# Tunisian Bac Orientation Comparison App

A Next.js 14 app router project that helps Tunisian bac students compare academic orientations using AI-powered analysis and interactive chat.

## 🚀 Project Overview

This application allows students to:
1. Select two academic orientations from a comprehensive list
2. Enter their bac score and location
3. Get AI-generated comparisons between orientations
4. Ask follow-up questions through an interactive chatbot

## 📋 Technical Plan

### Phase 1: Project Setup and Dependencies

#### 1.1 Install Required Dependencies
```bash
npm install @azure/openai ai zod react-hook-form @hookform/resolvers lucide-react nanoid
```

#### 1.2 Environment Variables
Create `.env.local`:
```env
AZURE_OPENAI_API_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=your_azure_endpoint
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name
```

### Phase 2: Data Structure and JSON Schema

#### 2.1 Orientations JSON Structure
```json
{
  "orientations": [
    {
      "id": "sciences-math",
      "name": "Sciences Mathématiques",
      "category": "Sciences",
      "description": "Formation axée sur les mathématiques et les sciences exactes",
      "requirements": {
        "minScore": 12.0,
        "subjects": ["Mathématiques", "Physique", "Chimie"]
      },
      "opportunities": [
        "Ingénierie",
        "Recherche scientifique",
        "Enseignement",
        "Informatique"
      ],
      "universities": [
        {
          "name": "ENIT",
          "location": "Tunis",
          "minScore": 16.0,
          "specialties": ["Génie Civil", "Génie Informatique"]
        },
        {
          "name": "FST",
          "location": "Tunis",
          "minScore": 14.0,
          "specialties": ["Mathématiques", "Physique"]
        }
      ],
      "jobMarket": {
        "demandLevel": "high",
        "averageSalary": "2500-4000 TND",
        "growth": "positive"
      }
    },
    {
      "id": "lettres",
      "name": "Lettres",
      "category": "Humanités",
      "description": "Formation en langues, littérature et sciences humaines",
      "requirements": {
        "minScore": 10.0,
        "subjects": ["Français", "Arabe", "Philosophie"]
      },
      "opportunities": [
        "Enseignement",
        "Traduction",
        "Journalisme",
        "Communication"
      ],
      "universities": [
        {
          "name": "Faculté des Lettres Tunis",
          "location": "Tunis",
          "minScore": 12.0,
          "specialties": ["Langue Française", "Langue Arabe"]
        }
      ],
      "jobMarket": {
        "demandLevel": "medium",
        "averageSalary": "1200-2500 TND",
        "growth": "stable"
      }
    }
  ],
  "governorates": [
    "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan",
    "Bizerte", "Béja", "Jendouba", "Kef", "Siliana", "Sousse",
    "Monastir", "Mahdia", "Sfax", "Kairouan", "Kasserine", "Sidi Bouzid",
    "Gabès", "Médenine", "Tataouine", "Gafsa", "Tozeur", "Kébili"
  ]
}
```

### Phase 3: Route Structure and Navigation

#### 3.1 App Router Structure
```
src/
├── app/
│   ├── page.jsx                   # Home page with orientation selection form
│   ├── comparison/
│   │   └── [id]/
│   │       └── page.jsx          # Results page with split layout
│   ├── api/
│   │   └── chat/
│   │       └── route.js          # API for streamText (streaming only)
│   ├── actions/
│   │   ├── comparison-actions.js  # Server actions for CRUD operations
│   │   └── ai-comparison.js       # AI model integration with generateObject
│   ├── components/
│   │   ├── OrientationForm.jsx   # Form component
│   │   ├── ComparisonView.jsx    # Left side comparison
│   │   ├── ChatBot.jsx           # Right side chatbot
│   │   └── LoadingSpinner.jsx    # Loading states
│   ├── lib/
│   │   ├── azure-ai.js           # Azure AI SDK configuration
│   │   ├── orientations.js       # Data utilities
│   │   ├── comparison-model.js   # Comparison model and storage
│   │   ├── comparison-storage.js # Storage logic
│   │   └── prompts.js            # System prompts for AI
│   └── data/
│       └── orientations.json     # Orientations data
```

#### 3.2 Comparison Model Structure
```javascript
// lib/comparison-model.js
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
      this.userProfile.score <= 20 &&
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
    score: Number, // 0-20
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
```

