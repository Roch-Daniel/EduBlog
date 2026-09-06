import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { IPostFilters } from "../interfaces/IPostFilters";
import type { SortOrder } from "../types/sortOrder";
import type { ViewMode } from "../types/viewMode";

function parseList(value: string | null) {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function usePostFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<IPostFilters>(
    () => ({
      series: parseList(searchParams.get("serie")),
      semesters: parseList(searchParams.get("semestre")),
      professor: searchParams.get("author") ?? searchParams.get("prof") ?? "",
      search: searchParams.get("q") ?? "",
    }),
    [searchParams],
  );

  const sortParam = searchParams.get("ordem");
  const sortOrder: SortOrder =
    sortParam === "antigos" || sortParam === "titulo" ? sortParam : "recentes";

  const viewMode: ViewMode =
    searchParams.get("view") === "lista" ? "lista" : "grid";
  const page = Number(searchParams.get("page")) || 1;

  const activeFilterCount =
    filters.series.length +
    filters.semesters.length +
    (filters.professor.length > 0 ? 1 : 0);

  function updateParams(changes: Record<string, string>, resetPage = true) {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);

        Object.entries(changes).forEach(([key, value]) => {
          if (value.length === 0) {
            next.delete(key);
            return;
          }

          next.set(key, value);
        });

        if (resetPage) next.delete("page");

        return next;
      },
      { replace: true },
    );
  }

  function toggleValue(key: string, value: string) {
    const selected = parseList(searchParams.get(key));
    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];

    updateParams({ [key]: next.join(",") });
  }

  function toggleSeries(value: string) {
    toggleValue("serie", value);
  }

  function toggleSemester(value: string) {
    toggleValue("semestre", value);
  }

  function setProfessor(value: string) {
    updateParams({ author: value, prof: "" });
  }

  function setViewMode(value: ViewMode) {
    updateParams({ view: value === "grid" ? "" : value }, false);
  }

  function setPage(value: number) {
    updateParams({ page: value <= 1 ? "" : String(value) }, false);
  }

  function clearFilters() {
    updateParams({ serie: "", semestre: "", author: "", prof: "" });
  }

  return {
    filters,
    sortOrder,
    viewMode,
    page,
    activeFilterCount,
    toggleSeries,
    toggleSemester,
    setProfessor,
    setViewMode,
    setPage,
    clearFilters,
  };
}
