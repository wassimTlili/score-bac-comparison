# API Routes Documentation

This document details the API routes and endpoints used in the application.

## Overview

The application uses Next.js 14 App Router API routes for handling external requests and providing REST/streaming endpoints. Currently, the primary API endpoint is the chat interface for AI-powered conversations.

## Chat API Route (`/api/chat`)

### Endpoint: `POST /api/chat`

**Purpose**: Provides streaming AI chat responses with context awareness about orientation comparisons.

**File**: `src/app/api/chat/route.js`

**Request Format**:
```javascript
{
  messages: [
    {
      role: "user" | "assistant",
      content: string
    }
  ],
  comparisonId?: string // Optional comparison context
}
```

**Response Format**: 
- Streaming text response
- Content-Type: `text/plain; charset=utf-8`
- Transfer-Encoding: `chunked`

### Implementation Details

#### Request Handling
```javascript
export async function POST(request) {
  try {
    const { messages, comparisonId } = await request.json();
    
    // Validation
    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages format', { status: 400 });
    }
    
    // Context injection
    let systemMessage = CHAT_SYSTEM_PROMPT;
    if (comparisonId) {
      const comparison = await getComparison(comparisonId);
      if (comparison) {
        systemMessage = injectComparisonContext(systemMessage, comparison);
      }
    }
    
    // AI streaming response
    const stream = await getChatStream([
      { role: 'system', content: systemMessage },
      ...messages
    ]);
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked'
      }
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
```

#### Context Injection
The API automatically injects comparison context when a `comparisonId` is provided:

```javascript
function injectComparisonContext(systemPrompt, comparison) {
  const contextInfo = `
CONTEXTE DE COMPARAISON ACTUEL:
- Orientations comparées: ${comparison.orientation1} vs ${comparison.orientation2}
- Gouvernorat: ${comparison.governorate}
- Score du bac: ${comparison.bacScore}
- Recommandation IA: ${comparison.analysis.recommendation.preferred}
- Résumé: ${comparison.analysis.summary}
`;
  
  return systemPrompt + '\n\n' + contextInfo;
}
```

#### Streaming Implementation
```javascript
async function getChatStream(messages) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 1000
  });
  
  const encoder = new TextEncoder();
  
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
      } catch (error) {
        console.error('Streaming error:', error);
        controller.error(error);
      } finally {
        controller.close();
      }
    }
  });
}
```

### Error Handling

#### Client-Side Error Handling
```javascript
// In ChatBot component
const sendMessage = async (message) => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...messages, { role: 'user', content: message }],
        comparisonId
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Handle streaming response
    const reader = response.body.getReader();
    // ... streaming logic
  } catch (error) {
    console.error('Chat error:', error);
    setError('Erreur de communication. Veuillez réessayer.');
  }
};
```

#### Server-Side Error Types
1. **Validation Errors** (400): Invalid request format
2. **Authentication Errors** (401): Missing/invalid API keys
3. **Rate Limit Errors** (429): Too many requests
4. **Server Errors** (500): Internal processing errors
5. **AI Service Errors** (502): OpenAI API issues

### Rate Limiting (Future Enhancement)

#### Implementation Strategy
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Trop de requêtes, veuillez réessayer plus tard.'
});

