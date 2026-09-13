import { isAxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ConfirmModal from "../components/ui/ConfirmModal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import type { IPost } from "../interfaces/IPost";
import { deletePostRequest } from "../services/postService";
import { getTeacherPostsRequest } from "../services/teacherPostService";
import { formatDate } from "../utils/date";
import { isPublishedPost } from "../utils/post";

type PostFilter = "todos" | "publicado" | "rascunho";

export default function TeacherPosts() {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();

  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeFilter, setActiveFilter] = useState<PostFilter>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState("");
  const [postToDelete, setPostToDelete] = useState<IPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadPosts() {
      try {
        setLoading(true);
        setLoadError("");
        const response = await getTeacherPostsRequest();

        if (ignore) return;

        const teacherPosts = response.filter(
          (post) =>
            post.author._id === user?.id || post.author.email === user?.email,
        );

        setPosts(teacherPosts);
      } catch {
        if (ignore) return;
        setLoadError("Não foi possível carregar os seus posts.");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadPosts();

    return () => {
      ignore = true;
    };
  }, [user?.email, user?.id]);

  const disciplines = useMemo(() => {
    return Array.from(new Set(posts.map((post) => post.discipline.label))).sort(
      (left, right) => left.localeCompare(right, "pt-BR"),
    );
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const sortedPosts = [...posts].sort(
      (left, right) =>
        new Date(right.createDate).getTime() -
        new Date(left.createDate).getTime(),
    );

    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return sortedPosts.filter((post) => {
      const matchesStatus =
        activeFilter === "todos"
          ? true
          : activeFilter === "publicado"
            ? isPublishedPost(post)
            : !isPublishedPost(post);

      const matchesDiscipline = selectedDiscipline
        ? post.discipline.label === selectedDiscipline
        : true;

      const matchesSearch = normalizedSearchTerm
        ? post.title.toLowerCase().includes(normalizedSearchTerm)
        : true;

      return matchesStatus && matchesDiscipline && matchesSearch;
    });
  }, [activeFilter, posts, searchTerm, selectedDiscipline]);

  async function handleDeletePost() {
    if (!postToDelete || isDeleting) return;

    try {
      setIsDeleting(true);
      await deletePostRequest(postToDelete._id);

      setPosts((currentPosts) =>
        currentPosts.filter((post) => post._id !== postToDelete._id),
      );
      setPostToDelete(null);
      showSuccess("Post excluído com sucesso.");
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 403) {
        showError("Você não tem permissão para excluir este post.");
      } else if (isAxiosError(error) && error.response?.status === 404) {
        showError("Post não encontrado para exclusão.");
      } else {
        showError("Não foi possível excluir o post. Tente novamente.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  const filterButtonClass =
    "rounded-full border px-4 py-2 text-sm font-semibold transition";

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl">
        <div className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-medium text-slate-500">
            Carregando seus posts...
          </p>
        </div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="mx-auto max-w-5xl">
        <div className="rounded-[14px] border border-rose-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          <h1 className="text-2xl font-bold text-slate-900">
            Meus Posts indisponível
          </h1>
          <p className="mt-2 text-sm text-slate-600">{loadError}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold text-slate-900">Meus Posts</h1>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveFilter("todos")}
          className={`${filterButtonClass} ${
            activeFilter === "todos"
              ? "border-teal-700 bg-teal-50 text-teal-700"
              : "border-slate-300 bg-white text-slate-700 hover:border-teal-700 hover:text-teal-700"
          }`}
        >
          Todos
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("publicado")}
          className={`${filterButtonClass} ${
            activeFilter === "publicado"
              ? "border-teal-700 bg-teal-50 text-teal-700"
              : "border-slate-300 bg-white text-slate-700 hover:border-teal-700 hover:text-teal-700"
          }`}
        >
          Publicados
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("rascunho")}
          className={`${filterButtonClass} ${
            activeFilter === "rascunho"
              ? "border-teal-700 bg-teal-50 text-teal-700"
              : "border-slate-300 bg-white text-slate-700 hover:border-teal-700 hover:text-teal-700"
          }`}
        >
          Rascunhos
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar post por título..."
          className="w-full rounded-[10px] border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-teal-700 sm:flex-1"
        />

        <select
          value={selectedDiscipline}
          onChange={(event) => setSelectedDiscipline(event.target.value)}
          className="rounded-[10px] border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-teal-700 sm:min-w-[260px]"
        >
          <option value="">Todas as disciplinas</option>
          {disciplines.map((discipline) => (
            <option key={discipline} value={discipline}>
              {discipline}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Título
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Disciplina
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Criado em
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => {
                const published = isPublishedPost(post);

                return (
                  <tr
                    key={post._id}
                    className="border-t border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {post.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {post.discipline.label}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-md px-3 py-1 text-xs font-semibold ${
                          published
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {published ? "Publicado" : "Rascunho"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {formatDate(post.createDate)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Link
                          to={`/posts/${post._id}`}
                          className="font-semibold text-teal-700 transition hover:opacity-75"
                        >
                          Ver
                        </Link>
                        <Link
                          to={`/professor/posts/${post._id}/edit`}
                          className="font-semibold text-teal-700 transition hover:opacity-75"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPostToDelete(post)}
                          className="cursor-pointer font-semibold text-rose-600 transition hover:opacity-75"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPosts.length === 0 && (
          <p className="border-t border-slate-200 px-4 py-4 text-sm text-slate-500">
            Nenhum post encontrado para os filtros aplicados.
          </p>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(postToDelete)}
        title="Excluir post"
        description={`Tem certeza que deseja excluir "${postToDelete?.title ?? ""}"?`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
        onCancel={() => setPostToDelete(null)}
        onConfirm={() => {
          void handleDeletePost();
        }}
      />
    </section>
  );
}
