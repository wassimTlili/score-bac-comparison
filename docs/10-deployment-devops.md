# Deployment and DevOps

This document covers deployment strategies, infrastructure setup, monitoring, and operational procedures for the Tunisian orientation comparison platform.

## Deployment Architecture

### Recommended Deployment: Vercel

**Primary Choice**: Vercel (Next.js native platform)

#### Advantages
- **Seamless Next.js Integration**: Built specifically for Next.js applications
- **Automatic CI/CD**: Git-based deployments with zero configuration
- **Global Edge Network**: Fast content delivery worldwide
- **Serverless Functions**: Automatic scaling for API routes
- **Environment Management**: Secure environment variable handling
- **Preview Deployments**: Automatic staging for pull requests

#### Configuration
```javascript
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "AZURE_OPENAI_ENDPOINT": "@azure-openai-endpoint",
    "AZURE_OPENAI_API_KEY": "@azure-openai-api-key"
  },
  "functions": {
    "src/app/api/chat/route.js": {
      "maxDuration": 30
    }
  }
}
```

### Alternative Deployment Options

#### 1. Azure App Service
**Use Case**: Enterprise environments, Azure ecosystem integration

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  nodeVersion: '18.x'

stages:
- stage: Build
  jobs:
  - job: BuildJob
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: $(nodeVersion)
    
    - script: npm ci
      displayName: 'Install dependencies'
    
    - script: npm run build
      displayName: 'Build application'
    
    - script: npm run test
      displayName: 'Run tests'
    
    - task: ArchiveFiles@2
      inputs:
        rootFolderOrFile: '.'
        includeRootFolder: false
        archiveFile: '$(Build.ArtifactStagingDirectory)/$(Build.BuildId).zip'
    
    - task: PublishBuildArtifacts@1
      inputs:
        artifactName: 'drop'

- stage: Deploy
  dependsOn: Build
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
  jobs:
  - deployment: DeployToProduction
    environment: 'production'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureWebApp@1
            inputs:
              azureSubscription: 'Azure-Connection'
              appType: 'webAppLinux'
              appName: 'orientation-comparison-app'
              package: '$(Pipeline.Workspace)/drop/$(Build.BuildId).zip'
```

#### 2. Docker + Cloud Run
**Use Case**: Multi-cloud deployments, containerized environments

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME 0.0.0.0

CMD ["node", "server.js"]
```

```yaml
# cloudbuild.yaml (Google Cloud Build)
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/orientation-comparison:$SHORT_SHA', '.']
  
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/orientation-comparison:$SHORT_SHA']
  
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
    - 'run'
    - 'deploy'
    - 'orientation-comparison'
    - '--image'
    - 'gcr.io/$PROJECT_ID/orientation-comparison:$SHORT_SHA'
    - '--region'
    - 'europe-west1'
    - '--platform'
    - 'managed'
    - '--allow-unauthenticated'
```

## Environment Configuration

### Environment Variables Management

#### Development (.env.local)
```bash
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-local-secret

# Database (when implemented)
DATABASE_URL=postgresql://user:password@localhost:5432/orientation_db

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Feature Flags
ENABLE_CHAT=true
ENABLE_ANALYTICS=false
```

#### Production Environment
```bash
# Vercel Environment Variables (set via dashboard)
AZURE_OPENAI_ENDPOINT=@azure-openai-endpoint
AZURE_OPENAI_API_KEY=@azure-openai-api-key
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Database
DATABASE_URL=@database-url
REDIS_URL=@redis-url

# Security
NEXTAUTH_SECRET=@nextauth-secret
NEXTAUTH_URL=https://your-domain.com

# Monitoring
SENTRY_DSN=@sentry-dsn
DATADOG_API_KEY=@datadog-api-key

# Feature Flags
ENABLE_CHAT=true
ENABLE_ANALYTICS=true
ENABLE_RATE_LIMITING=true
```

