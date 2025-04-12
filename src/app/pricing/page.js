"use client";

import Link from "next/link";

export default function PricingPage() {
  const features = [
    "AI-powered session analysis",
    "Comprehensive report generation",
    "Client management",
    "Session tracking",
    "Basic analytics",
    "Email support",
  ];

  const professionalFeatures = [
    ...features,
    "Advanced AI insights",
    "Custom report templates",
    "Team collaboration",
    "Priority support",
    "Data export",
    "API access",
  ];

  const enterpriseFeatures = [
    ...professionalFeatures,
    "Custom AI models",
    "Dedicated support",
    "Custom integrations",
    "Advanced security",
    "Training sessions",
    "SLA guarantees",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
        {/* Hero Section */}
        <div className="relative bg-blue-50">
          <div className="max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Simple, Transparent Pricing
              </h1>
              <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
                Choose the plan that's right for your practice. All plans include our core
                AI-powered features.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Basic Plan */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-8">
                <h3 className="text-lg font-medium text-gray-900">Basic</h3>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">$49</span>
                  <span className="text-base font-medium text-gray-500">/month</span>
                </p>
                <p className="mt-4 text-sm text-gray-500">
                  Perfect for individual practitioners starting with AI-powered mental health care.
                </p>
                <div className="mt-6">
                  <Link
                    href="/signup?plan=basic"
                    className="block w-full bg-blue-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-700"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
              <div className="border-t border-gray-200 px-6 pt-6 pb-8">
                <h4 className="text-sm font-medium text-gray-900">What's included</h4>
                <ul className="mt-6 space-y-4">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p className="ml-3 text-sm text-gray-500">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Professional Plan */}
            <div className="bg-white border-2 border-blue-600 rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Professional</h3>
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Most Popular
                  </span>
                </div>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">$99</span>
                  <span className="text-base font-medium text-gray-500">/month</span>
                </p>
                <p className="mt-4 text-sm text-gray-500">
                  Ideal for growing practices that need advanced features and team collaboration.
                </p>
                <div className="mt-6">
                  <Link
                    href="/signup?plan=professional"
                    className="block w-full bg-blue-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-700"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
              <div className="border-t border-gray-200 px-6 pt-6 pb-8">
                <h4 className="text-sm font-medium text-gray-900">What's included</h4>
                <ul className="mt-6 space-y-4">
                  {professionalFeatures.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p className="ml-3 text-sm text-gray-500">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-8">
                <h3 className="text-lg font-medium text-gray-900">Enterprise</h3>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">$299</span>
                  <span className="text-base font-medium text-gray-500">/month</span>
                </p>
                <p className="mt-4 text-sm text-gray-500">
                  For large organizations requiring custom solutions and dedicated support.
                </p>
                <div className="mt-6">
                  <Link
                    href="/contact"
                    className="block w-full bg-blue-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-700"
                  >
                    Contact Sales
                  </Link>
                </div>
              </div>
              <div className="border-t border-gray-200 px-6 pt-6 pb-8">
                <h4 className="text-sm font-medium text-gray-900">What's included</h4>
                <ul className="mt-6 space-y-4">
                  {enterpriseFeatures.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p className="ml-3 text-sm text-gray-500">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-extrabold text-gray-900 text-center">
                Frequently Asked Questions
              </h2>
              <div className="mt-12 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Can I change plans later?</h3>
                  <p className="mt-2 text-gray-500">
                    Yes, you can upgrade or downgrade your plan at any time. Changes will be
                    reflected in your next billing cycle.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Is there a free trial?</h3>
                  <p className="mt-2 text-gray-500">
                    Yes, we offer a 14-day free trial for all plans. No credit card required to
                    start.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    What payment methods do you accept?
                  </h3>
                  <p className="mt-2 text-gray-500">
                    We accept all major credit cards. Enterprise customers can also arrange for
                    invoice-based billing.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Do you offer discounts for non-profits?
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Yes, we offer special pricing for non-profit organizations. Contact our sales
                    team for more information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              <span className="block">Ready to get started?</span>
              <span className="block text-blue-600">Start your free trial today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Get started
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                >
                  Contact sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
