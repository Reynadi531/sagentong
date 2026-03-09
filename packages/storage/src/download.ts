import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { BUCKET_NAME, s3Client } from "./client";

export interface FileMetadata {
  /** The object key. */
  key: string;
  /** MIME content type. */
  contentType: string;
  /** File size in bytes. */
  size: number;
  /** Last modified date. */
  lastModified: Date | undefined;
  /** Original filename from metadata, if available. */
  originalFilename: string | undefined;
}

export interface DownloadResult {
  /** The file content as a readable stream. */
  stream: ReadableStream<Uint8Array>;
  /** MIME content type. */
  contentType: string;
  /** File size in bytes. */
  size: number;
  /** Original filename from metadata, if available. */
  originalFilename: string | undefined;
}

/**
 * Download a file from MinIO by its object key.
 * Returns a readable stream and metadata.
 */
export async function downloadFile(key: string): Promise<DownloadResult> {
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error(`File not found: ${key}`);
  }

  const webStream = response.Body.transformToWebStream();

  return {
    stream: webStream as ReadableStream<Uint8Array>,
    contentType: response.ContentType ?? "application/octet-stream",
    size: response.ContentLength ?? 0,
    originalFilename: response.Metadata?.["original-filename"],
  };
}

/**
 * Download a file as a Buffer.
 * Useful for small files or when you need the full content in memory.
 */
export async function downloadFileAsBuffer(key: string): Promise<{
  buffer: Buffer;
  contentType: string;
  originalFilename: string | undefined;
}> {
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error(`File not found: ${key}`);
  }

  const bytes = await response.Body.transformToByteArray();

  return {
    buffer: Buffer.from(bytes),
    contentType: response.ContentType ?? "application/octet-stream",
    originalFilename: response.Metadata?.["original-filename"],
  };
}

/**
 * Get file metadata without downloading the file content.
 */
export async function getFileMetadata(key: string): Promise<FileMetadata> {
  const response = await s3Client.send(
    new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }),
  );

  return {
    key,
    contentType: response.ContentType ?? "application/octet-stream",
    size: response.ContentLength ?? 0,
    lastModified: response.LastModified,
    originalFilename: response.Metadata?.["original-filename"],
  };
}

/**
 * Delete a file from MinIO by its object key.
 */
export async function deleteFile(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }),
  );
}

/**
 * Check if a file exists in MinIO.
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }),
    );
    return true;
  } catch {
    return false;
  }
}
