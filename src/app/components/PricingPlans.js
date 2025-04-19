"use client";

import { useState } from "react";
import Link from "next/link";

export default function PricingPlans({
  subscription,
  onUpgrade,
  upgrading = false,
  showUpgradeButton = true,
  showGetStartedButton = false,
  onGetStarted,
}) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div
        className={`p-6 rounded-2xl border ${
          subscription?.status === "trial" ? "border-indigo-600 bg-indigo-50" : "border-gray-200"
        } hover:shadow-lg transition-shadow`}
      >
        <h3 className="text-xl font-semibold mb-4">Free Trial</h3>
        {subscription?.status === "trial" && (
          <div className="mb-4 p-2 bg-indigo-100 text-indigo-800 rounded text-sm">
            Your Current Plan
          </div>
        )}
        <div className="text-4xl font-bold text-indigo-600 mb-6">$0</div>
        <p className="text-gray-600 mb-6">Try all features for 14 days</p>
        <ul className="space-y-4 mb-8">
          <li className="flex items-center">
            <svg
              className="w-5 h-5 text-green-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>All 6 AI Agents</span>
          </li>
          <li className="flex items-center">
            <svg
              className="w-5 h-5 text-green-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Up to 3 Clients</span>
          </li>
          <li className="flex items-center">
            <svg
              className="w-5 h-5 text-green-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Full Feature Access</span>
          </li>
        </ul>
        {showGetStartedButton && (
          <button
            onClick={onGetStarted}
            className="block w-full text-center bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-full font-medium hover:from-indigo-700 hover:to-indigo-800 transition-colors"
          >
            Start Free Trial
          </button>
        )}
      </div>

      <div
        className={`p-6 rounded-2xl ${
          subscription?.status === "active"
            ? "border-2 border-indigo-600 bg-indigo-50"
            : "border-2 border-indigo-600 bg-indigo-50"
        } transform scale-105`}
      >
        <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
          Most Popular
        </div>
        {subscription?.status === "active" && (
          <div className="mb-4 p-2 bg-indigo-100 text-indigo-800 rounded text-sm">
            Your Current Plan
          </div>
        )}
        {subscription?.status === "cancelled" && (
          <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
            Subscription Cancelled
          </div>
        )}
        {subscription?.status === "past_due" && (
          <div className="mb-4 p-2 bg-red-100 text-red-800 rounded text-sm">Payment Failed</div>
        )}
        <h3 className="text-xl font-semibold mb-4">Single Therapist</h3>
        <div className="text-4xl font-bold text-indigo-600 mb-6">
          $99<span className="text-lg text-gray-500">/month</span>
        </div>
        <p className="text-gray-600 mb-6">Perfect for individual practitioners</p>
        <ul className="space-y-4 mb-8">
          <li className="flex items-center">
            <svg
              className="w-5 h-5 text-green-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>All 6 AI Agents</span>
          </li>
          <li className="flex items-center">
            <svg
              className="w-5 h-5 text-green-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Up to 25 Clients</span>
          </li>
          <li className="flex items-center">
            <svg
              className="w-5 h-5 text-green-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Full Feature Access</span>
          </li>
        </ul>
        {showUpgradeButton &&
          (subscription?.status === "trial" ||
            subscription?.status === "cancelled" ||
            subscription?.status === "past_due") && (
            <button
              onClick={onUpgrade}
              disabled={upgrading}
              className="block w-full text-center bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-full font-medium hover:from-indigo-700 hover:to-indigo-800 transition-colors disabled:opacity-50"
            >
              {upgrading
                ? "Processing..."
                : subscription?.status === "cancelled"
                  ? "Resubscribe"
                  : subscription?.status === "past_due"
                    ? "Update Payment"
                    : "Upgrade Now"}
            </button>
          )}
      </div>
    </div>
  );
}
