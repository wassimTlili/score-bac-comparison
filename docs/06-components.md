# Components Documentation

This document provides detailed information about the React components used in the application.

## Component Architecture

The application follows a component-based architecture with clear separation of concerns:

- **Pages**: Main route components (`app/page.jsx`, `app/comparison/[id]/page.jsx`)
- **Feature Components**: Core functionality components (`OrientationForm`, `ComparisonView`, `ChatBot`)
- **UI Components**: Reusable interface elements (`LoadingSpinner`)

## Core Components

### OrientationForm (`src/components/OrientationForm.jsx`)

**Purpose**: Main form for collecting user input to generate orientation comparisons.

**Features**:
- React Hook Form integration
- Real-time validation
- Responsive design
- Accessibility features

**Props**: None (self-contained)

**State Management**:
```javascript
const form = useForm({
  resolver: zodResolver(ComparisonInputSchema),
  defaultValues: {
    orientation1: "",
    orientation2: "",
    governorate: "",
    bacScore: ""
  }
});
```

**Key Functionality**:
- Dynamic orientation filtering
- Score validation
- Form submission handling
- Error display
- Loading states

**Usage**:
```jsx
import OrientationForm from '@/components/OrientationForm';

export default function HomePage() {
  return (
    <div>
      <OrientationForm />
    </div>
  );
}
```

**Accessibility Features**:
- ARIA labels for form fields
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### ComparisonView (`src/components/ComparisonView.jsx`)

**Purpose**: Displays AI-generated comparison analysis in a structured format.

**Props**:
```javascript
{
  comparison: Object, // Complete comparison object
  className?: string  // Optional CSS classes
}
```

**Features**:
- Structured analysis display
- Responsive layout
- Interactive elements
- Print-friendly styling

**Section Breakdown**:
1. **Header**: Comparison summary and metadata
2. **Analysis**: Detailed comparison of both orientations
3. **Recommendation**: AI recommendation with reasoning
4. **Insights**: Additional tips and considerations

**Styling**:
- Tailwind CSS utility classes
- Responsive breakpoints
- Modern card-based layout
- Consistent spacing and typography

**Usage**:
```jsx
import ComparisonView from '@/components/ComparisonView';

export default function ComparisonPage({ comparison }) {
  return (
    <ComparisonView 
      comparison={comparison}
      className="max-w-4xl mx-auto"
    />
  );
}
```

### ChatBot (`src/components/ChatBot.jsx`)

**Purpose**: Interactive chat interface for asking questions about the comparison.

**Props**:
```javascript
{
  comparisonId: string, // ID of the current comparison
  className?: string    // Optional CSS classes
}
```

**Features**:
- Real-time messaging
- Streaming AI responses
- Message history
- Context-aware conversations
- Auto-scroll functionality

**State Management**:
```javascript
const [messages, setMessages] = useState([]);
const [input, setInput] = useState('');
const [isLoading, setIsLoading] = useState(false);
```

**Key Functionality**:
- Message sending and receiving
- Streaming response handling
- Error handling and retry
- Message persistence (session-based)
- Automatic context injection

**Message Format**:
```javascript
{
  id: string,
  role: 'user' | 'assistant',
  content: string,
  timestamp: Date
}
```

**Usage**:
```jsx
import ChatBot from '@/components/ChatBot';

export default function ComparisonPage({ comparisonId }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ComparisonView comparison={comparison} />
      <ChatBot comparisonId={comparisonId} />
    </div>
  );
}
```

### LoadingSpinner (`src/components/LoadingSpinner.jsx`)

**Purpose**: Reusable loading indicator for async operations.

**Props**:
```javascript
{
  size?: 'sm' | 'md' | 'lg', // Spinner size
  className?: string         // Optional CSS classes
}
```

**Features**:
- Multiple size variants
- Smooth animations
- Accessible design
- Customizable styling

**Usage**:
```jsx
import LoadingSpinner from '@/components/LoadingSpinner';

// In a component
{isLoading && <LoadingSpinner size="lg" />}
```

## Component Patterns

### Client vs Server Components

