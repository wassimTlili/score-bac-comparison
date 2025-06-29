# Testing Strategy

This document outlines the comprehensive testing strategy for the Tunisian orientation comparison platform, covering unit tests, integration tests, end-to-end testing, and quality assurance procedures.

## Testing Philosophy

### Testing Pyramid

```
        /\
       /  \
      / E2E \     ← Few, High-Value, Slow
     /______\
    /        \
   /Integration\ ← Some, Medium Coverage
  /__________\
 /            \
/  Unit Tests  \  ← Many, Fast, Isolated
/______________\
```

#### Unit Tests (70%)
- **Purpose**: Test individual functions and components in isolation
- **Tools**: Jest, React Testing Library
- **Coverage Target**: >90% for utilities and business logic
- **Speed**: <1ms per test

#### Integration Tests (20%)
- **Purpose**: Test component interactions and API integrations
- **Tools**: Jest, MSW (Mock Service Worker)
- **Coverage Target**: >80% for critical user flows
- **Speed**: <100ms per test

#### End-to-End Tests (10%)
- **Purpose**: Test complete user journeys
- **Tools**: Playwright
- **Coverage Target**: Critical paths and user flows
- **Speed**: <5s per test

## Testing Setup and Configuration

### Jest Configuration

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/app/layout.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 10000,
};

module.exports = createJestConfig(customJestConfig);
```

### Test Setup

```javascript
// jest.setup.js
import '@testing-library/jest-dom';
import { server } from './src/mocks/server';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock environment variables
process.env.AZURE_OPENAI_ENDPOINT = 'https://test.openai.azure.com/';
process.env.AZURE_OPENAI_API_KEY = 'test-key';

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
```

## Unit Testing

### Component Testing

#### Testing React Components
```javascript
// src/components/__tests__/OrientationForm.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrientationForm from '../OrientationForm';

// Mock the comparison action
jest.mock('@/actions/comparison-actions', () => ({
  createComparison: jest.fn(),
}));

describe('OrientationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<OrientationForm />);
    
    expect(screen.getByLabelText(/première orientation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/deuxième orientation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gouvernorat/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/score du bac/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<OrientationForm />);
    
    const submitButton = screen.getByRole('button', { name: /comparer/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/premier choix requis/i)).toBeInTheDocument();
    expect(screen.getByText(/deuxième choix requis/i)).toBeInTheDocument();
    expect(screen.getByText(/gouvernorat requis/i)).toBeInTheDocument();
  });

  it('validates bac score range', async () => {
    const user = userEvent.setup();
    render(<OrientationForm />);
    
    const scoreInput = screen.getByLabelText(/score du bac/i);
    await user.type(scoreInput, '25');
    await user.tab(); // Trigger validation
    
    expect(screen.getByText(/score maximum: 20/i)).toBeInTheDocument();
  });

  it('prevents selecting same orientation twice', async () => {
    const user = userEvent.setup();
    render(<OrientationForm />);
    
    const orientation1 = screen.getByLabelText(/première orientation/i);
    const orientation2 = screen.getByLabelText(/deuxième orientation/i);
    
    await user.selectOptions(orientation1, 'informatique');
    await user.selectOptions(orientation2, 'informatique');
    
    const submitButton = screen.getByRole('button', { name: /comparer/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/orientations différentes/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const mockCreateComparison = require('@/actions/comparison-actions').createComparison;
    mockCreateComparison.mockResolvedValue({ success: true, id: 'test-id' });
    
    const user = userEvent.setup();
    render(<OrientationForm />);
    
    // Fill form
    await user.selectOptions(
      screen.getByLabelText(/première orientation/i),
      'informatique'
    );
    await user.selectOptions(
      screen.getByLabelText(/deuxième orientation/i),
      'genie-civil'
    );
    await user.selectOptions(
      screen.getByLabelText(/gouvernorat/i),
      'tunis'
    );
    await user.type(screen.getByLabelText(/score du bac/i), '15.5');
    
    // Submit
    await user.click(screen.getByRole('button', { name: /comparer/i }));
    
    await waitFor(() => {
      expect(mockCreateComparison).toHaveBeenCalledWith(expect.any(FormData));
    });
  });
});
```

#### Testing Custom Hooks
```javascript
// src/hooks/__tests__/useComparison.test.js
import { renderHook, act } from '@testing-library/react';
import { useComparison } from '../useComparison';