#### 3.3 Comparison Storage Service
```javascript
// lib/comparison-storage.js
import { ComparisonModel } from './comparison-model';

// In-memory storage (for development)
// In production, replace with database (MongoDB, PostgreSQL, etc.)
const comparisonStore = new Map();

export class ComparisonStorage {
  // Create new comparison
  static async create(comparisonData) {
    const comparison = new ComparisonModel(comparisonData);
    
    if (!comparison.isValid()) {
      throw new Error('Invalid comparison data');
    }

    comparisonStore.set(comparison.id, comparison.toJSON());
    return comparison;
  }

  // Get comparison by ID
  static async getById(id) {
    const data = comparisonStore.get(id);
    if (!data) {
      return null;
    }
    return ComparisonModel.fromJSON(data);
  }

  // Update comparison
  static async update(id, updates) {
    const existing = comparisonStore.get(id);
    if (!existing) {
      throw new Error('Comparison not found');
    }

    const comparison = ComparisonModel.fromJSON(existing);
    Object.assign(comparison, updates);
    comparison.updatedAt = new Date();

    comparisonStore.set(id, comparison.toJSON());
    return comparison;
  }

  // Delete comparison
  static async delete(id) {
    return comparisonStore.delete(id);
  }

  // Get all comparisons (for admin/analytics)
  static async getAll(limit = 100) {
    const all = Array.from(comparisonStore.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
    
    return all.map(data => ComparisonModel.fromJSON(data));
  }

  // Update AI analysis for existing comparison
  static async updateAiAnalysis(id, aiAnalysis) {
    const comparison = await this.getById(id);
    if (!comparison) {
      throw new Error('Comparison not found');
    }

    comparison.updateAiAnalysis(aiAnalysis);
    comparisonStore.set(id, comparison.toJSON());
    return comparison;
  }
}
```

#### 3.4 Server Actions in `src/actions` Folder

##### AI Comparison Model (`src/actions/ai-comparison.js`)
```javascript
// src/actions/ai-comparison.js
'use server';

import { generateObject } from 'ai';
import { client } from '@/lib/azure-ai';
import { getComparisonSystemPrompt } from '@/lib/prompts';
import { z } from 'zod';

// Schema for AI response structure
const ComparisonAISchema = z.object({
  overview: z.string().describe("Overall comparison summary using all user data"),
  userProfileAnalysis: z.object({
    scoreAssessment: z.string().describe("Analysis of student's score relative to both orientations"),
    locationAdvantages: z.string().describe("Geographic advantages based on student's location"),
    readinessLevel: z.string().describe("Student's readiness for each orientation")
  }),
  orientation1Analysis: z.object({
    name: z.string(),
    strengths: z.array(z.string()),
    challenges: z.array(z.string()),
    suitabilityScore: z.number().describe("Score from 1-10 based on user's profile"),
    careerProspects: z.array(z.string()),
    accessibleUniversities: z.array(z.string()).describe("Universities accessible with user's score and location"),
    admissionProbability: z.number().min(0).max(100).describe("Chance of admission percentage")
  }),
  orientation2Analysis: z.object({
    name: z.string(),
    strengths: z.array(z.string()),
    challenges: z.array(z.string()),
    suitabilityScore: z.number().describe("Score from 1-10 based on user's profile"),
    careerProspects: z.array(z.string()),
    accessibleUniversities: z.array(z.string()).describe("Universities accessible with user's score and location"),
    admissionProbability: z.number().min(0).max(100).describe("Chance of admission percentage")
  }),
  recommendation: z.object({
    preferred: z.string().describe("Recommended orientation based on user's profile"),
    reasoning: z.string().describe("Detailed reasoning using user's score and location"),
    actionSteps: z.array(z.string()).describe("Specific next steps for this student"),
    alternativeOptions: z.array(z.string()).describe("Other suggestions based on user's score")
  }),
  universitiesAnalysis: z.array(z.object({
    name: z.string(),
    location: z.string(),
    orientation: z.string(),
    admissionProbability: z.number().min(0).max(100),
    advantages: z.array(z.string()),
    requirements: z.string(),
    applicationDeadlines: z.string(),
    scholarshipOpportunities: z.array(z.string())
  })),
  originalUserInput: z.object({
    score: z.number(),
    location: z.string(),
    orientation1Name: z.string(),
    orientation2Name: z.string(),
    selectionDate: z.string()
  }).describe("Original user input for chatbot reference")
});

/**
 * AI Model Integration - Generates comparison using generateObject
 * Receives user data via system prompt and returns structured JSON
 */
export async function generateAIComparison(orientation1, orientation2, userScore, userLocation) {
  try {
    // Create comprehensive system prompt with ALL user data
    const systemPrompt = getComparisonSystemPrompt(
      orientation1, 
      orientation2, 
      userScore, 
      userLocation
    );

    console.log('🤖 Sending data to AI model via system prompt');
    console.log('📊 User Score:', userScore);
    console.log('📍 User Location:', userLocation);
    console.log('🎯 Orientations:', orientation1.name, 'vs', orientation2.name);

    // AI Model processes the system prompt and generates structured response
    const result = await generateObject({
      model: client,
      schema: ComparisonAISchema,
      prompt: systemPrompt,
      temperature: 0.3, // Lower temperature for consistent analysis
    });

    console.log('✅ AI model generated comparison successfully');

    // Return structured data that will be shown to user
    return {
      success: true,
      data: {
        ...result.object,
        originalUserInput: {
          score: userScore,
          location: userLocation,
          orientation1Name: orientation1.name,
          orientation2Name: orientation2.name,
          selectionDate: new Date().toISOString()
        }
      },
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error in AI comparison generation:', error);
    throw new Error(`AI comparison failed: ${error.message}`);
  }
}

/**
 * Regenerate AI analysis for existing comparison
 */
export async function regenerateAIComparison(comparisonData) {
  return await generateAIComparison(
    comparisonData.orientation1,
    comparisonData.orientation2,
    comparisonData.userProfile.score,
    comparisonData.userProfile.location
  );
}
```

