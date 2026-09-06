import type { IPost } from "../interfaces/IPost";
import type { IFilterOption, IPostFilters } from "../interfaces/IPostFilters";
import type { SortOrder } from "../types/sortOrder";
import { normalizeText } from "./discipline";

function buildOptions(
  values: string[],
  formatLabel: (value: string) => string = (value) => value,
): IFilterOption[] {
  const uniqueValues = Array.from(
    new Set(
      values.map((value) => value.trim()).filter((value) => value.length > 0),
    ),
  );

  return uniqueValues
    .map((value) => ({ value, label: formatLabel(value) }))
    .sort((left, right) =>
      left.label.localeCompare(right.label, "pt-BR", { numeric: true }),
    );
}

function formatSemesterLabel(value: string) {
  return /^\d+$/.test(value) ? `${value} semestre` : value;
}

export function isPublished(post: IPost) {
  return normalizeText(post.status.label) === normalizeText("Publicado");
}

export function buildSeriesOptions(posts: IPost[]) {
  return buildOptions(posts.map((post) => post.series));
}

export function buildSemesterOptions(posts: IPost[]) {
  return buildOptions(
    posts.map((post) => post.semester),
    formatSemesterLabel,
  );
}

export function buildProfessorOptions(posts: IPost[]) {
  return buildOptions(posts.map((post) => post.author.name));
}

export function applyPostFilters(posts: IPost[], filters: IPostFilters) {
  return posts.filter((post) => {
    const matchesSeries =
      filters.series.length === 0 ||
      filters.series.some(
        (value) => normalizeText(value) === normalizeText(post.series),
      );

    const matchesSemester =
      filters.semesters.length === 0 ||
      filters.semesters.some(
        (value) => normalizeText(value) === normalizeText(post.semester),
      );

    const matchesProfessor =
      !filters.professor ||
      normalizeText(post.author.name) === normalizeText(filters.professor);

    return matchesSeries && matchesSemester && matchesProfessor;
  });
}

export function buildSearchParams(
  filters: IPostFilters,
  disciplineLabel?: string,
) {
  const params = new URLSearchParams();

  if (disciplineLabel) params.set("discipline", disciplineLabel);
  if (filters.professor) params.set("author", filters.professor);
  if (filters.search) params.set("q", filters.search);

  return params;
}

export function sortPosts(posts: IPost[], order: SortOrder) {
  const sorted = [...posts];

  if (order === "titulo") {
    return sorted.sort((left, right) =>
      left.title.localeCompare(right.title, "pt-BR"),
    );
  }

  return sorted.sort((left, right) => {
    const leftDate = new Date(left.createDate).getTime();
    const rightDate = new Date(right.createDate).getTime();

    return order === "antigos" ? leftDate - rightDate : rightDate - leftDate;
  });
}