### Configuration Validation
```javascript
// src/lib/env.js
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  
  // Azure OpenAI
  AZURE_OPENAI_ENDPOINT: z.string().url(),
  AZURE_OPENAI_API_KEY: z.string().min(1),
  AZURE_OPENAI_API_VERSION: z.string().min(1),
  
  // Database (optional for development)
  DATABASE_URL: z.string().url().optional(),
  
  // Feature flags
  ENABLE_CHAT: z.string().transform(s => s === 'true').default('true'),
  ENABLE_ANALYTICS: z.string().transform(s => s === 'true').default('false'),
});

export const env = envSchema.parse(process.env);
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run tests
      run: npm run test
      env:
        CI: true
    
    - name: Build application
      run: npm run build
      env:
        AZURE_OPENAI_ENDPOINT: ${{ secrets.AZURE_OPENAI_ENDPOINT }}
        AZURE_OPENAI_API_KEY: ${{ secrets.AZURE_OPENAI_API_KEY }}

  security:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Run security audit
      run: npm audit --audit-level=moderate
    
    - name: Scan for secrets
      uses: trufflesecurity/trufflehog@main
      with:
        path: ./
        base: main
        head: HEAD

  deploy-preview:
    runs-on: ubuntu-latest
    needs: [test, security]
    if: github.event_name == 'pull_request'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Vercel Preview
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        scope: ${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    runs-on: ubuntu-latest
    needs: [test, security]
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Vercel Production
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
        scope: ${{ secrets.VERCEL_ORG_ID }}
```

### Quality Gates
```yaml
# .github/workflows/quality.yml
name: Quality Checks

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Code Quality Analysis
      run: |
        npm run lint:check
        npm run format:check
        npm run type-check
    
    - name: Test Coverage
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
    
    - name: Bundle Analysis
      run: npm run analyze
    
    - name: Lighthouse CI
      run: |
        npm install -g @lhci/cli
        lhci autorun
      env:
        LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

## Monitoring and Observability

### Application Performance Monitoring

#### Sentry Integration
```javascript
// src/lib/sentry.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  debug: process.env.NODE_ENV === 'development',
  
  beforeSend(event) {
    // Filter out sensitive information
    if (event.request?.data) {
      delete event.request.data.apiKey;
      delete event.request.data.password;
    }
    return event;
  },
});

export { Sentry };
```

#### Custom Metrics
```javascript
// src/lib/metrics.js
import { Sentry } from './sentry';

export function trackComparison(orientations, score, governorate) {
  Sentry.addBreadcrumb({
    message: 'Comparison generated',
    category: 'ai',
    data: {
      orientations,
      score,
      governorate,
    },
    level: 'info',
  });
}

export function trackChatInteraction(messageCount, comparisonId) {
  Sentry.addBreadcrumb({
    message: 'Chat interaction',
    category: 'user',
    data: {
      messageCount,
      comparisonId,
    },
    level: 'info',
  });
}

