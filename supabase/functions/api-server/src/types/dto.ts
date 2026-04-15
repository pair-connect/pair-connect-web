export interface UpdateRequestActionDto {
  action: 'accept' | 'reject';
}

export interface UpdateUserDto extends Record<string, unknown> {
  profilePublic?: boolean;
  privacySettings?: Record<string, unknown>;
  username?: string;
  name?: string;
  avatar?: string;
  bio?: string | null;
  stack?: string;
  level?: string;
  languages?: string[];
  contacts?: Record<string, unknown>;
}

export interface CreateProjectDto {
  title: string;
  description: string;
  image?: string | null;
  stack?: string;
  level?: string;
  languages?: string[];
}

export interface UpdateProjectDto extends Record<string, unknown> {
  id?: string;
  owner_id?: string;
  created_at?: string;
}

export interface CreateSessionDto {
  projectId: string;
  title: string;
  description?: string;
  date: string;
  duration?: number;
  maxParticipants?: number;
  link?: string | null;
}

export interface UpdateSessionDto {
  title?: string;
  description?: string;
  date?: string;
  duration?: number;
  maxParticipants?: number;
  link?: string | null;
}
