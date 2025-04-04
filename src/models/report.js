import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true,
  },
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
  type: {
    type: String,
    enum: ["session", "progress", "assessment", "discharge", "incident", "treatment-plan"],
    required: true,
  },
  content: {
    summary: {
      type: String,
      required: true,
    },
    analysis: String,
    clinicalFormulation: {
      predisposingFactors: [String],
      precipitatingFactors: [String],
      perpetuatingFactors: [String],
      protectiveFactors: [String],
      hypotheses: [String],
    },
    recommendations: [String],
    riskAssessment: {
      level: {
        type: String,
        enum: ["none", "low", "moderate", "high", "severe"],
      },
      factors: [String],
      warning_signs: [String],
      safety_plan: {
        triggers: [String],
        coping_strategies: [String],
        support_system: [String],
        emergency_contacts: [String],
      },
      notes: String,
    },
    treatmentProgress: {
      status: {
        type: String,
        enum: ["improving", "stable", "declining", "fluctuating"],
      },
      goalProgress: [
        {
          goalId: String,
          description: String,
          progress: Number,
          barriers: [String],
          facilitators: [String],
        },
      ],
      interventionEffectiveness: [
        {
          intervention: String,
          effectiveness: Number,
          notes: String,
        },
      ],
      notes: String,
      nextSteps: [String],
    },
  },
  aiAnalysis: {
    sentimentAnalysis: {
      overallScore: Number,
      progression: {
        trend: String,
        keyChanges: [String],
      },
      emotionalThemes: [
        {
          theme: String,
          intensity: Number,
          frequency: Number,
        },
      ],
    },
    therapeuticInsights: {
      keyPatterns: [
        {
          pattern: String,
          evidence: [String],
          significance: String,
        },
      ],
      relationshipDynamics: {
        therapeutic_alliance: {
          strength: Number,
          observations: [String],
        },
        interpersonal_patterns: [String],
      },
      treatment_implications: [String],
    },
    riskAnalysis: {
      currentRisks: [
        {
          type: String,
          level: String,
          factors: [String],
        },
      ],
      protectiveFactors: [String],
      recommendedActions: [String],
      monitoring_points: [String],
    },
    treatmentEffectiveness: {
      overallProgress: {
        score: Number,
        trend: String,
        keyFactors: [String],
      },
      interventionAnalysis: [
        {
          intervention: String,
          effectiveness: Number,
          recommendations: [String],
        },
      ],
      barriers: [
        {
          description: String,
          impact: String,
          suggestions: [String],
        },
      ],
    },
    futurePredictions: {
      expectedOutcomes: [String],
      potentialChallenges: [String],
      recommendedAdjustments: [String],
      timelineEstimates: {
        shortTerm: [String],
        longTerm: [String],
      },
    },
    diagnosticConsiderations: {
      confirmedDiagnoses: [
        {
          code: String,
          name: String,
          confidence: Number,
          evidence: [String],
        },
      ],
      differentialDiagnoses: [
        {
          code: String,
          name: String,
          likelihood: Number,
          rationale: [String],
        },
      ],
      recommendedAssessments: [String],
    },
  },
  status: {
    type: String,
    enum: ["draft", "completed", "reviewed", "amended"],
    default: "draft",
  },
  reviewNotes: [
    {
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      notes: String,
      date: Date,
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
reportSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Report = mongoose.models.Report || mongoose.model("Report", reportSchema);

export default Report;
