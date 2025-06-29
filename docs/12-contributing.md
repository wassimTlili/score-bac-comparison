# Contributing Guide

Welcome to the Tunisian Orientation Comparison Platform! This guide will help you contribute effectively to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Documentation](#documentation)
- [Testing Requirements](#testing-requirements)
- [Release Process](#release-process)

## Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher
- **Git** for version control
- **Azure OpenAI** access (for AI features)

### Local Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/cmoparing-by-score.git
   cd cmoparing-by-score
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Azure OpenAI credentials
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Verify Setup**
   - Open http://localhost:3000
   - Test the orientation comparison form
   - Verify AI chat functionality

## Development Workflow

### Branch Strategy

We use **GitHub Flow** with the following conventions:

#### Main Branches
- **`main`**: Production-ready code
- **`develop`**: Integration branch for features

#### Feature Branches
- **`feature/feature-name`**: New features
- **`bugfix/bug-description`**: Bug fixes
- **`hotfix/critical-fix`**: Critical production fixes
- **`docs/documentation-update`**: Documentation changes

#### Branch Naming Examples
```
feature/add-multi-orientation-comparison
bugfix/fix-chat-scroll-issue
hotfix/azure-api-rate-limit
docs/update-deployment-guide
```

### Development Process

1. **Create Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow code standards
   - Write tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm run test
   npm run test:e2e
   npm run lint
   npm run type-check
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add multi-orientation comparison feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create pull request via GitHub UI
   ```

## Code Standards

### TypeScript/JavaScript Guidelines

#### File Structure
```javascript
// 1. Imports (external libraries first, then internal)
import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { validateInput } from '@/lib/utils';

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
}

// 3. Component/Function
export default function MyComponent({ title, onSubmit }: ComponentProps) {
  // Component logic
}
```

#### Naming Conventions
```javascript
// Variables and functions: camelCase
const userName = 'john_doe';
function calculateScore() {}

// Components: PascalCase
function OrientationForm() {}

// Constants: UPPER_SNAKE_CASE
const API_ENDPOINTS = {};

// Files: kebab-case
// orientation-form.jsx
// comparison-utils.js
```

#### Code Style
```javascript
// Use descriptive variable names
const bacScore = parseFloat(formData.get('bacScore'));
const isValidScore = bacScore >= 8 && bacScore <= 20;

// Prefer early returns
function validateOrientation(id) {
  if (!id) return { error: 'ID is required' };
  if (id.length < 3) return { error: 'ID too short' };
  
  return { success: true };
}

// Use async/await over promises
async function fetchComparison(id) {
  try {
    const response = await fetch(`/api/comparisons/${id}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch comparison:', error);
    throw error;
  }
}
```

### React Component Guidelines

#### Component Structure
```jsx
// 1. Imports
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types
interface Props {
  initialValue?: string;
  onSubmit: (value: string) => void;
}

// 3. Component
export default function ExampleComponent({ initialValue = '', onSubmit }: Props) {
  // 4. State
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  
  // 5. Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // 6. Event handlers
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSubmit(value);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 7. Render
  return (
    <div className="container">
      <input 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={isLoading}
      />
      <Button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit'}
      </Button>
    </div>
  );
}
```

#### Accessibility Requirements
```jsx
// Always include proper ARIA labels
<input
  id="orientation-search"
  aria-label="Rechercher une orientation"
  aria-describedby="search-help"
  type="text"
/>
<p id="search-help">Tapez pour rechercher parmi les orientations disponibles</p>

// Use semantic HTML
<main role="main">
  <section aria-labelledby="form-heading">
    <h2 id="form-heading">Formulaire de comparaison</h2>
  </section>
</main>

// Handle keyboard navigation
<button
  onClick={handleSubmit}
  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
>
  Submit
</button>
```

### CSS/Styling Guidelines

#### Tailwind CSS Best Practices
```jsx
// Use Tailwind utility classes
<div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
  
// Create component classes for repeated patterns
<div className="card"> {/* Defined in globals.css */}

// Use responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Dark mode support (future)
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
```

#### Custom CSS
```css
/* globals.css - Only for reusable patterns */
.card {
  @apply bg-white rounded-lg shadow-md p-6 border border-gray-200;
}

.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50;
}

/* Use CSS custom properties for themes */
:root {
  --color-primary: #dc2626;
  --color-secondary: #059669;
  --border-radius: 0.5rem;
}
```

## Commit Guidelines

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes

#### Scopes
- **ui**: User interface components
- **api**: API routes and server actions
- **ai**: AI integration and prompts
- **data**: Data models and storage
- **docs**: Documentation
- **config**: Configuration files

#### Examples
```bash
feat(ui): add multi-orientation comparison form
fix(api): handle Azure OpenAI rate limiting
docs(deployment): update Vercel configuration guide
refactor(ai): optimize prompt generation logic
test(ui): add tests for OrientationForm component
chore(deps): update Next.js to v14.1.0
```

### Commit Best Practices

1. **Keep commits atomic** - One logical change per commit
2. **Write descriptive messages** - Explain what and why, not how
3. **Use imperative mood** - "Add feature" not "Added feature"
4. **Reference issues** - Include "Fixes #123" in commit message

## Pull Request Process

### Before Creating a PR

1. **Sync with develop branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-branch
   git rebase develop
   ```

2. **Run full test suite**
   ```bash
   npm run test:all
   npm run lint
   npm run type-check
   ```

3. **Update documentation** if needed

### PR Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Include screenshots for UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No console.log statements left (✅ Completed)
```

### Review Process

1. **Automated checks** must pass
2. **At least one approval** from code owner
3. **All discussions resolved**
4. **Branch up to date** with develop

### Merging

- Use **Squash and merge** for feature branches
- Use **Merge commit** for hotfixes
- Delete feature branch after merge

## Issue Guidelines

### Bug Reports

Use the bug report template:

```markdown
## Bug Description
Clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Device: [e.g. Desktop, iPhone 12]

## Screenshots
Add screenshots if applicable.

## Additional Context
Any other relevant information.
```

### Feature Requests

Use the feature request template:

```markdown
## Feature Description
Clear description of the requested feature.

## Problem Statement
What problem does this solve?

## Proposed Solution
Detailed description of the proposed solution.

## Alternatives Considered
Other solutions you've considered.

## Additional Context
Any other relevant information, mockups, etc.
```

### Labels

- **Priority**: `priority-low`, `priority-medium`, `priority-high`, `priority-critical`
- **Type**: `bug`, `enhancement`, `documentation`, `question`
- **Area**: `ui`, `api`, `ai`, `deployment`, `testing`
- **Status**: `needs-investigation`, `in-progress`, `blocked`, `ready-for-review`

## Documentation

### Documentation Standards

1. **Write for your audience** - Consider the reader's knowledge level
2. **Keep it current** - Update docs with code changes
3. **Use examples** - Include code examples and screenshots
4. **Be concise** - Clear and to the point

### Documentation Types

#### Code Documentation
```javascript
/**
 * Generates AI-powered comparison between two orientations
 * @param {string} orientation1 - First orientation ID
 * @param {string} orientation2 - Second orientation ID  
 * @param {string} governorate - Governorate ID
 * @param {number} bacScore - Student's bac score (8-20)
 * @returns {Promise<ComparisonAnalysis>} AI-generated analysis
 * @throws {ValidationError} When input parameters are invalid
 */
async function generateComparison(orientation1, orientation2, governorate, bacScore) {
  // Implementation
}
```

#### README Updates
- Keep installation instructions current
- Update feature lists
- Include troubleshooting guides
- Add contributor acknowledgments

#### API Documentation
- Document all endpoints
- Include request/response examples
- Specify error codes and messages
- Provide authentication details

## Testing Requirements

### Required Tests for PRs

1. **Unit Tests**
   - New functions must have >90% coverage
   - Test edge cases and error conditions
   - Mock external dependencies

2. **Integration Tests**
   - Test component interactions
   - Test API integrations
   - Test server actions

3. **E2E Tests**
   - Critical user flows must be covered
   - Test on multiple browsers/devices
   - Include accessibility testing

### Test Guidelines

```javascript
// Test structure
describe('Component/Function Name', () => {
  beforeEach(() => {
    // Setup
  });

  describe('when condition', () => {
    it('should do expected behavior', () => {
      // Test implementation
    });
  });

  describe('error handling', () => {
    it('should handle error gracefully', () => {
      // Error test
    });
  });
});

// Assertion patterns
expect(result).toEqual(expectedValue);
expect(element).toBeInTheDocument();
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
```

## Release Process

### Version Numbers

We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. **Create release branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/v1.2.0
   ```

2. **Update version numbers**
   ```bash
   npm version minor  # or major/patch
   ```

3. **Update changelog**
   ```markdown
   ## [1.2.0] - 2024-01-15
   ### Added
   - Multi-orientation comparison feature
   - Enhanced chat interface
   
   ### Changed
   - Improved AI prompt accuracy
   
   ### Fixed
   - Mobile responsiveness issues
   ```

4. **Create PR to main**
5. **After merge, create GitHub release**
6. **Deploy to production**
7. **Merge main back to develop**

## Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Email**: [maintainer@email.com] for sensitive issues

### Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Azure OpenAI Documentation](https://docs.microsoft.com/azure/cognitive-services/openai/)

## Code of Conduct

### Our Standards

- **Be respectful** - Treat everyone with respect
- **Be inclusive** - Welcome diverse perspectives
- **Be collaborative** - Work together effectively
- **Be constructive** - Provide helpful feedback

### Enforcement

Violations can be reported to [conduct@email.com]. All reports will be handled confidentially.

## Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Annual contributor appreciation post

Thank you for contributing to the Tunisian Orientation Comparison Platform! 🇹🇳
