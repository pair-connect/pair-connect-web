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
}

export const toFrontendProject = (project: DbProject) => ({
  id: project.id,
  ownerId: project.owner_id,
  title: project.title,
  description: project.description,
  image: project.image,
  stack: project.stack,
  level: project.level,
  languages: project.languages || [],
  createdAt: project.created_at,
  updatedAt: project.updated_at,
});
