import type { IPostStatus } from "./IPost";

export interface ITeacherPostValues {
  title: string;
  summary: string;
  content: string;
  disciplineId: string;
  statusId: string;
  semester: string;
  series: string;
  imageUrl: string;
  isFeatured: boolean;
}

export type ITeacherPostPayload = ITeacherPostValues;

export interface ITeacherPostStatus extends IPostStatus {
  isActive: boolean;
}
