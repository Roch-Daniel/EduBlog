import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type SyntheticEvent,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useClickOutside } from "../../../hooks/useClickOutside";
import { useDebounce } from "../../../hooks/useDebounce";
import type { SearchSuggestion } from "../../../types/searchSuggestion";
import {
  normalizeText,
  slugifyDisciplineLabel,
} from "../../../utils/discipline";

import SearchSuggestions from "./SearchSuggestions";
import type { ISearchBarProps } from "../../../interfaces/ISearchs";

export default function SearchBar({ disciplines, posts }: ISearchBarProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    () => searchParams.get("q") ?? "",
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const searchRef = useRef<HTMLFormElement>(null);

  useClickOutside(searchRef, () => setIsSearchOpen(false));

  const debouncedSearch = useDebounce(searchValue);
  const normalizedQuery = normalizeText(debouncedSearch.trim());

  const searchSuggestions = useMemo<SearchSuggestion[]>(() => {
    if (!normalizedQuery) return [];

    const postSuggestions = posts
      .filter(
        (post) =>
          normalizeText(post.title).includes(normalizedQuery) ||
          normalizeText(post.summary).includes(normalizedQuery),
      )
      .slice(0, 4)
      .map((post) => ({
        id: `post-${post._id}`,
        label: post.title,
        description: `${post.discipline.label} · ${post.author.name}`,
        to: `/posts/${post._id}`,
        kind: "post" as const,
      }));

    const disciplineSuggestions = disciplines
      .filter((discipline) =>
        normalizeText(discipline.label).includes(normalizedQuery),
      )
      .slice(0, 3)
      .map((discipline) => ({
        id: `discipline-${discipline._id}`,
        label: discipline.label,
        description: "Disciplina",
        to: `/conteudo/${slugifyDisciplineLabel(discipline.label)}`,
        kind: "disciplina" as const,
      }));

    const professorSuggestions = Array.from(
      new Map(
        posts
          .filter((post) =>
            normalizeText(post.author.name).includes(normalizedQuery),
          )
          .map((post) => [post.author.name, post]),
      ).values(),
    )
      .slice(0, 2)
      .map((post) => ({
        id: `professor-${post.author.name}`,
        label: post.author.name,
        description: `Professor · ${post.discipline.label}`,
        to: `/busca?author=${encodeURIComponent(post.author.name)}`,
        kind: "professor" as const,
      }));

    return [
      ...postSuggestions,
      ...disciplineSuggestions,
      ...professorSuggestions,
    ].slice(0, 7);
  }, [disciplines, normalizedQuery, posts]);

  useEffect(() => {
    if (activeIndex < 0) return;

    const activeSuggestion = searchSuggestions[activeIndex];

    if (!activeSuggestion) return;

    document.getElementById(activeSuggestion.id)?.scrollIntoView({
      block: "nearest",
    });
  }, [activeIndex, searchSuggestions]);

  function handleSuggestionSelect(to: string) {
    navigate(to);
    setIsSearchOpen(false);
    setActiveIndex(-1);
  }

  function handleSearch(formEvent: SyntheticEvent<HTMLFormElement>) {
    formEvent.preventDefault();

    const term = searchValue.trim();

    if (!term) return;

    const activeSuggestion = searchSuggestions[activeIndex];

    if (activeSuggestion) {
      handleSuggestionSelect(activeSuggestion.to);
      return;
    }

    navigate(`/busca?q=${encodeURIComponent(term)}`);

    setIsSearchOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(keyEvent: KeyboardEvent<HTMLInputElement>) {
    if (keyEvent.key === "Escape") {
      keyEvent.preventDefault();
      setIsSearchOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (searchSuggestions.length === 0) return;

    if (keyEvent.key === "ArrowDown") {
      keyEvent.preventDefault();
      setIsSearchOpen(true);

      setActiveIndex((current) => (current + 1) % searchSuggestions.length);

      return;
    }

    if (keyEvent.key === "ArrowUp") {
      keyEvent.preventDefault();
      setIsSearchOpen(true);

      setActiveIndex(
        (current) =>
          (current - 1 + searchSuggestions.length) % searchSuggestions.length,
      );
    }
  }

  const isListboxOpen = isSearchOpen && normalizedQuery.length > 0;

  return (
    <form onSubmit={handleSearch} ref={searchRef} className="relative flex">
      <input
        type="search"
        value={searchValue}
        role="combobox"
        aria-expanded={isListboxOpen}
        aria-controls="search-suggestions"
        aria-activedescendant={
          activeIndex >= 0 ? searchSuggestions[activeIndex]?.id : undefined
        }
        onFocus={() => setIsSearchOpen(true)}
        onKeyDown={handleKeyDown}
        onChange={(event) => {
          setSearchValue(event.target.value);
          setIsSearchOpen(true);
          setActiveIndex(-1);
        }}
        placeholder="Buscar posts, professores ou disciplinas"
        className="w-full rounded-[10px] border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-700"
      />
      <button
        type="submit"
        aria-label="Pesquisar"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md cursor-pointer p-2 text-slate-500 transition hover:bg-slate-100 hover:text-teal-700"
      >
        🔍
      </button>

      <SearchSuggestions
        suggestions={searchSuggestions}
        activeIndex={activeIndex}
        isOpen={isListboxOpen}
        searchValue={searchValue}
        onSelect={handleSuggestionSelect}
        onActiveIndexChange={setActiveIndex}
      />
    </form>
  );
}
