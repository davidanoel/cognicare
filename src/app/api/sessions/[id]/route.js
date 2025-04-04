import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Session from "@/models/session";
import { requireAuth, getCurrentUser } from "@/lib/auth";

// Get a specific session
export const GET = requireAuth(async (req, _, { params }) => {
  try {
    await connectDB();
    const user = await getCurrentUser();

    const sessionData = await Session.findOne({
      _id: params.id,
      counselorId: user.id,
    })
      .populate("clientId", "name")
      .lean();

    if (!sessionData) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error("Session GET error:", error);
    return NextResponse.json({ message: "Error fetching session" }, { status: 500 });
  }
});

// Update a session
export const PATCH = requireAuth(async (req, _, { params }) => {
  try {
    await connectDB();
    const user = await getCurrentUser();

    const body = await req.json();
    const { notes, status, moodRating } = body;

    // Find the session and ensure it belongs to the counselor
    const existingSession = await Session.findOne({
      _id: params.id,
      counselorId: user.id,
    });

    if (!existingSession) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    // Update allowed fields
    if (notes !== undefined) existingSession.notes = notes;
    if (status !== undefined) existingSession.status = status;
    if (moodRating !== undefined) existingSession.moodRating = moodRating;

    // Save the updated session
    await existingSession.save();

    // Return the updated session with populated fields
    const updatedSession = await Session.findById(params.id).populate("clientId", "name").lean();

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Session PATCH error:", error);
    return NextResponse.json({ message: "Error updating session" }, { status: 500 });
  }
});

// Delete a session
export const DELETE = requireAuth(async (req, _, { params }) => {
  try {
    await connectDB();
    const user = await getCurrentUser();

    const deletedSession = await Session.findOneAndDelete({
      _id: params.id,
      counselorId: user.id,
    });

    if (!deletedSession) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Session deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Session DELETE error:", error);
    return NextResponse.json({ message: "Error deleting session" }, { status: 500 });
  }
});
