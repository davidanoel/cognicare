import Stripe from "stripe";
import { connectDB } from "./mongodb";
import Subscription from "@/models/subscription";
import Client from "@/models/client";
import User from "@/models/user";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class SubscriptionService {
  async createSubscription(userId, plan) {
    await connectDB();
    const user = await User.findById(userId);

    // Create Stripe customer if not exists
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
      });
      customerId = customer.id;
      await User.updateOne({ _id: userId }, { $set: { stripeCustomerId: customerId } });
    }

    // Create checkout session instead of subscription directly
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      metadata: {
        userId: userId.toString(),
        plan: plan,
      },
    });

    return {
      url: session.url,
    };
  }

  async cancelSubscription(userId) {
    await connectDB();
    const subscription = await Subscription.findOne({ userId, status: "active" });

    if (!subscription) {
      throw new Error("No active subscription found");
    }

    try {
      // Get the current subscription details from Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
      );

      // Cancel the subscription at the end of the current period
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      // Ensure we have a valid end date
      let endDate;
      if (stripeSubscription.current_period_end) {
        endDate = new Date(stripeSubscription.current_period_end * 1000);
      } else {
        // If no end date from Stripe, set it to 30 days from now
        endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
      }

      // Validate the date
      if (isNaN(endDate.getTime())) {
        throw new Error("Invalid end date");
      }

      // Update the subscription record
      subscription.status = "cancelled";
      subscription.endDate = endDate;
      await subscription.save();

      return true;
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      console.error("Stripe subscription:", stripeSubscription);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  async getSubscriptionStatus(userId) {
    await connectDB();
    return await Subscription.findOne({ userId });
  }

  async checkClientLimit(userId) {
    await connectDB();
    const subscription = await this.getSubscriptionStatus(userId);
    const clientCount = await Client.countDocuments({ counselorId: userId });

    if (subscription.tier === "free" && clientCount >= 3) {
      return { canAdd: false, reason: "freeLimit" };
    }
    if (subscription.tier === "paid" && clientCount >= 25) {
      return { canAdd: false, reason: "paidLimit" };
    }
    return { canAdd: true };
  }
}

export const subscriptionService = new SubscriptionService();
