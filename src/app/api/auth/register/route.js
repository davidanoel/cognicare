import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { hash } from "bcryptjs";

export async function POST(request) {
  try {
    const { email, password, name, licenseNumber, specialization } = await request.json();

    // Validate input
    if (!email || !password || !name || !licenseNumber) {
      return NextResponse.json(
        { message: "Email, password, name, and license number are required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create new user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      licenseNumber,
      specialization: specialization || "General Counseling",
      role: "counselor",
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(
      {
        message: "Registration successful",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
