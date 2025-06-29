# Server Actions

This document details the server actions that handle business logic and AI integration.

## Overview

Server actions provide a secure, server-side interface for handling user interactions, data processing, and AI communications. They leverage Next.js 14's server actions feature for seamless client-server integration.

## Core Server Actions

### Comparison Actions (`src/actions/comparison-actions.js`)

#### `createComparison(formData)`
Creates a new orientation comparison using AI analysis.

**Parameters:**
- `formData`: FormData object containing user inputs

**Process:**
1. Validates form data using Zod schema
2. Calls AI comparison service
3. Stores comparison with unique ID
4. Returns comparison ID for redirection

**Error Handling:**
- Form validation errors
- AI service failures
- Storage failures

```javascript
// Usage example
const formData = new FormData();
formData.append('orientation1', 'informatique');
formData.append('orientation2', 'genie-civil');
formData.append('governorate', 'tunis');
formData.append('bacScore', '15.5');

const result = await createComparison(formData);
```

#### `updateComparison(id, updates)`
Updates an existing comparison with new analysis.

**Parameters:**
- `id`: Comparison unique identifier
- `updates`: Partial comparison object

**Use Cases:**
- Regenerating AI analysis
- Updating user preferences
- Correcting data errors

#### `deleteComparison(id)`
Removes a comparison from storage.

**Parameters:**
- `id`: Comparison unique identifier

**Security:**
- Validates comparison ownership (future enhancement)
- Prevents unauthorized deletions

#### `getComparison(id)`
Retrieves a specific comparison by ID.

**Parameters:**
- `id`: Comparison unique identifier

**Returns:**
- Complete comparison object
- null if not found

#### `searchComparisons(query)`
Searches comparisons by various criteria.

**Parameters:**
- `query`: Search parameters object

**Search Criteria:**
- Orientation names
- Governorate
- Score range
- Date range

#### `getComparisonStats()`
Retrieves analytics and statistics about comparisons.

**Returns:**
- Total comparisons count
- Popular orientations
- Average scores
- Governorate distribution

#### `regenerateComparison(id)`
Regenerates AI analysis for an existing comparison.

**Parameters:**
- `id`: Comparison unique identifier

**Process:**
1. Retrieves original input parameters
2. Calls AI service with fresh prompts
3. Updates stored comparison
4. Maintains comparison history

### AI Comparison Service (`src/actions/ai-comparison.js`)

#### `generateComparison(orientation1, orientation2, governorate, bacScore)`
Core AI-powered comparison generation.

**Parameters:**
- `orientation1`: First orientation ID
- `orientation2`: Second orientation ID
- `governorate`: Governorate ID
- `bacScore`: User's bac score

**Process:**
1. Retrieves orientation and governorate data
2. Constructs comprehensive AI prompt
3. Calls Azure OpenAI service
4. Validates and parses AI response
5. Returns structured comparison analysis

**AI Integration:**
- Uses GPT-4 for sophisticated analysis
- Structured prompts for consistent outputs
- Response validation and error handling
- Retry logic for failed requests

## Error Handling Patterns

### Client-Side Error Handling
```javascript
export async function createComparison(formData) {
  try {
    // Validation and processing
    return { success: true, data: comparison };
  } catch (error) {
    console.error('Comparison creation failed:', error);
    return { 
      success: false, 
      error: error.message || 'Erreur lors de la création'
    };
  }
}
```

### Server-Side Error Types
1. **Validation Errors**: Invalid input data
2. **AI Service Errors**: OpenAI API failures
3. **Storage Errors**: Data persistence issues
4. **Network Errors**: External service timeouts

### Error Response Format
```javascript
{
  success: false,
  error: "Human-readable error message",
  code: "ERROR_CODE",
  details: { /* additional error context */ }
}
```

## Performance Optimizations

### Caching Strategies
- Static data caching for orientations
- Comparison result caching
- AI response caching for similar queries

### Async Processing
- Non-blocking AI calls
- Parallel data retrieval
- Streaming for long-running operations

### Resource Management
- Connection pooling for external APIs
- Memory management for large datasets
- Graceful degradation under load

## Security Considerations

### Input Validation
- Strict Zod schema validation
- SQL injection prevention
- XSS protection through sanitization

### API Security
- Rate limiting for AI calls
- API key protection
- Request logging and monitoring

### Data Privacy
- Minimal data collection
- Secure storage practices
- GDPR compliance preparation

## Testing Strategies

### Unit Testing
```javascript
// Example test for comparison creation
describe('createComparison', () => {
  it('should create valid comparison', async () => {
    const formData = createMockFormData();
    const result = await createComparison(formData);
    
    expect(result.success).toBe(true);
    expect(result.data.id).toBeDefined();
  });
});
```

### Integration Testing
- End-to-end user flows
- AI service integration
- Error handling scenarios

### Load Testing
- Concurrent user handling
- AI service rate limits
- Memory usage under load

## Future Enhancements

### Batch Processing
- Multiple comparison generation
- Bulk analysis operations
- Background job processing

### Advanced Analytics
- Machine learning insights
- Predictive analytics
- User behavior analysis

### Real-time Features
- Live comparison updates
- Collaborative comparisons
- Real-time notifications

## Monitoring and Logging

### Performance Metrics
- Response times
- Success/failure rates
- AI service usage

### Error Tracking
- Detailed error logs
- User impact assessment
- Automated alerting

### Usage Analytics
- Popular orientations
- User journey tracking
- Conversion metrics

## API Documentation

### Server Action Signatures
```javascript
// All server actions follow this pattern
export async function actionName(parameters) {
  // Input validation
  // Business logic
  // Error handling
  // Return standardized response
}
```

### Response Standards
- Consistent success/error format
- Detailed error messages
- Structured data returns
- Type-safe responses

## Development Guidelines

### Code Organization
- Separate concerns clearly
- Reusable utility functions
- Consistent error handling
- Comprehensive documentation

### Best Practices
- Always validate inputs
- Handle errors gracefully
- Log important operations
- Return meaningful responses
