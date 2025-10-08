import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, mediaFiles, projects, eq, and } from '@slideshow/db'

export const dynamic = 'force-dynamic'

// GET /api/projects/[id]/media - Get all media files for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify project belongs to user
    const [project] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, params.id),
          eq(projects.userId, session.user.id)
        )
      )
      .limit(1)

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get all media files for this project
    const files = await db
      .select({
        id: mediaFiles.id,
        type: mediaFiles.type,
        url: mediaFiles.url,
        filename: mediaFiles.filename,
        size: mediaFiles.size,
        order: mediaFiles.order,
      })
      .from(mediaFiles)
      .where(eq(mediaFiles.projectId, params.id))
      .orderBy(mediaFiles.order)

    return NextResponse.json({ files })
  } catch (error) {
    console.error('Failed to fetch media files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media files' },
      { status: 500 }
    )
  }
}
