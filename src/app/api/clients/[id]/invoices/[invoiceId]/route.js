import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import Client from "@/models/client";
import { deleteFile } from "@/lib/storage";

export async function DELETE(req, context) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, invoiceId } = await context.params;

    // Find the client and verify ownership
    const client = await Client.findOne({ _id: id, counselorId: user.id });
    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    // Find the invoice to delete
    const invoice = client.billing.invoices.id(invoiceId);
    if (!invoice) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    // Delete the invoice file from storage if it exists
    if (invoice.documentKey) {
      await deleteFile(invoice.documentKey);
    }

    // Remove the invoice from the array
    client.billing.invoices.pull(invoiceId);
    await client.save();

    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json({ message: "Error deleting invoice" }, { status: 500 });
  }
}
