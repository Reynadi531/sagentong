import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const isBuildTime = process.env.NODE_ENV === "production" && !process.env.DATABASE_URL;

export const env = createEnv({
  server: {
    DATABASE_URL: isBuildTime
      ? z.string().default("postgresql://placeholder:placeholder@localhost:5432/placeholder")
      : z.string().min(1),
    BETTER_AUTH_SECRET: isBuildTime
      ? z.string().default("placeholder-secret-at-least-32-chars-long!!")
      : z.string().min(32),
    BETTER_AUTH_URL: isBuildTime ? z.string().url().default("http://localhost:3000") : z.url(),
    CORS_ORIGIN: isBuildTime ? z.string().url().default("http://localhost:3000") : z.url(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    SUPERADMIN_EMAIL: z.email().optional(),
    SUPERADMIN_PASSWORD: z.string().min(8).optional(),
    SMTP_HOST: isBuildTime ? z.string().default("localhost") : z.string().min(1),
    SMTP_PORT: isBuildTime
      ? z.coerce.number().int().positive().default(587)
      : z.coerce.number().int().positive(),
    SMTP_USER: isBuildTime ? z.string().default("placeholder") : z.string().min(1),
    SMTP_PASS: isBuildTime ? z.string().default("placeholder") : z.string().min(1),
    SMTP_FROM: isBuildTime ? z.string().default("noreply@placeholder.com") : z.string().min(1),
    MINIO_ENDPOINT: z.string().url().default("http://localhost:9000"),
    MINIO_ACCESS_KEY: z.string().min(1).default("minioadmin"),
    MINIO_SECRET_KEY: z.string().min(1).default("minioadmin"),
    MINIO_BUCKET: z.string().min(1).default("sagentong"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
