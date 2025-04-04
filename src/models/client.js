import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  counselorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female", "other"],
  },
  contactInfo: {
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
  },
  demographics: {
    ethnicity: String,
    occupation: String,
    maritalStatus: String,
    education: String,
  },
  clinicalInfo: {
    presentingProblems: [String],
    diagnosis: [
      {
        code: String, // DSM-5/ICD-10 code
        name: String,
        dateAssigned: Date,
        status: {
          type: String,
          enum: ["active", "resolved", "in-remission"],
          default: "active",
        },
      },
    ],
    medications: [
      {
        name: String,
        dosage: String,
        frequency: String,
        prescriber: String,
        startDate: Date,
        endDate: Date,
        status: {
          type: String,
          enum: ["current", "discontinued"],
          default: "current",
        },
      },
    ],
    allergies: [String],
    medicalHistory: [String],
    familyHistory: String,
    substanceUse: {
      current: [String],
      past: [String],
      notes: String,
    },
  },
  riskFactors: {
    suicideRisk: {
      level: {
        type: String,
        enum: ["none", "low", "moderate", "high", "severe"],
        default: "none",
      },
      lastAssessed: Date,
      notes: String,
    },
    selfHarm: {
      present: Boolean,
      history: String,
    },
    violence: {
      risk: {
        type: String,
        enum: ["none", "low", "moderate", "high"],
        default: "none",
      },
      notes: String,
    },
  },
  treatmentPlan: {
    goals: [
      {
        description: String,
        type: {
          type: String,
          enum: ["short-term", "long-term"],
        },
        status: {
          type: String,
          enum: ["active", "achieved", "discontinued"],
          default: "active",
        },
        targetDate: Date,
        progress: Number, // 0-100
        interventions: [String],
      },
    ],
    approachesUsed: [String],
    strengthsIdentified: [String],
    barriersIdentified: [String],
  },
  aiInsights: {
    patternAnalysis: {
      behavioralPatterns: [String],
      triggerPatterns: [String],
      copingMechanisms: [String],
      lastUpdated: Date,
    },
    riskAssessment: {
      currentRiskFactors: [String],
      protectiveFactors: [String],
      recommendedInterventions: [String],
      lastUpdated: Date,
    },
    treatmentProgress: {
      overallTrend: {
        type: String,
        enum: ["improving", "stable", "declining", "fluctuating"],
      },
      keyInsights: [String],
      recommendedAdjustments: [String],
      lastUpdated: Date,
    },
  },
  status: {
    type: String,
    enum: ["active", "inactive", "completed", "transferred"],
    default: "active",
  },
  initialAssessment: {
    type: String,
    required: true,
  },
  consentForms: [
    {
      type: {
        type: String,
        enum: ["treatment", "information-release", "privacy-policy"],
      },
      dateSigned: Date,
      status: {
        type: String,
        enum: ["active", "expired", "revoked"],
        default: "active",
      },
      document: String, // URL or reference to document
    },
  ],
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
clientSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Client = mongoose.models.Client || mongoose.model("Client", clientSchema);

export default Client;
