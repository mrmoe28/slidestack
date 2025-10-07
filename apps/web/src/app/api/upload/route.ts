import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, mediaFiles } from '@slideshow/db'

export const dynamic = 'force-dynamic'

// Next.js API route config - increase body size limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
  },
}

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
]

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo'
]

const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/webm'
]

const ALL_ALLOWED_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_AUDIO_TYPES
]

function getMediaType(mimeType: string): 'image' | 'video' | 'audio' {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'image'
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'video'
  if (ALLOWED_AUDIO_TYPES.includes(mimeType)) return 'audio'
  throw new Error('Unsupported file type')
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Upload] Starting file upload...')

    const session = await auth()

    if (!session?.user?.id) {
      console.log('[Upload] Unauthorized - no session')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[Upload] Parsing form data...')
    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const order = parseInt(formData.get('order') as string || '0')

    if (!file) {
      console.log('[Upload] No file provided')
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('[Upload] File received:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
    })

    if (!projectId) {
      console.log('[Upload] No project ID provided')
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALL_ALLOWED_TYPES.includes(file.type)) {
      console.log('[Upload] Invalid file type:', file.type)
      return NextResponse.json(
        { error: `File type ${file.type} is not supported. Allowed types: images (jpg, png, gif, webp, svg), videos (mp4, webm, mov, avi), audio (mp3, wav, ogg)` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.log('[Upload] File too large:', file.size)
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      )
    }

    console.log('[Upload] Converting to base64...')
    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')

    console.log('[Upload] Base64 conversion complete, size:', `${(base64Data.length / 1024 / 1024).toFixed(2)}MB`)

    // Create data URL for immediate use
    const dataUrl = `data:${file.type};base64,${base64Data}`

    console.log('[Upload] Saving to database...')
    // Save to database
    const [mediaFile] = await db
      .insert(mediaFiles)
      .values({
        projectId,
        type: getMediaType(file.type),
        url: dataUrl, // Store data URL for easy retrieval
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        data: base64Data,
        order,
      })
      .returning()

    console.log('[Upload] Upload complete:', mediaFile.id)

    return NextResponse.json({
      success: true,
      file: {
        id: mediaFile.id,
        url: mediaFile.url, // Return data URL
        filename: mediaFile.filename,
        size: mediaFile.size,
        type: mediaFile.type,
      },
    })
  } catch (error) {
    console.error('[Upload] Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    )
  }
}