##### CRUD Server Actions (`src/actions/comparison-actions.js`)
```javascript
// src/actions/comparison-actions.js
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ComparisonStorage } from '@/lib/comparison-storage';
import { generateAIComparison } from './ai-comparison';

/**
 * Create new comparison with AI analysis
 * This is the main server action called from the form
 */
export async function createComparison(formData) {
  try {
    console.log('🚀 Starting comparison creation...');

    // Extract and parse form data
    const orientation1 = JSON.parse(formData.get('orientation1'));
    const orientation2 = JSON.parse(formData.get('orientation2'));
    const userProfile = JSON.parse(formData.get('userProfile'));

    // Validate required fields
    if (!orientation1 || !orientation2 || !userProfile) {
      throw new Error('Missing required comparison data');
    }

    console.log('📝 User inputs collected:', {
      orientation1: orientation1.name,
      orientation2: orientation2.name,
      score: userProfile.score,
      location: userProfile.location
    });

    // Create comparison record without AI analysis first
    const comparison = await ComparisonStorage.create({
      orientation1,
      orientation2,
      userProfile
    });

    console.log('💾 Comparison record created with ID:', comparison.id);

    // Generate AI analysis using ALL user inputs via system prompt
    console.log('🤖 Generating AI analysis with complete user data...');
    const aiResult = await generateAIComparison(
      orientation1,
      orientation2,
      userProfile.score,
      userProfile.location
    );

    // Update comparison with AI analysis results (this will be shown to user)
    await ComparisonStorage.updateAiAnalysis(comparison.id, aiResult.data);

    console.log('✅ AI analysis completed and stored');

    // Revalidate the comparison page
    revalidatePath(`/comparison/${comparison.id}`);

    console.log('🔄 Redirecting to comparison results...');

    // Redirect to comparison page where results will be displayed
    redirect(`/comparison/${comparison.id}`);

  } catch (error) {
    console.error('❌ Error creating comparison:', error);
    throw new Error(`Failed to create comparison: ${error.message}`);
  }
}

/**
 * Get comparison with all data for display and chatbot context
 */
export async function getComparison(id) {
  try {
    const comparison = await ComparisonStorage.getById(id);
    
    if (!comparison) {
      return null;
    }

    // Return complete data including AI analysis for user display
    return {
      id: comparison.id,
      aiAnalysis: comparison.aiAnalysis, // AI-generated results to show user
      userProfile: comparison.userProfile, // Original user inputs
      orientation1: comparison.orientation1,
      orientation2: comparison.orientation2,
      createdAt: comparison.createdAt,
      updatedAt: comparison.updatedAt
    };
    
  } catch (error) {
    console.error('Error fetching comparison:', error);
    throw new Error(`Failed to fetch comparison: ${error.message}`);
  }
}

/**
 * Form action for creating comparison with progressive enhancement
 */
export async function createComparisonAction(prevState, formData) {
  try {
    await createComparison(formData);
    return { success: true, error: null };
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}
```

