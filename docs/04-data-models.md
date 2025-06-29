# Data Models

This document outlines the data models and schemas used throughout the application.

## Core Data Models

### Orientation Model

The orientation data structure represents Tunisian university orientations (degree programs).

```javascript
{
  id: "string",           // Unique identifier
  name: "string",         // Orientation name in French
  nameAr: "string",       // Orientation name in Arabic
  category: "string",     // Category (e.g., "Sciences", "Lettres")
  subcategory: "string",  // Subcategory for more specific classification
  minScore: number,       // Minimum required bac score
  description: "string",  // Detailed description
  duration: "string",     // Study duration (e.g., "3 ans")
  degree: "string",       // Degree type (e.g., "Licence")
  skills: ["string"],     // Required/developed skills
  careers: ["string"],    // Career opportunities
  institutes: ["string"], // Available institutes/universities
  governorates: ["string"] // Available governorates
}
```

### Governorate Model

The governorate data structure represents Tunisian administrative regions.

```javascript
{
  id: "string",     // Unique identifier
  name: "string",   // Governorate name in French
  nameAr: "string", // Governorate name in Arabic
  region: "string", // Geographic region
  universities: ["string"] // Available universities
}
```

### Comparison Model

The comparison model represents an AI-generated comparison between orientations.

```javascript
{
  id: "string",           // Unique nanoid identifier
  orientation1: "string", // First orientation ID
  orientation2: "string", // Second orientation ID
  governorate: "string",  // Selected governorate ID
  bacScore: number,       // User's bac score
  analysis: {
    summary: "string",           // Executive summary
    orientation1Analysis: {
      strengths: ["string"],     // Strengths of orientation 1
      weaknesses: ["string"],    // Weaknesses of orientation 1
      suitability: "string",     // Suitability assessment
      careerProspects: "string"  // Career prospects
    },
    orientation2Analysis: {
      strengths: ["string"],     // Strengths of orientation 2
      weaknesses: ["string"],    // Weaknesses of orientation 2
      suitability: "string",     // Suitability assessment
      careerProspects: "string"  // Career prospects
    },
    recommendation: {
      preferred: "string",       // Recommended orientation ID
      reasoning: "string",       // Detailed reasoning
      considerations: ["string"] // Additional considerations
    },
    additionalInsights: ["string"] // Extra insights and tips
  },
  metadata: {
    createdAt: Date,     // Creation timestamp
    updatedAt: Date,     // Last update timestamp
    version: "string",   // Analysis version
    aiModel: "string"    // AI model used
  }
}
```

## Data Validation Schemas

### Zod Schemas

The application uses Zod for runtime validation:

#### ComparisonInputSchema
```javascript
export const ComparisonInputSchema = z.object({
  orientation1: z.string().min(1, "Premier choix requis"),
  orientation2: z.string().min(1, "Deuxième choix requis"),
  governorate: z.string().min(1, "Gouvernorat requis"),
  bacScore: z.number()
    .min(8, "Score minimum: 8")
    .max(20, "Score maximum: 20")
});
```

#### ComparisonAnalysisSchema
```javascript
export const ComparisonAnalysisSchema = z.object({
  summary: z.string().min(50),
  orientation1Analysis: OrientationAnalysisSchema,
  orientation2Analysis: OrientationAnalysisSchema,
  recommendation: RecommendationSchema,
  additionalInsights: z.array(z.string())
});
```

## Data Sources

### Static Data Files

#### orientations.json
- Contains all available Tunisian university orientations
- Manually curated and maintained
- Includes French and Arabic names for accessibility
- Regular updates needed for new programs

#### Structure:
```javascript
{
  "orientations": [
    // Array of orientation objects
  ],
  "governorates": [
    // Array of governorate objects
  ]
}
```

### Dynamic Data

#### In-Memory Storage
- Comparisons stored in-memory during development
- Fast access and manipulation
- Data lost on server restart
- Suitable for prototyping and testing

#### Future Database Integration
- PostgreSQL recommended for production
- MongoDB alternative for document-based storage
- Redis for caching and session management

## Data Flow

### Input Flow
1. User submits form with orientation choices, governorate, and bac score
2. Client-side validation using Zod schemas
3. Server-side validation and sanitization
4. Data passed to AI comparison service

### Processing Flow
1. Orientations and governorate data retrieved from static files
2. User input combined with orientation metadata
3. AI prompt constructed with full context
4. AI generates structured comparison analysis
5. Response validated against schema
6. Comparison stored with unique ID

### Output Flow
1. Comparison data served to client
2. Real-time chat context includes comparison data
3. Analytics aggregated from stored comparisons

## Data Relationships

### Entity Relationships
- Orientation ↔ Governorate (many-to-many)
- Comparison → Orientation (one-to-many)
- Comparison → Governorate (many-to-one)
- User Session → Comparison (one-to-many, implicit)

### Data Dependencies
- Comparisons depend on valid orientation IDs
- Chat context depends on comparison data
- Analytics depend on historical comparison data

## Data Integrity

### Validation Rules
1. All IDs must reference existing entities
2. Bac scores must be within valid range (8-20)
3. Orientations must be available in selected governorate
4. AI responses must match expected schema

### Error Handling
1. Invalid orientation IDs → user-friendly error
2. Missing governorate data → fallback to all governorates
3. AI response validation failure → retry mechanism
4. Data corruption → graceful degradation

## Performance Considerations

### Data Loading
- Static data loaded once at startup
- Comparison data cached in memory
- Lazy loading for large datasets

### Data Storage
- Efficient JSON serialization
- Minimal data duplication
- Optimized for read operations

### Scalability
- Horizontal scaling through stateless design
- Database sharding by governorate
- CDN for static orientation data
