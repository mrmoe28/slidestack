import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db, projects, eq, and } from '@slideshow/db'
import { ProjectEditorClient } from '@/components/features/editor/project-editor-client'

// Enable caching for faster navigation
export const revalidate = 30 // Cache for 30 seconds

export const metadata: Metadata = {
  title: 'Edit Project - SlideShow',
  description: 'Edit your slideshow project',
}

interface PageProps {
  params: { id: string }
}

export default async function ProjectEditorPage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

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
    notFound()
  }

  return <ProjectEditorClient project={project} />
}