#### 3.5 Form Component with Server Actions
```javascript
// components/OrientationForm.jsx
'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { createComparisonAction } from '@/actions/comparison-actions';
import { getAllOrientations, getAllGovernorates } from '@/lib/orientations';
import { useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'Création de la comparaison...' : 'Comparer les orientations'}
    </button>
  );
}

export default function OrientationForm() {
  const [state, formAction] = useFormState(createComparisonAction, {
    success: false,
    error: null
  });
  
  const [selectedOrientations, setSelectedOrientations] = useState([]);
  const [score, setScore] = useState('');
  const [location, setLocation] = useState('');

  const orientations = getAllOrientations();
  const governorates = getAllGovernorates();

  const handleOrientationChange = (orientationId, isChecked) => {
    if (isChecked) {
      if (selectedOrientations.length < 2) {
        setSelectedOrientations([...selectedOrientations, orientationId]);
      }
    } else {
      setSelectedOrientations(selectedOrientations.filter(id => id !== orientationId));
    }
  };

  const isFormValid = selectedOrientations.length === 2 && score && location;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Comparez vos orientations
      </h2>

      {state.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{state.error}</p>
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {/* Hidden inputs for data */}
        <input
          type="hidden"
          name="orientation1"
          value={selectedOrientations[0] ? JSON.stringify(
            orientations.find(o => o.id === selectedOrientations[0])
          ) : ''}
        />
        <input
          type="hidden"
          name="orientation2"
          value={selectedOrientations[1] ? JSON.stringify(
            orientations.find(o => o.id === selectedOrientations[1])
          ) : ''}
        />
        <input
          type="hidden"
          name="userProfile"
          value={JSON.stringify({
            score: parseFloat(score) || 0,
            location,
            selectedAt: new Date().toISOString()
          })}
        />

        {/* Orientation Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Sélectionnez deux orientations à comparer
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {orientations.map((orientation) => (
              <label
                key={orientation.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedOrientations.includes(orientation.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  selectedOrientations.length >= 2 && !selectedOrientations.includes(orientation.id)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedOrientations.includes(orientation.id)}
                  onChange={(e) => handleOrientationChange(orientation.id, e.target.checked)}
                  disabled={selectedOrientations.length >= 2 && !selectedOrientations.includes(orientation.id)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">{orientation.name}</div>
                  <div className="text-sm text-gray-500">{orientation.category}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Score Input */}
        <div>
          <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2">
            Votre note du bac (sur 20)
          </label>
          <input
            type="number"
            id="score"
            min="0"
            max="20"
            step="0.01"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 15.75"
            required
          />
        </div>

        {/* Location Selection */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Votre gouvernorat
          </label>
          <select
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionnez votre gouvernorat</option>
            {governorates.map((gov) => (
              <option key={gov} value={gov}>
                {gov}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <SubmitButton />

        {/* Form Validation Message */}
        {!isFormValid && (
          <p className="text-sm text-gray-500 text-center">
            Veuillez sélectionner 2 orientations, entrer votre note et choisir votre gouvernorat
          </p>
        )}
      </form>
    </div>
  );
}
```

### Phase 4: AI Workflow and Data Flow

#### 4.1 Complete AI Processing Flow
```
User Form Input → System Prompt → generateObject → JSON Results → Chatbot Context
```

**Step-by-step Process:**
1. **User Input Collection**: Orientation1, Orientation2, Score, Location
2. **System Prompt Generation**: Create detailed prompt with all user data
3. **AI Analysis**: Use generateObject to get structured comparison
4. **Results Storage**: Save JSON results in comparison model
5. **Chatbot Context**: Pass all data to chatbot for user questions

### 🔄 CLEAR AI WORKFLOW EXPLANATION

#### Data Flow: User Input → System Prompt → AI Model → generateObject → Results to User

**Step 1: User Input Collection**
```javascript
// User fills form with:
const userInputs = {
  orientation1: { name: "Sciences Mathématiques", universities: [...], requirements: {...} },
  orientation2: { name: "Lettres", universities: [...], requirements: {...} },
  userProfile: { score: 15.5, location: "Tunis" }
};
```

**Step 2: System Prompt Creation**
```javascript
// src/actions/ai-comparison.js
const systemPrompt = getComparisonSystemPrompt(orientation1, orientation2, userScore, userLocation);
// This creates a comprehensive prompt with ALL user data
```

**Step 3: AI Model Processing**
```javascript
// AI model receives system prompt and generates structured response
const result = await generateObject({
  model: client,
  schema: ComparisonAISchema,
  prompt: systemPrompt  // Contains ALL user input data
});
```

**Step 4: Structured Response to User**
```javascript
// AI returns JSON that will be displayed to user
const aiResponse = {
  overview: "Comparison summary...",
  userProfileAnalysis: { scoreAssessment: "...", locationAdvantages: "..." },
  orientation1Analysis: { strengths: [...], challenges: [...], suitabilityScore: 8 },
  orientation2Analysis: { strengths: [...], challenges: [...], suitabilityScore: 6 },
  recommendation: { preferred: "Sciences Mathématiques", reasoning: "..." },
  universitiesAnalysis: [...],
  originalUserInput: { score: 15.5, location: "Tunis", ... }
};
```

**Step 5: Chatbot Context**
```javascript
// Chatbot receives COMPLETE analysis + original user inputs for intelligent responses
const chatContext = {
  fullComparisonData: aiResponse,
  originalUserInputs: userInputs
};
```

#### Key Points:
- ✅ **ALL user data** (orientations, score, location) goes to AI model via system prompt
- ✅ AI model uses **generateObject** to return structured JSON
- ✅ **Structured response** is displayed to user as comparison results
- ✅ **Complete context** (AI analysis + user inputs) is sent to chatbot
- ✅ Chatbot can answer **specific questions** about the analysis

#### 4.2 Azure AI Configuration
```javascript
// lib/azure-ai.js
import { AzureOpenAI } from '@azure/openai';

const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  apiVersion: "2024-02-15-preview",
});

export { client };
```

#### 4.3 System Prompt Generation
```javascript
// lib/prompts.js
export const generateSystemPrompt = (orientation1, orientation2, userScore, userLocation) => {
  return `You are an expert educational counselor specializing in the Tunisian education system.

STUDENT PROFILE:
- Bac Score: ${userScore}/20
- Location: ${userLocation}
- Selected Orientations: ${orientation1.name} vs ${orientation2.name}

