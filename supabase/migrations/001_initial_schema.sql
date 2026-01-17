-- =============================================
-- PAIR CONNECT - Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE (perfiles de usuario)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  stack TEXT NOT NULL DEFAULT 'Fullstack' CHECK (stack IN ('Frontend', 'Backend', 'Fullstack')),
  level TEXT NOT NULL DEFAULT 'Junior' CHECK (level IN ('Junior', 'Mid', 'Senior')),
  languages TEXT[] DEFAULT '{}',
  contacts JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PROJECTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  stack TEXT NOT NULL DEFAULT 'Fullstack' CHECK (stack IN ('Frontend', 'Backend', 'Fullstack')),
  level TEXT NOT NULL DEFAULT 'Junior' CHECK (level IN ('Junior', 'Mid', 'Senior')),
  languages TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SESSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60, -- en minutos
  max_participants INTEGER NOT NULL DEFAULT 4,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SESSION PARTICIPANTS (many-to-many)
-- =============================================
CREATE TABLE IF NOT EXISTS session_participants (
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (session_id, user_id)
);

-- =============================================
-- SESSION INTERESTED (many-to-many)
-- =============================================
CREATE TABLE IF NOT EXISTS session_interested (
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (session_id, user_id)
);

-- =============================================
-- PROJECT INTERESTED (many-to-many)
-- =============================================
CREATE TABLE IF NOT EXISTS project_interested (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);

-- =============================================
-- USER BOOKMARKS (many-to-many)
-- =============================================
CREATE TABLE IF NOT EXISTS user_bookmarks (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, session_id)
);

-- =============================================
-- INDEXES para mejor rendimiento
-- =============================================
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_project ON sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_sessions_owner ON sessions(owner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_session_participants_user ON session_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_session_interested_user ON session_interested(user_id);
CREATE INDEX IF NOT EXISTS idx_project_interested_user ON project_interested(user_id);
CREATE INDEX IF NOT EXISTS idx_project_interested_project ON project_interested(project_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_session ON user_bookmarks(session_id);

-- =============================================
-- TRIGGERS para updated_at automático
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_interested ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_interested ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Políticas para USERS
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para PROJECTS
CREATE POLICY "Projects are viewable by everyone" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Users can create own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = owner_id);

-- Políticas para SESSIONS
CREATE POLICY "Sessions are viewable by everyone" ON sessions
  FOR SELECT USING (true);

CREATE POLICY "Users can create sessions for own projects" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own sessions" ON sessions
  FOR DELETE USING (auth.uid() = owner_id);

-- Políticas para SESSION_PARTICIPANTS
CREATE POLICY "Participants viewable by everyone" ON session_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join sessions" ON session_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave sessions" ON session_participants
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para SESSION_INTERESTED
CREATE POLICY "Interested viewable by everyone" ON session_interested
  FOR SELECT USING (true);

CREATE POLICY "Users can mark interest" ON session_interested
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove interest" ON session_interested
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para PROJECT_INTERESTED
CREATE POLICY "Project interested viewable by everyone" ON project_interested
  FOR SELECT USING (true);

CREATE POLICY "Users can mark project interest" ON project_interested
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove project interest" ON project_interested
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para USER_BOOKMARKS
CREATE POLICY "Users can view own bookmarks" ON user_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add bookmarks" ON user_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove bookmarks" ON user_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- Política especial para service_role (Edge Functions)
-- =============================================
CREATE POLICY "Service role full access users" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access projects" ON projects
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access sessions" ON sessions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access participants" ON session_participants
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access interested" ON session_interested
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access project interested" ON project_interested
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access bookmarks" ON user_bookmarks
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
