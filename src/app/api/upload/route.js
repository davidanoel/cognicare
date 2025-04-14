import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    // Create a unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name}`;

    // Save the file to the public/uploads directory
    const path = join(process.cwd(), "public/uploads", filename);
    await writeFile(path, buffer);

    // Return the file path
    return NextResponse.json({
      success: true,
      filename,
      path: `/uploads/${filename}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Error uploading file" }, { status: 500 });
  }
}
