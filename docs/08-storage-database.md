# Storage and Database

This document covers the data storage architecture, database design, and data persistence strategies.

## Current Storage Architecture

### In-Memory Storage (Development)

The application currently uses in-memory storage for rapid prototyping and development:

**File**: `src/lib/comparison-storage.js`

#### Implementation
```javascript
class ComparisonStorage {
  constructor() {
    this.comparisons = new Map();
  }
  
  create(comparison) {
    this.comparisons.set(comparison.id, {
      ...comparison,
      metadata: {
        ...comparison.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    return comparison;
  }
  
  // Additional CRUD operations
}

export const comparisonStorage = new ComparisonStorage();
```

#### Advantages
- **Fast Development**: No database setup required
- **Simple Testing**: Easy to reset state between tests
- **Zero Configuration**: Works out of the box
- **High Performance**: In-memory operations are extremely fast

#### Limitations
- **Data Loss**: Data is lost on server restart
- **No Persistence**: Cannot survive deployments
- **Memory Usage**: Limited by server RAM
- **No Concurrency**: Single-process limitation
- **No Analytics**: Limited historical data analysis

### Static Data Files

#### Orientations Data (`src/data/orientations.json`)
Contains Tunisian university orientations and governorate information:

```javascript
{
  "orientations": [
    {
      "id": "informatique",
      "name": "Informatique",
      "nameAr": "علوم الحاسوب",
      "category": "Sciences",
      "subcategory": "Informatique et Technologies",
      "minScore": 12.0,
      "description": "Formation en développement logiciel...",
      "duration": "3 ans",
      "degree": "Licence",
      "skills": ["Programmation", "Algorithmes", "Base de données"],
      "careers": ["Développeur", "Analyste", "Chef de projet IT"],
      "institutes": ["ISET", "Université de Tunis"],
      "governorates": ["tunis", "ariana", "manouba"]
    }
  ],
  "governorates": [
    {
      "id": "tunis",
      "name": "Tunis",
      "nameAr": "تونس",
      "region": "Grand Tunis",
      "universities": ["Université de Tunis", "Université Libre de Tunis"]
    }
  ]
}
```

#### Data Management
- **Version Control**: Tracked in Git
- **Manual Updates**: Requires code deployment for changes
- **Structured Format**: JSON schema validation
- **Localization**: French and Arabic language support

## Production Database Architecture

### Database Selection: PostgreSQL

**Recommended Database**: PostgreSQL 15+

#### Reasons for PostgreSQL
1. **ACID Compliance**: Ensures data integrity
2. **JSON Support**: Native support for JSON/JSONB columns
3. **Full-Text Search**: Built-in search capabilities
4. **Scalability**: Excellent performance and scaling options
5. **Extensions**: Rich ecosystem of extensions
6. **Open Source**: No licensing costs

### Database Schema Design

#### Tables Structure

##### comparisons
```sql
CREATE TABLE comparisons (
    id VARCHAR(21) PRIMARY KEY,  -- nanoid
    orientation1_id VARCHAR(100) NOT NULL,
    orientation2_id VARCHAR(100) NOT NULL,
    governorate_id VARCHAR(50) NOT NULL,
    bac_score DECIMAL(4,2) NOT NULL CHECK (bac_score >= 8.0 AND bac_score <= 20.0),
    analysis JSONB NOT NULL,
    metadata JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT fk_orientation1 FOREIGN KEY (orientation1_id) REFERENCES orientations(id),
    CONSTRAINT fk_orientation2 FOREIGN KEY (orientation2_id) REFERENCES orientations(id),
    CONSTRAINT fk_governorate FOREIGN KEY (governorate_id) REFERENCES governorates(id)
);

-- Indexes for query performance
CREATE INDEX idx_comparisons_created_at ON comparisons(created_at);
CREATE INDEX idx_comparisons_orientations ON comparisons(orientation1_id, orientation2_id);
CREATE INDEX idx_comparisons_governorate ON comparisons(governorate_id);
CREATE INDEX idx_comparisons_score ON comparisons(bac_score);
```

