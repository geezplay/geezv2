import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { publicRouter } from "./routes/public";
import { adminRouter } from "./routes/admin";
import { errorHandler, notFoundHandler } from "./lib/http";
import { previewsDir, sheetsDir, uploadsDir } from "./lib/uploads";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(uploadsDir, { maxAge: "7d" }));
app.use("/previews", express.static(previewsDir, { maxAge: "7d" }));
app.use("/sheets", express.static(sheetsDir, { maxAge: "7d" }));

app.use("/api", publicRouter);
app.use("/api/admin", adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`GeezPlay API berjalan di http://localhost:${port}`);
});