describe('useComparison', () => {
  it('initializes with empty state', () => {
    const { result } = renderHook(() => useComparison());
    
    expect(result.current.comparison).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles comparison creation', async () => {
    const { result } = renderHook(() => useComparison());
    
    const mockComparison = {
      id: 'test-id',
      orientation1: 'informatique',
      orientation2: 'genie-civil',
    };

    await act(async () => {
      await result.current.createComparison(mockComparison);
    });

    expect(result.current.comparison).toEqual(mockComparison);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles errors gracefully', async () => {
    const { result } = renderHook(() => useComparison());
    
    // Mock a failed request
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    await act(async () => {
      await result.current.createComparison({});
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.isLoading).toBe(false);
  });
});
```

### Utility Function Testing

```javascript
// src/lib/__tests__/orientations.test.js
import { 
  getOrientationById, 
  getOrientationsByGovernorate,
  filterOrientationsByScore,
  searchOrientations 
} from '../orientations';

describe('orientations utilities', () => {
  const mockOrientations = [
    {
      id: 'informatique',
      name: 'Informatique',
      minScore: 12.0,
      governorates: ['tunis', 'ariana']
    },
    {
      id: 'genie-civil',
      name: 'Génie Civil',
      minScore: 14.0,
      governorates: ['tunis', 'sfax']
    }
  ];

  beforeEach(() => {
    // Mock the data import
    jest.doMock('@/data/orientations.json', () => ({
      orientations: mockOrientations,
      governorates: []
    }));
  });

  describe('getOrientationById', () => {
    it('returns orientation when found', () => {
      const result = getOrientationById('informatique');
      expect(result).toEqual(mockOrientations[0]);
    });

    it('returns null when not found', () => {
      const result = getOrientationById('invalid-id');
      expect(result).toBeNull();
    });
  });

  describe('filterOrientationsByScore', () => {
    it('filters orientations by minimum score', () => {
      const result = filterOrientationsByScore(13.0);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('informatique');
    });

    it('returns all orientations when score is high enough', () => {
      const result = filterOrientationsByScore(15.0);
      expect(result).toHaveLength(2);
    });
  });

  describe('searchOrientations', () => {
    it('searches by name', () => {
      const result = searchOrientations('info');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('informatique');
    });

    it('returns empty array when no matches', () => {
      const result = searchOrientations('nonexistent');
      expect(result).toHaveLength(0);
    });
  });
});
```

## Integration Testing

### API Route Testing

```javascript
// src/app/api/chat/__tests__/route.test.js
import { POST } from '../route';
import { createMocks } from 'node-mocks-http';

// Mock Azure OpenAI
jest.mock('@/lib/azure-ai', () => ({
  getChatStream: jest.fn(),
}));

describe('/api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles valid chat request', async () => {
    const { getChatStream } = require('@/lib/azure-ai');
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('Test response'));
        controller.close();
      }
    });
    getChatStream.mockResolvedValue(mockStream);

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }]
      })
    });

    const response = await POST(request);
    
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
  });

  it('validates request format', async () => {
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: 'data' })
    });

    const response = await POST(request);
    
    expect(response.status).toBe(400);
  });

  it('handles AI service errors', async () => {
    const { getChatStream } = require('@/lib/azure-ai');
    getChatStream.mockRejectedValue(new Error('AI service error'));

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }]
      })
    });

    const response = await POST(request);
    
    expect(response.status).toBe(500);
  });
});
```

### Server Action Testing

```javascript
// src/actions/__tests__/comparison-actions.test.js
import { createComparison, getComparison } from '../comparison-actions';
import { comparisonStorage } from '@/lib/comparison-storage';

// Mock AI comparison
jest.mock('../ai-comparison', () => ({
  generateComparison: jest.fn(),
}));

describe('comparison actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    comparisonStorage.clear(); // Reset storage
  });

  describe('createComparison', () => {
    it('creates comparison with valid data', async () => {
      const { generateComparison } = require('../ai-comparison');
      const mockAnalysis = {
        summary: 'Test analysis',
        recommendation: { preferred: 'informatique' }
      };
      generateComparison.mockResolvedValue(mockAnalysis);

      const formData = new FormData();
      formData.append('orientation1', 'informatique');
      formData.append('orientation2', 'genie-civil');
      formData.append('governorate', 'tunis');
      formData.append('bacScore', '15.5');

      const result = await createComparison(formData);

      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
      expect(result.data.analysis).toEqual(mockAnalysis);
    });

    it('handles validation errors', async () => {
      const formData = new FormData();
      formData.append('orientation1', ''); // Missing required field

      const result = await createComparison(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('requis');
    });
  });

  describe('getComparison', () => {
    it('retrieves existing comparison', async () => {
      // Create a comparison first
      const mockComparison = {
        id: 'test-id',
        orientation1: 'informatique',
        orientation2: 'genie-civil',
      };
      comparisonStorage.create(mockComparison);

      const result = await getComparison('test-id');

      expect(result).toEqual(mockComparison);
    });

    it('returns null for non-existent comparison', async () => {
      const result = await getComparison('invalid-id');
      expect(result).toBeNull();
    });
  });
});
```

### Mock Service Worker Setup

```javascript
// src/mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  // Mock Azure OpenAI API
  rest.post('https://test.openai.azure.com/openai/deployments/:deployment/chat/completions', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        choices: [{
          message: {
            content: 'Mocked AI response'
          }
        }]
      })
    );
  }),

  // Mock comparison API
  rest.post('/api/comparisons', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 'mock-comparison-id',
        analysis: {
          summary: 'Mock analysis summary'
        }
      })
    );
  }),

  // Mock chat API
  rest.post('/api/chat', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.text('Mock chat response')
    );
  }),
];
```

```javascript
// src/mocks/server.js
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

