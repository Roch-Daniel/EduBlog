import api from "./api";
import type { IPost } from "../interfaces/IPost";
import type { ITeacherPostPayload, ITeacherPostStatus } from "../interfaces/ITeacherPost";

export async function getTeacherPostsRequest() {
  const response = await api.get<{ data: IPost[] }>("/posts/all");
  return response.data.data;
}

export async function getPostStatusesRequest() {
  const response = await api.get<{ data: ITeacherPostStatus[] }>("/catalog/status");
  return response.data.data;
}

export async function createTeacherPostRequest(payload: ITeacherPostPayload) {
  const response = await api.post<{ data: IPost }>("/posts", payload);
  return response.data.data;
}

export async function updateTeacherPostRequest(id: string, payload: ITeacherPostPayload) {
  const response = await api.put<{ data: IPost }>(`/posts/${id}`, payload);
  return response.data.data;
}