export async function POST(request) {
  // Apply rate limiting
  await limiter(request);
  
  // Continue with normal processing
}
```

## Future API Routes

### Comparison API (`/api/comparisons`)

#### `GET /api/comparisons` - List Comparisons
**Purpose**: Retrieve paginated list of comparisons

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term
- `governorate`: Filter by governorate
- `orientation`: Filter by orientation

**Response**:
```javascript
{
  comparisons: [
    // Array of comparison objects
  ],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

#### `GET /api/comparisons/[id]` - Get Comparison
**Purpose**: Retrieve specific comparison by ID

**Response**:
```javascript
{
  success: true,
  data: {
    // Complete comparison object
  }
}
```

#### `POST /api/comparisons` - Create Comparison
**Purpose**: Create new comparison via API

**Request Body**:
```javascript
{
  orientation1: string,
  orientation2: string,
  governorate: string,
  bacScore: number
}
```

#### `PUT /api/comparisons/[id]` - Update Comparison
**Purpose**: Update existing comparison

#### `DELETE /api/comparisons/[id]` - Delete Comparison
**Purpose**: Remove comparison

### Analytics API (`/api/analytics`)

#### `GET /api/analytics/stats` - General Statistics
**Response**:
```javascript
{
  totalComparisons: number,
  popularOrientations: [
    { name: string, count: number }
  ],
  averageScore: number,
  governorateDistribution: [
    { governorate: string, count: number }
  ]
}
```

#### `GET /api/analytics/trends` - Trend Analysis
**Response**:
```javascript
{
  monthlyComparisons: [
    { month: string, count: number }
  ],
  popularityTrends: [
    { orientation: string, trend: 'up' | 'down' | 'stable' }
  ]
}
```

### Admin API (`/api/admin`)

#### `GET /api/admin/health` - Health Check
**Response**:
```javascript
{
  status: 'healthy' | 'degraded' | 'unhealthy',
  services: {
    database: 'up' | 'down',
    ai: 'up' | 'down',
    storage: 'up' | 'down'
  },
  timestamp: string
}
```

#### `POST /api/admin/orientations` - Update Orientations
**Purpose**: Update orientation data (admin only)

## API Security

### Authentication (Future)
```javascript
// JWT token validation
import jwt from 'jsonwebtoken';

export async function authenticateRequest(request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  
  if (!token) {
    throw new Error('No token provided');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

### Input Validation
```javascript
import { z } from 'zod';

const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(1000)
  })),
  comparisonId: z.string().optional()
});

export async function POST(request) {
  const body = await request.json();
  const validatedData = ChatRequestSchema.parse(body);
  // Continue processing
}
```

### CORS Configuration
```javascript
export async function POST(request) {
  const response = await processRequest(request);
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  
  return response;
}
```

## Performance Optimizations

### Caching Strategies
```javascript
// Redis caching for frequently accessed data
import redis from '@/lib/redis';

export async function GET(request) {
  const cacheKey = generateCacheKey(request);
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return new Response(cached, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=300'
      }
    });
  }
  
  const data = await fetchData();
  await redis.setex(cacheKey, 300, JSON.stringify(data));
  
  return new Response(JSON.stringify(data));
}
```

### Response Compression
```javascript
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

export async function GET(request) {
  const data = await fetchData();
  const jsonData = JSON.stringify(data);
  
  const acceptEncoding = request.headers.get('Accept-Encoding') || '';
  
  if (acceptEncoding.includes('gzip')) {
    const compressed = await gzipAsync(jsonData);
    return new Response(compressed, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip'
      }
    });
  }
  
  return new Response(jsonData);
}
```

## Monitoring and Logging

### Request Logging
```javascript
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  const requestId = uuidv4();
  const startTime = Date.now();
  
  // Production logging should use proper logging service
  // console.log is removed from production code
  
  try {
    const response = await processRequest(request);
    const duration = Date.now() - startTime;
    
    // Track metrics internally for monitoring
    // console.log replaced with proper logging service
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    // Error logging should use proper error tracking service
    console.error(`[${requestId}] Error - ${duration}ms:`, error);
    throw error;
  }
}
```

### Error Tracking
```javascript
import * as Sentry from '@sentry/nextjs';

export async function POST(request) {
  try {
    return await processRequest(request);
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/chat',
        method: 'POST'
      },
      extra: {
        requestId: request.headers.get('x-request-id'),
        userAgent: request.headers.get('user-agent')
      }
    });
    
    throw error;
  }
}
```

## Testing API Routes

### Unit Testing
```javascript
import { POST } from '@/app/api/chat/route';

describe('/api/chat', () => {
  it('should return streaming response', async () => {
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }]
      })
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
  });
});
```

### Integration Testing
```javascript
import { render, screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.post('/api/chat', (req, res, ctx) => {
    return res(ctx.text('Mocked AI response'));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Development Guidelines

### API Design Principles
1. **RESTful conventions** for CRUD operations
2. **Consistent response formats** across endpoints
3. **Proper HTTP status codes** for different scenarios
4. **Comprehensive error messages** for debugging
5. **API versioning** for future compatibility

### Documentation Standards
- Clear endpoint descriptions
- Request/response examples
- Error handling documentation
- Rate limiting information
- Authentication requirements
