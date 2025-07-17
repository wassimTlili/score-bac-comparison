-- Migration: Enhanced Database Schema for University Orientation Platform
-- Version: 2.0 - Major Database Upgrade
-- Features: Clerk Auth, Comprehensive Models, RAG, Analytics, Full Chat System
-- 
-- IMPORTANT: This migration requires careful data migration planning
-- Run this migration in staging environment first!

-- ============================================
-- BACKUP EXISTING DATA (Important!)
-- ============================================

-- Create backup tables for existing data
CREATE TABLE IF NOT EXISTS backup_comparisons AS SELECT * FROM comparisons;
CREATE TABLE IF NOT EXISTS backup_chat_sessions AS SELECT * FROM chat_sessions;
CREATE TABLE IF NOT EXISTS backup_orientations AS SELECT * FROM orientations;
CREATE TABLE IF NOT EXISTS backup_universities AS SELECT * FROM universities;

-- ============================================
-- DROP EXISTING TABLES (Careful!)
-- ============================================

-- Drop in correct order (foreign keys first)
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS bac_scores CASCADE;
DROP TABLE IF EXISTS comparisons CASCADE;
DROP TABLE IF EXISTS orientations CASCADE;
DROP TABLE IF EXISTS universities CASCADE;
DROP TABLE IF EXISTS hubs CASCADE;

-- ============================================
-- CREATE NEW ENHANCED SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Clerk integration)
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    image_url TEXT,
    preferred_language TEXT DEFAULT 'ar',
    theme TEXT DEFAULT 'dark',
    notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- User profiles (stepper data)
CREATE TABLE user_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filiere TEXT NOT NULL,
    wilaya TEXT NOT NULL,
    birth_date TIMESTAMP,
    gender TEXT,
    session TEXT,
    mg_score DECIMAL,
    fs_score DECIMAL,
    final_score DECIMAL,
    grades JSONB,
    preferred_regions JSONB,
    career_interests JSONB,
    is_active BOOLEAN DEFAULT true,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, is_active)
);

-- Universities
CREATE TABLE universities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    university_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_ar TEXT,
    name_en TEXT,
    region TEXT,
    website TEXT,
    description TEXT,
    ranking INTEGER,
    is_public BOOLEAN DEFAULT true,
    founded_year INTEGER,
    address TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Bac types
CREATE TABLE bac_types (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    type_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_en TEXT,
    name_ar TEXT,
    description TEXT,
    subjects JSONB
);

-- Fields of study
CREATE TABLE fields_of_study (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    name_en TEXT,
    name_ar TEXT,
    category TEXT,
    description TEXT,
    demand_level TEXT,
    avg_salary TEXT,
    job_market JSONB
);

-- Institutions
CREATE TABLE institutions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    name_en TEXT,
    name_ar TEXT,
    location TEXT NOT NULL,
    university_id TEXT NOT NULL REFERENCES universities(id),
    type TEXT,
    website TEXT,
    phone TEXT,
    email TEXT
);

-- Orientations (main table based on finale-data.json)
CREATE TABLE orientations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    ramz_code TEXT UNIQUE NOT NULL,
    ramz_id TEXT UNIQUE NOT NULL,
    ramz_link TEXT,
    specialization TEXT NOT NULL,
    criteria TEXT,
    seven_percent BOOLEAN DEFAULT false,
    historical_scores JSONB NOT NULL,
    duration TEXT,
    degree TEXT,
    language TEXT,
    career_prospects JSONB,
    skills JSONB,
    bac_type_id TEXT NOT NULL REFERENCES bac_types(id),
    university_id TEXT NOT NULL REFERENCES universities(id),
    field_of_study_id TEXT REFERENCES fields_of_study(id),
    institution_id TEXT REFERENCES institutions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    popularity INTEGER DEFAULT 0
);

-- Favorites
CREATE TABLE favorites (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_profile_id TEXT REFERENCES user_profiles(id),
    orientation_id TEXT NOT NULL REFERENCES orientations(id),
    notes TEXT,
    priority INTEGER,
    tags JSONB,
    reason TEXT,
    application_status TEXT,
    application_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, orientation_id)
);

