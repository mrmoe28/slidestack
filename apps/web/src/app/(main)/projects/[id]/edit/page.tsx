import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db, projects } from '@slideshow/db'
import { eq, and } from 'drizzle-orm'
import Link from 'next/link'
import { ArrowLeft, Save, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-white">{project.title}</h1>
            <p className="text-sm text-gray-400">
              {project.description || 'No description'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button size="sm">
            <Play className="w-4 h-4 mr-2" />
            Render Video
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Media Library */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold text-white mb-4">Media Library</h2>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
            <p className="text-sm text-gray-400 mb-2">No media files yet</p>
            <Button size="sm" variant="outline">
              Upload Files
            </Button>
          </div>
        </aside>

        {/* Center - Preview & Timeline */}
        <main className="flex-1 flex flex-col">
          {/* Preview Area */}
          <div className="flex-1 bg-black flex items-center justify-center">
            <div className="text-center">
              <div className="w-[640px] h-[360px] bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <p className="text-gray-400">Preview</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button size="sm" variant="ghost">
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Timeline Area */}
          <div className="h-48 bg-gray-800 border-t border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Timeline</h3>
            <div className="bg-gray-900 rounded-lg h-32 flex items-center justify-center">
              <p className="text-gray-500 text-sm">
                Drag media files here to build your slideshow
              </p>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Properties */}
        <aside className="w-64 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold text-white mb-4">Properties</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Duration</label>
              <p className="text-sm text-white">0:00</p>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Resolution</label>
              <p className="text-sm text-white">1920x1080</p>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">FPS</label>
              <p className="text-sm text-white">30</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
