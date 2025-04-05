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

    const { clientId } = params;
    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    await connectDB();

    // Fetch the latest report of each type for this client
    const reports = await AIReport.find({ clientId }).sort({ "metadata.timestamp": -1 });

    // Group reports by type, keeping only the latest of each
    const latestReports = reports.reduce((acc, report) => {
      if (!acc[report.type] || report.metadata.timestamp > acc[report.type].metadata.timestamp) {
        acc[report.type] = report;
      }
      return acc;
    }, {});

    return NextResponse.json(latestReports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
