import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import AIReport from "@/models/aiReport";
import { getSession } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { clientId } = params;

    // Fetch the most recent reports of each type for this client
    const reports = await AIReport.aggregate([
      {
        $match: {
          clientId: clientId,
          status: "active",
        },
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$type",
          report: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$report" } },
    ]);

    if (!reports || reports.length === 0) {
      return NextResponse.json({
        message: "No reports found for this client",
        reports: [],
      });
    }

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching client reports:", error);
    return NextResponse.json({ error: "Failed to fetch client reports" }, { status: 500 });
  }
}
