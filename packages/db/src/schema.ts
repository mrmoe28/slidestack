import { pgTable, uuid, text, timestamp, integer, jsonb, bigint, check } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Users table
export const users = pgTable('users', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Projects table
export const projects = pgTable('projects', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  aspect: text('aspect').notNull().default('16:9'),
  fps: integer('fps').notNull().default(30),
  status: text('status').notNull().default('DRAFT'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Assets table (images, videos, audio, fonts)
export const assets = pgTable(
  'assets',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    s3Key: text('s3_key').notNull(),
    width: integer('width'),
    height: integer('height'),
    durationMs: integer('duration_ms'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => ({
    typeCheck: check('type_check', sql`${table.type} IN ('image', 'video', 'audio', 'font')`),
  })
)

// Scenes table (timeline items)
export const scenes = pgTable(
  'scenes',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    orderIdx: integer('order_idx').notNull(),
    kind: text('kind').notNull(),
    durationMs: integer('duration_ms').notNull(),
    transition: text('transition').notNull().default('fade'),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => ({
    kindCheck: check('kind_check', sql`${table.kind} IN ('image', 'video', 'text')`),
  })
)

// Jobs table (render jobs)
export const jobs = pgTable(
  'jobs',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('PENDING'),
    params: jsonb('params').$type<Record<string, unknown>>().notNull(),
    outputKey: text('output_key'),
    thumbKey: text('thumb_key'),
    error: text('error'),
    progress: integer('progress').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => ({
    statusCheck: check(
      'status_check',
      sql`${table.status} IN ('PENDING', 'RUNNING', 'FAILED', 'READY')`
    ),
  })
)

// Type exports for use in app code
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type Asset = typeof assets.$inferSelect
export type NewAsset = typeof assets.$inferInsert
export type Scene = typeof scenes.$inferSelect
export type NewScene = typeof scenes.$inferInsert
export type Job = typeof jobs.$inferSelect
export type NewJob = typeof jobs.$inferInsert
