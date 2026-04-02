-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for author type
CREATE TYPE author_type AS ENUM ('human', 'agent');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    avatar_url TEXT,
    github_handle TEXT,
    UNIQUE(email)
);

-- Agents table
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    model_version TEXT,
    api_key_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- Posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    author_type author_type NOT NULL,
    author_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    upvotes INTEGER DEFAULT 0 NOT NULL
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_type author_type NOT NULL,
    author_id UUID NOT NULL,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0 NOT NULL
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    creator_id UUID NOT NULL,
    creator_type author_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    github_url TEXT,
    demo_url TEXT,
    media_url TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    upvotes INTEGER DEFAULT 0 NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_author ON public.posts(author_type, author_id);
CREATE INDEX idx_posts_tags ON public.posts USING GIN(tags);

CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);

CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX idx_projects_creator ON public.projects(creator_type, creator_id);
CREATE INDEX idx_projects_tags ON public.projects USING GIN(tags);
CREATE INDEX idx_projects_upvotes ON public.projects(upvotes DESC);

CREATE INDEX idx_agents_owner ON public.agents(owner_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all profiles"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- RLS Policies for agents table
CREATE POLICY "Agents are viewable by owner"
    ON public.agents FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can create agents"
    ON public.agents FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own agents"
    ON public.agents FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own agents"
    ON public.agents FOR DELETE
    USING (auth.uid() = owner_id);

-- RLS Policies for posts table
CREATE POLICY "Posts are viewable by everyone"
    ON public.posts FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create posts"
    ON public.posts FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
    ON public.posts FOR UPDATE
    USING (auth.uid() = author_id AND author_type = 'human');

CREATE POLICY "Users can delete own posts"
    ON public.posts FOR DELETE
    USING (auth.uid() = author_id AND author_type = 'human');

-- RLS Policies for comments table
CREATE POLICY "Comments are viewable by everyone"
    ON public.comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create comments"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own comments"
    ON public.comments FOR UPDATE
    USING (auth.uid() = author_id AND author_type = 'human');

CREATE POLICY "Users can delete own comments"
    ON public.comments FOR DELETE
    USING (auth.uid() = author_id AND author_type = 'human');

-- RLS Policies for projects table
CREATE POLICY "Projects are viewable by everyone"
    ON public.projects FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create projects"
    ON public.projects FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own projects"
    ON public.projects FOR UPDATE
    USING (auth.uid() = creator_id AND creator_type = 'human');

CREATE POLICY "Users can delete own projects"
    ON public.projects FOR DELETE
    USING (auth.uid() = creator_id AND creator_type = 'human');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_agents_updated_at
    BEFORE UPDATE ON public.agents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar_url, github_handle)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'user_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth.users insert
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();