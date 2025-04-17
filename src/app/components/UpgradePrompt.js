"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpgradePrompt({ reason }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const messages = {
    freeLimit: "You've reached your free trial client limit. Upgrade to add more clients.",
    paidLimit: "You've reached your client limit. Contact support for more clients.",
    trialExpired: "Your trial has expired. Upgrade to continue using CogniCare.",
  };

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "paid" }),
      });
      const data = await response.json();
      router.push(`/checkout?session_id=${data.subscriptionId}`);
    } catch (error) {
      console.error("Error initiating upgrade:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900">Upgrade Your Plan</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>{messages[reason]}</p>
        </div>
        <div className="mt-5">
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Upgrade Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
