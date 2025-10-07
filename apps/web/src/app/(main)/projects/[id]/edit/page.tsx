import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db, projects, eq, and } from '@slideshow/db'
import Link from 'next/link'
import { ArrowLeft, Save, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectEditor } from '@/components/features/editor/project-editor'
import { MediaUploader } from '@/components/features/editor/media-uploader'
import { Timeline } from '@/components/features/editor/timeline'
import { TextSlideEditor } from '@/components/features/editor/text-slide-editor'

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
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header - Fixed height */}
      <header className="flex-shrink-0 bg-white border-b shadow-sm px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </Link>
          </Button>
          <div className="border-l pl-3">
            <h1 className="text-base font-semibold text-gray-900">{project.title}</h1>
            {project.description && (
              <p className="text-xs text-gray-600">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-1.5" />
            Save
          </Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
            <Play className="w-4 h-4 mr-1.5" />
            Render Video
          </Button>
        </div>
      </header>

      {/* Main Content Area - Flexible height */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar - Media Library & Editing Tools */}
        <aside className="w-64 flex-shrink-0 bg-white border-r shadow-sm overflow-y-auto">
          <div className="p-3 space-y-4">
            {/* Media Uploader */}
            <div>
              <h2 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide">Media Library</h2>
              <MediaUploader projectId={project.id} />
            </div>

            {/* Slide Editor */}
            <div className="border-t pt-4">
              <ProjectEditor projectId={project.id} projectTitle={project.title} />
            </div>

            {/* Text Slide Editor */}
            <div className="border-t pt-4">
              <TextSlideEditor />
            </div>
          </div>
        </aside>

        {/* Center - Preview Area */}
        <main className="flex-1 flex flex-col bg-gray-50 min-w-0">
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full h-full max-w-5xl max-h-full flex items-center justify-center">
              <div id="preview-canvas" className="w-full aspect-video bg-white rounded-lg shadow-xl flex items-center justify-center border-2 border-gray-200">
                <p className="text-gray-400 text-lg">Preview Canvas</p>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Properties */}
        <aside className="w-56 flex-shrink-0 bg-white border-l shadow-sm overflow-y-auto">
          <div className="p-3 space-y-3">
            <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Properties</h2>

            <div className="space-y-2">
              <div className="p-2 bg-gray-50 rounded border border-gray-200">
                <label className="text-xs text-gray-600 block mb-0.5 font-medium">Duration</label>
                <p className="text-sm font-semibold text-gray-900">0:00</p>
              </div>
              <div className="p-2 bg-gray-50 rounded border border-gray-200">
                <label className="text-xs text-gray-600 block mb-0.5 font-medium">Resolution</label>
                <p className="text-sm font-semibold text-gray-900">1920×1080</p>
              </div>
              <div className="p-2 bg-gray-50 rounded border border-gray-200">
                <label className="text-xs text-gray-600 block mb-0.5 font-medium">FPS</label>
                <p className="text-sm font-semibold text-gray-900">30</p>
              </div>
            </div>

            <div className="pt-3 border-t">
              <h3 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide">Export</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Quality</label>
                  <select className="w-full text-xs border border-gray-300 rounded px-2 py-1.5">
                    <option>High (1080p)</option>
                    <option>Medium (720p)</option>
                    <option>Low (480p)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Format</label>
                  <select className="w-full text-xs border border-gray-300 rounded px-2 py-1.5">
                    <option>MP4</option>
                    <option>WebM</option>
                    <option>AVI</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Timeline Area - Fixed height at bottom */}
      <div className="flex-shrink-0 h-64 bg-white border-t border-gray-200">
        <Timeline />
      </div>
    </div>
  )
}
