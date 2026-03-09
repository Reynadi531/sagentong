import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { BUCKET_NAME, s3Client } from "./client";

export interface UploadOptions {
  /** The object key (path) in the bucket. If not provided, one is generated. */
  key?: string;
  /** Original filename, used for generating keys and setting metadata. */
  filename: string;
  /** MIME content type (e.g., "image/png"). */
  contentType: string;
  /** Optional folder prefix (e.g., "uploads", "evidence"). Defaults to "uploads". */
  folder?: string;
}

export interface UploadResult {
  /** The object key stored in MinIO. */
  key: string;
  /** The bucket the file was stored in. */
  bucket: string;
  /** The original filename. */
  filename: string;
  /** The content type. */
  contentType: string;
  /** The file size in bytes. */
  size: number;
}

/**
 * Generates a unique object key for a file.
 */
function generateKey(filename: string, folder: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${folder}/${timestamp}-${random}-${sanitized}`;
}

/**
 * Upload a file from a Buffer or Uint8Array.
 * For files under 5MB, uses a single PutObject call.
 * For larger files, uses multipart upload.
 */
export async function uploadFile(
  data: Buffer | Uint8Array,
  options: UploadOptions,
): Promise<UploadResult> {
  const folder = options.folder ?? "uploads";
  const key = options.key ?? generateKey(options.filename, folder);

  const MULTIPART_THRESHOLD = 5 * 1024 * 1024; // 5MB

  if (data.byteLength < MULTIPART_THRESHOLD) {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: data,
        ContentType: options.contentType,
        Metadata: {
          "original-filename": options.filename,
        },
      }),
    );
  } else {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: data,
        ContentType: options.contentType,
        Metadata: {
          "original-filename": options.filename,
        },
      },
      partSize: MULTIPART_THRESHOLD,
      leavePartsOnError: false,
    });

    await upload.done();
  }

  return {
    key,
    bucket: BUCKET_NAME,
    filename: options.filename,
    contentType: options.contentType,
    size: data.byteLength,
  };
}

/**
 * Upload a file directly from a Web API ReadableStream.
 * Uses multipart upload for streaming support.
 */
export async function uploadStream(
  stream: ReadableStream<Uint8Array>,
  options: UploadOptions & { size?: number },
): Promise<UploadResult> {
  const folder = options.folder ?? "uploads";
  const key = options.key ?? generateKey(options.filename, folder);

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: stream,
      ContentType: options.contentType,
      ContentLength: options.size,
      Metadata: {
        "original-filename": options.filename,
      },
    },
    partSize: 5 * 1024 * 1024,
    leavePartsOnError: false,
  });

  await upload.done();

  return {
    key,
    bucket: BUCKET_NAME,
    filename: options.filename,
    contentType: options.contentType,
    size: options.size ?? 0,
  };
}
