import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import Report from "@/models/report";
import { generateProgressReport } from "@/lib/reports/progress";
import { generateDocumentationReport } from "@/lib/reports/documentation";
import { generateAssessmentReport } from "@/lib/reports/assessment";

export async function POST(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Session data:", session); // Debug log

    const { id } = await params;
    const { type, startDate, endDate } = await request.json();

    if (!type || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Generate report based on type
    let reportContent;
    switch (type) {
      case "progress":
        reportContent = await generateProgressReport(id, startDate, endDate, session.user);
        break;
      case "documentation":
        reportContent = await generateDocumentationReport(id, startDate, endDate, session.user);
        break;
      case "assessment":
        reportContent = await generateAssessmentReport(id, startDate, endDate, session.user);
        break;
      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    // Create new report document
    const report = new Report({
      clientId: id,
      type,
      startDate,
      endDate,
      content: reportContent,
      createdBy: session.user.id, // Changed from _id to id
      status: "completed",
    });

    console.log("Report data before save:", report); // Debug log

    await report.save();

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    console.log("Fetching reports for client:", id);

    await connectDB();

    const reports = await Report.find({ clientId: id })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name");

    console.log("Found reports:", reports);

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
