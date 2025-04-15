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

    const { id } = await context.params;

    // Find the client and verify ownership
    const client = await Client.findOne({ _id: id, counselorId: user.id });
    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    // Delete all invoice files from storage
    if (client.billing?.invoices) {
      for (const invoice of client.billing.invoices) {
        if (invoice.documentKey) {
          await deleteFile(invoice.documentKey);
        }
      }
    }

    // Remove the billing information
    client.billing = undefined;
    await client.save();

    return NextResponse.json({ message: "Billing information deleted successfully" });
  } catch (error) {
    console.error("Error deleting billing:", error);
    return NextResponse.json({ message: "Error deleting billing information" }, { status: 500 });
  }
}
