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
}

export interface ITeacherPostPayload extends Omit<ITeacherPostValues, "imageUrl"> {
  imageUrl?: string;
}

export interface ITeacherPostStatus extends IPostStatus {
  isActive: boolean;
}
