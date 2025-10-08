import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db, projects, renderJobs, eq, and } from '@slideshow/db'

export const dynamic = 'force-dynamic'

const renderRequestSchema = z.object({
  timeline: z.array(z.any()),
  duration: z.number(),
  resolution: z.string().default('1920x1080'),
  fps: z.number().default(30),
  quality: z.enum(['low', 'medium', 'high']).default('high'),
})

// POST /api/projects/[id]/render - Start a render job
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify project ownership
    const [project] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, id),
          eq(projects.userId, session.user.id)
        )
      )
      .limit(1)

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const body = await request.json()
    const renderConfig = renderRequestSchema.parse(body)

    // Create render job
    const [job] = await db
      .insert(renderJobs)
      .values({
        projectId: id,
        status: 'queued',
        progress: 0,
      })
      .returning()

    // Update project config with render settings
    await db
      .update(projects)
      .set({
        config: {
          ...(project.config as object || {}),
          lastRender: {
            jobId: job.id,
            settings: renderConfig,
            startedAt: new Date().toISOString(),
          },
        },
        status: 'processing',
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))

    // TODO: Send job to worker queue (Redis/BullMQ)
    // For now, just return the job ID

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: 'Render job created successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to create render job:', error)
    return NextResponse.json(
      { error: 'Failed to create render job' },
      { status: 500 }
    )
  }
}

// GET /api/projects/[id]/render - Get render job status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify project ownership
    const [project] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, id),
          eq(projects.userId, session.user.id)
        )
      )
      .limit(1)

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get latest render job for this project
    const [job] = await db
      .select()
      .from(renderJobs)
      .where(eq(renderJobs.projectId, id))
      .orderBy(renderJobs.createdAt)
      .limit(1)

    if (!job) {
      return NextResponse.json({ error: 'No render jobs found' }, { status: 404 })
    }

    return NextResponse.json({ job })
  } catch (error) {
    console.error('Failed to fetch render job:', error)
    return NextResponse.json(
      { error: 'Failed to fetch render job' },
      { status: 500 }
    )
  }
}