ORIENTATION 1 - ${orientation1.name}:
- Category: ${orientation1.category}
- Description: ${orientation1.description}
- Minimum Score Required: ${orientation1.requirements.minScore}/20
- Required Subjects: ${orientation1.requirements.subjects.join(', ')}
- Career Opportunities: ${orientation1.opportunities.join(', ')}
- Universities Available:
${orientation1.universities.map(uni => 
  `  • ${uni.name} (${uni.location}) - Min Score: ${uni.minScore}/20 - Specialties: ${uni.specialties.join(', ')}`
).join('\n')}
- Job Market: ${orientation1.jobMarket.demandLevel} demand, ${orientation1.jobMarket.averageSalary} salary, ${orientation1.jobMarket.growth} growth

ORIENTATION 2 - ${orientation2.name}:
- Category: ${orientation2.category}
- Description: ${orientation2.description}
- Minimum Score Required: ${orientation2.requirements.minScore}/20
- Required Subjects: ${orientation2.requirements.subjects.join(', ')}
- Career Opportunities: ${orientation2.opportunities.join(', ')}
- Universities Available:
${orientation2.universities.map(uni => 
  `  • ${uni.name} (${uni.location}) - Min Score: ${uni.minScore}/20 - Specialties: ${uni.specialties.join(', ')}`
).join('\n')}
- Job Market: ${orientation2.jobMarket.demandLevel} demand, ${orientation2.jobMarket.averageSalary} salary, ${orientation2.jobMarket.growth} growth

ANALYSIS REQUIREMENTS:
Provide a comprehensive comparison considering:
1. Student's academic eligibility (score vs requirements)
2. Geographic accessibility from ${userLocation}
3. University admission chances based on ${userScore}/20
4. Job market prospects in Tunisia
5. Long-term career growth potential
6. Financial prospects and salary expectations
7. Specific recommendations for this student's profile

Be specific to Tunisian context with actual university names, admission processes, and regional job markets.`;
};

export const generateChatbotSystemPrompt = (comparisonResults, userProfile) => {
  return `You are an expert educational counselor for Tunisian students. You have access to a detailed comparison analysis that was generated specifically for this student.

STUDENT PROFILE:
- Bac Score: ${userProfile.score}/20
- Location: ${userProfile.location}
- Comparing: ${userProfile.orientation1} vs ${userProfile.orientation2}

PREVIOUS ANALYSIS RESULTS:
${JSON.stringify(comparisonResults, null, 2)}

YOUR ROLE:
You must help the student understand this comparison analysis by:
1. Answering questions about the comparison results
2. Explaining university admission processes in Tunisia
3. Clarifying career prospects and job market realities
4. Providing specific action steps for university applications
5. Discussing scholarship opportunities and financial aid
6. Recommending study strategies and preparation tips

GUIDELINES:
- Always reference the specific analysis data provided above
- Use actual Tunisian university names and admission requirements
- Provide practical, actionable advice
- Be encouraging but realistic about challenges
- Explain complex terms in simple language
- Focus on helping the student make informed decisions

CONTEXT AWARENESS:
- Remember the student's score (${userProfile.score}/20) when discussing admission chances
- Consider their location (${userProfile.location}) for geographic recommendations
- Reference the specific orientations they're comparing
- Use the detailed analysis results to support your answers`;
};
```

