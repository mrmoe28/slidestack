'use client'

import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'
import { AudioLibrary } from './audio-library'

interface ProjectEditorProps {
  projectId: string
  projectTitle: string
}

export function ProjectEditorNew({ projectId, projectTitle: _projectTitle }: ProjectEditorProps) {
  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Audio Library */}
      <div>
        <AudioLibrary projectId={projectId} />
      </div>

      {/* Transitions */}
      <div className="pt-4 border-t">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Transitions</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => {
              // Dispatch event for timeline to pick up
              window.dispatchEvent(new CustomEvent('transitionSelected', { detail: 'fade' }))
            }}
          >
            <Zap className="w-3 h-3 mr-1" />
            Fade
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('transitionSelected', { detail: 'slide' }))
            }}
          >
            <Zap className="w-3 h-3 mr-1" />
            Slide
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('transitionSelected', { detail: 'zoom' }))
            }}
          >
            <Zap className="w-3 h-3 mr-1" />
            Zoom
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('transitionSelected', { detail: 'none' }))
            }}
          >
            <Zap className="w-3 h-3 mr-1" />
            None
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 italic">
          Select a clip in the timeline, then choose a transition
        </p>
      </div>
    </div>
  )
}
