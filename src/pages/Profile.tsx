import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const roleLabel =
    user.role === "PROFESSOR"
      ? "Professor"
      : user.role === "ADM"
        ? "Administrador"
        : "Aluno";

  return (
    <div className="mx-auto w-[min(900px,92%)] py-8">
      <div className="rounded-[14px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-bold text-slate-900">Meu perfil</h1>
        </div>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
          <div
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-teal-100 text-3xl font-bold text-teal-700"
            aria-hidden="true"
          >
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>

            <p className="mt-1 text-sm text-slate-500">@{user.username}</p>

            <span className="mt-3 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
              {roleLabel}
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-[10px] border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Nome
            </p>

            <p className="mt-1 text-sm font-medium text-slate-800">
              {user.name}
            </p>
          </div>

          <div className="rounded-[10px] border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Username
            </p>

            <p className="mt-1 text-sm font-medium text-slate-800">
              {user.username}
            </p>
          </div>

          <div className="rounded-[10px] border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              E-mail
            </p>

            <p className="mt-1 wrap-break-word text-sm font-medium text-slate-800">
              {user.email}
            </p>
          </div>

          <div className="rounded-[10px] border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Tipo de usuário
            </p>

            <p className="mt-1 text-sm font-medium text-slate-800">
              {roleLabel}
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end border-t border-slate-200 pt-5">
          <Link
            to="/"
            className="rounded-[10px] border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Voltar para a Home
          </Link>
        </div>
      </div>
    </div>
  );
}
