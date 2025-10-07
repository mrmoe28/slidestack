'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { X, Play, Pause, SkipForward, SkipBack, ZoomIn, ZoomOut, Type, Music, Video as VideoIcon } from 'lucide-react'
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
}

interface TimelineProps {
  onClipsChange?: (clips: TimelineClip[]) => void
}

export function Timeline({ onClipsChange }: TimelineProps) {
  const [clips, setClips] = useState<TimelineClip[]>([])
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [zoom, setZoom] = useState(1) // 1 = 1 second per 50px
  const timelineRef = useRef<HTMLDivElement>(null)
  const playheadRef = useRef<HTMLDivElement>(null)

  const PIXELS_PER_SECOND = 50 * zoom

  const getTotalDuration = useCallback(() => {
    return clips.reduce((total, clip) => total + clip.duration, 0)
  }, [clips])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const frames = Math.floor((seconds % 1) * 30) // 30 fps
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)

    try {
      const data = e.dataTransfer.getData('application/json')
      if (!data) return

      const content: ClipContent = JSON.parse(data)

      // Determine duration based on content type
      const duration = 'duration' in content && content.type === 'text'
        ? content.duration
        : 3 // Default 3 seconds for media files

      // Add clip to timeline
      const newClip: TimelineClip = {
        id: `clip-${Date.now()}`,
        content,
        duration,
        order: clips.length,
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
    const updatedClips = clips
      .filter(c => c.id !== clipId)
      .map((clip, index) => ({ ...clip, order: index }))

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
        const next = prev + 0.033 // ~30fps
        if (next >= getTotalDuration()) {
          setIsPlaying(false)
          return getTotalDuration()
        }
        return next
      })
    }, 33)

    return () => clearInterval(interval)
  }, [isPlaying, getTotalDuration])

  // Generate time ruler ticks
  const generateTimeRulerTicks = () => {
    const totalDuration = getTotalDuration()
    const ticks = []
    const interval = zoom < 0.5 ? 5 : zoom < 1 ? 2 : 1 // seconds per tick

    for (let i = 0; i <= Math.ceil(totalDuration); i += interval) {
      ticks.push(
        <div
          key={i}
          className="absolute flex flex-col items-center"
          style={{ left: `${i * PIXELS_PER_SECOND}px` }}
        >
          <div className="w-px h-2 bg-gray-500" />
          <span className="text-xs text-gray-400 mt-0.5">{formatTime(i)}</span>
        </div>
      )
    }
    return ticks
  }

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Timeline Header - Controls */}
      <div className="flex-shrink-0 bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Transport Controls */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={skipBackward}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={skipForward}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Time Display */}
          <div className="text-sm font-mono text-gray-300 bg-gray-800 px-3 py-1 rounded border border-gray-700">
            {formatTime(currentTime)} / {formatTime(getTotalDuration())}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={handleZoomOut}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-gray-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={handleZoomIn}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-sm text-gray-400">
            {clips.length} {clips.length === 1 ? 'clip' : 'clips'}
          </div>
        </div>
      </div>

      {/* Timeline Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Labels */}
        <div className="flex-shrink-0 w-24 bg-gray-900 border-r border-gray-700">
          <div className="h-12 flex items-center justify-center border-b border-gray-700">
            <span className="text-xs text-gray-400 font-medium">TIMELINE</span>
          </div>
          <div className="h-32 flex items-center justify-center border-b border-gray-700">
            <span className="text-xs text-gray-400 font-medium">VIDEO</span>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="relative min-w-full h-full">
            {/* Time Ruler */}
            <div className="h-12 bg-gray-900 border-b border-gray-700 relative">
              <div className="absolute inset-0 pl-2">
                {generateTimeRulerTicks()}
              </div>
            </div>

            {/* Video Track */}
            <div
              ref={timelineRef}
              className={`h-32 bg-gray-800 border-b border-gray-700 relative ${
                isDraggingOver ? 'bg-indigo-900/30 ring-2 ring-indigo-500' : ''
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleTimelineClick}
            >
              {clips.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className={`text-sm ${isDraggingOver ? 'text-indigo-400 font-medium' : 'text-gray-500'}`}>
                    {isDraggingOver ? 'Drop here to add to timeline' : 'Drag media files here to build your slideshow'}
                  </p>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center">
                  {clips.map((clip, index) => {
                    const isTextSlide = 'type' in clip.content && clip.content.type === 'text'
                    const textSlide = isTextSlide ? (clip.content as TextSlideData) : null
                    const mediaFile = !isTextSlide ? (clip.content as MediaFile) : null

                    // Calculate start position
                    const startTime = clips.slice(0, index).reduce((sum, c) => sum + c.duration, 0)
                    const left = startTime * PIXELS_PER_SECOND
                    const width = clip.duration * PIXELS_PER_SECOND

                    return (
                      <div
                        key={clip.id}
                        className="absolute h-24 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded border-2 border-indigo-500 overflow-hidden group hover:border-indigo-400 transition-all shadow-lg"
                        style={{
                          left: `${left}px`,
                          width: `${width}px`,
                          top: '8px',
                        }}
                      >
                        {/* Clip Preview */}
                        <div className="absolute inset-0">
                          {textSlide && (
                            <div
                              className="w-full h-full flex items-center justify-center p-2"
                              style={{ backgroundColor: textSlide.backgroundColor }}
                            >
                              <Type className="w-8 h-8" style={{ color: textSlide.textColor }} />
                            </div>
                          )}

                          {mediaFile && mediaFile.type === 'image' && mediaFile.url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={mediaFile.url}
                              alt={mediaFile.name}
                              className="w-full h-full object-cover"
                            />
                          )}

                          {mediaFile && mediaFile.type === 'video' && (
                            <div className="w-full h-full flex items-center justify-center bg-gray-900">
                              <VideoIcon className="w-8 h-8 text-white" />
                            </div>
                          )}

                          {mediaFile && mediaFile.type === 'audio' && (
                            <div className="w-full h-full flex items-center justify-center bg-purple-900">
                              <Music className="w-8 h-8 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Clip Info Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                          <div className="absolute bottom-0 left-0 right-0 p-2">
                            <p className="text-xs text-white truncate font-medium">
                              {textSlide
                                ? textSlide.text.substring(0, 20)
                                : mediaFile
                                ? mediaFile.name
                                : 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-300">{clip.duration.toFixed(1)}s</p>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-600 hover:bg-red-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeClip(clip.id)
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Playhead */}
              <div
                ref={playheadRef}
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10"
                style={{
                  left: `${currentTime * PIXELS_PER_SECOND}px`,
                }}
              >
                <div className="absolute -top-1 -left-2 w-4 h-4">
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-red-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