-- Comparisons
CREATE TABLE comparisons (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES users(id),
    user_profile_id TEXT REFERENCES user_profiles(id),
    orientation1_id TEXT NOT NULL REFERENCES orientations(id),
    orientation2_id TEXT NOT NULL REFERENCES orientations(id),
    user_score DECIMAL,
    user_bac_type TEXT,
    user_location TEXT,
    ai_analysis JSONB,
    analysis_status TEXT DEFAULT 'pending',
    analysis_model TEXT,
    analysis_tokens INTEGER,
    title TEXT,
    summary TEXT,
    confidence DECIMAL,
    is_public BOOLEAN DEFAULT false,
    share_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    view_count INTEGER DEFAULT 1
);

-- Conversations
CREATE TABLE conversations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES users(id),
    comparison_id TEXT REFERENCES comparisons(id),
    title TEXT,
    type TEXT DEFAULT 'comparison',
    status TEXT DEFAULT 'active',
    is_fullscreen BOOLEAN DEFAULT false,
    model TEXT,
    temperature DECIMAL,
    context JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP,
    message_count INTEGER DEFAULT 0
);

-- Messages
CREATE TABLE messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    role TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    tokens INTEGER,
    model TEXT,
    temperature DECIMAL,
    response_time INTEGER,
    parent_message_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversation transfers
CREATE TABLE conversation_transfers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    conversation_id TEXT NOT NULL REFERENCES conversations(id),
    from_mode TEXT NOT NULL,
    to_mode TEXT NOT NULL,
    reason TEXT,
    transferred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dynamic prompts
CREATE TABLE dynamic_prompts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    route TEXT NOT NULL,
    context TEXT,
    system_prompt TEXT NOT NULL,
    suggested_questions JSONB,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
    version TEXT DEFAULT '1.0',
    variant TEXT,
    audience TEXT,
    use_count INTEGER DEFAULT 0,
    avg_rating DECIMAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(route, context, variant, is_active)
);

-- Prompt analytics
CREATE TABLE prompt_analytics (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    prompt_id TEXT NOT NULL REFERENCES dynamic_prompts(id),
    use_count INTEGER DEFAULT 0,
    avg_rating DECIMAL,
    avg_response_time DECIMAL,
    success_rate DECIMAL,
    error_rate DECIMAL,
    positive_reactions INTEGER DEFAULT 0,
    negative_reactions INTEGER DEFAULT 0,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(prompt_id, date)
);

-- Orientation embeddings
CREATE TABLE orientation_embeddings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    orientation_id TEXT NOT NULL REFERENCES orientations(id),
    content TEXT NOT NULL,
    embedding JSONB NOT NULL,
    model TEXT NOT NULL,
    content_type TEXT NOT NULL,
    language TEXT DEFAULT 'ar',
    version TEXT DEFAULT '1.0',
    quality DECIMAL,
    relevance DECIMAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document embeddings
CREATE TABLE document_embeddings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    url TEXT,
    source TEXT NOT NULL,
    embedding JSONB NOT NULL,
    model TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    tags JSONB,
    language TEXT DEFAULT 'ar',
    version TEXT DEFAULT '1.0',
    file_size INTEGER,
    mime_type TEXT,
    quality DECIMAL,
    relevance DECIMAL,
    is_public BOOLEAN DEFAULT true,
    access_level TEXT DEFAULT 'public',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User activities
CREATE TABLE user_activities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES users(id),
    action TEXT NOT NULL,
    page TEXT,
    data JSONB,
    session_id TEXT,
    user_agent TEXT,
    ip_address TEXT,
    country TEXT,
    city TEXT,
    load_time INTEGER,
    duration INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System metrics
CREATE TABLE system_metrics (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    value DECIMAL NOT NULL,
    unit TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    tags JSONB,
    source TEXT,
    method TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hour INTEGER
);

-- Pomodoro settings
CREATE TABLE pomodoro_settings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL,
    tasks JSONB,
    stats JSONB,
    version TEXT DEFAULT '1.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lofi settings
CREATE TABLE lofi_settings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL,
    playlists JSONB,
    history JSONB,
    favorites JSONB,
    version TEXT DEFAULT '1.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- User indexes
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Orientation indexes
CREATE INDEX idx_orientations_ramz_code ON orientations(ramz_code);
CREATE INDEX idx_orientations_bac_type_id ON orientations(bac_type_id);
CREATE INDEX idx_orientations_university_id ON orientations(university_id);
CREATE INDEX idx_orientations_popularity ON orientations(popularity);

