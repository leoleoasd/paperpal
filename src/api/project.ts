import api from './api';
import type { CreateProjectRequest, CreateProjectResponse, GetProjectsResponse, UploadFileResponse, GetProjectResponse, GetProjectDataResponse, UpdateDataResponse, UpdateDataRequest, UpdateProjectRequest} from './types';

export async function getProjects(): Promise<GetProjectsResponse>{
  const projects = await api({
    url: '/api/projects',
    method: 'get',
  }) as GetProjectsResponse;
  return projects;
}

export async function uploadFile(file: File): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return await api({
    url: '/api/project/file ',
    method: 'post',
    data: formData,
  }) as UploadFileResponse;
}

export async function createProject(form: CreateProjectRequest): Promise<CreateProjectResponse> {
  return await api({
    url: '/api/project',
    method: 'post',
    data: form,
  }) as CreateProjectResponse;
}

export async function getProject(projectId: number): Promise<GetProjectResponse> {
  return await api({
    url: `/api/project/${projectId}`,
    method: 'get',
  }) as GetProjectResponse;
}

export async function updateProject(projectId: number, form: UpdateProjectRequest): Promise<CreateProjectResponse> {
  return await api({
    url: `/api/project/${projectId}`,
    method: 'patch',
    data: form,
  }) as CreateProjectResponse;
}

export async function getData(projectId: number, labelId: number): Promise<GetProjectDataResponse> {
  return await api({
    url: `/api/project/${projectId}/data/${labelId}`,
    method: 'get',
  }) as GetProjectDataResponse;
}

export async function updateData(data: UpdateDataRequest): Promise<UpdateDataResponse> {
  const d = data.data;
  for (const key in d) {
    if (d[key] === null) {
      delete d[key];
    }
  }
  return await api({
    url: `/api/project/${data.project_id}/data/${data.label_id}`,
    method: 'patch',
    data: d,
  }) as UpdateDataResponse;
}


// export function createProject(form: {
//   name: string,
//   config_name?: string,
//   config?: string,
// }, file: File): Promise<CreateProjectResp>{
//   const auth = useAuthStore();
//   const formData = new FormData();
//   formData.append('files', file);
//   if(form.config)
//     formData.append('config', form.config);
//   return api({
//     url: '/projects',
//     method: 'post',
//     params: {
//       ...form,
//       token: auth.token
//     },
//     data: formData
//   }) as Promise<CreateProjectResp>;
// }

// export async function getProjectDetail(form: {
//   project_id: number,
//   label_id: number,
// }): Promise<ProjectDetail>{
//   const {project_id: _, ...params} = form;
//   const project = await api({
//     url: `/projects/${form.project_id}`,
//     params,
//     method: 'get',
//   }) as ProjectDetail<string>;
//   return {
//     ...project,
//     project_meta: {
//       ...project.project_meta,
//       create_time: new Date(project.project_meta.create_time + 'Z'),
//       update_time: new Date(project.project_meta.update_time + 'Z'),
//     },
//   } as ProjectDetail;
// }

// export function getProjectData(form: {
//   project_id: number,
//   label_id: number,
//   // {{baseUrl}}/projects/:project_id?label_id=1&size=10&num=0
//   size: number,
//   num: number,
//   semantic_key_word?: string,
//   semantic_column?: string,
//   filter_column?: string,
//   filters?: string[],
// }): Promise<ProjectDataResp>{
//   const {project_id: _, ...params} = form;
//   return api({
//     url: `/projects/${form.project_id}/data`,
//     params,
//     method: 'post',
//   }) as Promise<ProjectDataResp>;
// }

// export function getProjectUnlabeledData(form: {
//   label_id: number,
// }): Promise<ProjectDataResp>{
//   const {label_id: _, ...params} = form;
//   return api({
//     url: `/labels/${form.label_id}/unlabeled`,
//     params,
//     method: 'get',
//   }) as Promise<ProjectDataResp>;
// }


// export function updateLabel(
//   label_id: number,
//   data: {
//     label_data: any
//   }
// ): Promise<UpdateLabelResp>{
//   return api({
//     url: `/labels/${label_id}/data`,
//     method: 'patch',
//     data,
//   }) as Promise<UpdateLabelResp>;
// }