#### 4.4 AI Comparison Generation with generateObject
```javascript
// lib/comparison-service.js
import { generateObject } from 'ai';
import { client } from './azure-ai';
import { generateSystemPrompt } from './prompts';
import { z } from 'zod';

// Structured schema for comparison results
const ComparisonResultsSchema = z.object({
  overview: z.object({
    summary: z.string().describe("Brief overview of both orientations for this student"),
    studentEligibility: z.string().describe("Analysis of student's eligibility for both orientations"),
    keyDifferences: z.array(z.string()).describe("Main differences between the two orientations")
  }),
  
  orientation1Analysis: z.object({
    name: z.string(),
    eligibilityStatus: z.enum(["eligible", "partially_eligible", "not_eligible"]),
    scoreGap: z.number().describe("Difference between student score and minimum required"),
    strengths: z.array(z.string()).describe("Advantages of this orientation for the student"),
    challenges: z.array(z.string()).describe("Potential difficulties or concerns"),
    admissionChances: z.object({
      percentage: z.number().min(0).max(100),
      reasoning: z.string()
    }),
    careerProspects: z.array(z.string()).describe("Specific career opportunities"),
    financialOutlook: z.object({
      startingSalary: z.string(),
      growthPotential: z.string(),
      jobSecurity: z.string()
    }),
    geographicConsiderations: z.string().describe("Accessibility from student's location")
  }),
  
  orientation2Analysis: z.object({
    name: z.string(),
    eligibilityStatus: z.enum(["eligible", "partially_eligible", "not_eligible"]),
    scoreGap: z.number().describe("Difference between student score and minimum required"),
    strengths: z.array(z.string()).describe("Advantages of this orientation for the student"),
    challenges: z.array(z.string()).describe("Potential difficulties or concerns"),
    admissionChances: z.object({
      percentage: z.number().min(0).max(100),
      reasoning: z.string()
    }),
    careerProspects: z.array(z.string()).describe("Specific career opportunities"),
    financialOutlook: z.object({
      startingSalary: z.string(),
      growthPotential: z.string(),
      jobSecurity: z.string()
    }),
    geographicConsiderations: z.string().describe("Accessibility from student's location")
  }),
  
  comparison: z.object({
    recommendedChoice: z.string().describe("Which orientation is recommended and why"),
    reasoning: z.string().describe("Detailed explanation of the recommendation"),
    alternativeScenarios: z.array(z.string()).describe("Other options to consider"),
    riskAssessment: z.string().describe("Risks and mitigation strategies")
  }),
  
  universitiesAnalysis: z.array(z.object({
    name: z.string(),
    location: z.string(),
    orientation: z.string().describe("Which orientation this university serves"),
    admissionProbability: z.number().min(0).max(100),
    advantages: z.array(z.string()),
    requirements: z.string(),
    applicationDeadlines: z.string(),
    scholarshipOpportunities: z.array(z.string())
  })),
  
  actionPlan: z.object({
    immediateSteps: z.array(z.string()).describe("What to do right now"),
    preparationTips: z.array(z.string()).describe("How to prepare for admission"),
    backupPlans: z.array(z.string()).describe("Alternative options if primary choice fails"),
    timeline: z.string().describe("Timeline for applications and decisions")
  }),
  
  additionalInsights: z.object({
    marketTrends: z.string().describe("Current job market trends in Tunisia"),
    futureOutlook: z.string().describe("Long-term career prospects"),
    skillDevelopment: z.array(z.string()).describe("Skills to develop for chosen path"),
    networkingAdvice: z.string().describe("How to build professional networks")
  })
});

export async function generateComparisonAnalysis(orientation1, orientation2, userScore, userLocation) {
  try {
    const systemPrompt = generateSystemPrompt(orientation1, orientation2, userScore, userLocation);
    
    const result = await generateObject({
      model: client,
      schema: ComparisonResultsSchema,
      prompt: systemPrompt,
      temperature: 0.3, // Lower temperature for more consistent analysis
    });
    
    return {
      success: true,
      data: result.object,
      generatedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error generating comparison analysis:', error);
    throw new Error(`Failed to generate comparison: ${error.message}`);
  }
}
```

#### 4.5 Server Action Integration
```javascript
// lib/comparison-actions.js (updated)
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ComparisonStorage } from './comparison-storage';
import { generateComparisonAnalysis } from './comparison-service';

export async function createComparison(formData) {
  try {
    // Extract and parse form data
    const orientation1 = JSON.parse(formData.get('orientation1'));
    const orientation2 = JSON.parse(formData.get('orientation2'));
    const userProfile = JSON.parse(formData.get('userProfile'));

    // Validate required fields
    if (!orientation1 || !orientation2 || !userProfile) {
      throw new Error('Missing required comparison data');
    }

    // Create comparison record without AI analysis first
    const comparison = await ComparisonStorage.create({
      orientation1,
      orientation2,
      userProfile
    });

    // Generate AI analysis using all user inputs
    const analysisResult = await generateComparisonAnalysis(
      orientation1,
      orientation2,
      userProfile.score,
      userProfile.location
    );

    // Update comparison with AI analysis results
    await ComparisonStorage.updateAiAnalysis(comparison.id, analysisResult.data);

    // Revalidate the comparison page
    revalidatePath(`/comparison/${comparison.id}`);

    // Redirect to comparison page
    redirect(`/comparison/${comparison.id}`);

  } catch (error) {
    console.error('Error creating comparison:', error);
    throw new Error(`Failed to create comparison: ${error.message}`);
  }
}

// Get comparison with all data for chatbot
export async function getComparison(id) {
  try {
    const comparison = await ComparisonStorage.getById(id);
    
    if (!comparison) {
      return null;
    }

    // Return all data needed for chatbot context
    return {
      id: comparison.id,
      aiAnalysis: comparison.aiAnalysis,
      userProfile: comparison.userProfile,
      orientation1: comparison.orientation1,
      orientation2: comparison.orientation2,
      createdAt: comparison.createdAt
    };
    
  } catch (error) {
    console.error('Error fetching comparison for chat:', error);
    throw new Error(`Failed to fetch comparison: ${error.message}`);
  }
}
```

