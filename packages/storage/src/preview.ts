import { downloadFile } from "./download";

/** Image MIME types that should be served inline for preview. */
const INLINE_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/avif",
  "application/pdf",
]);

export interface PreviewHandlerOptions {
  /** Maximum cache age in seconds. Defaults to 3600 (1 hour). */
  maxAge?: number;
  /** Maximum allowed file size for preview in bytes. Defaults to 50MB. */
  maxFileSize?: number;
  /** Allowed content types for preview. Defaults to common image types + PDF. */
  allowedTypes?: Set<string>;
}

/**
 * Creates a Next.js App Router compatible handler that proxies files from MinIO.
 *
 * Usage in your Next.js app:
 * ```ts
 * // app/api/storage/[...key]/route.ts
 * import { createPreviewHandler } from "@sagentong/storage";
 * export const GET = createPreviewHandler();
 * ```
 *
 * Files are then accessible at: /api/storage/uploads/1234-abcd-photo.jpg
 */
export function createPreviewHandler(options?: PreviewHandlerOptions) {
  const maxAge = options?.maxAge ?? 3600;
  const maxFileSize = options?.maxFileSize ?? 50 * 1024 * 1024;
  const allowedTypes = options?.allowedTypes ?? INLINE_CONTENT_TYPES;

  return async (
    _request: Request,
    context: { params: Promise<{ key: string[] }> },
  ): Promise<Response> => {
    try {
      const { key: keySegments } = await context.params;

      if (!keySegments || keySegments.length === 0) {
        return new Response(JSON.stringify({ error: "Missing file key" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const key = keySegments.join("/");

      const result = await downloadFile(key);

      if (maxFileSize > 0 && result.size > maxFileSize) {
        return new Response(JSON.stringify({ error: "File too large for preview" }), {
          status: 413,
          headers: { "Content-Type": "application/json" },
        });
      }

      const isInline = allowedTypes.has(result.contentType);
      const disposition = isInline
        ? "inline"
        : `attachment; filename="${result.originalFilename ?? "download"}"`;

      return new Response(result.stream, {
        status: 200,
        headers: {
          "Content-Type": result.contentType,
          "Content-Length": String(result.size),
          "Content-Disposition": disposition,
          "Cache-Control": `public, max-age=${maxAge}, immutable`,
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const isNotFound =
        message.includes("NoSuchKey") ||
        message.includes("not found") ||
        message.includes("NotFound");

      if (isNotFound) {
        return new Response(JSON.stringify({ error: "File not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.error("[storage] Preview error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}
