"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ClientAnalytics({ clientId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [clientId]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}/analytics`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Custom tooltip component with a fun twist
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-blue-200 rounded shadow-lg">
          <p className="font-medium text-blue-600">{formatDate(label)}</p>
          <p className="text-gray-700">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-4 text-gray-600 flex items-center gap-2">
        <span className="animate-spin">⏳</span> Crunching the numbers...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 flex items-center gap-2">
        <span className="text-xl">⚠️</span> Oops! {error}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-blue-100 p-4 rounded-lg flex items-center gap-2">
        <span className="text-2xl">📊</span>
        <p className="text-blue-700 text-sm">
          No analytics yet! Let’s get some data flowing to see the magic.
        </p>
      </div>
    );
  }

  // Deduplicate risk factors
  const uniqueRiskFactors = [...new Set(analytics.keyInsights.riskFactors)];

  // Get treatment goals from the first item in the array
  const treatmentGoals = analytics.keyInsights.treatmentGoals?.[0] || {};

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-white to-blue-50 p-6 rounded-xl shadow-lg border border-blue-100 space-y-6">
        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mood Trends Chart */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-xl">😊</span> Mood Vibes
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.moodTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10 }} />
                  <YAxis domain={[1, 10]} width={30} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#8884d8"
                    name="Mood Rating"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Level Trends */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-xl">🚨</span> Risk Radar
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.riskLevels}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10 }} />
                  <YAxis width={30} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="level"
                    stroke="#ff7300"
                    name="Risk Level"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Risk Factors */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span className="text-xl">⚠️</span> Heads Up
            </h3>
            <ul className="text-sm text-gray-700 space-y-2">
              {uniqueRiskFactors.length > 0 ? (
                uniqueRiskFactors.map((factor, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-blue-500">➡️</span> {factor}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">All clear for now!</li>
              )}
            </ul>
          </div>

          {/* Diagnoses */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span className="text-xl">🔍</span> What’s Cooking
            </h3>
            <ul className="text-sm text-gray-700 space-y-2">
              {analytics.keyInsights.diagnoses.length > 0 ? (
                analytics.keyInsights.diagnoses.map((diagnosis, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-blue-500">➡️</span> {diagnosis.name}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No diagnoses yet!</li>
              )}
            </ul>
          </div>

          {/* Treatment Goals */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span className="text-xl">🎯</span> Goal Game
            </h3>
            <div className="text-sm text-gray-700 space-y-4">
              {treatmentGoals.shortTerm?.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-600 mb-1">Quick Hits</h4>
                  <ul className="space-y-2">
                    {treatmentGoals.shortTerm.map((goal, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-blue-500">➡️</span> {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {treatmentGoals.longTerm?.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-600 mb-1">Big Wins</h4>
                  <ul className="space-y-2">
                    {treatmentGoals.longTerm.map((goal, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-blue-500">➡️</span> {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!treatmentGoals.shortTerm?.length && !treatmentGoals.longTerm?.length && (
                <p className="text-gray-500">No goals on the board yet!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
