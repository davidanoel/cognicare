"use client";

import { useState, useEffect } from "react";

export default function AIWorkflowTest({ title = "AI Workflow Test" }) {
  const [status, setStatus] = useState("checking");
  const [apiInfo, setApiInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkWorkflow = async () => {
      try {
        console.log("Checking AI workflow...");
        const response = await fetch("/api/ai/workflow-check");

        if (!response.ok) {
          throw new Error(`API check failed: ${response.status}`);
        }

        const data = await response.json();
        console.log("AI workflow check response:", data);
        setApiInfo(data);
        setStatus("available");
      } catch (err) {
        console.error("AI workflow check error:", err);
        setError(err.message);
        setStatus("error");
      }
    };

    checkWorkflow();
  }, []);

  // Add visible debug element so we can confirm the component renders
  useEffect(() => {
    // Create a debug element to show in the DOM
    const debugDiv = document.createElement("div");
    debugDiv.id = "ai-workflow-test-rendered";
    debugDiv.style.position = "fixed";
    debugDiv.style.bottom = "10px";
    debugDiv.style.right = "10px";
    debugDiv.style.backgroundColor = "rgba(255, 255, 0, 0.8)";
    debugDiv.style.padding = "5px";
    debugDiv.style.borderRadius = "3px";
    debugDiv.style.fontSize = "12px";
    debugDiv.style.zIndex = "9999";
    debugDiv.textContent = `AIWorkflowTest rendered at ${new Date().toLocaleTimeString()}`;

    document.body.appendChild(debugDiv);

    // Clean up on unmount
    return () => {
      const existingDebug = document.getElementById("ai-workflow-test-rendered");
      if (existingDebug) {
        document.body.removeChild(existingDebug);
      }
    };
  }, []);

  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>

      {status === "checking" && (
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          <span>Checking AI workflow availability...</span>
        </div>
      )}

      {status === "error" && (
        <div className="text-red-500">
          <p className="font-medium">Error connecting to AI workflow</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {status === "available" && apiInfo && (
        <div className="text-green-600">
          <p className="font-medium">✅ AI workflow available</p>
          <div className="mt-2 text-xs text-gray-600">
            <p>Status: {apiInfo.status}</p>
            <p>Message: {apiInfo.message}</p>
            <p>Available routes: {apiInfo.availableRoutes.length}</p>
            <p>Version: {apiInfo.version}</p>
          </div>
        </div>
      )}
    </div>
  );
}
