import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import Subscription from "@/models/subscription";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  await connectDB();

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      console.log("Processing checkout.session.completed webhook:", {
        sessionId: session.id,
        subscriptionId: session.subscription,
        customerId: session.customer,
        metadata: session.metadata,
      });

      // Update existing subscription when checkout is completed
      const updateResult = await Subscription.updateOne(
        { userId: session.metadata.userId },
        {
          $set: {
            tier: session.metadata.plan,
            status: "active",
            startDate: new Date(),
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Set initial end date to 30 days from now
          },
        }
      );

      console.log("Subscription update result:", {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount,
        acknowledged: updateResult.acknowledged,
      });

      // Verify the update
      const updatedSubscription = await Subscription.findOne({ userId: session.metadata.userId });
      console.log("Updated subscription:", {
        exists: !!updatedSubscription,
        subscriptionId: updatedSubscription?._id,
        stripeSubscriptionId: updatedSubscription?.stripeSubscriptionId,
        status: updatedSubscription?.status,
      });
      break;

    case "customer.subscription.created":
    case "customer.subscription.updated":
      const subscription = event.data.object;
      console.log("Processing subscription event:", {
        eventType: event.type,
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });

      // Only update end date if it's a valid timestamp
      const endDate = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Fallback to 30 days if no period end

      // Update status based on subscription state
      let status = subscription.status; // Use Stripe's status directly

      // Get the latest invoice for this subscription
      const invoices = await stripe.invoices.list({
        subscription: subscription.id,
        limit: 1,
      });

      const updateData = {
        status: status,
        endDate: endDate,
        autoRenew: !subscription.cancel_at_period_end,
      };

      // Only add to billing history if we have a recent invoice and it's a payment event
      if (invoices.data.length > 0) {
        const latestInvoice = invoices.data[0];
        // Only add to billing history if this is a payment event
        if (latestInvoice.status === "paid" || latestInvoice.status === "open") {
          console.log("Found latest invoice:", {
            invoiceId: latestInvoice.id,
            amount: latestInvoice.amount_paid,
            status: latestInvoice.status,
          });

          updateData.$push = {
            billingHistory: {
              date: new Date(latestInvoice.created * 1000),
              amount: latestInvoice.amount_paid / 100, // Convert from cents to dollars
              status: latestInvoice.status === "paid" ? "paid" : "pending",
              invoiceId: latestInvoice.id,
              paymentMethod: latestInvoice.payment_method_types?.[0] || "card",
              description: "Subscription payment",
            },
          };
        }
      }

      const subscriptionUpdateResult = await Subscription.updateOne(
        { stripeSubscriptionId: subscription.id },
        updateData
      );

      console.log("Subscription update result:", {
        matchedCount: subscriptionUpdateResult.matchedCount,
        modifiedCount: subscriptionUpdateResult.modifiedCount,
        acknowledged: subscriptionUpdateResult.acknowledged,
        hasBillingHistory: !!updateData.$push,
      });

      // Verify the update
      const subscriptionAfterUpdate = await Subscription.findOne({
        stripeSubscriptionId: subscription.id,
      });
      console.log("Updated subscription:", {
        exists: !!subscriptionAfterUpdate,
        subscriptionId: subscriptionAfterUpdate?._id,
        stripeSubscriptionId: subscriptionAfterUpdate?.stripeSubscriptionId,
        status: subscriptionAfterUpdate?.status,
        billingHistoryLength: subscriptionAfterUpdate?.billingHistory?.length,
      });
      break;

    case "customer.subscription.deleted":
      const deletedSubscription = event.data.object;
      await Subscription.updateOne(
        { stripeSubscriptionId: deletedSubscription.id },
        {
          $set: {
            status: "cancelled",
            endDate: new Date(),
          },
        }
      );
      break;

    case "invoice.payment_succeeded":
      const invoice = event.data.object;
      console.log("Processing invoice.payment_succeeded webhook:", {
        invoiceId: invoice.id,
        subscriptionId: invoice.subscription,
        amount: invoice.amount_paid,
        created: new Date(invoice.created * 1000).toISOString(),
      });

      if (invoice.subscription) {
        const subscription = await Subscription.findOne({
          stripeSubscriptionId: invoice.subscription,
        });
        console.log("Found subscription:", {
          exists: !!subscription,
          subscriptionId: subscription?._id,
          stripeSubscriptionId: subscription?.stripeSubscriptionId,
        });

        if (subscription) {
          const updateResult = await Subscription.updateOne(
            { stripeSubscriptionId: invoice.subscription },
            {
              // Only update billing history, do not change status here
              $push: {
                billingHistory: {
                  date: new Date(invoice.created * 1000),
                  amount: invoice.amount_paid / 100, // Convert from cents to dollars
                  status: "paid",
                  invoiceId: invoice.id,
                  paymentMethod: invoice.payment_method_types?.[0] || "card",
                  description: "Subscription payment",
                },
              },
            }
          );

          console.log("Update result (billing history only):", {
            matchedCount: updateResult.matchedCount,
            modifiedCount: updateResult.modifiedCount,
            acknowledged: updateResult.acknowledged,
          });

          // Verify the update
          const updatedSubscription = await Subscription.findOne({
            stripeSubscriptionId: invoice.subscription,
          });
          console.log("Updated subscription billing history:", {
            billingHistoryLength: updatedSubscription?.billingHistory?.length,
            latestEntry:
              updatedSubscription?.billingHistory?.[updatedSubscription.billingHistory.length - 1],
          });
        }
      } else {
        console.log("No subscription ID found in invoice");
      }
      break;

    case "invoice.payment_failed":
      const failedInvoice = event.data.object;
      if (failedInvoice.subscription) {
        await Subscription.updateOne(
          { stripeSubscriptionId: failedInvoice.subscription },
          {
            $set: {
              status: "past_due",
            },
            $push: {
              billingHistory: {
                date: new Date(failedInvoice.created * 1000),
                amount: failedInvoice.amount_due / 100, // Convert from cents to dollars
                status: "failed",
                invoiceId: failedInvoice.id,
                paymentMethod: failedInvoice.payment_method_types?.[0] || "card",
                description: "Failed subscription payment",
              },
            },
          }
        );
      }
      break;
  }

  return NextResponse.json({ received: true });
}
