import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import Client from "@/models/client";
import Session from "@/models/session";
import Report from "@/models/report";

export const GET = requireAuth(async (req, session) => {
  try {
    const counselorId = session.user.id;

    // Get total clients
    const totalClients = await Client.countDocuments({ counselorId });

    // Get active sessions (scheduled or in-progress)
    const activeSessions = await Session.countDocuments({
      counselorId,
      status: { $in: ["scheduled", "in-progress"] },
    });

    // Get completed sessions
    const completedSessions = await Session.countDocuments({
      counselorId,
      status: "completed",
    });

    // Get total reports
    const reportsGenerated = await Report.countDocuments({ counselorId });

    // Get recent activity (last 5 items of each type)
    const [recentSessions, recentReports] = await Promise.all([
      Session.find({ counselorId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate("clientId", "name")
        .lean(),
      Report.find({ counselorId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("clientId", "name")
        .lean(),
    ]);

    // Format recent activity
    const recentActivity = [...recentSessions, ...recentReports]
      .map((item) => ({
        type: item.type || (item.sessionId ? "report" : "session"),
        date: item.createdAt,
        clientName: item.clientId?.name || "Unknown Client",
        status: item.status,
        id: item._id.toString(),
      }))
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);

    return NextResponse.json({
      totalClients,
      activeSessions,
      completedSessions,
      reportsGenerated,
      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});
