import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  counselorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  type: {
    type: String,
    enum: ["initial", "followup", "assessment", "crisis", "group", "family"],
    required: true,
  },
  format: {
    type: String,
    enum: ["in-person", "video", "phone", "chat"],
    required: true,
  },
  status: {
    type: String,
    enum: ["scheduled", "in-progress", "completed", "cancelled", "no-show"],
    default: "scheduled",
  },
  // Raw input from counselor
  notes: {
    type: String,
    required: true,
  },
  // Basic session metrics
  moodRating: {
    type: Number,
    min: 1,
    max: 10,
  },
  // AI Agent Generated Content
  aiContent: {
    assessment: {
      symptoms: [
        {
          name: String,
          severity: Number,
          change: String,
          notes: String,
        },
      ],
      mentalStatus: String,
      riskLevel: {
        type: String,
        enum: ["none", "low", "moderate", "high", "severe"],
      },
      observations: [String],
    },
    diagnostic: {
      impressions: [String],
      recommendations: [String],
      concerns: [String],
    },
    treatment: {
      goals: [
        {
          description: String,
          progress: Number,
          status: String,
        },
      ],
      interventions: [
        {
          type: String,
          effectiveness: Number,
          notes: String,
        },
      ],
      plan: [String],
    },
    progress: {
      overview: String,
      improvements: [String],
      challenges: [String],
      nextSteps: [String],
    },
    documentation: {
      soap: {
        subjective: String,
        objective: String,
        assessment: String,
        plan: String,
      },
      keyThemes: [String],
      riskFlags: [
        {
          type: String,
          severity: String,
          recommendations: [String],
        },
      ],
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamps before saving
sessionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);

export default Session;
