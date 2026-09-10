import { isAxiosError } from "axios";
import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import type { IDiscipline } from "../interfaces/IDiscipline";
import type {
  ITeacherPostStatus,
  ITeacherPostValues,
} from "../interfaces/ITeacherPost";
import { getDisciplinesRequest } from "../services/catalogService";
import { getPostByIdRequest } from "../services/postService";
import {
  createTeacherPostRequest,
  getPostStatusesRequest,
  updateTeacherPostRequest,
} from "../services/teacherPostService";

type Field = keyof ITeacherPostValues;
type FieldErrors = Partial<Record<Field, string>>;

const emptyValues: ITeacherPostValues = {
  title: "",
  summary: "",
  content: "",
  disciplineId: "",
  statusId: "",
  semester: "",
  series: "",
  imageUrl: "",
  isFeatured: false,
};

// Mantém a contagem dos campos de texto compatível com a sanitização da API.
function plainText(value: string) {
  return value
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function requestError(error: unknown, fallback: string) {
  if (!isAxiosError(error)) return fallback;
  if (error.response?.status === 401)
    return "Sua sessão expirou. Entre novamente para continuar.";
  if (error.response?.status === 403)
    return "Você não tem permissão para realizar esta ação.";
  if (error.response?.status === 404)
    return "Post, disciplina ou status não encontrado. O cadastro pode ter sido removido.";
  if (
    error.response?.status === 400 &&
    typeof error.response.data?.message === "string"
  ) {
    return error.response.data.message;
  }
  return fallback;
}

export default function TeacherPostForm() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = Boolean(id);
  const savingRef = useRef(false);

  const [values, setValues] = useState<ITeacherPostValues>(emptyValues);
  const [disciplines, setDisciplines] = useState<IDiscipline[]>([]);
  const [statuses, setStatuses] = useState<ITeacherPostStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadForm() {
      setLoading(true);
      setLoadError("");
      setSaveError("");
      setErrors({});
      setNeedsLogin(false);

      try {
        const [availableDisciplines, availableStatuses, post] =
          await Promise.all([
            getDisciplinesRequest(),
            getPostStatusesRequest(),
            id ? getPostByIdRequest(id) : Promise.resolve(null),
          ]);
        if (ignore) return;

        if (post && post.author._id !== user?.id) {
          setLoadError("Você só pode editar os seus próprios posts.");
          return;
        }

        setDisciplines(availableDisciplines);
        setStatuses(availableStatuses);
        setValues(
          post
            ? {
                title: post.title,
                summary: post.summary,
                content: post.content,
                disciplineId: post.discipline._id,
                statusId: post.status._id,
                semester: post.semester ?? "",
                series: post.series ?? "",
                imageUrl: post.imageUrl ?? "",
                isFeatured: post.isFeatured ?? false,
              }
            : { ...emptyValues },
        );
      } catch (error) {
        if (ignore) return;
        setLoadError(
          requestError(
            error,
            "Não foi possível carregar o formulário. Tente abrir esta página novamente.",
          ),
        );
        setNeedsLogin(isAxiosError(error) && error.response?.status === 401);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void loadForm();
    return () => {
      ignore = true;
    };
  }, [id, user?.id]);

  function changeField<F extends Field>(
    field: F,
    value: ITeacherPostValues[F],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSaveError("");
  }

  function validate() {
    const nextErrors: FieldErrors = {};
    const titleLength = plainText(values.title).length;
    const summaryLength = plainText(values.summary).length;
    if (titleLength < 5 || titleLength > 100)
      nextErrors.title = "Informe um título com 5 a 100 caracteres.";
    if (summaryLength < 10 || summaryLength > 300)
      nextErrors.summary = "Informe um resumo com 10 a 300 caracteres.";
    if (plainText(values.content).length < 10)
      nextErrors.content = "Escreva um conteúdo com pelo menos 10 caracteres.";
    if (!values.semester.trim())
      nextErrors.semester = "Informe o semestre letivo.";
    if (
      !disciplines.some(
        (item) => item._id === values.disciplineId && item.isActive,
      )
    ) {
      nextErrors.disciplineId = "Selecione uma disciplina disponível.";
    }
    if (
      !statuses.some((item) => item._id === values.statusId && item.isActive)
    ) {
      nextErrors.statusId = "Selecione um status disponível.";
    }
    if (values.imageUrl.trim()) {
      try {
        const url = new URL(values.imageUrl.trim());
        if (!["http:", "https:"].includes(url.protocol))
          throw new Error("Protocolo inválido");
      } catch {
        nextErrors.imageUrl =
          "Informe uma URL de imagem válida, começando com http:// ou https://.";
      }
    }
    return nextErrors;
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingRef.current) return;

    const nextErrors = validate();
    setErrors(nextErrors);
    setSaveError("");
    const firstInvalidField = Object.keys(nextErrors)[0];
    if (firstInvalidField) {
      document.getElementById(`post-${firstInvalidField}`)?.focus();
      return;
    }

    savingRef.current = true;
    setIsSaving(true);
    const payload = {
      ...values,
      title: plainText(values.title),
      summary: plainText(values.summary),
      content: plainText(values.content),
      semester: values.semester.trim(),
      series: values.series.trim(),
      imageUrl: values.imageUrl.trim(),
    };

    try {
      if (id) await updateTeacherPostRequest(id, payload);
      else await createTeacherPostRequest(payload);
      showSuccess(
        id ? "Post atualizado com sucesso." : "Post criado com sucesso.",
      );
      navigate("/professor/posts");
    } catch (error) {
      setSaveError(
        requestError(
          error,
          "Não foi possível salvar o post. Seus dados continuam no formulário; tente novamente.",
        ),
      );
      setNeedsLogin(isAxiosError(error) && error.response?.status === 401);
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  const cardClass =
    "rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)]";
  const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";
  const inputClass =
    "w-full rounded-[10px] border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 aria-invalid:border-rose-500 disabled:bg-slate-50";
  const availableCatalogs =
    disciplines.some((item) => item.isActive) &&
    statuses.some((item) => item.isActive);

  function fieldProps(field: Exclude<Field, "isFeatured">) {
    return {
      id: `post-${field}`,
      name: field,
      value: values[field],
      "aria-invalid": Boolean(errors[field]),
      "aria-describedby": errors[field] ? `post-${field}-error` : undefined,
      className: inputClass,
      onChange: (event: { target: { value: string } }) =>
        changeField(field, event.target.value),
    };
  }

  function fieldError(field: Field) {
    return errors[field] ? (
      <p
        id={`post-${field}-error`}
        className="mt-1.5 text-sm text-rose-600"
        role="alert"
      >
        {errors[field]}
      </p>
    ) : null;
  }

  const loginLink = needsLogin && (
    <Link
      to="/login"
      state={{ from: location }}
      className="mt-3 inline-block font-semibold text-teal-700 underline"
    >
      Entrar novamente
    </Link>
  );

  if (loading) {
    return (
      <div className={cardClass} role="status">
        Carregando formulário...
      </div>
    );
  }

  if (loadError) {
    return (
      <section className={`${cardClass} max-w-5xl`}>
        <h1 className="text-2xl font-bold text-slate-900">
          Formulário indisponível
        </h1>
        <p className="mt-3 text-sm text-slate-600" role="alert">
          {loadError}
        </p>
        {loginLink}
        <Link
          to="/professor/posts"
          className="mt-4 block text-sm font-semibold text-teal-700"
        >
          Voltar para Meus Posts
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-5xl">
      <h1 className="text-3xl font-bold text-slate-900">
        {isEditing ? "Editar Post" : "Novo Post"}
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        {isEditing
          ? "Atualize o conteúdo e salve suas alterações."
          : "Compartilhe um novo conteúdo com seus alunos."}{" "}
        Campos com * são obrigatórios.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className={`${cardClass} mt-6`}
        aria-busy={isSaving}
      >
        {!availableCatalogs && (
          <p
            className="mb-5 rounded-[10px] bg-amber-50 p-4 text-sm text-amber-800"
            role="alert"
          >
            É necessário ter uma disciplina e um status ativos cadastrados para
            salvar posts.
          </p>
        )}
        <fieldset
          disabled={isSaving}
          className="min-w-0 space-y-5 disabled:opacity-70"
        >
          <legend className="sr-only">Dados do post</legend>
          <div>
            <label htmlFor="post-title" className={labelClass}>
              Título *
            </label>
            <input
              {...fieldProps("title")}
              type="text"
              required
              maxLength={100}
              placeholder="Título do conteúdo"
            />
            <p className="mt-1 text-xs text-slate-500">
              {values.title.length}/100 caracteres
            </p>
            {fieldError("title")}
          </div>

          <div>
            <label htmlFor="post-summary" className={labelClass}>
              Resumo *
            </label>
            <textarea
              {...fieldProps("summary")}
              required
              maxLength={300}
              rows={3}
              placeholder="Uma breve apresentação do post"
            />
            <p className="mt-1 text-xs text-slate-500">
              {values.summary.length}/300 caracteres
            </p>
            {fieldError("summary")}
          </div>

          <div>
            <label htmlFor="post-content" className={labelClass}>
              Conteúdo *
            </label>
            <textarea
              {...fieldProps("content")}
              required
              rows={10}
              placeholder="Escreva o conteúdo completo do post"
            />
            <p className="mt-1 text-xs text-slate-500">
              Use texto simples. Separe os parágrafos com uma linha em branco.
            </p>
            {fieldError("content")}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="post-disciplineId" className={labelClass}>
                Disciplina *
              </label>
              <select {...fieldProps("disciplineId")} required>
                <option value="">Selecione a disciplina</option>
                {disciplines
                  .filter(
                    (item) => item.isActive || item._id === values.disciplineId,
                  )
                  .map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                      disabled={!item.isActive}
                    >
                      {item.label}
                      {!item.isActive ? " (indisponível)" : ""}
                    </option>
                  ))}
              </select>
              {fieldError("disciplineId")}
            </div>
            <div>
              <label htmlFor="post-statusId" className={labelClass}>
                Status *
              </label>
              <select {...fieldProps("statusId")} required>
                <option value="">Selecione o status</option>
                {statuses
                  .filter(
                    (item) => item.isActive || item._id === values.statusId,
                  )
                  .map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                      disabled={!item.isActive}
                    >
                      {item.label}
                      {!item.isActive ? " (indisponível)" : ""}
                    </option>
                  ))}
              </select>
              {fieldError("statusId")}
            </div>
            <div>
              <label htmlFor="post-semester" className={labelClass}>
                Semestre *
              </label>
              <input
                {...fieldProps("semester")}
                type="text"
                required
                placeholder="Ex.: 1"
              />
              {fieldError("semester")}
            </div>
            <div>
              <label htmlFor="post-series" className={labelClass}>
                Série / Ano{" "}
                <span className="font-normal text-slate-500">(opcional)</span>
              </label>
              <input
                {...fieldProps("series")}
                type="text"
                placeholder="Ex.: 1º ano do Ensino Médio"
              />
            </div>
          </div>

          <div>
            <label htmlFor="post-imageUrl" className={labelClass}>
              URL da imagem de capa{" "}
              <span className="font-normal text-slate-500">(opcional)</span>
            </label>
            <input
              {...fieldProps("imageUrl")}
              type="url"
              placeholder="https://exemplo.com/imagem.jpg"
            />
            <p className="mt-1 text-xs text-slate-500">
              Deixe em branco para salvar sem imagem de capa.
            </p>
            {fieldError("imageUrl")}
          </div>

          <label
            htmlFor="post-isFeatured"
            className="flex items-center gap-3 text-sm font-semibold text-slate-700"
          >
            <input
              id="post-isFeatured"
              name="isFeatured"
              type="checkbox"
              checked={values.isFeatured}
              onChange={(event) =>
                changeField("isFeatured", event.target.checked)
              }
              className="h-4 w-4 rounded border-slate-300 accent-teal-700 focus:ring-2 focus:ring-teal-700/20 scheme-light"
            />
            Marcar post como destaque
          </label>

          {saveError && (
            <div
              className="rounded-[10px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
              role="alert"
            >
              {saveError}
              {loginLink}
            </div>
          )}
          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={() => navigate("/professor/posts")}
              className="rounded-[10px] border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!availableCatalogs || isSaving}
              className="rounded-[10px] bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? "Salvando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Criar post"}
            </button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
