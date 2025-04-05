import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Client from "@/models/client";
import { requireAuth, getCurrentUser } from "@/lib/auth";

// Get all clients for the authenticated counselor
export const GET = requireAuth(async (req) => {
  try {
    await connectDB();
    const user = await getCurrentUser();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build query based on filters
    const query = { counselorId: user.id };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { "contactInfo.email": { $regex: search, $options: "i" } },
      ];
    }

    const clients = await Client.find(query)
      .select("-initialAssessment") // Exclude large fields
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Clients GET error:", error);
    return NextResponse.json({ message: "Error fetching clients" }, { status: 500 });
  }
});

// Create a new client
export const POST = requireAuth(async (req) => {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "counselor") {
      return NextResponse.json(
        { message: "Unauthorized - Only counselors can create clients" },
        { status: 401 }
      );
    }

    await connectDB();

    // Get body data from request
    const body = await req.json();
    console.log("Received client data:", JSON.stringify(body, null, 2));

    // Add counselorId and default status if not provided
    body.counselorId = user.id;
    if (!body.status) body.status = "Active";

    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    if (!body.initialAssessment) {
      console.log("Missing initialAssessment in request body");
      return NextResponse.json({ message: "Initial assessment is required" }, { status: 400 });
    }
    console.log("Initial assessment found:", body.initialAssessment);

    // Ensure contactInfo structure exists
    if (!body.contactInfo) {
      body.contactInfo = {
        email: "",
        phone: "",
        emergencyContact: {
          name: "",
          relationship: "",
          phone: "",
        },
      };
    } else {
      // Ensure email and phone exist
      body.contactInfo.email = body.contactInfo.email || "";
      body.contactInfo.phone = body.contactInfo.phone || "";

      // Ensure emergencyContact exists with all fields
      if (!body.contactInfo.emergencyContact) {
        body.contactInfo.emergencyContact = {
          name: "",
          relationship: "",
          phone: "",
        };
      } else if (typeof body.contactInfo.emergencyContact !== "object") {
        // If emergencyContact is a string (or other non-object), convert to object
        const value = String(body.contactInfo.emergencyContact);
        body.contactInfo.emergencyContact = {
          name: value,
          relationship: "",
          phone: "",
        };
      } else {
        // Ensure all fields exist
        body.contactInfo.emergencyContact.name = body.contactInfo.emergencyContact.name || "";
        body.contactInfo.emergencyContact.relationship =
          body.contactInfo.emergencyContact.relationship || "";
        body.contactInfo.emergencyContact.phone = body.contactInfo.emergencyContact.phone || "";
      }
    }

    // Create and save the client
    console.log("Creating client with data:", JSON.stringify(body, null, 2));
    const client = await Client.create(body);
    console.log("Created client:", JSON.stringify(client.toObject(), null, 2));

    // Return the complete client object including initialAssessment
    return NextResponse.json(client.toObject(), { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json({ message: "Error creating client" }, { status: 500 });
  }
});
