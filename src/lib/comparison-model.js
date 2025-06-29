import { nanoid } from 'nanoid';

export class ComparisonModel {
  constructor({
    orientation1,
    orientation2,
    userProfile,
    aiAnalysis = null,
    createdAt = new Date(),
    id = nanoid()
  }) {
    this.id = id;
    this.orientation1 = orientation1;
    this.orientation2 = orientation2;
    this.userProfile = userProfile;
    this.aiAnalysis = aiAnalysis;
    this.createdAt = createdAt;
    this.updatedAt = new Date();
  }

  // Convert to JSON for storage
  toJSON() {
    return {
      id: this.id,
      orientation1: this.orientation1,
      orientation2: this.orientation2,
      userProfile: this.userProfile,
      aiAnalysis: this.aiAnalysis,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  // Create from JSON
  static fromJSON(data) {
    return new ComparisonModel({
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    });
  }

  // Update AI analysis
  updateAiAnalysis(aiAnalysis) {
    this.aiAnalysis = aiAnalysis;
    this.updatedAt = new Date();
  }

  // Generate shareable URL
  getShareableUrl() {
    return `/comparison/${this.id}`;
  }

  // Validate comparison data
  isValid() {
    return (
      this.orientation1 && 
      this.orientation2 && 
      this.userProfile &&
      this.userProfile.score >= 0 && 
      this.userProfile.score <= 200 &&
      this.userProfile.location
    );
  }
}

// Comparison Data Schema for validation
export const ComparisonSchema = {
  id: String,
  orientation1: {
    id: String,
    name: String,
    category: String,
    description: String,
    requirements: {
      minScore: Number,
      subjects: Array
    },
    opportunities: Array,
    universities: Array,
    jobMarket: Object
  },
  orientation2: {
    // Same structure as orientation1
  },
  userProfile: {
    score: Number, // 0-200 (Tunisian baccalaureate system)
    location: String,
    selectedAt: Date
  },
  aiAnalysis: {
    overview: String,
    orientation1Analysis: {
      strengths: Array,
      challenges: Array,
      suitabilityScore: Number,
      careerProspects: Array
    },
    orientation2Analysis: {
      strengths: Array,
      challenges: Array,
      suitabilityScore: Number,
      careerProspects: Array
    },
    recommendation: {
      preferred: String,
      reasoning: String,
      actionSteps: Array
    },
    universitiesComparison: Array,
    generatedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
};
