import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Report from "@/models/report";
import { requireAuth, getCurrentUser, getSession } from "@/lib/auth";
import AIReport from "@/models/aiReport";

// Get a specific report
export const GET = requireAuth(async (req, _, { params }) => {
  try {
    await connectDB();
    const user = await getCurrentUser();

    const report = await Report.findOne({
      _id: params.id,
      counselorId: user.id,
    })
      .populate("clientId", "name")
      .populate("sessionId", "date type")
      .lean();

    if (!report) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Report GET error:", error);
    return NextResponse.json({ message: "Error fetching report" }, { status: 500 });
  }
});

// Update a report
export const PATCH = requireAuth(async (req, _, { params }) => {
  try {
    await connectDB();
    const user = await getCurrentUser();

    const body = await req.json();
    const { content, type, recommendations, followUp } = body;

    // Find the report and ensure it belongs to the counselor
    const existingReport = await Report.findOne({
      _id: params.id,
      counselorId: user.id,
    });

    if (!existingReport) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 });
    }

    // Update allowed fields
    if (content !== undefined) existingReport.content = content;
    if (type !== undefined) existingReport.type = type;
    if (recommendations !== undefined) existingReport.recommendations = recommendations;
    if (followUp !== undefined) existingReport.followUp = followUp;

    // Save the updated report
    await existingReport.save();

    // Return the updated report with populated fields
    const updatedReport = await Report.findById(params.id)
      .populate("clientId", "name")
      .populate("sessionId", "date type")
      .lean();

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("Report PATCH error:", error);
    return NextResponse.json({ message: "Error updating report" }, { status: 500 });
  }
});

// Delete a report
export const DELETE = requireAuth(async (req, _, { params }) => {
  try {
    await connectDB();
    const user = await getCurrentUser();

    const deletedReport = await Report.findOneAndDelete({
      _id: params.id,
      counselorId: user.id,
    });

    if (!deletedReport) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Report deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Report DELETE error:", error);
    return NextResponse.json({ message: "Error deleting report" }, { status: 500 });
  }
});

export async function getReports(req, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: clientId } = params;
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
