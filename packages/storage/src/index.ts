// Client & bucket management
export { s3Client, BUCKET_NAME, ensureBucket } from "./client";

// Upload
export { uploadFile, uploadStream } from "./upload";
export type { UploadOptions, UploadResult } from "./upload";

// Download & file operations
export {
  downloadFile,
  downloadFileAsBuffer,
  getFileMetadata,
  deleteFile,
  fileExists,
} from "./download";
export type { FileMetadata, DownloadResult } from "./download";

// Preview handler for Next.js API routes
export { createPreviewHandler } from "./preview";
export type { PreviewHandlerOptions } from "./preview";
