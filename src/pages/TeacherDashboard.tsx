import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { IPost } from "../interfaces/IPost";
import { getTeacherPostsRequest } from "../services/teacherPostService";
import { formatDate } from "../utils/date";
import { isDraftPost, isPublishedPost } from "../utils/post";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadPosts() {
      try {
        setLoading(true);
        setLoadError("");
        const response = await getTeacherPostsRequest();

        if (ignore) return;

        const teacherPosts = response.filter(
          (post) => post.author._id === user?.id || post.author.email === user?.email,
        );

        setPosts(teacherPosts);
      } catch {
        if (ignore) return;
        setLoadError("Não foi possível carregar os dados do painel.");
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

  const publishedPostsCount = useMemo(
    () => posts.filter((post) => isPublishedPost(post)).length,
    [posts],
  );

  const draftPostsCount = useMemo(
    () => posts.filter((post) => isDraftPost(post)).length,
    [posts],
  );

  const latestPosts = useMemo(() => {
    return [...posts]
      .sort(
        (left, right) =>
          new Date(right.createDate).getTime() - new Date(left.createDate).getTime(),
      )
      .slice(0, 5);
  }, [posts]);

  if (loading) {
    return (
      <div className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-medium text-slate-500">Carregando painel do professor...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-[14px] border border-rose-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard indisponível</h1>
        <p className="mt-2 text-sm text-slate-600">{loadError}</p>
      </div>
    );
  }

  return (
    <section className="max-w-5xl">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <article className="rounded-[12px] border border-slate-200 bg-white p-4 text-center shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
          <p className="text-3xl font-bold text-teal-700">{publishedPostsCount}</p>
          <p className="mt-2 text-sm text-slate-500">Posts Publicados</p>
        </article>

        <article className="rounded-[12px] border border-slate-200 bg-white p-4 text-center shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
          <p className="text-3xl font-bold text-teal-700">{draftPostsCount}</p>
          <p className="mt-2 text-sm text-slate-500">Rascunhos</p>
        </article>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">Últimos Posts</h2>
        <Link
          to="/professor/posts"
          className="rounded-[10px] border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
        >
          Ir para Meus Posts
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {latestPosts.length > 0 ? (
          latestPosts.map((post) => (
            <article
              key={post._id}
              className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,0.07)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900">{post.title}</h3>
                <span
                  className={`rounded-md px-3 py-1 text-xs font-semibold ${
                    isPublishedPost(post)
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {post.status.label}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                {post.discipline.label} | Criado em {formatDate(post.createDate)}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link
                  to={`/posts/${post._id}`}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
                >
                  Visualizar
                </Link>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[12px] border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
            Nenhum post encontrado para este professor.
          </div>
        )}
      </div>
    </section>
  );
}
