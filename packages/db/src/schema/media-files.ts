import { pgTable, text, timestamp, uuid, bigint, integer, real } from 'drizzle-orm/pg-core'
import { projects } from './projects'

export type MediaType = 'image' | 'video' | 'audio' | 'text'
export type TimelineTrack = 'video' | 'audio' | 'overlay'

export const mediaFiles = pgTable('media_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  type: text('type').$type<MediaType>().notNull(),
  track: text('track').$type<TimelineTrack>().notNull().default('video'), // Timeline track: video, audio, or overlay
  url: text('url').notNull(), // Data URL (base64) for files stored in DB
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(), // Original MIME type
  size: bigint('size', { mode: 'number' }).notNull(),
  data: text('data').notNull(), // Base64 encoded file data
  duration: real('duration'), // seconds for video/audio/text slides
  order: integer('order').notNull(), // Order within the track
  textContent: text('text_content'), // For text slides
  textStyles: text('text_styles'), // JSON string for text styling (font, color, etc.)
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type MediaFile = typeof mediaFiles.$inferSelect
export type NewMediaFile = typeof mediaFiles.$inferInsert
