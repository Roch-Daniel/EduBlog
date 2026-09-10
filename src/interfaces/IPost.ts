import type { IDiscipline } from "./IDiscipline";

export interface IPostAuthor {
  _id: string;
  name: string;
  username: string;
  email: string;
}

export interface IPostStatus {
  _id: string;
  label: string;
  order: number;
}

export interface IPost {
  _id: string;
  title: string;
  content: string;
  summary: string;
  imageUrl: string;
  isFeatured?: boolean;
  series: string;
  semester: string;
  discipline: Pick<IDiscipline, "_id" | "label" | "order">;
  author: IPostAuthor;
  status: IPostStatus;
  createDate: string;
  updateDate: string;
}
