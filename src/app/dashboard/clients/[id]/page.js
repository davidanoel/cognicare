import Link from "next/link";
import { Button } from "@/components/ui/button";
import ClientSessionsList from "@/app/components/clients/ClientSessionsList";
import ClientAnalytics from "@/app/components/clients/ClientAnalytics";
import ClientInsights from "@/app/components/clients/ClientInsights";
import SessionPrepView from "@/app/components/clients/SessionPrepView";
import AIWorkflow from "@/app/components/clients/AIWorkflow";
import AIWorkflowTest from "@/app/components/clients/AIWorkflowTest";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function ClientPage({ params }) {
  // Get auth session
  const session = await getServerSession(authOptions);
  if (!session) {
    return redirect("/login");
  }

  // Get client ID from params
  const clientId = params.id;

  try {
    // Fetch client data from API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/clients/${clientId}`, {
      headers: {
        Cookie: headers().get("cookie") || "",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return notFound();
      }
      throw new Error(`Failed to fetch client: ${response.status}`);
    }

    const { client } = await response.json();

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <p className="text-gray-500">{client.email}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href={`/dashboard/clients/${client._id}/edit`}>
              <Button>Edit Client</Button>
            </Link>
            <Link href={`/dashboard/clients/${client._id}/sessions/new`}>
              <Button>Add Session</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ClientAnalytics clientId={client._id} />
            <ClientSessionsList clientId={client._id} />
          </div>
          <div className="space-y-6">
            <ClientInsights clientId={client._id} />

            {/* Standalone Test Component */}
            <AIWorkflowTest title="Component Test" />

            {/* Session Prep View Component */}
            <div className="mt-4">
              <SessionPrepView clientId={client._id} />
            </div>

            {/* AI Workflow Component */}
            <div className="mt-4">
              <AIWorkflow
                client={client}
                updateFunction={() => {
                  // This would trigger a refresh of client data if needed
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading client page:", error);
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h1 className="text-xl text-red-700">Error loading client</h1>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }
}
