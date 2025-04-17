"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function SubscriptionStatus() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
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
          <p className="mb-2">
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`px-2 py-1 rounded text-sm ${
                subscription.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {subscription.status}
            </span>
          </p>
          <p className="mb-2">
            <span className="font-medium">Plan:</span> {subscription.tier}
          </p>
          <p className="mb-2">
            <span className="font-medium">Start Date:</span>{" "}
            {new Date(subscription.startDate).toLocaleDateString()}
          </p>
          {subscription.endDate && (
            <p>
              <span className="font-medium">End Date:</span>{" "}
              {new Date(subscription.endDate).toLocaleDateString()}
            </p>
          )}
        </div>
      ) : (
        <p className="text-gray-600">No active subscription found</p>
      )}
    </div>
  );
}