#### 4.6 Chatbot Integration with Full Context
```javascript
// api/chat/route.js
import { streamText } from 'ai';
import { client } from '@/lib/azure-ai';
import { getChatSystemPrompt } from '@/lib/prompts';
import { getComparisonForChat } from '@/lib/comparison-actions';

export async function POST(request) {
  try {
    const { messages, fullComparisonData } = await request.json();

    // Get the full comparison data for context
    const comparisonData = await getComparisonForChat(fullComparisonData.id);
    
    if (!comparisonData) {
      throw new Error('Comparison not found');
    }

    // Generate system prompt with all comparison results
    const systemPrompt = getChatSystemPrompt(
      comparisonData.aiAnalysis,
      comparisonData.userProfile
    );

    const result = await streamText({
      model: client,
      system: systemPrompt,
      messages: messages,
      temperature: 0.7,
      maxTokens: 1000,
    });

    return result.toAIStreamResponse();

  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

#### 4.7 Updated ChatBot Component
```javascript
// components/ChatBot.jsx
'use client';
import { useChat } from 'ai/react';
import { useState } from 'react';

export default function ChatBot({ comparisonData, userProfile, comparisonId }) {
  const [isFirstMessage, setIsFirstMessage] = useState(true);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      // Send COMPLETE comparison data including original user inputs
      fullComparisonData: {
        ...comparisonData,
        originalUserInput: {
          score: userProfile.score,
          location: userProfile.location,
          orientation1Name: comparisonData.orientation1Analysis?.name || userProfile.orientation1,
          orientation2Name: comparisonData.orientation2Analysis?.name || userProfile.orientation2,
          selectionDate: userProfile.selectedAt
        }
      }
    },
    initialMessages: isFirstMessage ? [{
      id: 'welcome',
      role: 'assistant',
      content: `Bonjour ! J'ai analysé votre comparaison entre **${userProfile.orientation1}** et **${userProfile.orientation2}**.

📊 **Votre profil**: ${userProfile.score}/20 à ${userProfile.location}

🎯 **Recommandation**: ${comparisonData.recommendation?.preferred || 'En cours d\'analyse...'}

Je peux vous aider à comprendre cette analyse et répondre à vos questions sur :
• Les chances d'admission dans les universités
• Les perspectives de carrière et salaires
• Les étapes de candidature et délais
• Les alternatives à considérer
• Les bourses et aides financières

Que souhaitez-vous savoir ?`
    }] : [],
    onFinish: () => {
      if (isFirstMessage) setIsFirstMessage(false);
    }
  });

  const quickQuestions = [
    "Quelles sont mes chances d'admission ?",
    "Quelle orientation me recommandez-vous ?",
    "Quelles universités dois-je cibler ?",
    "Comment améliorer mon dossier ?",
    "Quels sont les délais de candidature ?",
    "Y a-t-il des bourses disponibles ?"
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Assistant Orientation IA</h3>
            <p className="text-sm text-gray-600">
              Spécialisé dans le système éducatif tunisien
            </p>
          </div>
        </div>
        
        {/* Student Profile Summary */}
        <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">📊 Score:</span>
            <span className="font-medium text-gray-900">{userProfile.score}/20</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">📍 Localisation:</span>
            <span className="font-medium text-gray-900">{userProfile.location}</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Comparaison: {userProfile.orientation1} vs {userProfile.orientation2}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
              message.role === 'user' 
                ? 'bg-blue-500 text-white rounded-br-sm' 
                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
            }`}>
              {message.role === 'assistant' && index === 0 && (
                <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-gray-100">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-500">Assistant IA</span>
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
              {message.role === 'assistant' && (
                <div className="text-xs text-gray-400 mt-2">
                  {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg px-4 py-3 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm text-gray-500">L'assistant analyse votre question...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && !isLoading && (
        <div className="px-4 py-3 border-t bg-gray-50">
          <p className="text-xs font-medium text-gray-600 mb-2">Questions suggérées :</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.slice(0, 4).map((question, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  handleInputChange({ target: { value: question } });
                  // Auto-submit the question
                  setTimeout(() => {
                    const event = new Event('submit', { bubbles: true, cancelable: true });
                    document.querySelector('form').dispatchEvent(event);
                  }, 100);
                }}
                className="text-xs bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 px-3 py-2 rounded-full border border-gray-200 hover:border-blue-300 transition-colors duration-200 cursor-pointer"
                disabled={isLoading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Tapez votre question ici..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 placeholder-gray-400"
              disabled={isLoading}
              maxLength={500}
            />
            <div className="absolute right-3 top-3 text-xs text-gray-400">
              {input.length}/500
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500 flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Envoi...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Envoyer</span>
              </>
            )}
          </button>
        </div>
        
        {/* Character limit warning */}
        {input.length > 450 && (
          <p className="text-xs text-orange-500 mt-2">
            Attention: Limite de caractères bientôt atteinte ({input.length}/500)
          </p>
        )}
        
        {/* Helpful tips */}
        <div className="mt-3 text-xs text-gray-500">
          💡 <strong>Astuce:</strong> Soyez spécifique dans vos questions pour obtenir des réponses plus détaillées
        </div>
      </form>

      {/* Footer with context indicator */}
      <div className="px-4 py-2 bg-gray-50 border-t">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Contexte de comparaison chargé</span>
          </div>
          <div>
            ID: {comparisonId?.slice(-8)}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Phase 5: UI Components and Layout

#### 5.1 Comparison View Component
```javascript
// components/ComparisonView.jsx
'use client';
import { useState } from 'react';

