import { jwtDecode } from "jwt-decode";
import type { IJwtPayload } from "../interfaces/IJwtPayload";

export function isTokenExpired(token: string) {
  try {
    const { exp } = jwtDecode<IJwtPayload>(token);

    if (!exp) return false;

    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}
