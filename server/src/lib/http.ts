import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { MulterError } from "multer";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Endpoint tidak ditemukan: ${req.method} ${req.path}` });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ApiError) {
    return res
      .status(error.status)
      .json({ error: error.message, details: error.details });
  }

  if (error instanceof ZodError || (error as { name?: string })?.name === "ZodError") {
    const zodErr = error as ZodError;
    return res.status(400).json({
      error: "Data yang dikirim tidak valid.",
      details: typeof zodErr.flatten === "function" ? zodErr.flatten() : error,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ error: "Data tidak ditemukan atau sudah dihapus." });
    }
    if (error.code === "P2003") {
      return res.status(409).json({
        error:
          "Data tidak dapat dihapus karena masih terhubung dengan data lain (mis. order).",
      });
    }
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Data dengan kode unik tersebut sudah ada." });
    }
  }

  if (error instanceof MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Ukuran file terlalu besar (maksimal 3 MB)."
        : "Gagal mengunggah file.";
    return res.status(400).json({ error: message });
  }

  console.error(error);
  return res.status(500).json({ error: "Terjadi kesalahan pada server." });
}
