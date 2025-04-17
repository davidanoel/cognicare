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

    if (subscription) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      subscription.status = "cancelled";
      subscription.endDate = new Date();
      await subscription.save();
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
