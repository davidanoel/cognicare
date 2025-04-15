import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import Client from "@/models/client";
import { uploadFile, generateFileKey } from "@/lib/storage";
import { connectDB } from "@/lib/mongodb";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import mongoose from "mongoose";

export async function POST(req, context) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get client data
    const client = await Client.findOne({ _id: id, counselorId: user.id });
    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    if (!client.billing?.rate) {
      return NextResponse.json({ message: "Client rate not set" }, { status: 400 });
    }

    // Get request body
    const body = await req.json();
    const { sessions = [], notes = "" } = body;

    // Calculate total amount
    const totalAmount = sessions.length * client.billing.rate;

    // Generate PDF invoice
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size

    // Add company letterhead
    page.drawText("COGNICARE", {
      x: 50,
      y: 800,
      size: 24,
      color: rgb(0.2, 0.4, 0.8),
      font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    });

    page.drawText("Professional Mental Health Services", {
      x: 50,
      y: 775,
      size: 12,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Add invoice header
    page.drawText("INVOICE", {
      x: 50,
      y: 740,
      size: 20,
      color: rgb(0, 0, 0),
      font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    });

    // Add client information section
    page.drawText("Bill To:", {
      x: 50,
      y: 710,
      size: 12,
      color: rgb(0.3, 0.3, 0.3),
      font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    });

    page.drawText(`${client.name}`, {
      x: 50,
      y: 690,
      size: 12,
      color: rgb(0, 0, 0),
    });

    // Add invoice details
    const invoiceDate = new Date().toLocaleDateString();
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    page.drawText(`Invoice #: ${invoiceNumber}`, {
      x: 400,
      y: 710,
      size: 12,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText(`Date: ${invoiceDate}`, {
      x: 400,
      y: 690,
      size: 12,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Add sessions table header
    page.drawText("Description", {
      x: 50,
      y: 650,
      size: 12,
      color: rgb(0.3, 0.3, 0.3),
      font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    });

    page.drawText("Date", {
      x: 300,
      y: 650,
      size: 12,
      color: rgb(0.3, 0.3, 0.3),
      font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    });

    page.drawText("Amount", {
      x: 450,
      y: 650,
      size: 12,
      color: rgb(0.3, 0.3, 0.3),
      font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    });

    // Add sessions table content
    let yPosition = 630;
    sessions.forEach((session) => {
      page.drawText(`Therapy Session - ${session.type}`, {
        x: 50,
        y: yPosition,
        size: 12,
        color: rgb(0, 0, 0),
      });

      page.drawText(new Date(session.date).toLocaleDateString(), {
        x: 300,
        y: yPosition,
        size: 12,
        color: rgb(0, 0, 0),
      });

      page.drawText(`$${client.billing.rate}`, {
        x: 450,
        y: yPosition,
        size: 12,
        color: rgb(0, 0, 0),
      });

      yPosition -= 20;
    });

    // Add total
    yPosition -= 20;
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: 545, y: yPosition },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    yPosition -= 20;
    page.drawText("Total", {
      x: 400,
      y: yPosition,
      size: 12,
      color: rgb(0.3, 0.3, 0.3),
      font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    });

    page.drawText(`$${totalAmount}`, {
      x: 450,
      y: yPosition,
      size: 12,
      color: rgb(0, 0, 0),
      font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    });

    // Add notes if provided
    if (notes) {
      yPosition -= 40;
      page.drawText("Notes:", {
        x: 50,
        y: yPosition,
        size: 12,
        color: rgb(0.3, 0.3, 0.3),
        font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      });
      yPosition -= 20;
      page.drawText(notes, {
        x: 50,
        y: yPosition,
        size: 12,
        color: rgb(0, 0, 0),
        maxWidth: 495,
      });
    }

    // Add footer
    yPosition = 50;
    page.drawText("Thank you for your business!", {
      x: 50,
      y: yPosition,
      size: 12,
      color: rgb(0.3, 0.3, 0.3),
    });

    yPosition -= 20;
    page.drawText("COGNICARE - Professional Mental Health Services", {
      x: 50,
      y: yPosition,
      size: 10,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();

    // Convert PDF bytes to Blob
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });

    // Generate file key
    const fileKey = generateFileKey("invoices", `invoice-${Date.now()}.pdf`);

    // Upload PDF to storage
    const documentUrl = await uploadFile(pdfBlob, fileKey, {
      type: "invoice",
      uploadedBy: user._id,
    });

    // Create invoice record
    const invoiceData = {
      _id: new mongoose.Types.ObjectId(),
      date: new Date(),
      amount: totalAmount,
      status: "pending",
      notes: notes,
      document: documentUrl,
      documentKey: fileKey,
    };

    // Update client with new invoice
    const updatedClient = await Client.findOneAndUpdate(
      { _id: id, counselorId: user.id },
      { $push: { "billing.invoices": invoiceData } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      invoice: invoiceData,
      documentUrl,
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    return NextResponse.json({ message: "Error generating invoice" }, { status: 500 });
  }
}
