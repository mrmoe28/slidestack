'use client'

import { useState, useCallback } from 'react'
import { X, Play, Type, Music, Video as VideoIcon } from 'lucide-react'
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

  const getTotalDuration = () => {
    return clips.reduce((total, clip) => total + clip.duration, 0)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Timeline {clips.length > 0 && `(${clips.length} clips, ${formatDuration(getTotalDuration())})`}
        </h3>
        {clips.length > 0 && (
          <Button size="sm" variant="outline">
            <Play className="w-3 h-3 mr-1" />
            Preview
          </Button>
        )}
      </div>

      <div
        className={`flex-1 border-2 border-dashed rounded-lg p-4 transition-all ${
          isDraggingOver
            ? 'border-indigo-500 bg-indigo-50'
            : clips.length === 0
            ? 'border-gray-300'
            : 'border-gray-200'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {clips.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className={`text-sm ${isDraggingOver ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
              {isDraggingOver ? 'Drop here to add to timeline' : 'Drag media files here to build your slideshow'}
            </p>
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {clips.map((clip) => {
              const isTextSlide = 'type' in clip.content && clip.content.type === 'text'
              const textSlide = isTextSlide ? (clip.content as TextSlideData) : null
              const mediaFile = !isTextSlide ? (clip.content as MediaFile) : null

              return (
                <div
                  key={clip.id}
                  className="relative flex-shrink-0 w-32 h-24 bg-white border-2 border-gray-300 rounded-lg overflow-hidden group hover:border-indigo-400 transition-colors"
                >
                  {/* Text Slide */}
                  {textSlide && (
                    <div
                      className="w-full h-full flex items-center justify-center p-2"
                      style={{
                        backgroundColor: textSlide.backgroundColor,
                      }}
                    >
                      <div className="text-center">
                        <Type className="w-6 h-6 mx-auto mb-1" style={{ color: textSlide.textColor }} />
                        <p
                          className="text-xs truncate"
                          style={{
                            color: textSlide.textColor,
                            fontFamily: textSlide.font,
                          }}
                        >
                          {textSlide.text.substring(0, 20)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Image Media */}
                  {mediaFile && mediaFile.type === 'image' && mediaFile.url && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mediaFile.url}
                        alt={mediaFile.name}
                        className="w-full h-full object-cover"
                      />
                    </>
                  )}

                  {/* Video Media */}
                  {mediaFile && mediaFile.type === 'video' && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <VideoIcon className="w-12 h-12 text-white" />
                    </div>
                  )}

                  {/* Audio Media */}
                  {mediaFile && mediaFile.type === 'audio' && (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-900">
                      <Music className="w-12 h-12 text-white" />
                    </div>
                  )}

                  {/* Remove Button */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => removeClip(clip.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Clip Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                    <p className="text-xs text-white truncate">
                      {textSlide
                        ? textSlide.text.substring(0, 15)
                        : mediaFile
                        ? mediaFile.name
                        : 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-300">{clip.duration}s</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
