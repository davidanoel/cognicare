"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function SubscriptionStatus({ isDashboard = false }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!session) return;

      try {
        const response = await fetch("/api/subscriptions/status");
        const data = await response.json();
        setSubscription(data);
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [session]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;

    try {
      setCancelling(true);
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      // Refresh subscription status
      const data = await fetch("/api/subscriptions/status").then((res) => res.json());
      setSubscription(data);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      alert(error.message);
    } finally {
      setCancelling(false);
    }
  };

  if (!session) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800">Please sign in to view subscription status</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <p>Loading subscription status...</p>
      </div>
    );
  }

  // Simplified version for dashboard
  if (isDashboard) {
    return (
      <div className="py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{subscription?.tier}</span>
            <span className="text-xs text-gray-500">{subscription?.status}</span>
          </div>
          {subscription?.status === "active" ? (
            <Link href="/subscription" className="text-sm text-indigo-600 hover:text-indigo-800">
              Manage Subscription
            </Link>
          ) : (
            <Link href="/subscription" className="text-sm text-indigo-600 hover:text-indigo-800">
              Upgrade Now
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Full version for subscription page
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Subscription Status</h2>
      {subscription ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-gray-600">Current Plan</p>
              <p className="text-lg font-medium">
                {subscription.tier === "free" ? "Free Trial" : "Single Therapist"}
              </p>
              <p className="text-sm text-gray-500">
                {subscription.tier === "free" ? "3 clients" : "25 clients"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-600">Status</p>
              <p className="text-lg font-medium capitalize">{subscription.status}</p>
              <p className="text-sm text-gray-500">
                {subscription.status === "active" ? "Auto-renewing" : "Not auto-renewing"}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-gray-600">Subscription ID</p>
            <p className="text-sm font-mono">{subscription.stripeSubscriptionId || "N/A"}</p>
            <p className="text-gray-600 mt-2">Customer ID</p>
            <p className="text-sm font-mono">{subscription.stripeCustomerId || "N/A"}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-gray-600">Start Date</p>
              <p className="text-sm">{new Date(subscription.startDate).toLocaleDateString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-600">
                {subscription.status === "active" ? "Next Billing Date" : "End Date"}
              </p>
              <p className="text-sm">
                {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>

          {subscription.status === "active" && (
            <div className="pt-4">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Cancel Subscription"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-600 mb-4">No active subscription</p>
          <Link
            href="/subscription"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            View Pricing Plans
          </Link>
        </div>
      )}
    </div>
  );
}
