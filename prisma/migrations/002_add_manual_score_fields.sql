-- Migration: Add manual score override fields to user_profiles table
-- Date: 2025-01-18

-- Add new fields for manual score overrides
ALTER TABLE user_profiles 
ADD COLUMN has_manual_scores BOOLEAN DEFAULT FALSE,
ADD COLUMN manual_mg_score DECIMAL(5,2),
ADD COLUMN manual_fs_score DECIMAL(6,2);

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.has_manual_scores IS 'Flag indicating if user has manually overridden calculated scores';
COMMENT ON COLUMN user_profiles.manual_mg_score IS 'User-provided MG score override (0-20)';
COMMENT ON COLUMN user_profiles.manual_fs_score IS 'User-provided FS score override (0-200)';

-- Create index for performance
CREATE INDEX idx_user_profiles_manual_scores ON user_profiles(has_manual_scores) WHERE has_manual_scores = TRUE;
