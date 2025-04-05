import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import AIReport from "@/models/aiReport";

export async function GET(req, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, sessionId } = params;
    if (!clientId || !sessionId) {
      return NextResponse.json({ error: "Client ID and Session ID are required" }, { status: 400 });
    }

    await connectDB();

    // Fetch the latest documentation report for this session
    const report = await AIReport.findOne({
      clientId,
      sessionId,
      type: "documentation",
    }).sort({ "metadata.timestamp": -1 });

    if (!report) {
      return NextResponse.json(
        { error: "No documentation found for this session" },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching session documentation:", error);
    return NextResponse.json({ error: "Failed to fetch session documentation" }, { status: 500 });
  }
}
