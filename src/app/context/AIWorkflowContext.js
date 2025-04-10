"use client";

import { createContext, useContext, useState } from "react";

const AIWorkflowContext = createContext();

export function AIWorkflowProvider({ children }) {
  const [status, setStatus] = useState("idle");
  const [results, setResults] = useState(null);
  const [activeStage, setActiveStage] = useState(null);
  const [error, setError] = useState(null);

  return (
    <AIWorkflowContext.Provider
      value={{
        status,
        setStatus,
        results,
        setResults,
        activeStage,
        setActiveStage,
        error,
        setError,
      }}
    >
      {children}
    </AIWorkflowContext.Provider>
  );
}

export function useAIWorkflow() {
  const context = useContext(AIWorkflowContext);
  if (!context) {
    throw new Error("useAIWorkflow must be used within an AIWorkflowProvider");
  }
  return context;
}
