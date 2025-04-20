import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Subscription from "@/models/subscription";
import { subscriptionService } from "@/lib/subscription-service";

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { autoRenew } = await request.json();
    if (typeof autoRenew !== "boolean") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await connectDB();

    const subscription = await Subscription.findOne({ userId: session.user.id });
    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    await subscriptionService.cancelSubscription(session.user.id, autoRenew);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error toggling auto-renewal:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
