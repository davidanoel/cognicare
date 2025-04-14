import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadFile, getSignedDownloadUrl } from "@/lib/storage";
import { generateFileKey } from "@/lib/storage";
import { getConsentFormTemplate } from "@/lib/templates/consentFormTemplate";
import Client from "@/models/client";

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const clientId = formData.get("clientId");
    const type = formData.get("type");
    const file = formData.get("file");
    const notes = formData.get("notes");

    if (!clientId || !type || !file) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get template to validate type and version
    const template = getConsentFormTemplate(type);

    // Upload file to storage
    const fileKey = generateFileKey("consent-forms", file.name);
    const documentUrl = await uploadFile(file, fileKey, {
      type: "consent-form",
      clientId,
      formType: type,
      version: template.version,
    });

    // Generate a signed URL for the document
    const signedUrl = await getSignedDownloadUrl(fileKey);

    // Create consent form object
    const consentForm = {
      type:
        type === "general"
          ? "treatment"
          : type === "telehealth"
          ? "treatment"
          : type === "minor"
          ? "treatment"
          : "treatment",
      version: template.version,
      document: signedUrl,
      documentKey: fileKey,
      status: "pending",
      requestedBy: user._id,
      requestedAt: new Date(),
      notes: notes || "",
    };

    // Update client with new consent form
    const client = await Client.findByIdAndUpdate(
      clientId,
      {
        $push: { consentForms: consentForm },
      },
      { new: true }
    );

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(consentForm);
  } catch (error) {
    console.error("Error creating consent form:", error);
    return NextResponse.json({ error: "Failed to create consent form" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    const consentForms = await ConsentForm.find({
      clientId,
      therapistId: user._id,
    }).sort({ createdAt: -1 });

    return NextResponse.json(consentForms);
  } catch (error) {
    console.error("Error fetching consent forms:", error);
    return NextResponse.json({ error: "Failed to fetch consent forms" }, { status: 500 });
  }
}
