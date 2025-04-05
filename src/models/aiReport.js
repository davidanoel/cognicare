import mongoose from "mongoose";

const aiReportSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["assessment", "diagnostic", "progress", "treatment"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    content: {
      summary: String,
      riskLevel: {
        type: String,
        enum: ["low", "moderate", "high", "severe"],
      },
      primaryConcerns: [String],
      diagnoses: [
        {
          code: String,
          name: String,
          description: String,
        },
      ],
      recommendations: [String],
    },
    source: {
      type: String,
      required: true,
      enum: ["initial-assessment", "session-notes", "progress-review"],
    },
    status: {
      type: String,
      required: true,
      default: "active",
      enum: ["active", "archived"],
    },
    metadata: {
      sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
      },
      confidence: Number,
      modelVersion: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
aiReportSchema.index({ clientId: 1, type: 1, timestamp: -1 });

const AIReport = mongoose.models.AIReport || mongoose.model("AIReport", aiReportSchema);

export default AIReport;