export function trackError(error, context = {}) {
  Sentry.captureException(error, {
    tags: {
      component: context.component,
      action: context.action,
    },
    extra: context.extra,
  });
}
```

### Infrastructure Monitoring

#### Health Check Endpoint
```javascript
// src/app/api/health/route.js
export async function GET() {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {},
    };
    
    // Check Azure OpenAI
    try {
      await fetch(process.env.AZURE_OPENAI_ENDPOINT, {
        method: 'HEAD',
        timeout: 5000,
      });
      health.services.openai = 'up';
    } catch (error) {
      health.services.openai = 'down';
      health.status = 'degraded';
    }
    
    // Check Database (when implemented)
    try {
      // await prisma.$queryRaw`SELECT 1`;
      health.services.database = 'up';
    } catch (error) {
      health.services.database = 'down';
      health.status = 'unhealthy';
    }
    
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;
    
    return new Response(JSON.stringify(health), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

#### Uptime Monitoring
```yaml
# uptime.yml (GitHub Actions for uptime monitoring)
name: Uptime Monitoring

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:

jobs:
  uptime:
    runs-on: ubuntu-latest
    
    steps:
    - name: Check website
      uses: srt32/uptime-monitor-action@v1
      with:
        url-to-check: 'https://your-domain.com/api/health'
        site-name: 'Orientation Comparison Platform'
        
    - name: Slack notification on failure
      if: failure()
      uses: 8398a7/action-slack@v3
      with:
        status: failure
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        text: '🚨 Website is down! Please check immediately.'
```

## Security and Compliance

### Security Headers
```javascript
// next.config.mjs
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ')
  }
];

export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### API Rate Limiting
```javascript
// src/lib/rate-limit.js
import { LRUCache } from 'lru-cache';

const rateLimit = (limit = 10, window = 60000) => {
  const cache = new LRUCache({
    max: 500,
    ttl: window,
  });
  
  return {
    check: (identifier) => {
      const key = `rate_limit_${identifier}`;
      const current = cache.get(key) || 0;
      
      if (current >= limit) {
        return { success: false, remaining: 0 };
      }
      
      cache.set(key, current + 1);
      return { success: true, remaining: limit - current - 1 };
    }
  };
};

// Usage in API routes
export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const limiter = rateLimit(5, 60000); // 5 requests per minute
  
  const result = limiter.check(ip);
  if (!result.success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  // Continue with normal processing
}
```

## Performance Optimization

### Build Optimization
```javascript
// next.config.mjs
export default {
  // Optimize images
  images: {
    domains: ['your-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Enable compression
  compress: true,
  
  // Bundle analyzer
  experimental: {
    bundlePagesRouterDependencies: true,
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
    }
    return config;
  },
};
```

### Caching Strategy
```javascript
// src/lib/cache.js
const CACHE_DURATIONS = {
  static: 31536000,      // 1 year for static assets
  comparison: 3600,      // 1 hour for comparisons
  orientations: 86400,   // 1 day for orientation data
};

export function setCacheHeaders(response, type = 'static') {
  const duration = CACHE_DURATIONS[type];
  response.headers.set(
    'Cache-Control',
    `public, max-age=${duration}, s-maxage=${duration}`
  );
  return response;
}
```

## Backup and Disaster Recovery

### Data Backup Strategy
```bash
#!/bin/bash
# scripts/backup.sh

# Environment variables
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
S3_BUCKET="orientation-comparison-backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database (when implemented)
if [ ! -z "$DATABASE_URL" ]; then
  pg_dump $DATABASE_URL > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
  gzip "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
  
  # Upload to S3
  aws s3 cp "$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz" \
    "s3://$S3_BUCKET/database/"
fi

# Backup static files
tar -czf "$BACKUP_DIR/static_backup_$TIMESTAMP.tar.gz" src/data/
aws s3 cp "$BACKUP_DIR/static_backup_$TIMESTAMP.tar.gz" \
  "s3://$S3_BUCKET/static/"

# Cleanup old local backups (keep last 7 days)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $TIMESTAMP"
```

### Disaster Recovery Plan

#### Recovery Time Objective (RTO): 1 hour
#### Recovery Point Objective (RPO): 24 hours

**Recovery Steps:**
1. **Assessment** (5 minutes): Identify scope of outage
2. **Communication** (5 minutes): Notify stakeholders
3. **Restoration** (30 minutes): Deploy from backup
4. **Verification** (15 minutes): Test functionality
5. **Monitoring** (5 minutes): Ensure stability

```bash
#!/bin/bash
# scripts/disaster-recovery.sh

echo "Starting disaster recovery procedure..."

# 1. Deploy from last known good state
vercel --prod --force

# 2. Restore database (if needed)
if [ "$RESTORE_DB" = "true" ]; then
  LATEST_BACKUP=$(aws s3 ls s3://orientation-comparison-backups/database/ | sort | tail -n 1 | awk '{print $4}')
  aws s3 cp "s3://orientation-comparison-backups/database/$LATEST_BACKUP" ./latest_backup.sql.gz
  gunzip latest_backup.sql.gz
  psql $DATABASE_URL < latest_backup.sql
fi

# 3. Verify deployment
curl -f https://your-domain.com/api/health || exit 1

echo "Disaster recovery completed successfully"
```

## Operational Procedures

### Deployment Checklist
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Monitoring alerts configured
- [ ] Rollback plan prepared
- [ ] Team notified of deployment

### Incident Response
```yaml
# .github/ISSUE_TEMPLATE/incident.md
---
name: Production Incident
about: Report a production incident
title: '[INCIDENT] '
labels: 'incident, priority-high'
assignees: '@devops-team'
---

## Incident Summary
Brief description of the issue

## Impact
- Affected users:
- Affected features:
- Severity: Critical/High/Medium/Low

## Timeline
- Detection time:
- Response time:
- Resolution time:

## Root Cause
Description of what caused the incident

## Resolution
Steps taken to resolve the issue

## Prevention
Measures to prevent similar incidents
```

### Maintenance Windows
```bash
# scripts/maintenance.sh
#!/bin/bash

echo "Starting maintenance window..."

# 1. Enable maintenance mode
echo "Maintenance mode enabled" > public/maintenance.html

# 2. Perform updates
npm run build
npm run migrate

# 3. Disable maintenance mode
rm public/maintenance.html

echo "Maintenance completed"
```

This comprehensive deployment and DevOps documentation provides a complete operational framework for the Tunisian orientation comparison platform, ensuring reliable, secure, and scalable deployments.
