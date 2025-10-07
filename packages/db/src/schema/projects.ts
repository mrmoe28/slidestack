import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core'
import { users } from './users'

export type ProjectStatus = 'draft' | 'processing' | 'completed' | 'failed'

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').$type<ProjectStatus>().notNull().default('draft'),
  config: jsonb('config').$type<Record<string, any>>(),
  outputUrl: text('output_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
