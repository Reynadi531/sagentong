import { CreateBucketCommand, HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "@sagentong/env/server";

export const s3Client = new S3Client({
  endpoint: env.MINIO_ENDPOINT,
  region: "us-east-1",
  credentials: {
    accessKeyId: env.MINIO_ACCESS_KEY,
    secretAccessKey: env.MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});

export const BUCKET_NAME = env.MINIO_BUCKET;

/**
 * Ensures the default bucket exists, creating it if it doesn't.
 * Call this once during application startup.
 */
export async function ensureBucket(): Promise<void> {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
  } catch (_error) {
    await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
  }
}
