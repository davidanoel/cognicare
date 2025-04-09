import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AIReport from "@/models/aiReport";
import { getSession } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the client ID from params
    const { id: clientId } = await params;
    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const sessionId = searchParams.get("sessionId");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")) : 10;
    const source = searchParams.get("source");

    await connectDB();

    // Build query
    const query = {
      clientId,
      counselorId: session.user.id,
    };

    // Add optional filters if provided
    if (type) query.type = type;
    if (sessionId) query.sessionId = sessionId;
    if (source) query.source = source;

    // Fetch reports
    const reports = await AIReport.find(query)
      .sort({ "metadata.timestamp": -1 })
      .limit(limit)
      .lean();

    if (!reports || reports.length === 0) {
      return NextResponse.json(
        {
          message: "No reports found",
          reports: [],
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      reports,
      count: reports.length,
    });
  } catch (error) {
    console.error("Error fetching client reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
