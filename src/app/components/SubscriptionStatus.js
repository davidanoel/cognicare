"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function SubscriptionStatus() {
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

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Subscription Status</h2>
      {subscription ? (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="mb-2">
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    subscription.status === "active"
                      ? "bg-green-100 text-green-800"
                      : subscription.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : subscription.status === "trial"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {subscription.status === "trial" ? "Free Trial" : subscription.status}
                </span>
              </p>
              <p className="mb-2">
                <span className="font-medium">Plan:</span>{" "}
                {subscription.status === "trial" ? "Free Trial" : subscription.tier}
              </p>
              <p className="mb-2">
                <span className="font-medium">Start Date:</span>{" "}
                {new Date(subscription.startDate).toLocaleDateString()}
              </p>
              {subscription.endDate && (
                <p>
                  <span className="font-medium">
                    {subscription.status === "trial" ? "Trial Ends:" : "End Date:"}
                  </span>{" "}
                  {new Date(subscription.endDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <div>
              {subscription.stripeSubscriptionId && (
                <p className="mb-2">
                  <span className="font-medium">Subscription ID:</span>{" "}
                  <span className="text-sm text-gray-600">{subscription.stripeSubscriptionId}</span>
                </p>
              )}
              {subscription.stripeCustomerId && (
                <p className="mb-2">
                  <span className="font-medium">Customer ID:</span>{" "}
                  <span className="text-sm text-gray-600">{subscription.stripeCustomerId}</span>
                </p>
              )}
              {subscription.status === "trial" && (
                <p className="mb-2">
                  <span className="font-medium">Client Limit:</span>{" "}
                  <span className="text-sm text-gray-600">3 clients</span>
                </p>
              )}
              {subscription.status !== "trial" && (
                <p className="mb-2">
                  <span className="font-medium">Auto-renew:</span>{" "}
                  <span
                    className={
                      subscription.status === "cancelled" ? "text-red-600" : "text-green-600"
                    }
                  >
                    {subscription.status === "cancelled" ? "No" : "Yes"}
                  </span>
                </p>
              )}
            </div>
          </div>

          {subscription.status === "active" && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              {cancelling ? "Cancelling..." : "Cancel Subscription"}
            </button>
          )}
          {subscription.status === "trial" && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">
                Your trial includes access to all features with a 3-client limit.
              </p>
              <a
                href="/pricing"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Upgrade to Full Plan
              </a>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-4">No active subscription found</p>
          <a href="/pricing" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            View Pricing Plans
          </a>
        </div>
      )}
    </div>
  );
}
