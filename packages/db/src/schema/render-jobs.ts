import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core'
import { projects } from './projects'

export type RenderJobStatus = 'queued' | 'processing' | 'completed' | 'failed'

export const renderJobs = pgTable('render_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  status: text('status').$type<RenderJobStatus>().notNull().default('queued'),
  progress: integer('progress').notNull().default(0), // 0-100
  outputUrl: text('output_url'), // Cloud storage URL (R2/S3) when completed
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type RenderJob = typeof renderJobs.$inferSelect
export type NewRenderJob = typeof renderJobs.$inferInsert
