# Development Setup with Database

This file contains instructions for setting up the database for local development.

## Prerequisites

1. **PostgreSQL** installed locally
2. **Node.js** 18+ with npm
3. **Git** for version control

## Database Setup

### 1. Install PostgreSQL
- Download and install PostgreSQL from https://postgresql.org/download/
- Create a database user and database for the project

### 2. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE orientation_db;
CREATE USER orientation_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE orientation_db TO orientation_user;
\q
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your database credentials
DATABASE_URL="postgresql://orientation_user:your_password@localhost:5432/orientation_db"
```

### 4. Prisma Setup
```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database with orientation data
npm run db:seed
```

## Alternative: Use Static Data Only

If you prefer not to set up a database for development:

1. The application will work with static JSON data from `src/data/orientations.json`
2. Database functions will fallback to static data automatically
3. All features will work except data persistence

## Development Commands

```bash
# Start development server
npm run dev

# View database in Prisma Studio
npm run db:studio

# Reset database and reseed
npm run db:reset

# Push schema changes without migration
npm run db:push
```

## Production Database

For production deployment, configure:
- PostgreSQL on cloud provider (AWS RDS, Google Cloud SQL, etc.)
- Update DATABASE_URL in production environment
- Run migrations: `npm run db:migrate`
- Seed data: `npm run db:seed`
