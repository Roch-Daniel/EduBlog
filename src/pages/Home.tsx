import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { IDiscipline } from "../interfaces/IDiscipline";
import type { IPost } from "../interfaces/IPost";
import { getDisciplinesRequest } from "../services/catalogService";
import { getPostsRequest } from "../services/postService";
import { formatDate } from "../utils/date";
import { normalizeText, slugifyDisciplineLabel } from "../utils/discipline";
import { shuffle } from "../utils/shuffle";

export default function Home() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [disciplines, setDisciplines] = useState<IDiscipline[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadHomeData() {
      try {
        setLoading(true);
        setLoadError("");

        const [postsResponse, disciplinesResponse] = await Promise.all([
          getPostsRequest(),
          getDisciplinesRequest(),
        ]);

        if (ignore) return;

        const publishedPosts = postsResponse
          .filter(
            (post) =>
              normalizeText(post.status.label) === normalizeText("Publicado"),
          )
          .sort(
            (left, right) =>
              new Date(right.createDate).getTime() -
              new Date(left.createDate).getTime(),
          );

        const activeDisciplines = disciplinesResponse
          .filter((discipline) => discipline.isActive)
          .sort((left, right) => left.order - right.order);

        setPosts(publishedPosts);
        setDisciplines(activeDisciplines);
        setFeaturedPosts(
          shuffle(publishedPosts.filter((post) => post.isFeatured)).slice(0, 4),
        );
      } catch {
        if (ignore) return;
        setLoadError("Não foi possível carregar a Home neste momento.");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadHomeData();

    return () => {
      ignore = true;
    };
  }, []);

  const currentSlideIndex =
    featuredPosts.length === 0 ? 0 : activeSlide % featuredPosts.length;

  useEffect(() => {
    if (featuredPosts.length <= 1) return;

    const timerId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % featuredPosts.length);
    }, 8000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [featuredPosts]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-[min(1200px,92%)] items-center justify-center py-8">
        <div className="rounded-[14px] border border-slate-200 bg-white px-8 py-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          <p className="text-base font-medium text-slate-500">
            Carregando conteúdos da Home...
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-[min(1200px,92%)] items-center justify-center py-8">
        <div className="flex flex-col items-center gap-4 rounded-[14px] border border-rose-200 bg-white p-10 text-center shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          <h1 className="text-2xl font-bold text-slate-900">
            Home indisponível
          </h1>
          <p className="max-w-xl text-sm text-slate-600">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-[min(1200px,92%)] flex-col gap-9 py-6">
      <section className="home-section">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            Destaques da Semana
          </h2>
        </div>

        <div className="relative min-h-[320px] overflow-hidden rounded-[16px] shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          {featuredPosts.map((post, index) => (
            <article
              key={post._id}
              className={`absolute inset-0 grid h-full bg-white transition-opacity duration-500 md:grid-cols-[1.1fr_1fr] ${
                index === currentSlideIndex
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <img
                src={post.imageUrl}
                alt={post.title}
                className="h-full w-full object-cover"
              />
              <div className="flex flex-col justify-center gap-3 p-8">
                <h3 className="text-2xl font-bold text-slate-900">
                  {post.title}
                </h3>
                <p className="text-sm leading-6 text-slate-500">
                  {post.summary}
                </p>
                <p className="text-sm text-slate-500">
                  {post.author.name} | {formatDate(post.createDate)}
                </p>
                <Link
                  to={`/posts/${post._id}`}
                  className="w-fit rounded-[10px] bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Ler aula
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-3 flex justify-center gap-2">
          {featuredPosts.map((post, index) => (
            <button
              key={post._id}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={`Ir para destaque ${index + 1}`}
              className={`h-3 w-3 rounded-full border-2 transition ${
                index === currentSlideIndex
                  ? "border-teal-700 bg-teal-100"
                  : "border-dotted border-slate-400 bg-transparent"
              }`}
            />
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-900">Disciplinas</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {disciplines.map((discipline) => {
            const disciplinePosts = posts.filter(
              (post) => post.discipline._id === discipline._id,
            );
            const previewPost = disciplinePosts[0] ?? null;

            return (
              <Link
                key={discipline._id}
                to={`/conteudo/${slugifyDisciplineLabel(discipline.label)}`}
                className="group overflow-hidden rounded-[14px] bg-white text-left shadow-[0_4px_18px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
              >
                {previewPost ? (
                  <img
                    src={previewPost.imageUrl}
                    alt={discipline.label}
                    className="h-[200px] w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center bg-[linear-gradient(135deg,#ccfbf1,#99f6e4,#e2e8f0)] px-6">
                    <span className="text-center text-3xl font-bold tracking-[0.18em] text-slate-700">
                      {discipline.label.slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="p-4">
                  <h3 className="text-xl font-bold text-slate-900">
                    {discipline.label}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {disciplinePosts.length} posts
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
