'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { X, Play, Pause, SkipForward, SkipBack, ZoomIn, ZoomOut, Type, Music, Video as VideoIcon, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MediaFile {
  id: string
  name: string
  size: number
  type: string
  url: string
}

interface TextSlideData {
  id: string
  type: 'text'
  text: string
  font: string
  fontSize: number
  textColor: string
  backgroundColor: string
  duration: number
}

type ClipContent = MediaFile | TextSlideData

interface TimelineClip {
  id: string
  content: ClipContent
  duration: number
  order: number
  track: 'video' | 'audio' | 'overlay'
}

interface TimelineProps {
  onClipsChange?: (clips: TimelineClip[]) => void
}

export function Timeline({ onClipsChange }: TimelineProps) {
  const [clips, setClips] = useState<TimelineClip[]>([])
  const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [zoom, setZoom] = useState(1)
  const timelineRef = useRef<HTMLDivElement>(null)

  const PIXELS_PER_SECOND = 50 * zoom

  const getTotalDuration = useCallback(() => {
    const videoClips = clips.filter(c => c.track === 'video')
    return videoClips.reduce((total, clip) => total + clip.duration, 0)
  }, [clips])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const frames = Math.floor((seconds % 1) * 30)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`
  }, [])

  const getTrackForContent = (content: ClipContent): 'video' | 'audio' | 'overlay' => {
    if ('type' in content) {
      if (content.type === 'text') return 'overlay'
    }

    const mediaFile = content as MediaFile
    if (mediaFile.type === 'audio') return 'audio'
    if (mediaFile.type === 'image' || mediaFile.type === 'video') return 'video'

    return 'video'
  }

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>, track: string) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(track)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(null)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, _targetTrack: 'video' | 'audio' | 'overlay') => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(null)

    try {
      const data = e.dataTransfer.getData('application/json')
      if (!data) return

      const content: ClipContent = JSON.parse(data)

      // Content type ALWAYS determines the track (images→video, text→overlay, audio→audio)
      const finalTrack = getTrackForContent(content)

      const duration = 'duration' in content && content.type === 'text'
        ? content.duration
        : 3

      const trackClips = clips.filter(c => c.track === finalTrack)

      const newClip: TimelineClip = {
        id: `clip-${Date.now()}`,
        content,
        duration,
        order: trackClips.length,
        track: finalTrack,
      }

      const updatedClips = [...clips, newClip]
      setClips(updatedClips)

      if (onClipsChange) {
        onClipsChange(updatedClips)
      }
    } catch (error) {
      console.error('Error adding clip to timeline:', error)
    }
  }, [clips, onClipsChange])

  const removeClip = useCallback((clipId: string) => {
    const updatedClips = clips.filter(c => c.id !== clipId)
    setClips(updatedClips)

    if (onClipsChange) {
      onClipsChange(updatedClips)
    }
  }, [clips, onClipsChange])

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const time = x / PIXELS_PER_SECOND
    setCurrentTime(Math.max(0, Math.min(time, getTotalDuration())))
  }, [PIXELS_PER_SECOND, getTotalDuration])

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const skipBackward = useCallback(() => {
    setCurrentTime(Math.max(0, currentTime - 1))
  }, [currentTime])

  const skipForward = useCallback(() => {
    setCurrentTime(Math.min(getTotalDuration(), currentTime + 1))
  }, [currentTime, getTotalDuration])

  const handleZoomIn = useCallback(() => {
    setZoom(Math.min(4, zoom * 1.5))
  }, [zoom])

  const handleZoomOut = useCallback(() => {
    setZoom(Math.max(0.25, zoom / 1.5))
  }, [zoom])

  // Animation loop for playback
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.033
        if (next >= getTotalDuration()) {
          setIsPlaying(false)
          return getTotalDuration()
        }
        return next
      })
    }, 33)

    return () => clearInterval(interval)
  }, [isPlaying, getTotalDuration])

  // Update preview canvas
  useEffect(() => {
    const previewCanvas = document.getElementById('preview-canvas')
    if (!previewCanvas) return

    const videoClips = clips.filter(c => c.track === 'video').sort((a, b) => a.order - b.order)
    const overlayClips = clips.filter(c => c.track === 'overlay').sort((a, b) => a.order - b.order)

    if (videoClips.length === 0 && overlayClips.length === 0) {
      previewCanvas.innerHTML = '<p class="text-gray-400 text-lg">Preview Canvas</p>'
      return
    }

    // Find current video clip
    let accumulatedTime = 0
    let currentVideoClip: TimelineClip | null = null

    for (const clip of videoClips) {
      if (currentTime >= accumulatedTime && currentTime < accumulatedTime + clip.duration) {
        currentVideoClip = clip
        break
      }
      accumulatedTime += clip.duration
    }

    if (!currentVideoClip) {
      previewCanvas.innerHTML = '<p class="text-gray-400 text-lg">End of Timeline</p>'
      return
    }

    // Render video clip
    const mediaFile = currentVideoClip.content as MediaFile
    if (mediaFile.type === 'image') {
      previewCanvas.innerHTML = `
        <img src="${mediaFile.url}" alt="${mediaFile.name}" class="w-full h-full object-contain" />
      `
    }

    // TODO: Overlay text clips on top of video in future update
  }, [currentTime, clips])

  // Generate time ruler ticks
  const generateTimeRulerTicks = () => {
    const totalDuration = getTotalDuration()
    const ticks = []
    const interval = zoom < 0.5 ? 5 : zoom < 1 ? 2 : 1

    for (let i = 0; i <= Math.ceil(totalDuration); i += interval) {
      ticks.push(
        <div
          key={i}
          className="absolute flex flex-col items-center"
          style={{ left: `${i * PIXELS_PER_SECOND}px` }}
        >
          <div className="w-px h-2 bg-gray-400" />
          <span className="text-xs text-gray-600 mt-0.5">{formatTime(i)}</span>
        </div>
      )
    }
    return ticks
  }

  const renderTrackClips = (track: 'video' | 'audio' | 'overlay') => {
    const trackClips = clips.filter(c => c.track === track).sort((a, b) => a.order - b.order)

    return trackClips.map((clip, index) => {
      const isTextSlide = 'type' in clip.content && clip.content.type === 'text'
      const textSlide = isTextSlide ? (clip.content as TextSlideData) : null
      const mediaFile = !isTextSlide ? (clip.content as MediaFile) : null

      const startTime = trackClips.slice(0, index).reduce((sum, c) => sum + c.duration, 0)
      const left = startTime * PIXELS_PER_SECOND
      const width = clip.duration * PIXELS_PER_SECOND

      return (
        <div
          key={clip.id}
          className="absolute h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded border border-indigo-400 overflow-hidden group hover:border-indigo-300 transition-all shadow-md"
          style={{
            left: `${left}px`,
            width: `${width}px`,
            top: '8px',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {textSlide && <Type className="w-6 h-6 text-white" />}
            {mediaFile && mediaFile.type === 'image' && <ImageIcon className="w-6 h-6 text-white" />}
            {mediaFile && mediaFile.type === 'video' && <VideoIcon className="w-6 h-6 text-white" />}
            {mediaFile && mediaFile.type === 'audio' && <Music className="w-6 h-6 text-white" />}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
            <div className="absolute bottom-0 left-0 right-0 p-1.5">
              <p className="text-xs text-white truncate font-medium">
                {textSlide ? textSlide.text.substring(0, 15) : mediaFile ? mediaFile.name : 'Unknown'}
              </p>
              <p className="text-xs text-gray-200">{clip.duration.toFixed(1)}s</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="absolute top-0.5 right-0.5 h-5 w-5 p-0 bg-red-600 hover:bg-red-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              removeClip(clip.id)
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )
    })
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Timeline Header */}
      <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-700 hover:bg-gray-200" onClick={skipBackward}>
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-700 hover:bg-gray-200" onClick={togglePlayPause}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-700 hover:bg-gray-200" onClick={skipForward}>
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-sm font-mono text-gray-700 bg-white px-3 py-1 rounded border border-gray-300">
            {formatTime(currentTime)} / {formatTime(getTotalDuration())}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-700 hover:bg-gray-200" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-gray-600 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-700 hover:bg-gray-200" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            {clips.length} {clips.length === 1 ? 'clip' : 'clips'}
          </div>
        </div>
      </div>

      {/* Timeline Tracks */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Labels */}
        <div className="flex-shrink-0 w-24 bg-gray-50 border-r border-gray-200">
          <div className="h-10 flex items-center justify-center border-b border-gray-200">
            <span className="text-xs text-gray-600 font-medium">TIME</span>
          </div>
          <div className="h-20 flex items-center justify-center border-b border-gray-200">
            <div className="flex flex-col items-center gap-1">
              <Type className="w-4 h-4 text-indigo-600" />
              <span className="text-xs text-gray-700 font-medium">OVERLAY</span>
            </div>
          </div>
          <div className="h-20 flex items-center justify-center border-b border-gray-200">
            <div className="flex flex-col items-center gap-1">
              <VideoIcon className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-700 font-medium">VIDEO</span>
            </div>
          </div>
          <div className="h-16 flex items-center justify-center border-b border-gray-200">
            <div className="flex flex-col items-center gap-1">
              <Music className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-gray-700 font-medium">AUDIO</span>
            </div>
          </div>
        </div>

        {/* Track Content */}
        <div ref={timelineRef} className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="relative min-w-full h-full">
            {/* Time Ruler */}
            <div className="h-10 bg-gray-50 border-b border-gray-200 relative">
              <div className="absolute inset-0 pl-2">{generateTimeRulerTicks()}</div>
            </div>

            {/* Overlay Track */}
            <div
              className={`h-20 bg-purple-50 border-b border-gray-200 relative ${isDraggingOver === 'overlay' ? 'bg-purple-100 ring-2 ring-purple-400' : ''}`}
              onDragEnter={(e) => handleDragEnter(e, 'overlay')}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'overlay')}
            >
              {clips.filter(c => c.track === 'overlay').length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-xs text-gray-500 font-medium">📝 Text slides only</p>
                </div>
              ) : (
                <div className="absolute inset-0">{renderTrackClips('overlay')}</div>
              )}
            </div>

            {/* Video Track */}
            <div
              className={`h-20 bg-blue-50 border-b border-gray-200 relative ${isDraggingOver === 'video' ? 'bg-blue-100 ring-2 ring-blue-400' : ''}`}
              onDragEnter={(e) => handleDragEnter(e, 'video')}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'video')}
              onClick={handleTimelineClick}
            >
              {clips.filter(c => c.track === 'video').length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-xs text-gray-500 font-medium">🖼️ Drop images/videos here to start</p>
                </div>
              ) : (
                <div className="absolute inset-0">{renderTrackClips('video')}</div>
              )}
            </div>

            {/* Audio Track */}
            <div
              className={`h-16 bg-green-50 border-b border-gray-200 relative ${isDraggingOver === 'audio' ? 'bg-green-100 ring-2 ring-green-400' : ''}`}
              onDragEnter={(e) => handleDragEnter(e, 'audio')}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'audio')}
            >
              {clips.filter(c => c.track === 'audio').length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-xs text-gray-500 font-medium">🎵 Background music/audio</p>
                </div>
              ) : (
                <div className="absolute inset-0">{renderTrackClips('audio')}</div>
              )}
            </div>

            {/* Playhead */}
            <div
              className="absolute top-10 bottom-0 w-0.5 bg-red-500 pointer-events-none z-20"
              style={{ left: `${currentTime * PIXELS_PER_SECOND}px` }}
            >
              <div className="absolute -top-2 -left-2 w-4 h-4">
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-red-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
