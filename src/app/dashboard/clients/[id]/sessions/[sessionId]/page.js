import SessionEditForm from "@/app/components/sessions/SessionEditForm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import AIWorkflow from "@/app/components/clients/AIWorkflow";
import AIWorkflowTest from "@/app/components/clients/AIWorkflowTest";

export async function generateMetadata({ params }) {
  const { sessionId } = params;

  if (sessionId === "new") {
    return {
      title: "New Session",
    };
  }

  return {
    title: "Edit Session",
  };
}

export default async function SessionPage({ params }) {
  const { id: clientId, sessionId } = params;
  const authSession = await getServerSession(authOptions);

  if (!authSession) {
    return redirect("/login");
  }

  try {
    // Fetch client data from API
    const clientResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/clients/${clientId}`,
      {
        headers: {
          Cookie: headers().get("cookie") || "",
        },
        next: { revalidate: 0 },
      }
    );

    if (!clientResponse.ok) {
      if (clientResponse.status === 404) {
        return notFound();
      }
      throw new Error(`Failed to fetch client: ${clientResponse.status}`);
    }

    const { client } = await clientResponse.json();

    // Get session data if it's not a new session
    let sessionData = null;
    if (sessionId !== "new") {
      const sessionResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/sessions/${sessionId}`,
        {
          headers: {
            Cookie: headers().get("cookie") || "",
          },
          next: { revalidate: 0 },
        }
      );

      if (!sessionResponse.ok) {
        if (sessionResponse.status === 404) {
          return notFound();
        }
        throw new Error(`Failed to fetch session: ${sessionResponse.status}`);
      }

      sessionData = await sessionResponse.json();
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{sessionData ? "Edit Session" : "New Session"}</h1>
            <p className="text-gray-500">
              {sessionData
                ? `Session for ${client.name}`
                : `Create a new session for ${client.name}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SessionEditForm clientId={client._id} session={sessionData} />
          </div>

          <div className="space-y-6">
            {/* Test Component */}
            <AIWorkflowTest title="Session Component Test" />

            {/* AI Workflow Component */}
            <div className="mt-4">
              <AIWorkflow
                client={client}
                session={sessionData}
                updateFunction={() => {
                  // This would trigger a refresh of session data if needed
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading session page:", error);
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h1 className="text-xl text-red-700">Error loading session</h1>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }
}
