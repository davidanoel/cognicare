"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function SubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: "paid",
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.url) {
        throw new Error("No checkout URL received");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Subscription error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handleSubscribe}
        disabled={loading || !session}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Processing..." : "Subscribe Now"}
      </button>
      {!session && <p className="mt-2 text-red-600">Please sign in to subscribe</p>}
    </div>
  );
}
