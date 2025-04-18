"use client";

import { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-6xl font-bold text-indigo-900 mb-4">CogniCare</h1>
        <h2 className="text-2xl text-indigo-700 mb-8 font-medium">
          5 AI Agents. One Powerful Team.
        </h2>
        <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
          Meet your team of 5 specialized AI agents, working together to enhance your therapy
          practice.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/signup"
            className="bg-indigo-600 text-white px-8 py-3 rounded-full font-medium hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-200"
          >
            Try CogniCare Free
          </Link>
          <Link
            href="#how-it-works"
            className="bg-white text-indigo-600 px-8 py-3 rounded-full font-medium border border-indigo-200 hover:bg-indigo-50 transition-colors"
          >
            See How It Works
          </Link>
        </div>
      </section>

      {/* AI Team Section - Consolidated */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-indigo-900 mb-12">
            Meet Your AI Therapy Team
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="p-6 rounded-2xl bg-indigo-50 hover:bg-indigo-100 transition-colors">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-indigo-900">Assessment Agent</h3>
                </div>
                <p className="text-gray-600">
                  Conducts initial and ongoing assessments, analyzing client responses and behaviors
                  to identify key areas of focus.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-indigo-50 hover:bg-indigo-100 transition-colors">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-indigo-900">Diagnostic Agent</h3>
                </div>
                <p className="text-gray-600">
                  Analyzes assessment data to provide diagnostic insights and identify patterns in
                  client symptoms and behaviors.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-indigo-50 hover:bg-indigo-100 transition-colors">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-indigo-900">Treatment Agent</h3>
                </div>
                <p className="text-gray-600">
                  Develops personalized treatment plans and suggests evidence-based interventions
                  tailored to each client's needs.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="p-6 rounded-2xl bg-indigo-50 hover:bg-indigo-100 transition-colors">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <h3 className="text-xl font-semibold text-indigo-900">Progress Agent</h3>
                </div>
                <p className="text-gray-600">
                  Tracks and analyzes client progress, identifying trends and suggesting adjustments
                  to treatment plans.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 transition-colors">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">5</span>
                  </div>
                  <h3 className="text-xl font-semibold text-indigo-900">Documentation Agent</h3>
                </div>
                <p className="text-gray-600">
                  Coordinates with all agents to maintain comprehensive records, ensuring HIPAA
                  compliance and easy access to client history.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border-2 border-indigo-200 hover:border-indigo-300 transition-colors">
                <h3 className="text-xl font-semibold text-indigo-900 mb-4">
                  The Power of Collaboration
                </h3>
                <p className="text-gray-600">
                  These agents work together in real-time, sharing insights and coordinating their
                  efforts to provide comprehensive support for your practice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 bg-indigo-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-indigo-900 mb-12">
            How CogniCare Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white transform hover:scale-105 transition-transform shadow-lg">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl text-indigo-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center text-indigo-900">
                Record Your Session
              </h3>
              <p className="text-gray-600 text-center">
                Simply record your therapy session. Our AI will handle the rest.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white transform hover:scale-105 transition-transform shadow-lg">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl text-indigo-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center text-indigo-900">
                Get AI Insights
              </h3>
              <p className="text-gray-600 text-center">
                Our AI team analyzes the session and provides comprehensive insights.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white transform hover:scale-105 transition-transform shadow-lg">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl text-indigo-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center text-indigo-900">
                Focus on Therapy
              </h3>
              <p className="text-gray-600 text-center">
                Spend more time with clients while we handle the documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits - Consolidated */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-indigo-900 mb-12">
            Transform Your Practice
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-indigo-900">Smart Documentation</h3>
              <p className="text-gray-600">
                Save 5+ hours per week on paperwork. Our AI handles the boring stuff so you can
                focus on what matters.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-indigo-900">Progress Tracking</h3>
              <p className="text-gray-600">
                Beautiful charts and insights help you track client progress and celebrate their
                wins.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-indigo-900">Treatment Planning</h3>
              <p className="text-gray-600">
                Get AI-powered treatment suggestions and goal tracking to help your clients succeed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-indigo-900 mb-12">
            Everything You Need in One Place with CogniCare
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-indigo-600"
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
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-indigo-900">AI Session Notes</h3>
                  <p className="text-gray-600">
                    No more late nights writing notes. Our AI captures everything important from
                    your sessions.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-indigo-600"
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
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-indigo-900">Treatment Planning</h3>
                  <p className="text-gray-600">
                    Get personalized treatment suggestions based on evidence-based practices.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-indigo-600"
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
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-indigo-900">Progress Analytics</h3>
                  <p className="text-gray-600">
                    Beautiful charts and insights to track client progress and celebrate their wins.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-indigo-600"
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
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-indigo-900">Comprehensive Reporting</h3>
                  <p className="text-gray-600">
                    Generate detailed reports for insurance, supervision, and client progress
                    tracking. Export in multiple formats with custom branding.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-indigo-600"
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
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-indigo-900">Risk Assessment</h3>
                  <p className="text-gray-600">
                    AI-powered tools to help you identify and monitor client risk factors.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-indigo-600"
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
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-indigo-900">Session Prep</h3>
                  <p className="text-gray-600">
                    Get personalized recommendations and focus areas for each session.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-indigo-600"
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
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-indigo-900">HIPAA Compliant</h3>
                  <p className="text-gray-600">
                    Your client&apos;s data is always safe and secure with enterprise-grade
                    protection.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-indigo-600"
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
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-indigo-900">Custom Report Templates</h3>
                  <p className="text-gray-600">
                    Create and save your own report templates for different purposes, from progress
                    notes to treatment summaries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-indigo-900 mb-12">
            Simple, Fair Pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-4">Starter</h3>
              <div className="text-4xl font-bold text-indigo-600 mb-6">
                $29<span className="text-lg text-gray-500">/month</span>
              </div>
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
                  <span>Up to 20 clients</span>
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
                  <span>Basic AI features</span>
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
                  <span>Email support</span>
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-full font-medium hover:from-indigo-700 hover:to-indigo-800 transition-colors"
              >
                Get Started
              </Link>
            </div>

            <div className="p-8 rounded-2xl border-2 border-indigo-600 bg-indigo-50 transform scale-105">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold mb-4">Professional</h3>
              <div className="text-4xl font-bold text-indigo-600 mb-6">
                $59<span className="text-lg text-gray-500">/month</span>
              </div>
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
                  <span>Up to 50 clients</span>
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
                  <span>Advanced AI features</span>
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
                  <span>Priority support</span>
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
                  <span>Custom treatment plans</span>
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-full font-medium hover:from-indigo-700 hover:to-indigo-800 transition-colors"
              >
                Get Started
              </Link>
            </div>

            <div className="p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-4">Enterprise</h3>
              <div className="text-4xl font-bold text-indigo-600 mb-6">
                $99<span className="text-lg text-gray-500">/month</span>
              </div>
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
                  <span>Unlimited clients</span>
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
                  <span>All AI features</span>
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
                  <span>24/7 support</span>
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
                  <span>Custom integrations</span>
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-full font-medium hover:from-indigo-700 hover:to-indigo-800 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Practice with CogniCare?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of therapists who are using CogniCare to enhance their practice and
            improve client outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-indigo-600 px-8 py-3 rounded-full font-medium hover:bg-indigo-50 transition-colors shadow-lg"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="bg-transparent text-white px-8 py-3 rounded-full font-medium border-2 border-white hover:bg-white/10 transition-colors"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-indigo-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-indigo-900">CogniCare</h3>
              <p className="text-gray-600">
                Helping therapists focus on what matters most - their clients.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-indigo-900">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-gray-600 hover:text-indigo-500">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-600 hover:text-indigo-500">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/demo" className="text-gray-600 hover:text-indigo-500">
                    Demo
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-indigo-900">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/blog" className="text-gray-600 hover:text-teal-500">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-gray-600 hover:text-teal-500">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-gray-600 hover:text-teal-500">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-teal-800">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-teal-500">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-gray-600 hover:text-teal-500">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-teal-500">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>© 2024 CogniCare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
