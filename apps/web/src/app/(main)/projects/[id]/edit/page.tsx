import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db, projects, eq, and } from '@slideshow/db'
import Link from 'next/link'
import { ArrowLeft, Save, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectEditor } from '@/components/features/editor/project-editor'
import { MediaUploader } from '@/components/features/editor/media-uploader'

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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{project.title}</h1>
            <p className="text-sm text-gray-600">
              {project.description || 'No description'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
            <Play className="w-4 h-4 mr-2" />
            Render Video
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Media Library & Editing Tools */}
        <aside className="w-80 bg-white border-r shadow-sm p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Media Uploader */}
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Media Library</h2>
              <MediaUploader projectId={project.id} />
            </div>

            {/* Slide Editor */}
            <div className="border-t pt-6">
              <ProjectEditor projectId={project.id} projectTitle={project.title} />
            </div>
          </div>
        </aside>

        {/* Center - Preview & Timeline */}
        <main className="flex-1 flex flex-col bg-gray-100">
          {/* Preview Area */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-4xl">
              <div className="aspect-video bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-gray-200">
                <p className="text-gray-400 text-lg">Preview</p>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button size="sm" variant="outline">
                  <Play className="w-4 h-4 mr-2" />
                  Play Preview
                </Button>
              </div>
            </div>
          </div>

          {/* Timeline Area */}
          <div className="h-56 bg-white border-t shadow-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Timeline</h3>
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg h-40 flex items-center justify-center">
              <p className="text-gray-500 text-sm">
                Drag slides here to build your slideshow
              </p>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Properties */}
        <aside className="w-72 bg-white border-l shadow-sm p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Properties</h2>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <label className="text-xs text-gray-600 block mb-1 font-medium">Duration</label>
              <p className="text-lg font-semibold text-gray-900">0:00</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <label className="text-xs text-gray-600 block mb-1 font-medium">Resolution</label>
              <p className="text-lg font-semibold text-gray-900">1920×1080</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <label className="text-xs text-gray-600 block mb-1 font-medium">FPS</label>
              <p className="text-lg font-semibold text-gray-900">30</p>
            </div>
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Export Settings</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Quality</label>
                  <select className="w-full text-sm border rounded-md px-2 py-1.5">
                    <option>High (1080p)</option>
                    <option>Medium (720p)</option>
                    <option>Low (480p)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Format</label>
                  <select className="w-full text-sm border rounded-md px-2 py-1.5">
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
    </div>
  )
}
