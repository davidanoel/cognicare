import { NextResponse } from "next/server";
import { subscriptionService } from "@/lib/subscription-service";
import { getSession } from "@/lib/auth";

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await request.json();
    const result = await subscriptionService.createSubscription(session.user.id, plan);

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("Subscription creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}
