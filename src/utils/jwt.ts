import { jwtDecode } from "jwt-decode";

interface IJwtPayload {
  exp?: number;
}

export function isTokenExpired(token: string) {
  try {
    const { exp } = jwtDecode<IJwtPayload>(token);

    if (!exp) return false;

    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}
