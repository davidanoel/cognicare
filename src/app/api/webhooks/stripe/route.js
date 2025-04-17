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
      // Create subscription record when checkout is completed
      const newSubscription = new Subscription({
        userId: session.metadata.userId,
        tier: session.metadata.plan,
        status: "active",
        startDate: new Date(),
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
      });
      await newSubscription.save();
      break;

    case "customer.subscription.created":
    case "customer.subscription.updated":
      const subscription = event.data.object;
      await Subscription.updateOne(
        { stripeSubscriptionId: subscription.id },
        {
          $set: {
            status: subscription.status,
            endDate: new Date(subscription.current_period_end * 1000),
          },
        }
      );
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
      if (invoice.subscription) {
        await Subscription.updateOne(
          { stripeSubscriptionId: invoice.subscription },
          {
            $set: {
              status: "active",
            },
          }
        );
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
          }
        );
      }
      break;
  }

  return NextResponse.json({ received: true });
}
