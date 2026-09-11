import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/date";
import type { IFeaturedCarouselProps } from "../../interfaces/IFeaturedCarousel";

export default function FeaturedCarousel({ posts }: IFeaturedCarouselProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  const currentSlideIndex = posts.length === 0 ? 0 : activeSlide % posts.length;

  useEffect(() => {
    if (posts.length <= 1) return;

    const timerId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % posts.length);
    }, 8000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [posts.length]);

  if (posts.length === 0) {
    return (
      <div className="mt-3 flex min-h-80 flex-col items-center justify-center rounded-2xl bg-white px-6 py-10 text-center shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
        <div
          className="mb-5 text-6xl"
          role="img"
          aria-label="Destaques tiraram uma folga"
        >
          💤
        </div>

        <h3 className="text-xl font-bold text-slate-900">
          Os destaques tiraram folga hoje 💤
        </h3>

        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          Ainda não há conteúdos selecionados para aparecer aqui.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="relative mt-3 min-h-150 overflow-hidden rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:min-h-140 md:min-h-80">
        {posts.map((post, index) => (
          <article
            key={post._id}
            aria-hidden={index !== currentSlideIndex}
            className={`absolute inset-0 grid h-full grid-rows-[220px_1fr] bg-white transition-opacity duration-500 md:grid-cols-[1.1fr_1fr] md:grid-rows-none ${
              index === currentSlideIndex
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }`}
          >
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#ccfbf1,#99f6e4,#e2e8f0)] px-6">
                <span className="text-3xl font-bold tracking-[0.18em] text-slate-700">
                  {post.discipline.label.slice(0, 3).toUpperCase()}
                </span>
              </div>
            )}

            <div className="flex min-h-0 flex-col justify-center gap-3 overflow-y-auto p-5 sm:p-8">
              <h3 className="text-2xl font-bold leading-tight text-slate-900">
                {post.title}
              </h3>

              <p className="text-sm leading-6 text-slate-500">{post.summary}</p>

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

      {posts.length > 1 && (
        <div
          className="mt-3 flex justify-center gap-2"
          aria-label="Controles do carrossel"
        >
          {posts.map((post, index) => (
            <button
              key={post._id}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={`Ir para destaque ${index + 1}`}
              aria-current={index === currentSlideIndex ? "true" : undefined}
              className={`h-3 w-3 rounded-full border-2 transition ${
                index === currentSlideIndex
                  ? "border-teal-700 bg-teal-100"
                  : "border-dotted border-slate-400 bg-transparent"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
