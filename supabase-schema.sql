-- DevPath Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Drop existing table and policies if they exist
DROP TABLE IF EXISTS user_progress CASCADE;

-- User progress table (tracks completed roadmap/best-practice topics)
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('roadmap', 'best-practice')),
  resource_id VARCHAR(100) NOT NULL,
  topic_id VARCHAR(100) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource_type, resource_id, topic_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_user_progress_user_id 
ON user_progress(user_id);

CREATE INDEX idx_user_progress_resource 
ON user_progress(user_id, resource_type, resource_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see and modify their own progress
CREATE POLICY "Users can view their own progress"
ON user_progress FOR SELECT
USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can insert their own progress"
ON user_progress FOR INSERT
WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update their own progress"
ON user_progress FOR UPDATE
USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can delete their own progress"
ON user_progress FOR DELETE
USING (auth.uid()::uuid = user_id);
