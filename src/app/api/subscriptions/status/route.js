import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Subscription from "@/models/subscription";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const subscription = await Subscription.findOne({ userId: session.user.id });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    return NextResponse.json({ error: "Failed to fetch subscription status" }, { status: 500 });
  }
}
