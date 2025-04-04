import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";

// This route should only be used once to set up the first admin
// You should delete this file after creating your admin account
export async function POST(req) {
  try {
    const {
      email,
      password,
      name,
      licenseNumber = "ADMIN-0000",
      specialization = "System Administration",
    } = await req.json();

    // Basic validation
    if (!email || !password || !name) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Check if any admin exists
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      return NextResponse.json(
        { message: "Admin already exists. This route is for initial setup only." },
        { status: 400 }
      );
    }

    // Check if email is already in use
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = await User.create({
      email,
      password: hashedPassword,
      name,
      role: "admin",
      status: "active",
      licenseNumber,
      specialization,
      createdAt: new Date(),
    });

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    return NextResponse.json(adminResponse, { status: 201 });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ message: "Error creating admin user" }, { status: 500 });
  }
}
