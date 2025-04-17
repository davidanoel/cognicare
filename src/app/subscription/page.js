"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import SubscriptionStatus from "@/app/components/SubscriptionStatus";
import { useRouter } from "next/navigation";

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Subscription Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your subscription and billing information
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <SubscriptionStatus />
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Billing History</h2>
          <p className="text-gray-600">
            Your billing history will appear here once you have an active subscription.
          </p>
        </div>
      </div>
    </div>
  );
}
