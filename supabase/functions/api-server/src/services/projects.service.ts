import { toFrontendProject } from "../adapters/frontend/project.adapter.ts";
import { projectsQuery } from "../queries/projects.query.ts";
import type { DbInterestedRow, DbProject, DbSessionRef } from "../types/domain.ts";
import type { CreateProjectDto, UpdateProjectDto } from "../types/dto.ts";
import { ensureUserExists } from "./users.service.ts";

type ServiceResult = { status: number; body: Record<string, unknown> | unknown[] };

export const projectsService = {
  async createProject(userId: string | null, projectData: CreateProjectDto): Promise<ServiceResult> {
    if (!userId) {
      console.log('Create project - Auth verification failed');
      return { status: 401, body: { error: 'Unauthorized' } };
    }

    console.log('Create project - Auth verified, userId:', userId);

    const userExists = await ensureUserExists(userId);
    if (!userExists) {
      return { status: 500, body: { error: 'Could not create user profile' } };
    }

    const { data: project, error } = await projectsQuery.insertProject({
      owner_id: userId,
      title: projectData.title,
      description: projectData.description,
      image: projectData.image,
      stack: projectData.stack || 'Fullstack',
      level: projectData.level || 'Junior',
      languages: projectData.languages || [],
    });

    if (error) {
      console.log('Create project error:', error);
      return { status: 500, body: { error: 'Error creating project: ' + error.message } };
    }

    return {
      status: 200,
      body: {
        ...toFrontendProject(project),
        interested: [],
      },
    };
  },

  async getProjects(ownerId?: string, stack?: string, level?: string): Promise<ServiceResult> {
    const { data: projects, error } = await projectsQuery.listProjects({ ownerId, stack, level });

    if (error) {
      console.log('Get projects error details:', error.message, error.code, error.details);
      return { status: 500, body: { error: 'Error fetching projects: ' + error.message } };
    }

    const projectsWithInterested = await Promise.all(
      ((projects as DbProject[] | null) || []).map(async (project) => {
        const { data: interested } = await projectsQuery.findProjectInterestedUsers(project.id);

        return {
          ...toFrontendProject(project),
          interested: (interested as DbInterestedRow[] | null)?.map((i) => i.user_id) || [],
        };
      })
    );

    return { status: 200, body: projectsWithInterested };
  },

  async getProjectById(projectId: string): Promise<ServiceResult> {
    const { data: project, error } = await projectsQuery.findProjectById(projectId);

    if (error || !project) {
      return { status: 404, body: { error: 'Project not found' } };
    }

    const { data: interested } = await projectsQuery.findProjectInterestedUsers(projectId);

    return {
      status: 200,
      body: {
        ...toFrontendProject(project),
        interested: (interested as DbInterestedRow[] | null)?.map((i) => i.user_id) || [],
      },
    };
  },

  async updateProject(userId: string | null, projectId: string, updates: UpdateProjectDto): Promise<ServiceResult> {
    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized' } };
    }

    const { data: existing } = await projectsQuery.findProjectOwnerById(projectId);

    if (!existing || existing.owner_id !== userId) {
      return { status: 403, body: { error: 'Forbidden - not project owner' } };
    }

    delete updates.id;
    delete updates.owner_id;
    delete updates.created_at;

    const { data: project, error } = await projectsQuery.updateProjectById(projectId, updates);

    if (error) {
      return { status: 500, body: { error: 'Error updating project' } };
    }

    const { data: interested } = await projectsQuery.findProjectInterestedUsers(projectId);

    return {
      status: 200,
      body: {
        ...toFrontendProject(project),
        interested: (interested as DbInterestedRow[] | null)?.map((i) => i.user_id) || [],
      },
    };
  },

  async deleteProject(userId: string | null, projectId: string): Promise<ServiceResult> {
    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized' } };
    }

    const { data: existing } = await projectsQuery.findProjectOwnerById(projectId);

    if (!existing || existing.owner_id !== userId) {
      return { status: 403, body: { error: 'Forbidden - not project owner' } };
    }

    const { error } = await projectsQuery.deleteProjectById(projectId);

    if (error) {
      return { status: 500, body: { error: 'Error deleting project' } };
    }

    return { status: 200, body: { success: true } };
  },

  async toggleProjectInterest(userId: string | null, projectId: string): Promise<ServiceResult> {
    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized' } };
    }

    const { data: project, error: projectError } = await projectsQuery.findProjectById(projectId);

    if (projectError || !project) {
      return { status: 404, body: { error: 'Project not found' } };
    }

    if (project.owner_id === userId) {
      return { status: 400, body: { error: 'Cannot show interest in your own project' } };
    }

    const { data: existingRequest } = await projectsQuery.findProjectRequestByProjectAndUser(projectId, userId);

    if (existingRequest) {
      await projectsQuery.deleteProjectRequestByProjectAndUser(projectId, userId);
    } else {
      const { error: requestError } = await projectsQuery.insertProjectRequest({
        project_id: projectId,
        user_id: userId,
        status: 'pending',
      });

      if (requestError) {
        console.log('Error creating request:', requestError);
        return { status: 500, body: { error: 'Error creating request' } };
      }
    }

    const { data: acceptedRequests } = await projectsQuery.findAcceptedProjectRequestsByProjectId(projectId);
    const { data: fullProject } = await projectsQuery.findProjectById(projectId);

    return {
      status: 200,
      body: {
        ...toFrontendProject(fullProject),
        interested: (acceptedRequests as DbInterestedRow[] | null)?.map((r) => r.user_id) || [],
      },
    };
  },

  async getProjectRequests(userId: string | null, projectId: string): Promise<ServiceResult> {
    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized' } };
    }

    const { data: project } = await projectsQuery.findProjectOwnerById(projectId);

    if (!project || project.owner_id !== userId) {
      return { status: 403, body: { error: 'Forbidden - not project owner' } };
    }

    const { data: requests, error } = await projectsQuery.findProjectRequestsWithUser(projectId);

    if (error) {
      return { status: 500, body: { error: 'Error fetching requests' } };
    }

    return { status: 200, body: requests || [] };
  },

  async updateProjectRequest(
    userId: string | null,
    projectId: string,
    requestId: string,
    action: string
  ): Promise<ServiceResult> {
    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized' } };
    }

    if (!['accept', 'reject'].includes(action)) {
      return { status: 400, body: { error: 'Invalid action. Must be "accept" or "reject"' } };
    }

    const { data: project } = await projectsQuery.findProjectOwnerById(projectId);

    if (!project || project.owner_id !== userId) {
      return { status: 403, body: { error: 'Forbidden - not project owner' } };
    }

    const { data: request, error: requestError } = await projectsQuery.findProjectRequestByIdAndProject(requestId, projectId);

    if (requestError || !request) {
      return { status: 404, body: { error: 'Request not found' } };
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const { data: updatedRequest, error: updateError } = await projectsQuery.updateProjectRequestStatus(
      requestId,
      newStatus
    );

    if (updateError) {
      return { status: 500, body: { error: 'Error updating request' } };
    }

    if (action === 'accept') {
      const { data: projectSessions } = await projectsQuery.findSessionIdsByProjectId(projectId);

      if (projectSessions && projectSessions.length > 0) {
        const sessionParticipants = (projectSessions as DbSessionRef[]).map((session) => ({
          session_id: session.id,
          user_id: request.user_id,
        }));

        await projectsQuery.upsertSessionParticipants(sessionParticipants);
      }
    }

    return { status: 200, body: updatedRequest };
  },
};
