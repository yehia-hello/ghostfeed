-- ==================== SUPABASE DATABASE SCHEMA ====================
-- Run this in your Supabase SQL Editor

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT,
    avatar_url TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    username TEXT,
    avatar_url TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Anyone can read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Anyone can read likes" ON likes FOR SELECT USING (true);

-- Create policies for authenticated users
CREATE POLICY "Auth users can insert posts" ON posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can insert comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can insert likes" ON likes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to delete their own likes
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (user_id = auth.uid()::text);

-- Allow users to update/delete their own posts
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (user_id = auth.uid()::text);

-- Enable Realtime subscriptions
ALTER publication supabase_realtime ADD TABLE posts;
ALTER publication supabase_realtime ADD TABLE comments;
ALTER publication supabase_realtime ADD TABLE likes;