##### orientations
```sql
CREATE TABLE orientations (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    name_ar VARCHAR(200),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    min_score DECIMAL(4,2) NOT NULL,
    description TEXT,
    duration VARCHAR(50),
    degree VARCHAR(100),
    skills JSONB,
    careers JSONB,
    institutes JSONB,
    governorates JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX idx_orientations_search ON orientations 
USING GIN (to_tsvector('french', name || ' ' || COALESCE(description, '')));
```

##### governorates
```sql
CREATE TABLE governorates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    region VARCHAR(100),
    universities JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

##### chat_sessions (Future)
```sql
CREATE TABLE chat_sessions (
    id VARCHAR(21) PRIMARY KEY,
    comparison_id VARCHAR(21) NOT NULL,
    messages JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_chat_comparison FOREIGN KEY (comparison_id) REFERENCES comparisons(id) ON DELETE CASCADE
);
```

##### analytics_events (Future)
```sql
CREATE TABLE analytics_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    user_session VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_type_date ON analytics_events(event_type, created_at);
```

### Database Migration Strategy

#### Prisma ORM Integration
```javascript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Comparison {
  id            String   @id @default(cuid())
  orientation1Id String   @map("orientation1_id")
  orientation2Id String   @map("orientation2_id")
  governorateId  String   @map("governorate_id")
  bacScore      Float    @map("bac_score")
  analysis      Json
  metadata      Json
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  orientation1 Orientation @relation("Orientation1", fields: [orientation1Id], references: [id])
  orientation2 Orientation @relation("Orientation2", fields: [orientation2Id], references: [id])
  governorate  Governorate @relation(fields: [governorateId], references: [id])

  @@map("comparisons")
}

model Orientation {
  id           String   @id
  name         String
  nameAr       String?  @map("name_ar")
  category     String
  subcategory  String?
  minScore     Float    @map("min_score")
  description  String?
  duration     String?
  degree       String?
  skills       Json?
  careers      Json?
  institutes   Json?
  governorates Json?
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  comparisons1 Comparison[] @relation("Orientation1")
  comparisons2 Comparison[] @relation("Orientation2")

  @@map("orientations")
}

model Governorate {
  id           String   @id
  name         String
  nameAr       String?  @map("name_ar")
  region       String?
  universities Json?
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  comparisons Comparison[]

  @@map("governorates")
}
```

#### Migration Files
```sql
-- 001_initial_schema.sql
-- Create initial database structure

-- 002_add_indexes.sql
-- Add performance indexes

-- 003_add_analytics.sql
-- Add analytics tables
```

### Database Client Setup

#### Prisma Client Configuration
```javascript
// src/lib/prisma.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

#### Connection Pool Configuration
```javascript
// database.js
const databaseConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100
  }
};
```

## Data Access Layer

### Repository Pattern Implementation

#### ComparisonRepository
```javascript
// src/repositories/comparison-repository.js
import { prisma } from '@/lib/prisma';

export class ComparisonRepository {
  async create(data) {
    return await prisma.comparison.create({
      data: {
        ...data,
        metadata: {
          version: '1.0',
          aiModel: 'gpt-4',
          ...data.metadata
        }
      },
      include: {
        orientation1: true,
        orientation2: true,
        governorate: true
      }
    });
  }
  
  async findById(id) {
    return await prisma.comparison.findUnique({
      where: { id },
      include: {
        orientation1: true,
        orientation2: true,
        governorate: true
      }
    });
  }
  
  async findMany(filters = {}) {
    const { page = 1, limit = 10, ...where } = filters;
    
    return await prisma.comparison.findMany({
      where,
      include: {
        orientation1: true,
        orientation2: true,
        governorate: true
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });
  }
  
  async update(id, data) {
    return await prisma.comparison.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }
  
  async delete(id) {
    return await prisma.comparison.delete({
      where: { id }
    });
  }
  
  async getStats() {
    const [totalCount, avgScore, popularOrientations] = await Promise.all([
      prisma.comparison.count(),
      prisma.comparison.aggregate({
        _avg: { bacScore: true }
      }),
      prisma.comparison.groupBy({
        by: ['orientation1Id'],
        _count: { orientation1Id: true },
        orderBy: { _count: { orientation1Id: 'desc' } },
        take: 10
      })
    ]);
    
    return {
      totalCount,
      averageScore: avgScore._avg.bacScore,
      popularOrientations
    };
  }
}

export const comparisonRepository = new ComparisonRepository();
```

