import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import Report from "@/models/report";

export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, reportId } = await params;
    await connectDB();

    const report = await Report.findOne({
      _id: reportId,
      clientId: id,
    }).populate("createdBy", "name");

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