**Client Components** (`'use client'`):
- `OrientationForm`: Needs form interactions
- `ComparisonView`: Interactive elements
- `ChatBot`: Real-time messaging
- `LoadingSpinner`: Animation states

**Server Components** (default):
- Page components
- Static content components
- Data fetching components

### State Management Patterns

#### Local State (useState)
```javascript
// For simple, component-specific state
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);
```

#### Form State (React Hook Form)
```javascript
// For complex form handling
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: {}
});
```

#### Server State (Server Actions)
```javascript
// For server-side data operations
const handleSubmit = async (data) => {
  const result = await createComparison(formData);
  // Handle result
};
```

### Error Handling Patterns

#### Component-Level Error Boundaries
```jsx
export default function ComponentWithErrorHandling() {
  const [error, setError] = useState(null);
  
  if (error) {
    return <ErrorDisplay error={error} onRetry={() => setError(null)} />;
  }
  
  return <NormalComponent />;
}
```

#### Form Error Handling
```jsx
// React Hook Form integration
{errors.orientation1 && (
  <p className="text-red-500 text-sm">{errors.orientation1.message}</p>
)}
```

## Styling Guidelines

### Tailwind CSS Usage

**Responsive Design**:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

**Component Variants**:
```jsx
// Button variants
className={`btn ${variant === 'primary' ? 'btn-primary' : 'btn-secondary'}`}
```

**Dark Mode Support** (future):
```jsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
```

### Custom CSS Classes

**Utility Classes**:
```css
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700;
}

.card {
  @apply bg-white rounded-lg shadow-md p-6 border border-gray-200;
}
```

## Performance Optimizations

### React Optimizations

#### Memoization
```jsx
import { memo, useMemo, useCallback } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => 
    expensiveProcessing(data), [data]
  );
  
  return <div>{processedData}</div>;
});
```

#### Lazy Loading
```jsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Bundle Optimization

#### Code Splitting
- Automatic route-based splitting
- Dynamic imports for large components
- Vendor bundle separation

#### Asset Optimization
- Image optimization with Next.js Image
- CSS purging with Tailwind
- Font optimization

## Accessibility Features

### ARIA Support
```jsx
<button
  aria-label="Submit comparison form"
  aria-describedby="submit-help"
  disabled={isLoading}
>
  {isLoading ? 'Processing...' : 'Compare'}
</button>
```

### Keyboard Navigation
- Tab order management
- Enter/Space key handling
- Escape key for modals
- Arrow keys for lists

### Screen Reader Support
- Semantic HTML elements
- Descriptive alt texts
- Live regions for dynamic content
- Skip navigation links

## Testing Strategies

### Unit Testing
```jsx
import { render, screen } from '@testing-library/react';
import OrientationForm from './OrientationForm';

test('renders form fields', () => {
  render(<OrientationForm />);
  expect(screen.getByLabelText(/première orientation/i)).toBeInTheDocument();
});
```

### Integration Testing
```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

test('submits form successfully', async () => {
  render(<OrientationForm />);
  
  fireEvent.change(screen.getByLabelText(/première orientation/i), {
    target: { value: 'informatique' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /comparer/i }));
  
  await waitFor(() => {
    expect(mockCreateComparison).toHaveBeenCalled();
  });
});
```

### Visual Testing
- Storybook for component documentation
- Chromatic for visual regression
- Responsive design testing

## Future Component Enhancements

### Advanced UI Components
- Multi-step form wizard
- Advanced data visualizations
- Interactive comparison charts
- Real-time collaboration features

### Enhanced Accessibility
- Voice navigation support
- High contrast mode
- Text-to-speech integration
- Gesture-based interactions

### Performance Improvements
- Virtual scrolling for large lists
- Progressive image loading
- Advanced caching strategies
- Service worker integration

## Development Guidelines

### Component Creation Checklist
- [ ] Define clear props interface
- [ ] Implement error boundaries
- [ ] Add accessibility features
- [ ] Write unit tests
- [ ] Document usage examples
- [ ] Optimize performance
- [ ] Ensure responsive design
