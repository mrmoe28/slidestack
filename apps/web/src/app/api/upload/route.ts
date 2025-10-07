import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, mediaFiles } from '@slideshow/db'

export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

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
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const order = parseInt(formData.get('order') as string || '0')

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALL_ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} is not supported. Allowed types: images (jpg, png, gif, webp, svg), videos (mp4, webm, mov, avi), audio (mp3, wav, ogg)` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')

    // Create data URL for immediate use
    const dataUrl = `data:${file.type};base64,${base64Data}`

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
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
