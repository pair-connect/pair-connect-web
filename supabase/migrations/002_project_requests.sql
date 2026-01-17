-- =============================================
-- PROJECT REQUESTS - Sistema de solicitudes
-- =============================================
-- Tabla para manejar solicitudes de participación en proyectos
-- Cuando alguien muestra interés, se crea una solicitud pendiente
-- El owner puede aceptar o rechazar

CREATE TABLE IF NOT EXISTS project_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_project_requests_project ON project_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_project_requests_user ON project_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_project_requests_status ON project_requests(status);

-- RLS
ALTER TABLE project_requests ENABLE ROW LEVEL SECURITY;

-- Políticas para PROJECT_REQUESTS
CREATE POLICY "Users can view own requests" ON project_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Project owners can view requests for their projects" ON project_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_requests.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create requests" ON project_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Project owners can update request status" ON project_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_requests.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Service role access
CREATE POLICY "Service role full access requests" ON project_requests
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Trigger para updated_at
CREATE TRIGGER update_project_requests_updated_at
  BEFORE UPDATE ON project_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
