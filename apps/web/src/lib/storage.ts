/**
 * Cloudflare R2 Storage Client
 * S3-compatible storage for rendered videos and media files
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

if (!process.env.R2_ACCOUNT_ID) {
  throw new Error('R2_ACCOUNT_ID environment variable is not set')
}

if (!process.env.R2_ACCESS_KEY_ID) {
  throw new Error('R2_ACCESS_KEY_ID environment variable is not set')
}

if (!process.env.R2_SECRET_ACCESS_KEY) {
  throw new Error('R2_SECRET_ACCESS_KEY environment variable is not set')
}

if (!process.env.R2_BUCKET_NAME) {
  throw new Error('R2_BUCKET_NAME environment variable is not set')
}

// R2-specific endpoint format
const R2_ENDPOINT = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

// Initialize S3 client for R2
const r2Client = new S3Client({
  region: 'auto', // R2 uses 'auto' as region
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

export interface UploadOptions {
  userId: string
  projectId: string
  jobId: string
  fileName: string
  contentType: string
  body: Buffer | Uint8Array | string
}

export interface DownloadOptions {
  userId: string
  projectId: string
  jobId: string
  fileName: string
}

/**
 * Upload a file to R2 storage
 * Path format: /rendered-videos/{userId}/{projectId}/{jobId}/{fileName}
 */
export async function uploadToR2(options: UploadOptions): Promise<string> {
  const { userId, projectId, jobId, fileName, contentType, body } = options

  const key = `rendered-videos/${userId}/${projectId}/${jobId}/${fileName}`

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    Metadata: {
      userId,
      projectId,
      jobId,
    },
  })

  await r2Client.send(command)

  // Return the full path
  return key
}

/**
 * Generate a signed download URL (expires in 1 hour)
 */
export async function getDownloadUrl(options: DownloadOptions, expiresIn: number = 3600): Promise<string> {
  const { userId, projectId, jobId, fileName } = options

  const key = `rendered-videos/${userId}/${projectId}/${jobId}/${fileName}`

  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  })

  // Generate signed URL that expires in 1 hour (default)
  const signedUrl = await getSignedUrl(r2Client, command, { expiresIn })

  return signedUrl
}

/**
 * Delete a file from R2 storage
 */
export async function deleteFromR2(options: DownloadOptions): Promise<void> {
  const { userId, projectId, jobId, fileName } = options

  const key = `rendered-videos/${userId}/${projectId}/${jobId}/${fileName}`

  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  })

  await r2Client.send(command)
}

/**
 * Check if a file exists in R2 storage
 */
export async function fileExistsInR2(options: DownloadOptions): Promise<boolean> {
  const { userId, projectId, jobId, fileName } = options

  const key = `rendered-videos/${userId}/${projectId}/${jobId}/${fileName}`

  try {
    const command = new HeadObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    })

    await r2Client.send(command)
    return true
  } catch (error) {
    if ((error as { name?: string }).name === 'NotFound') {
      return false
    }
    throw error
  }
}

/**
 * Upload media file (images, videos, audio)
 * Path format: /media/{userId}/{projectId}/{fileName}
 */
export async function uploadMediaToR2(
  userId: string,
  projectId: string,
  fileName: string,
  contentType: string,
  body: Buffer | Uint8Array | string
): Promise<string> {
  const key = `media/${userId}/${projectId}/${fileName}`

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    Metadata: {
      userId,
      projectId,
    },
  })

  await r2Client.send(command)

  return key
}

/**
 * Get public URL for R2 file (if bucket has public access configured)
 */
export function getPublicUrl(key: string): string {
  if (!process.env.R2_PUBLIC_URL) {
    throw new Error('R2_PUBLIC_URL environment variable is not set')
  }

  return `${process.env.R2_PUBLIC_URL}/${key}`
}

export { r2Client }
