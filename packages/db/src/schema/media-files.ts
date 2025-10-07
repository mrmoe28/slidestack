import { pgTable, text, timestamp, uuid, bigint, integer, real } from 'drizzle-orm/pg-core'
import { projects } from './projects'

export type MediaType = 'image' | 'video' | 'audio'

export const mediaFiles = pgTable('media_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  type: text('type').$type<MediaType>().notNull(),
  url: text('url').notNull(),
  filename: text('filename').notNull(),
  size: bigint('size', { mode: 'number' }).notNull(),
  duration: real('duration'), // seconds for video/audio
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type MediaFile = typeof mediaFiles.$inferSelect
export type NewMediaFile = typeof mediaFiles.$inferInsert