## End-to-End Testing

### Playwright Configuration

```javascript
// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### End-to-End Test Cases

```javascript
// e2e/comparison-flow.spec.js
import { test, expect } from '@playwright/test';

test.describe('Orientation Comparison Flow', () => {
  test('complete comparison journey', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/Comparaison d'orientations/);
    
    // Fill the comparison form
    await page.selectOption('[data-testid="orientation1"]', 'informatique');
    await page.selectOption('[data-testid="orientation2"]', 'genie-civil');
    await page.selectOption('[data-testid="governorate"]', 'tunis');
    await page.fill('[data-testid="bac-score"]', '15.5');
    
    // Submit form
    await page.click('[data-testid="submit-comparison"]');
    
    // Wait for navigation to results page
    await expect(page).toHaveURL(/\/comparison\/[a-zA-Z0-9_-]+/);
    
    // Check that analysis is displayed
    await expect(page.locator('[data-testid="comparison-analysis"]')).toBeVisible();
    
    // Check that chat interface is available
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    
    // Test chat interaction
    await page.fill('[data-testid="chat-input"]', 'Quelles sont les débouchés en informatique?');
    await page.click('[data-testid="send-message"]');
    
    // Wait for AI response
    await expect(page.locator('[data-testid="chat-messages"] .ai-message').last()).toBeVisible({ timeout: 10000 });
  });

  test('form validation', async ({ page }) => {
    await page.goto('/');
    
    // Try to submit empty form
    await page.click('[data-testid="submit-comparison"]');
    
    // Check validation messages
    await expect(page.locator('text=Premier choix requis')).toBeVisible();
    await expect(page.locator('text=Deuxième choix requis')).toBeVisible();
    await expect(page.locator('text=Gouvernorat requis')).toBeVisible();
    
    // Test invalid score
    await page.fill('[data-testid="bac-score"]', '25');
    await page.blur('[data-testid="bac-score"]');
    await expect(page.locator('text=Score maximum: 20')).toBeVisible();
  });

  test('mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Check that form is still usable on mobile
    await expect(page.locator('[data-testid="orientation-form"]')).toBeVisible();
    
    // Test mobile navigation
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    }
  });
});
```

### Visual Regression Testing

```javascript
// e2e/visual.spec.js
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('homepage screenshot', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('homepage.png');
  });

  test('comparison results screenshot', async ({ page }) => {
    // Navigate to a test comparison
    await page.goto('/comparison/test-id');
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="comparison-analysis"]');
    
    // Take screenshot
    await expect(page).toHaveScreenshot('comparison-results.png');
  });

  test('mobile layout screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page).toHaveScreenshot('mobile-homepage.png');
  });
});
```

## Performance Testing

### Load Testing with Artillery

```yaml
# artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: 'Warm up'
    - duration: 120
      arrivalRate: 20
      name: 'Load test'
    - duration: 60
      arrivalRate: 50
      name: 'Stress test'

scenarios:
  - name: 'Homepage visit'
    weight: 40
    flow:
      - get:
          url: '/'
      - think: 5

  - name: 'Create comparison'
    weight: 40
    flow:
      - post:
          url: '/api/comparisons'
          json:
            orientation1: 'informatique'
            orientation2: 'genie-civil'
            governorate: 'tunis'
            bacScore: 15.5
      - think: 10

  - name: 'Chat interaction'
    weight: 20
    flow:
      - post:
          url: '/api/chat'
          json:
            messages:
              - role: 'user'
                content: 'Tell me about computer science'
            comparisonId: 'test-id'
```

### Lighthouse CI Configuration

```yaml
# .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/comparison/test-id'
      ],
      startServerCommand: 'npm run start',
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

## Testing Scripts

### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:visual": "playwright test --grep='Visual'",
    "test:perf": "artillery run artillery.yml",
    "test:lighthouse": "lhci autorun",
    "test:all": "npm run test:ci && npm run test:e2e && npm run test:lighthouse"
  }
}
```

### CI Test Pipeline

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npx playwright install
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          AZURE_OPENAI_ENDPOINT: ${{ secrets.AZURE_OPENAI_ENDPOINT }}
          AZURE_OPENAI_API_KEY: ${{ secrets.AZURE_OPENAI_API_KEY }}
      
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      - run: npm run test:lighthouse
```

## Quality Gates

### Coverage Requirements
- **Unit Tests**: >90% for business logic
- **Integration Tests**: >80% for API routes
- **E2E Tests**: 100% of critical user paths

### Performance Thresholds
- **Lighthouse Performance**: >80
- **Time to Interactive**: <3s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1

### Accessibility Standards
- **WCAG 2.1 AA Compliance**: 100%
- **Lighthouse Accessibility**: >90
- **Keyboard Navigation**: Full coverage
- **Screen Reader Compatibility**: Verified

This comprehensive testing strategy ensures the reliability, performance, and accessibility of the Tunisian orientation comparison platform across all user scenarios and technical requirements.
