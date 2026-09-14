import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { AdminRole } from "@prisma/client";
import { ApiError } from "./http";

const JWT_SECRET = process.env.JWT_SECRET ?? "geezplay-dev-secret-change-me";
const TOKEN_TTL = "8h";

export interface AdminTokenPayload {
  sub: string;
  email: string;
  role: AdminRole;
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export interface AuthedRequest extends Request {
  admin?: AdminTokenPayload;
}

export function requireAdmin(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Token autentikasi tidak ditemukan."));
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
    req.admin = payload;
    return next();
  } catch {
    return next(new ApiError(401, "Token tidak valid atau kedaluwarsa."));
  }
}

export function requireRole(...roles: AdminRole[]) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    if (!req.admin) return next(new ApiError(401, "Belum terautentikasi."));
    if (!roles.includes(req.admin.role)) {
      return next(new ApiError(403, "Anda tidak memiliki akses untuk aksi ini."));
    }
    return next();
  };
}