-- Comparison indexes
CREATE INDEX idx_comparisons_user_id ON comparisons(user_id);
CREATE INDEX idx_comparisons_created_at ON comparisons(created_at);
CREATE INDEX idx_comparisons_share_token ON comparisons(share_token);

-- Conversation indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_comparison_id ON conversations(comparison_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);

-- Message indexes
CREATE INDEX idx_messages_conversation_id_created_at ON messages(conversation_id, created_at);

-- Embedding indexes
CREATE INDEX idx_orientation_embeddings_orientation_id ON orientation_embeddings(orientation_id);
CREATE INDEX idx_orientation_embeddings_content_type ON orientation_embeddings(content_type);
CREATE INDEX idx_document_embeddings_category ON document_embeddings(category);
CREATE INDEX idx_document_embeddings_language ON document_embeddings(language);

-- Activity indexes
CREATE INDEX idx_user_activities_user_id_created_at ON user_activities(user_id, created_at);
CREATE INDEX idx_user_activities_action_created_at ON user_activities(action, created_at);
CREATE INDEX idx_user_activities_session_id ON user_activities(session_id);

-- Metrics indexes
CREATE INDEX idx_system_metrics_name_date ON system_metrics(name, date);
CREATE INDEX idx_system_metrics_category_date ON system_metrics(category, date);
CREATE INDEX idx_system_metrics_hour ON system_metrics(hour);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_universities_updated_at BEFORE UPDATE ON universities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orientations_updated_at BEFORE UPDATE ON orientations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_favorites_updated_at BEFORE UPDATE ON favorites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comparisons_updated_at BEFORE UPDATE ON comparisons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dynamic_prompts_updated_at BEFORE UPDATE ON dynamic_prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orientation_embeddings_updated_at BEFORE UPDATE ON orientation_embeddings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_embeddings_updated_at BEFORE UPDATE ON document_embeddings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pomodoro_settings_updated_at BEFORE UPDATE ON pomodoro_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lofi_settings_updated_at BEFORE UPDATE ON lofi_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample bac types
INSERT INTO bac_types (type_id, name, name_ar, description) VALUES
('1', 'Mathématiques', 'رياضيات', 'Baccalauréat Mathématiques'),
('2', 'Sciences Expérimentales', 'علوم تجريبية', 'Baccalauréat Sciences Expérimentales'),
('3', 'Sciences de l''Informatique', 'علوم إعلامية', 'Baccalauréat Sciences de l''Informatique'),
('4', 'Économie et Gestion', 'إقتصاد وتصرف', 'Baccalauréat Économie et Gestion'),
('5', 'Lettres', 'آداب', 'Baccalauréat Lettres'),
('6', 'Sciences Techniques', 'تقنية', 'Baccalauréat Sciences Techniques'),
('7', 'Sport', 'رياضة', 'Baccalauréat Sport');

-- Insert sample fields of study
INSERT INTO fields_of_study (name, name_ar, category, description) VALUES
('Sciences Exactes', 'العلوم الدقيقة', 'Sciences', 'Mathématiques, Physique, Chimie'),
('Sciences de la Vie', 'علوم الحياة', 'Sciences', 'Biologie, Médecine, Pharmacie'),
('Ingénierie', 'الهندسة', 'Ingénierie', 'Génie Civil, Informatique, Électrique'),
('Sciences Économiques', 'العلوم الاقتصادية', 'Économie', 'Économie, Gestion, Finance'),
('Sciences Humaines', 'العلوم الإنسانية', 'Humanités', 'Langues, Philosophie, Histoire'),
('Arts et Culture', 'الفنون والثقافة', 'Arts', 'Beaux-Arts, Musique, Théâtre');

-- ============================================
-- NOTES AND WARNINGS
-- ============================================

-- IMPORTANT: 
-- 1. This migration will DROP existing tables and data
-- 2. Make sure to backup your data before running this migration
-- 3. Update your application code to use the new schema
-- 4. Test thoroughly in staging environment first
-- 5. Consider running data migration scripts after this migration

-- TODO:
-- 1. Create data migration scripts for existing data
-- 2. Update Prisma client generation
-- 3. Update application models and services
-- 4. Add proper error handling for migration failures