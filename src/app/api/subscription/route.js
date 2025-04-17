import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { subscriptionService } from "@/lib/subscription-service";

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await request.json();
    const result = await subscriptionService.createSubscription(user._id, plan);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await subscriptionService.cancelSubscription(user._id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await subscriptionService.getSubscriptionStatus(user._id);
    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error getting subscription:", error);
    return NextResponse.json({ error: "Failed to get subscription" }, { status: 500 });
  }
}
