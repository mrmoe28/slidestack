'use client'

import { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Save, Play, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { TimelineClip, TextContent } from '@/types/timeline'

// Lazy load heavy components with Next.js dynamic (fixes SSR hydration)
const ProjectEditorNew = dynamic(() => import('@/components/features/editor/project-editor-new').then(m => ({ default: m.ProjectEditorNew })), {
  loading: () => <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>,
  ssr: false
})
const MediaUploader = dynamic(() => import('@/components/features/editor/media-uploader').then(m => ({ default: m.MediaUploader })), {
  loading: () => <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>,
  ssr: false
})
const Timeline = dynamic(() => import('@/components/features/editor/timeline').then(m => ({ default: m.Timeline })), {
  loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>,
  ssr: false
})
const PreviewControls = dynamic(() => import('@/components/features/editor/preview-controls').then(m => ({ default: m.PreviewControls })), {
  ssr: false
})
const TextEditorPanel = dynamic(() => import('@/components/features/editor/text-editor-panel').then(m => ({ default: m.TextEditorPanel })), {
  loading: () => <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>,
  ssr: false
})

interface ProjectData {
  id: string
  title: string
  description: string | null
}

interface ProjectEditorClientProps {
  project: ProjectData
}

export function ProjectEditorClient({ project }: ProjectEditorClientProps) {
  const [clips, setClips] = useState<TimelineClip[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isRendering, setIsRendering] = useState(false)
  const [totalDuration, setTotalDuration] = useState(0)
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)
  const [isLoadingProject, setIsLoadingProject] = useState(true)

  // Load saved project config on mount
  useEffect(() => {
    const loadProjectConfig = async () => {
      try {
        setIsLoadingProject(true)

        // Fetch full project config including timeline
        const response = await fetch(`/api/projects/${project.id}`)
        if (!response.ok) throw new Error('Failed to load project')

        const data = await response.json()
        const config = data.project.config as { timeline?: TimelineClip[], duration?: number } | null

        if (config?.timeline && Array.isArray(config.timeline)) {
          setClips(config.timeline)

          // Calculate total duration
          const videoClips = config.timeline.filter(c => c.track === 'video')
          const duration = videoClips.reduce((total, clip) => total + clip.duration, 0)
          setTotalDuration(duration)
        }
      } catch (error) {
        console.error('Failed to load project config:', error)
        toast.error('Failed to load project data')
      } finally {
        setIsLoadingProject(false)
      }
    }

    loadProjectConfig()
  }, [project.id])

  const handleClipsChange = useCallback((updatedClips: TimelineClip[]) => {
    setClips(updatedClips)

    // Calculate total duration from video clips
    const videoClips = updatedClips.filter(c => c.track === 'video')
    const duration = videoClips.reduce((total, clip) => total + clip.duration, 0)
    setTotalDuration(duration)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Save project configuration with timeline data
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            timeline: clips,
            duration: totalDuration,
            lastSaved: new Date().toISOString(),
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save project')
      }

      toast.success('Project saved successfully!')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save project')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRenderVideo = async () => {
    if (clips.length === 0) {
      toast.error('Please add clips to the timeline before rendering')
      return
    }

    setIsRendering(true)

    try {
      // First save the project
      await handleSave()

      // Then trigger render job
      const response = await fetch(`/api/projects/${project.id}/render`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeline: clips,
          duration: totalDuration,
          resolution: '1920x1080',
          fps: 30,
          quality: 'high',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start render')
      }

      const { jobId } = await response.json()

      toast.success('Rendering started! This may take a few minutes...', {
        description: `Job ID: ${jobId}\n\n📍 Video Location: Your rendered video will be saved to cloud storage (Cloudflare R2) and accessible from the dashboard once complete.\n\nNote: Full render processing is coming soon! This creates a render job for now.`,
        duration: 10000,
      })

      // TODO: Implement job status polling and download link
    } catch (error) {
      console.error('Render error:', error)
      toast.error('Failed to start rendering', {
        description: 'Please check your timeline has clips and try again.',
      })
    } finally {
      setIsRendering(false)
    }
  }

  const handleClipSelect = useCallback((clipId: string | null) => {
    setSelectedClipId(clipId)
  }, [])

  const handleTextUpdate = useCallback((clipId: string, updates: Partial<TextContent>) => {
    setClips((prevClips) => {
      return prevClips.map((clip) => {
        if (clip.id === clipId && clip.content.type === 'text') {
          return {
            ...clip,
            content: {
              ...clip.content,
              ...updates,
            },
          }
        }
        return clip
      })
    })
  }, [])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Show loading indicator while project config loads
  if (isLoadingProject) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Editor Header - Fixed height */}
      <header className="flex-shrink-0 bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-base font-semibold text-gray-900">{project.title}</h1>
            {project.description && (
              <p className="text-xs text-gray-600">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-1.5" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={handleRenderVideo}
            disabled={isRendering || clips.length === 0}
          >
            <Play className="w-4 h-4 mr-1.5" />
            {isRendering ? 'Rendering...' : 'Render Video'}
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

            {/* Audio Library & Tools */}
            <div className="border-t pt-4">
              <ProjectEditorNew projectId={project.id} projectTitle={project.title} />
            </div>
          </div>
        </aside>

        {/* Center - Preview Area */}
        <main className="flex-1 flex flex-col bg-gray-50 min-w-0">
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full h-full max-w-5xl max-h-full flex items-center justify-center relative">
              <div id="preview-canvas" className="w-full aspect-video bg-white rounded-lg shadow-xl flex items-center justify-center border-2 border-gray-200 relative overflow-hidden">
                <p className="text-gray-400 text-lg">Preview Canvas</p>
                <PreviewControls />
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Properties / Text Editor */}
        <aside className="w-80 flex-shrink-0 bg-white border-l shadow-sm overflow-y-auto">
          <div className="p-3 space-y-3">
            {selectedClipId && clips.find(c => c.id === selectedClipId)?.content.type === 'text' ? (
              <TextEditorPanel
                selectedClip={clips.find(c => c.id === selectedClipId) || null}
                onUpdate={handleTextUpdate}
              />
            ) : (
              <>
                <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Properties</h2>

                <div className="space-y-2">
                  <div className="p-2 bg-gray-50 rounded border border-gray-200">
                    <label className="text-xs text-gray-600 block mb-0.5 font-medium">Duration</label>
                    <p className="text-sm font-semibold text-gray-900">{formatDuration(totalDuration)}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded border border-gray-200">
                    <label className="text-xs text-gray-600 block mb-0.5 font-medium">Resolution</label>
                    <p className="text-sm font-semibold text-gray-900">1920×1080</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded border border-gray-200">
                    <label className="text-xs text-gray-600 block mb-0.5 font-medium">FPS</label>
                    <p className="text-sm font-semibold text-gray-900">30</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded border border-gray-200">
                    <label className="text-xs text-gray-600 block mb-0.5 font-medium">Clips</label>
                    <p className="text-sm font-semibold text-gray-900">{clips.length}</p>
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
              </>
            )}
          </div>
        </aside>
      </div>

      {/* Timeline Area - Fixed height at bottom */}
      <div className="flex-shrink-0 h-80 bg-white border-t border-gray-200">
        <Timeline
          clips={clips}
          onClipsChange={handleClipsChange}
          selectedClipId={selectedClipId}
          onClipSelect={handleClipSelect}
        />
      </div>
    </div>
  )
}