export default function ComparisonView({ comparisonData, orientation1, orientation2, userProfile }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!comparisonData) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Génération de l'analyse en cours...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
    { id: 'orientations', label: 'Comparaison', icon: '⚖️' },
    { id: 'universities', label: 'Universités', icon: '🏫' },
    { id: 'action-plan', label: 'Plan d\'action', icon: '🎯' }
  ];

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-blue-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Analyse de Comparaison
        </h2>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>📊 Score: {userProfile.score}/20</span>
          <span>📍 {userProfile.location}</span>
          <span>📅 {new Date().toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b bg-gray-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Overview Section */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Résumé de l'analyse</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                {comparisonData.overview}
              </p>
            </div>

            {/* User Profile Analysis */}
            {comparisonData.userProfileAnalysis && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">🎯 Évaluation de votre score</h4>
                  <p className="text-green-800 text-sm">
                    {comparisonData.userProfileAnalysis.scoreAssessment}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-medium text-orange-900 mb-2">📍 Avantages géographiques</h4>
                  <p className="text-orange-800 text-sm">
                    {comparisonData.userProfileAnalysis.locationAdvantages}
                  </p>
                </div>
              </div>
            )}

            {/* Recommendation */}
            {comparisonData.recommendation && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  ⭐ Recommandation: {comparisonData.recommendation.preferred}
                </h3>
                <p className="text-yellow-800 text-sm mb-3">
                  {comparisonData.recommendation.reasoning}
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium text-yellow-900">Prochaines étapes:</h4>
                  <ul className="list-disc list-inside text-yellow-800 text-sm space-y-1">
                    {comparisonData.recommendation.actionSteps?.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orientations' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Orientation 1 Analysis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                {comparisonData.orientation1Analysis?.name || orientation1.name}
              </h3>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">✅ Points forts</h4>
                <ul className="list-disc list-inside text-green-800 text-sm space-y-1">
                  {comparisonData.orientation1Analysis?.strengths?.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">⚠️ Défis</h4>
                <ul className="list-disc list-inside text-red-800 text-sm space-y-1">
                  {comparisonData.orientation1Analysis?.challenges?.map((challenge, index) => (
                    <li key={index}>{challenge}</li>
                  ))}
                </ul>
              </div>

              {comparisonData.orientation1Analysis?.suitabilityScore && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">📊 Score d'adéquation</h4>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(comparisonData.orientation1Analysis.suitabilityScore / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-blue-900 font-bold">
                      {comparisonData.orientation1Analysis.suitabilityScore}/10
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Orientation 2 Analysis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                {comparisonData.orientation2Analysis?.name || orientation2.name}
              </h3>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">✅ Points forts</h4>
                <ul className="list-disc list-inside text-green-800 text-sm space-y-1">
                  {comparisonData.orientation2Analysis?.strengths?.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">⚠️ Défis</h4>
                <ul className="list-disc list-inside text-red-800 text-sm space-y-1">
                  {comparisonData.orientation2Analysis?.challenges?.map((challenge, index) => (
                    <li key={index}>{challenge}</li>
                  ))}
                </ul>
              </div>

              {comparisonData.orientation2Analysis?.suitabilityScore && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">📊 Score d'adéquation</h4>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(comparisonData.orientation2Analysis.suitabilityScore / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-blue-900 font-bold">
                      {comparisonData.orientation2Analysis.suitabilityScore}/10
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'universities' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">🏫 Analyse des universités</h3>
            {comparisonData.universitiesAnalysis?.map((university, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{university.name}</h4>
                  <span className="text-sm text-gray-500">{university.location}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Orientation: {university.orientation}
                </p>
                <p className="text-sm text-gray-700 mb-3">
                  {university.accessibility}
                </p>
                {university.advantages && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Avantages:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {university.advantages.map((advantage, idx) => (
                        <li key={idx}>{advantage}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'action-plan' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">🎯 Plan d'action personnalisé</h3>
            
            {comparisonData.recommendation?.actionSteps && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">📋 Étapes recommandées</h4>
                <ol className="list-decimal list-inside text-blue-800 space-y-2">
                  {comparisonData.recommendation.actionSteps.map((step, index) => (
                    <li key={index} className="text-sm">{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {comparisonData.recommendation?.alternativeOptions && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-3">🔄 Options alternatives</h4>
                <ul className="list-disc list-inside text-yellow-800 space-y-1">
                  {comparisonData.recommendation.alternativeOptions.map((option, index) => (
                    <li key={index} className="text-sm">{option}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">💡 Conseils supplémentaires</h4>
              <p className="text-gray-700 text-sm">
                N'hésitez pas à utiliser le chatbot pour poser des questions spécifiques sur votre plan d'action ou pour clarifier certains points de cette analyse.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```
