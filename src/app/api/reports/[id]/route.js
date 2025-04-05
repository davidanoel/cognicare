import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Report from "@/models/report";
import { getCurrentUser } from "@/lib/auth";
import AIReport from "@/models/aiReport";

// Get all AI reports for a specific client
export async function GET(req, context) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id: clientId } = await context.params;
    console.log("Fetching reports for clientId:", clientId);
    console.log("Current user (counselor) id:", user.id);

    // Fetch all reports for the client, sorted by creation date
    const reports = await AIReport.find({
      clientId,
      counselorId: user.id,
    })
      .sort({ "metadata.timestamp": -1 })
      .lean();

    console.log("Found reports:", reports);

    if (!reports || reports.length === 0) {
      console.log("No reports found for this client");
      return NextResponse.json({ message: "No reports found for this client" }, { status: 404 });
    }

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Reports GET error:", error);
    if (error.kind === "ObjectId") {
      return NextResponse.json({ message: "Invalid Client ID format" }, { status: 400 });
    }
    return NextResponse.json({ message: "Error fetching reports" }, { status: 500 });
  }
}

// Update a report (Refactored)
export async function PATCH(req, context) {
  try {
    // Check authentication directly
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await context.params; // Get id from context
    const body = await req.json();
    const { content, type, recommendations, followUp } = body;

    // Find the report and ensure it belongs to the counselor
    // Note: This currently operates on the standard 'Report' model, not AIReport.
    // Decide if PATCH should apply to AIReport or standard Report.
    const existingReport = await Report.findOne({
      _id: id,
      counselorId: user.id,
    });

    if (!existingReport) {
      // Consider checking AIReport as well if PATCH should apply to both?
      return NextResponse.json({ message: "Report not found" }, { status: 404 });
    }

    // Update allowed fields
    if (content !== undefined) existingReport.content = content;
    if (type !== undefined) existingReport.type = type;
    if (recommendations !== undefined) existingReport.recommendations = recommendations;
    if (followUp !== undefined) existingReport.followUp = followUp;

    await existingReport.save();

    // Return the updated report (still using standard Report model)
    const updatedReport = await Report.findById(id)
      .populate("clientId", "name")
      .populate("sessionId", "date type")
      .lean();

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("Report PATCH error:", error);
    if (error.kind === "ObjectId") {
      return NextResponse.json({ message: "Invalid Report ID format" }, { status: 400 });
    }
    return NextResponse.json({ message: "Error updating report" }, { status: 500 });
  }
}

// Delete a report (Refactored)
export async function DELETE(req, context) {
  try {
    // Check authentication directly
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await context.params; // Get id from context

    // Find and delete the report, ensuring it belongs to the counselor
    // Note: This currently operates on the standard 'Report' model, not AIReport.
    const deletedReport = await Report.findOneAndDelete({
      _id: id,
      counselorId: user.id,
    });

    if (!deletedReport) {
      // Consider checking AIReport as well if DELETE should apply to both?
      return NextResponse.json({ message: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Report deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Report DELETE error:", error);
    if (error.kind === "ObjectId") {
      return NextResponse.json({ message: "Invalid Report ID format" }, { status: 400 });
    }
    return NextResponse.json({ message: "Error deleting report" }, { status: 500 });
  }
}

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
