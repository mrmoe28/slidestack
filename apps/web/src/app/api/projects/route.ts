import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db, projects, eq, desc } from '@slideshow/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional(),
})

// GET /api/projects - List user's projects
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, session.user.id))
      .orderBy(desc(projects.createdAt))

    return NextResponse.json({ projects: userProjects })
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    const [newProject] = await db
      .insert(projects)
      .values({
        userId: session.user.id,
        title: validatedData.title,
        description: validatedData.description,
        status: 'draft',
        config: {},
      })
      .returning()

    return NextResponse.json({ project: newProject }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to create project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
