'use client'

import { useState } from 'react'
import { Maximize, Minimize, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PreviewControls() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const toggleFullscreen = () => {
    const preview = document.getElementById('preview-canvas')
    if (!preview) return

    if (!isFullscreen) {
      if (preview.requestFullscreen) {
        preview.requestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    // Dispatch event for timeline/preview to handle
    window.dispatchEvent(new CustomEvent('previewMuteToggle', { detail: { muted: !isMuted } }))
  }

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
      <Button
        variant="secondary"
        size="sm"
        className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white border-none"
        onClick={toggleMute}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </Button>

      <Button
        variant="secondary"
        size="sm"
        className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white border-none"
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
      </Button>
    </div>
  )
}
