"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import SubscriptionStatus from "@/app/components/SubscriptionStatus";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clientCount, setClientCount] = useState(0);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      setLoading(false);
      // Fetch client count and subscription status
      Promise.all([
        fetch("/api/clients").then((res) => res.json()),
        fetch("/api/subscriptions/status").then((res) => res.json()),
      ])
        .then(([clients, subscription]) => {
          setClientCount(clients.length);
          setSubscription(subscription);
        })
        .catch(console.error);
    }
  }, [status, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const clientLimit = subscription?.tier === "free" ? 3 : 25;
  const progressPercentage = Math.min((clientCount / clientLimit) * 100, 100);

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

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Client Limit</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Clients</span>
              <span className="text-sm font-medium">
                {clientCount}/{clientLimit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {clientCount >= clientLimit
                ? subscription?.tier === "free"
                  ? "You've reached your trial client limit. Upgrade to add more clients."
                  : "You've reached your client limit."
                : subscription?.tier === "free"
                  ? `Upgrade to add up to ${clientLimit} clients.`
                  : `You can add up to ${clientLimit} clients.`}
            </p>
            {subscription?.tier === "free" && (
              <Link
                href="/#pricing"
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Upgrade Plan
              </Link>
            )}
          </div>
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
