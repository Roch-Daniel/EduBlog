import { useState } from "react";
import type { ReactNode } from "react";
import type { IUser } from "../interfaces/IUser";
import { AuthContext } from "./AuthContextDefinition";
import { loginRequest } from "../services/authService";
import { isTokenExpired } from "../utils/jwt";

function readStoredUser(): IUser | null {
  const token = sessionStorage.getItem("token");
  const stored = sessionStorage.getItem("user");

  if (!token || !stored || isTokenExpired(token)) {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    return null;
  }

  return JSON.parse(stored);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(readStoredUser);

  async function login(email: string, password: string) {
    const { token, user } = await loginRequest(email, password);

    const loggedUser: IUser = { ...user };

    sessionStorage.setItem("user", JSON.stringify(loggedUser));
    sessionStorage.setItem("token", token);
    setUser(loggedUser);
  }

  function logout() {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
