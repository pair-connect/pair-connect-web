export interface ProjectInterestState {
  interested: string[];
}

export interface PrivacySettings {
  showEmail?: boolean;
  showContacts?: boolean;
  showProjects?: boolean;
  showSessions?: boolean;
  showBio?: boolean;
  showLanguages?: boolean;
  showStack?: boolean;
  showLevel?: boolean;
}

export interface DbBookmarkRow {
  session_id: string;
}

export interface DbInterestedRow {
  user_id: string;
}

export interface DbSessionRef {
  id: string;
}

export interface DbUser {
  id: string;
  username?: string | null;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  bio?: string | null;
  stack?: string | null;
  level?: string | null;
  languages?: string[] | null;
  contacts?: Record<string, unknown> | null;
  profile_public?: boolean | null;
  privacy_settings?: PrivacySettings | null;
  [key: string]: unknown;
}

export interface DbProject {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  image?: string | null;
  stack?: string | null;
  level?: string | null;
  languages?: string[] | null;
  created_at: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface DbSession {
  id: string;
  project_id: string;
  owner_id: string;
  title: string;
  description?: string | null;
  date: string;
  duration: number;
  max_participants: number;
  link?: string | null;
  [key: string]: unknown;
}