### Query Optimization

#### Database Indexes
```sql
-- Performance indexes
CREATE INDEX CONCURRENTLY idx_comparisons_created_at ON comparisons(created_at);
CREATE INDEX CONCURRENTLY idx_comparisons_analysis_gin ON comparisons USING GIN (analysis);
CREATE INDEX CONCURRENTLY idx_orientations_category ON orientations(category, min_score);
```

#### Query Caching
```javascript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedComparison(id) {
  const cached = await redis.get(`comparison:${id}`);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const comparison = await comparisonRepository.findById(id);
  if (comparison) {
    await redis.setex(`comparison:${id}`, 300, JSON.stringify(comparison));
  }
  
  return comparison;
}
```

## Backup and Recovery

### Automated Backups
```bash
#!/bin/bash
# backup-database.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="orientation_comparison"

# Create backup
pg_dump $DATABASE_URL > "$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Compress backup
gzip "$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### Point-in-Time Recovery
```sql
-- Enable point-in-time recovery
ALTER SYSTEM SET archive_mode = on;
ALTER SYSTEM SET archive_command = 'cp %p /var/lib/postgresql/archive/%f';
SELECT pg_reload_conf();
```

## Data Migration Strategy

### Static Data Migration
```javascript
// scripts/migrate-static-data.js
import { readFileSync } from 'fs';
import { prisma } from '../src/lib/prisma.js';

export async function migrateStaticData() {
  const data = JSON.parse(readFileSync('src/data/orientations.json', 'utf8'));
  
  // Migrate governorates
  for (const gov of data.governorates) {
    await prisma.governorate.upsert({
      where: { id: gov.id },
      update: gov,
      create: gov
    });
  }
  
  // Migrate orientations
  for (const orientation of data.orientations) {
    await prisma.orientation.upsert({
      where: { id: orientation.id },
      update: orientation,
      create: orientation
    });
  }
}
```

### Data Validation
```javascript
// scripts/validate-data.js
export async function validateData() {
  const orientations = await prisma.orientation.findMany();
  const governorates = await prisma.governorate.findMany();
  
  const errors = [];
  
  // Validate orientation references
  for (const orientation of orientations) {
    for (const govId of orientation.governorates) {
      if (!governorates.find(g => g.id === govId)) {
        errors.push(`Invalid governorate ${govId} in orientation ${orientation.id}`);
      }
    }
  }
  
  return errors;
}
```

## Performance Monitoring

### Database Metrics
```sql
-- Monitor query performance
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- Monitor table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Application Monitoring
```javascript
// src/lib/database-metrics.js
export async function getDatabaseMetrics() {
  const [
    connectionCount,
    tableSize,
    queryStats
  ] = await Promise.all([
    prisma.$queryRaw`SELECT count(*) FROM pg_stat_activity`,
    prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database()))`,
    prisma.$queryRaw`SELECT * FROM pg_stat_user_tables WHERE schemaname = 'public'`
  ]);
  
  return {
    connections: connectionCount[0].count,
    databaseSize: tableSize[0].pg_size_pretty,
    tables: queryStats
  };
}
```

## Security Considerations

### Database Security
```sql
-- Create application user with limited privileges
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE orientation_comparison TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

### Connection Security
```javascript
// src/lib/database.js
const DATABASE_URL = process.env.DATABASE_URL;

// Validate SSL in production
if (process.env.NODE_ENV === 'production') {
  if (!DATABASE_URL.includes('sslmode=require')) {
    throw new Error('SSL required for production database connections');
  }
}
```

### Data Encryption
```sql
-- Enable row-level security
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;

-- Create policy for data access
CREATE POLICY comparison_access ON comparisons
  FOR ALL
  TO app_user
  USING (true);  -- Customize based on requirements
```

## Future Enhancements

### Sharding Strategy
- Horizontal partitioning by governorate
- Read replicas for analytics queries
- Distributed caching with Redis Cluster

### Advanced Analytics
- Time-series data for trend analysis
- Data warehouse integration
- Real-time analytics dashboards

### Multi-tenant Architecture
- School/institution-specific data isolation
- Custom branding and configurations
- Separate databases per institution
