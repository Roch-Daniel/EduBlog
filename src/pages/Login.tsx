import { useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate, useLocation, type Location } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { LoadingDots } from "../components/ui/LoadingDots";

export default function Login() {
  const { login } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: Location })?.from?.pathname || "/";

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      showSuccess("Login realizado com sucesso!");
      navigate(from, { replace: true });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 429) {
        showError("Muitas tentativas. Aguarde 15 minutos e tente novamente.");
      } else {
        showError("E-mail ou senha inválidos");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-teal-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        <h1 className="text-2xl font-bold text-center text-teal-700">
          EduBlog
        </h1>
        <p className="text-center font-bold text-sm text-slate-700 mt-1 mb-6">
          Faça seu login
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white text-slate-900
             focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white text-slate-900
             focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60
                       text-white rounded-lg py-2 text-sm font-medium transition"
          >
            {loading ? <LoadingDots /> : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
