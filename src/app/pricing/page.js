// In src/app/pricing/page.js
"use client";

import { CheckIcon } from "@heroicons/react/24/outline";

const tiers = [
  {
    name: "Free Trial",
    price: "$0",
    description: "Try all features for 14 days",
    features: [
      "All 6 AI Agents",
      "Up to 3 Clients",
      "Full Feature Access",
      "Email Support",
      "14-day Trial Period",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Single Therapist",
    price: "$99",
    period: "/month",
    description: "Perfect for individual practitioners",
    features: [
      "All 6 AI Agents",
      "Up to 25 Clients",
      "Full Feature Access",
      "Email Support",
      "1 Therapist License",
    ],
    cta: "Get Started",
    highlighted: true,
  },
];

const AIAgentSection = () => (
  <div className="bg-gray-50 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Your AI Therapy Team</h2>
        <p className="mt-4 text-lg text-gray-500">
          Each plan includes our complete suite of AI agents
        </p>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            name: "Assessment Agent",
            description: "Risk assessment and initial evaluation",
          },
          {
            name: "Diagnostic Agent",
            description: "Clinical insights and diagnosis support",
          },
          {
            name: "Treatment Agent",
            description: "Treatment planning and recommendations",
          },
          {
            name: "Progress Agent",
            description: "Session progress tracking and analysis",
          },
          {
            name: "Documentation Agent",
            description: "Automated note-taking and documentation",
          },
          {
            name: "Conversational Agent",
            description: "Real-time session support and assistance",
          },
        ].map((agent) => (
          <div key={agent.name} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">{agent.name}</h3>
            <p className="mt-2 text-sm text-gray-500">{agent.description}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function PricingPage() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-center">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-5 text-xl text-gray-500 sm:text-center">
            Choose the plan that fits your practice
          </p>
        </div>
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`border rounded-lg shadow-sm divide-y divide-gray-200 ${
                tier.highlighted ? "border-indigo-500 ring-2 ring-indigo-500" : "border-gray-200"
              }`}
            >
              <div className="p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">{tier.name}</h2>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">{tier.price}</span>
                  {tier.period && (
                    <span className="text-base font-medium text-gray-500">{tier.period}</span>
                  )}
                </p>
                <p className="mt-4 text-sm text-gray-500">{tier.description}</p>
                <button
                  className={`mt-8 block w-full rounded-md py-2 text-sm font-semibold text-white ${
                    tier.highlighted
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-gray-800 hover:bg-gray-900"
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                  What's included
                </h3>
                <ul className="mt-6 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <CheckIcon
                        className="flex-shrink-0 h-5 w-5 text-green-500"
                        aria-hidden="true"
                      />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need more?{" "}
            <a href="/contact" className="text-indigo-600 hover:text-indigo-500">
              Contact us
            </a>{" "}
            for custom plans
          </p>
        </div>
      </div>
      <AIAgentSection />
    </div>
  );
}
