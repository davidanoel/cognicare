import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import Client from "@/models/client";
import { connectDB } from "@/lib/mongodb";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req, context) {
  try {
    const { id, invoiceId } = await context.params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find the client and invoice
    const client = await Client.findOne({ _id: id, counselorId: user.id });
    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    const invoice = client.billing.invoices.id(invoiceId);
    if (!invoice) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === "paid") {
      return NextResponse.json({ message: "Invoice is already paid" }, { status: 400 });
    }

    if (!client.contactInfo.email) {
      return NextResponse.json({ message: "Client email not found" }, { status: 400 });
    }

    // Send reminder email
    const { data, error } = await resend.emails.send({
      from: "Cognicare <onboarding@resend.dev>",
      to: client.contactInfo.email,
      subject: `Payment Reminder: Invoice #${invoice.invoiceNumber || invoiceId}`,
      html: `
        <h1>Payment Reminder</h1>
        <p>Dear ${client.name},</p>
        <p>This is a friendly reminder that your invoice #${
          invoice.invoiceNumber || invoiceId
        } for $${invoice.amount} is still pending payment.</p>
        <p>Invoice Details:</p>
        <ul>
          <li>Amount: $${invoice.amount}</li>
          <li>Date: ${new Date(invoice.date).toLocaleDateString()}</li>
          <li>Status: Pending</li>
        </ul>
        <p>Please make payment at your earliest convenience.</p>
        <p>Thank you,<br>Cognicare Team</p>
      `,
    });

    if (error) {
      console.error("Error sending reminder email:", error);
      return NextResponse.json({ message: "Failed to send reminder email" }, { status: 500 });
    }

    // Update last reminder sent date
    invoice.lastReminderSent = new Date();
    await client.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending reminder:", error);
    return NextResponse.json({ message: "Error sending reminder" }, { status: 500 });
  }
}
