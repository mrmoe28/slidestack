import { z } from 'zod'

/**
 * Validation schemas for timeline operations
 * These schemas prevent runtime errors by validating drag-and-drop data
 * and timeline clip structures before processing
 */

// Media file schema (from database)
export const mediaFileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.enum(['image', 'video', 'audio']),
  url: z.string().url(),
  duration: z.number().optional(),
  mimeType: z.string(),
  size: z.number(),
})

// Text slide schema
export const textSlideSchema = z.object({
  id: z.string(),
  type: z.literal('text'),
  content: z.string(),
  duration: z.number().min(0.5).max(30),
  bgColor: z.string().optional(),
  textColor: z.string().optional(),
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
})

// Union type for all possible clip content
export const clipContentSchema = z.discriminatedUnion('type', [
  mediaFileSchema.extend({ type: z.enum(['image', 'video', 'audio']) }),
  textSlideSchema,
])

// Timeline track enum
export const timelineTrackSchema = z.enum(['video', 'audio', 'overlay'])

// Timeline clip schema (what's actually in the timeline)
export const timelineClipSchema = z.object({
  id: z.string(),
  content: clipContentSchema,
  duration: z.number().positive(),
  order: z.number().int().min(0),
  track: timelineTrackSchema,
})

// Helper function to determine correct track from content
export function getTrackForContent(content: unknown): 'video' | 'audio' | 'overlay' {
  const validated = clipContentSchema.parse(content)

  if (validated.type === 'text') {
    return 'overlay'
  }
  if (validated.type === 'audio') {
    return 'audio'
  }
  if (validated.type === 'image' || validated.type === 'video') {
    return 'video'
  }

  return 'video' // fallback
}

// Helper function to validate drag-and-drop data
export function validateDragData(jsonString: string): z.infer<typeof clipContentSchema> {
  try {
    const data = JSON.parse(jsonString)
    return clipContentSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Invalid drag data:', error.errors)
      throw new Error(`Invalid content: ${error.errors.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

// Type exports for TypeScript
export type MediaFile = z.infer<typeof mediaFileSchema>
export type TextSlide = z.infer<typeof textSlideSchema>
export type ClipContent = z.infer<typeof clipContentSchema>
export type TimelineTrack = z.infer<typeof timelineTrackSchema>
export type TimelineClip = z.infer<typeof timelineClipSchema>
