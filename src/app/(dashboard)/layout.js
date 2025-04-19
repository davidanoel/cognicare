"use client";

import SubscriptionStatus from "@/app/components/SubscriptionStatus";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Subscription Status Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SubscriptionStatus isDashboard={true} />
        </div>
      </div>

      {/* Main content */}
      <div className="ml-0">
        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
