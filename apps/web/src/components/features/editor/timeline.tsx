'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { X, Play, Pause, SkipForward, SkipBack, ZoomIn, ZoomOut, Music, Video as VideoIcon, Scissors, Type, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import type { TimelineClip, ClipContent, MediaFile, TextContent } from '@/types/timeline'

interface TimelineProps {
  clips: TimelineClip[]
  onClipsChange?: (clips: TimelineClip[]) => void
  selectedClipId?: string | null
  onClipSelect?: (clipId: string | null) => void
}

export function Timeline({ clips: externalClips, onClipsChange, selectedClipId, onClipSelect }: TimelineProps) {
  const [clips, setClips] = useState<TimelineClip[]>(externalClips)

  // Sync with external clips when they change
  useEffect(() => {
    setClips(externalClips)
  }, [externalClips])
  const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [resizingClip, setResizingClip] = useState<{ clipId: string; edge: 'left' | 'right'; initialDuration: number; initialX: number } | null>(null)
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

  const getTrackForContent = (content: ClipContent): 'video' | 'audio' | 'text' => {
    if (content.type === 'text') return 'text'

    const mediaFile = content as MediaFile
    if (mediaFile.type === 'audio') return 'audio'
    if (mediaFile.type === 'image' || mediaFile.type === 'video') return 'video'

    return 'video'
  }

  const addTextClip = useCallback(() => {
    const textClips = clips.filter(c => c.track === 'text')

    const newTextContent: TextContent = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: 'Enter your text here',
      fontSize: 48,
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      position: 'center',
      alignment: 'center',
      animation: 'fade',
    }

    const newClip: TimelineClip = {
      id: `clip-${Date.now()}`,
      content: newTextContent,
      duration: 3, // Default 3 seconds
      order: textClips.length,
      track: 'text',
    }

    const updatedClips = [...clips, newClip]
    setClips(updatedClips)

    if (onClipsChange) {
      onClipsChange(updatedClips)
    }
  }, [clips, onClipsChange])

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

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, _targetTrack: 'video' | 'audio') => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(null)

    try {
      const data = e.dataTransfer.getData('application/json')
      if (!data) return

      const content: ClipContent = JSON.parse(data)

      // Content type ALWAYS determines the track (images→video, audio→audio, text→text)
      const finalTrack = getTrackForContent(content)

      // Use duration from content if available, otherwise default to 3 seconds for images
      const duration = content.type === 'text' ? 3 : ((content as MediaFile).duration || 3)

      const trackClips = clips.filter(c => c.track === finalTrack)

      const newClip: TimelineClip = {
        id: `clip-${Date.now()}`,
        content,
        duration,
        order: trackClips.length,
        track: finalTrack,
        transition: {
          type: 'fade',
          duration: 0.5
        }
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

  const updateClipTransition = useCallback((clipId: string, transitionType: string) => {
    const updatedClips = clips.map(c => {
      if (c.id === clipId) {
        return {
          ...c,
          transition: {
            type: transitionType as any,
            duration: 0.5
          }
        }
      }
      return c
    })

    setClips(updatedClips)

    if (onClipsChange) {
      onClipsChange(updatedClips)
    }
  }, [clips, onClipsChange])

  const removeClip = useCallback((clipId: string) => {
    const updatedClips = clips.filter(c => c.id !== clipId)
    setClips(updatedClips)

    if (onClipsChange) {
      onClipsChange(updatedClips)
    }
  }, [clips, onClipsChange])

  const splitClip = useCallback((clipId: string) => {
    const clip = clips.find(c => c.id === clipId)
    if (!clip) return

    // Split at the midpoint of the clip
    const splitPoint = clip.duration / 2

    const firstHalf: TimelineClip = {
      ...clip,
      id: `clip-${Date.now()}-1`,
      duration: splitPoint,
    }

    const secondHalf: TimelineClip = {
      ...clip,
      id: `clip-${Date.now()}-2`,
      duration: clip.duration - splitPoint,
      order: clip.order + 1,
    }

    // Replace the original clip with two halves
    const updatedClips = clips
      .filter(c => c.id !== clipId)
      .map(c => {
        // Increment order for clips after the split point
        if (c.track === clip.track && c.order > clip.order) {
          return { ...c, order: c.order + 1 }
        }
        return c
      })
      .concat([firstHalf, secondHalf])
      .sort((a, b) => a.order - b.order)

    setClips(updatedClips)

    if (onClipsChange) {
      onClipsChange(updatedClips)
    }
  }, [clips, onClipsChange])

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || isDraggingPlayhead) return

    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const time = x / PIXELS_PER_SECOND
    setCurrentTime(Math.max(0, Math.min(time, getTotalDuration())))
  }, [PIXELS_PER_SECOND, getTotalDuration, isDraggingPlayhead])

  const handlePlayheadMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDraggingPlayhead(true)
    setIsPlaying(false)
  }, [])

  const handlePlayheadDrag = useCallback((e: MouseEvent) => {
    if (!isDraggingPlayhead || !timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const time = x / PIXELS_PER_SECOND
    setCurrentTime(Math.max(0, Math.min(time, getTotalDuration())))
  }, [isDraggingPlayhead, PIXELS_PER_SECOND, getTotalDuration])

  const handlePlayheadMouseUp = useCallback(() => {
    setIsDraggingPlayhead(false)
  }, [])

  // Clip resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent, clipId: string, edge: 'left' | 'right') => {
    e.stopPropagation()
    const clip = clips.find(c => c.id === clipId)
    if (!clip) return

    setResizingClip({
      clipId,
      edge,
      initialDuration: clip.duration,
      initialX: e.clientX
    })
    setIsPlaying(false) // Pause playback during resize
  }, [clips])

  const handleResizeDrag = useCallback((e: MouseEvent) => {
    if (!resizingClip || !timelineRef.current) return

    const deltaX = e.clientX - resizingClip.initialX
    const deltaDuration = deltaX / PIXELS_PER_SECOND

    let newDuration: number
    if (resizingClip.edge === 'right') {
      // Dragging right edge - increase/decrease duration
      newDuration = resizingClip.initialDuration + deltaDuration
    } else {
      // Dragging left edge - decrease/increase duration (opposite direction)
      newDuration = resizingClip.initialDuration - deltaDuration
    }

    // Clamp to minimum 0.5 seconds
    newDuration = Math.max(0.5, newDuration)

    // Update clip duration in real-time
    setClips(prevClips =>
      prevClips.map(c =>
        c.id === resizingClip.clipId ? { ...c, duration: newDuration } : c
      )
    )
  }, [resizingClip, PIXELS_PER_SECOND])

  const handleResizeEnd = useCallback(() => {
    if (!resizingClip) return

    // Notify parent of final clip changes
    if (onClipsChange) {
      onClipsChange(clips)
    }

    setResizingClip(null)
  }, [resizingClip, clips, onClipsChange])

  // Handle playhead dragging
  useEffect(() => {
    if (!isDraggingPlayhead) return

    window.addEventListener('mousemove', handlePlayheadDrag)
    window.addEventListener('mouseup', handlePlayheadMouseUp)

    return () => {
      window.removeEventListener('mousemove', handlePlayheadDrag)
      window.removeEventListener('mouseup', handlePlayheadMouseUp)
    }
  }, [isDraggingPlayhead, handlePlayheadDrag, handlePlayheadMouseUp])

  // Handle clip resizing
  useEffect(() => {
    if (!resizingClip) return

    window.addEventListener('mousemove', handleResizeDrag)
    window.addEventListener('mouseup', handleResizeEnd)

    return () => {
      window.removeEventListener('mousemove', handleResizeDrag)
      window.removeEventListener('mouseup', handleResizeEnd)
    }
  }, [resizingClip, handleResizeDrag, handleResizeEnd])

  // Listen for audio track selection from AudioLibrary
  useEffect(() => {
    const handleAudioTrackSelected = (event: CustomEvent) => {
      const mediaFile = event.detail as MediaFile

      // Get current audio clips to determine order
      const audioClips = clips.filter(c => c.track === 'audio')

      const newClip: TimelineClip = {
        id: `clip-${Date.now()}`,
        content: mediaFile,
        duration: mediaFile.duration || 60, // Default to 60s if no duration
        order: audioClips.length,
        track: 'audio',
      }

      const updatedClips = [...clips, newClip]
      setClips(updatedClips)

      if (onClipsChange) {
        onClipsChange(updatedClips)
      }
    }

    window.addEventListener('audioTrackSelected', handleAudioTrackSelected as EventListener)

    return () => {
      window.removeEventListener('audioTrackSelected', handleAudioTrackSelected as EventListener)
    }
  }, [clips, onClipsChange])

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

  // Update preview canvas with transitions
  useEffect(() => {
    const previewCanvas = document.getElementById('preview-canvas')
    if (!previewCanvas) return

    const videoClips = clips.filter(c => c.track === 'video').sort((a, b) => a.order - b.order)
    const textClips = clips.filter(c => c.track === 'text').sort((a, b) => a.order - b.order)

    // If no video clips but we have text clips, show a solid background
    if (videoClips.length === 0) {
      if (textClips.length === 0) {
        previewCanvas.innerHTML = '<p class="text-gray-400 text-lg">Preview Canvas</p>'
        return
      }
      // Create a solid background for text-only preview
      previewCanvas.innerHTML = '<div class="absolute inset-0 bg-gray-900"></div>'
    }

    // Find current and next video clips with transition info
    let accumulatedTime = 0
    let currentVideoClip: TimelineClip | null = null
    let nextVideoClip: TimelineClip | null = null
    let clipStartTime = 0

    for (let i = 0; i < videoClips.length; i++) {
      const clip = videoClips[i]
      if (currentTime >= accumulatedTime && currentTime < accumulatedTime + clip.duration) {
        currentVideoClip = clip
        clipStartTime = accumulatedTime
        nextVideoClip = videoClips[i + 1] || null
        break
      }
      accumulatedTime += clip.duration
    }

    if (!currentVideoClip) {
      previewCanvas.innerHTML = '<p class="text-gray-400 text-lg">End of Timeline</p>'
      return
    }

    // Calculate if we're in a transition
    const timeInClip = currentTime - clipStartTime
    const transitionDuration = nextVideoClip?.transition?.duration || 0.5
    const isInTransition = nextVideoClip && (timeInClip >= currentVideoClip.duration - transitionDuration)
    const transitionProgress = isInTransition
      ? (timeInClip - (currentVideoClip.duration - transitionDuration)) / transitionDuration
      : 0

    // Clear and rebuild canvas
    previewCanvas.innerHTML = ''

    // Render current clip
    const currentMediaFile = currentVideoClip.content as MediaFile
    const currentElement = document.createElement('div')
    currentElement.className = 'absolute inset-0 flex items-center justify-center transition-all duration-100'
    currentElement.style.transformOrigin = 'center center'

    if (isInTransition && nextVideoClip) {
      const transitionType = nextVideoClip.transition?.type || 'fade'

      // Apply transition effects to outgoing clip
      switch (transitionType) {
        case 'fade':
        case 'dissolve':
          currentElement.style.opacity = String(1 - transitionProgress)
          break
        case 'slide-left':
          currentElement.style.transform = `translateX(-${transitionProgress * 100}%)`
          break
        case 'slide-right':
          currentElement.style.transform = `translateX(${transitionProgress * 100}%)`
          break
        case 'zoom':
          // Zoom out effect - scale up to 1.5x and fade out
          currentElement.style.transform = `scale(${1 + transitionProgress * 0.5})`
          currentElement.style.opacity = String(1 - transitionProgress)
          break
        case 'wipe':
          currentElement.style.clipPath = `inset(0 ${transitionProgress * 100}% 0 0)`
          break
      }
    }

    if (currentMediaFile.type === 'image') {
      currentElement.innerHTML = `
        <img src="${currentMediaFile.url}" alt="${currentMediaFile.name}" class="w-full h-full object-contain" />
      `
    } else if (currentMediaFile.type === 'video') {
      currentElement.innerHTML = `
        <video src="${currentMediaFile.url}" class="w-full h-full object-contain" controls />
      `
    }
    previewCanvas.appendChild(currentElement)

    // Render next clip during transition
    if (isInTransition && nextVideoClip) {
      const nextMediaFile = nextVideoClip.content as MediaFile
      const nextElement = document.createElement('div')
      nextElement.className = 'absolute inset-0 flex items-center justify-center transition-all duration-100'
      nextElement.style.transformOrigin = 'center center'

      const transitionType = nextVideoClip.transition?.type || 'fade'

      // Apply transition effects to incoming clip
      switch (transitionType) {
        case 'fade':
        case 'dissolve':
          nextElement.style.opacity = String(transitionProgress)
          break
        case 'slide-left':
          nextElement.style.transform = `translateX(${(1 - transitionProgress) * 100}%)`
          break
        case 'slide-right':
          nextElement.style.transform = `translateX(-${(1 - transitionProgress) * 100}%)`
          break
        case 'zoom':
          // Zoom in effect - scale from 0.5x to 1x and fade in
          nextElement.style.transform = `scale(${0.5 + transitionProgress * 0.5})`
          nextElement.style.opacity = String(transitionProgress)
          break
        case 'wipe':
          nextElement.style.clipPath = `inset(0 0 0 ${(1 - transitionProgress) * 100}%)`
          break
      }

      if (nextMediaFile.type === 'image') {
        nextElement.innerHTML = `
          <img src="${nextMediaFile.url}" alt="${nextMediaFile.name}" class="w-full h-full object-contain" />
        `
      } else if (nextMediaFile.type === 'video') {
        nextElement.innerHTML = `
          <video src="${nextMediaFile.url}" class="w-full h-full object-contain" controls />
        `
      }
      previewCanvas.appendChild(nextElement)
    }

    // Overlay text clips (textClips already defined at top of useEffect)
    textClips.forEach((clip) => {
      // Calculate text clip timing
      let textAccumulated = 0
      const textContent = clip.content as TextContent

      // Check if this text clip should be visible at current time
      for (const c of textClips) {
        if (c.id === clip.id) {
          if (currentTime >= textAccumulated && currentTime < textAccumulated + clip.duration) {
            // This text should be visible
            const textDiv = document.createElement('div')
            textDiv.dataset.clipId = clip.id

            // Handle custom positioning or preset positions
            if (textContent.position === 'custom' && textContent.customX !== undefined && textContent.customY !== undefined) {
              textDiv.className = 'absolute z-10 cursor-move'
              textDiv.style.left = `${textContent.customX}px`
              textDiv.style.top = `${textContent.customY}px`
            } else {
              const positionClass =
                textContent.position === 'top' ? 'top-8' :
                textContent.position === 'bottom' ? 'bottom-8' :
                'top-1/2 -translate-y-1/2'

              const alignClass =
                textContent.alignment === 'left' ? 'text-left' :
                textContent.alignment === 'right' ? 'text-right' :
                'text-center'

              textDiv.className = `absolute left-0 right-0 ${positionClass} px-8 ${alignClass} z-10 cursor-move`
            }

            // Create editable text element
            const textP = document.createElement('p')
            textP.contentEditable = 'true'
            textP.spellcheck = false
            textP.textContent = textContent.text
            textP.style.cssText = `
              color: ${textContent.color};
              font-size: ${textContent.fontSize}px;
              font-family: ${textContent.fontFamily};
              background-color: ${textContent.backgroundColor || 'transparent'};
              padding: 8px 16px;
              display: inline-block;
              border-radius: 4px;
              text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
              outline: 2px dashed transparent;
              transition: outline 0.2s;
              cursor: text;
              min-width: 50px;
            `

            // Focus outline
            textP.addEventListener('focus', () => {
              textP.style.outline = '2px dashed rgba(59, 130, 246, 0.5)'
            })

            textP.addEventListener('blur', () => {
              textP.style.outline = '2px dashed transparent'
              // Save text changes
              const newText = textP.textContent || ''
              const updatedClips = clips.map(c => {
                if (c.id === clip.id && c.content.type === 'text') {
                  return {
                    ...c,
                    content: {
                      ...c.content,
                      text: newText,
                    }
                  }
                }
                return c
              })
              onClipsChange?.(updatedClips)
            })

            // Prevent Enter key from adding newlines
            textP.addEventListener('keydown', (e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                textP.blur()
              }
            })

            textDiv.appendChild(textP)

            // Add drag functionality (only on text container, not the text itself)
            let isDragging = false
            let dragStarted = false
            let startX = 0
            let startY = 0
            let initialX = 0
            let initialY = 0

            const handleMouseDown = (e: MouseEvent) => {
              // Don't start drag if clicking on the text element itself
              if (e.target === textP) return

              e.preventDefault()
              isDragging = true
              dragStarted = false
              startX = e.clientX
              startY = e.clientY
              const rect = textDiv.getBoundingClientRect()
              initialX = rect.left
              initialY = rect.top
            }

            const handleMouseMove = (e: MouseEvent) => {
              if (!isDragging) return

              const deltaX = e.clientX - startX
              const deltaY = e.clientY - startY

              // Only start dragging after moving 5px (prevents accidental drags)
              if (!dragStarted && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
                dragStarted = true
                textDiv.style.cursor = 'grabbing'
                textP.contentEditable = 'false'
              }

              if (dragStarted) {
                const newX = initialX + deltaX
                const newY = initialY + deltaY

                // Update position
                textDiv.style.left = `${newX}px`
                textDiv.style.top = `${newY}px`
                textDiv.className = 'absolute z-10'
              }
            }

            const handleMouseUp = (e: MouseEvent) => {
              if (!isDragging) return

              if (dragStarted) {
                const deltaX = e.clientX - startX
                const deltaY = e.clientY - startY
                const finalX = initialX + deltaX
                const finalY = initialY + deltaY

                // Update clip with custom position
                const updatedClips = clips.map(c => {
                  if (c.id === clip.id && c.content.type === 'text') {
                    return {
                      ...c,
                      content: {
                        ...c.content,
                        position: 'custom' as const,
                        customX: Math.max(0, finalX),
                        customY: Math.max(0, finalY),
                      }
                    }
                  }
                  return c
                })
                onClipsChange?.(updatedClips)
              }

              isDragging = false
              dragStarted = false
              textDiv.style.cursor = 'move'
              textP.contentEditable = 'true'
            }

            textDiv.addEventListener('mousedown', handleMouseDown)
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)

            previewCanvas.appendChild(textDiv)
          }
          break
        }
        textAccumulated += c.duration
      }
    })
  }, [currentTime, clips, onClipsChange])

  // Audio playback synchronization
  useEffect(() => {
    const audioClips = clips.filter(c => c.track === 'audio').sort((a, b) => a.order - b.order)

    if (!isPlaying || audioClips.length === 0) {
      // Stop audio when not playing
      if (audioElement) {
        audioElement.pause()
        setAudioElement(null)
      }
      return
    }

    // Find which audio clip should be playing at currentTime
    let accumulatedTime = 0
    let currentAudioClip: TimelineClip | null = null
    let clipStartTime = 0

    for (const clip of audioClips) {
      if (currentTime >= accumulatedTime && currentTime < accumulatedTime + clip.duration) {
        currentAudioClip = clip
        clipStartTime = accumulatedTime
        break
      }
      accumulatedTime += clip.duration
    }

    if (!currentAudioClip) {
      // No audio at this point, stop playback
      if (audioElement) {
        audioElement.pause()
        setAudioElement(null)
      }
      return
    }

    const mediaFile = currentAudioClip.content as MediaFile

    // If audio element doesn't exist or is different clip, create new one
    // Compare URLs properly (audioElement.src is absolute, mediaFile.url might be relative)
    const currentSrc = audioElement?.src || ''
    const newSrc = mediaFile.url.startsWith('http') ? mediaFile.url : window.location.origin + mediaFile.url

    if (!audioElement || currentSrc !== newSrc) {
      if (audioElement) {
        audioElement.pause()
      }

      const audio = new Audio(mediaFile.url)
      audio.volume = 0.5 // 50% volume

      // Calculate position within the clip
      const positionInClip = currentTime - clipStartTime
      audio.currentTime = Math.max(0, positionInClip)

      audio.play().catch(err => {
        console.error('Audio playback error:', err)
      })

      setAudioElement(audio)
    } else {
      // Sync existing audio element
      const positionInClip = currentTime - clipStartTime
      const timeDiff = Math.abs(audioElement.currentTime - positionInClip)

      // Resync if off by more than 0.1s
      if (timeDiff > 0.1) {
        audioElement.currentTime = positionInClip
      }

      // Ensure it's playing
      if (audioElement.paused) {
        audioElement.play().catch(err => {
          console.error('Audio playback error:', err)
        })
      }
    }

    // Cleanup on unmount
    return () => {
      if (audioElement && !isPlaying) {
        audioElement.pause()
      }
    }
  }, [currentTime, isPlaying, clips, audioElement])

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

  const renderTrackClips = (track: 'video' | 'audio' | 'text') => {
    const trackClips = clips.filter(c => c.track === track).sort((a, b) => a.order - b.order)

    return trackClips.map((clip, index) => {
      const startTime = trackClips.slice(0, index).reduce((sum, c) => sum + c.duration, 0)
      const left = startTime * PIXELS_PER_SECOND
      const width = clip.duration * PIXELS_PER_SECOND

      // Handle text clips
      if (clip.content.type === 'text') {
        const textContent = clip.content as TextContent
        const isSelected = selectedClipId === clip.id
        return (
          <div
            key={clip.id}
            className={`absolute h-16 bg-gradient-to-br from-orange-600 to-orange-800 rounded border-2 ${
              isSelected ? 'border-white ring-2 ring-orange-300' : 'border-orange-500'
            } overflow-hidden group hover:border-orange-300 transition-all shadow-lg cursor-pointer`}
            style={{
              left: `${left}px`,
              width: `${width}px`,
              top: '8px',
            }}
            onClick={() => onClipSelect?.(clip.id)}
          >
            {/* Text icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Type className="w-8 h-8 text-white" />
            </div>

            {/* Info overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-1.5">
                <p className="text-xs text-white truncate font-medium">{textContent.text}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-300">{clip.duration.toFixed(1)}s</p>
                  {clip.transition && (
                    <span className="text-xs px-1.5 py-0.5 bg-purple-600 text-white rounded font-medium">
                      {clip.transition.type}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Resize Handles */}
            <div
              className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize bg-transparent hover:bg-white/50 hover:shadow-lg transition-all z-10 border-l-2 border-transparent hover:border-white"
              onMouseDown={(e) => handleResizeStart(e, clip.id, 'left')}
              title="◀ Drag to resize duration"
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize bg-transparent hover:bg-white/50 hover:shadow-lg transition-all z-10 border-r-2 border-transparent hover:border-white"
              onMouseDown={(e) => handleResizeStart(e, clip.id, 'right')}
              title="Drag to resize duration ▶"
            />

            {/* Editing Tools */}
            <div className="absolute top-0.5 right-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 bg-purple-600 hover:bg-purple-700 text-white rounded"
                onClick={(e) => {
                  e.stopPropagation()
                  const transitions = ['none', 'fade', 'dissolve', 'slide-left', 'slide-right', 'wipe', 'zoom']
                  const current = clip.transition?.type || 'none'
                  const currentIndex = transitions.indexOf(current)
                  const nextIndex = (currentIndex + 1) % transitions.length
                  updateClipTransition(clip.id, transitions[nextIndex])
                }}
                title="Change transition effect"
              >
                <Sparkles className="w-3 h-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 bg-blue-600 hover:bg-blue-700 text-white rounded"
                onClick={(e) => {
                  e.stopPropagation()
                  splitClip(clip.id)
                }}
                title="Split clip"
              >
                <Scissors className="w-3 h-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 bg-red-600 hover:bg-red-700 text-white rounded"
                onClick={(e) => {
                  e.stopPropagation()
                  removeClip(clip.id)
                }}
                title="Delete clip"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )
      }

      // Handle media clips (video/audio)
      const mediaFile = clip.content as MediaFile
      const isSelected = selectedClipId === clip.id

      return (
        <div
          key={clip.id}
          className={`absolute h-16 bg-gray-800 rounded border-2 ${
            isSelected ? 'border-white ring-2 ring-blue-300' : 'border-gray-600'
          } overflow-hidden group hover:border-blue-400 transition-all shadow-lg cursor-pointer`}
          style={{
            left: `${left}px`,
            width: `${width}px`,
            top: '8px',
          }}
          onClick={() => onClipSelect?.(clip.id)}
        >
          {/* Thumbnail background */}
          {mediaFile.type === 'image' && (
            <Image
              src={mediaFile.url}
              alt={mediaFile.name}
              fill
              className="object-cover opacity-70"
              unoptimized
            />
          )}
          {mediaFile.type === 'video' && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
              <VideoIcon className="w-8 h-8 text-white" />
            </div>
          )}
          {mediaFile.type === 'audio' && (
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
              <Music className="w-8 h-8 text-white" />
            </div>
          )}

          {/* Info overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
            <div className="absolute bottom-0 left-0 right-0 p-1.5">
              <p className="text-xs text-white truncate font-medium">{mediaFile.name}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-300">{clip.duration.toFixed(1)}s</p>
                {clip.transition && (
                  <span className="text-xs px-1.5 py-0.5 bg-purple-600 text-white rounded font-medium uppercase">
                    {clip.transition.type}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Resize Handles */}
          <div
            className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize bg-transparent hover:bg-white/50 hover:shadow-lg transition-all z-10 border-l-2 border-transparent hover:border-white"
            onMouseDown={(e) => handleResizeStart(e, clip.id, 'left')}
            title="◀ Drag to resize duration"
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize bg-transparent hover:bg-white/50 hover:shadow-lg transition-all z-10 border-r-2 border-transparent hover:border-white"
            onMouseDown={(e) => handleResizeStart(e, clip.id, 'right')}
            title="Drag to resize duration ▶"
          />

          {/* Editing Tools */}
          <div className="absolute top-0.5 right-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            {/* Transition button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 bg-purple-600 hover:bg-purple-700 text-white rounded"
              onClick={(e) => {
                e.stopPropagation()
                const transitions = ['none', 'fade', 'dissolve', 'slide-left', 'slide-right', 'wipe', 'zoom']
                const current = clip.transition?.type || 'none'
                const currentIndex = transitions.indexOf(current)
                const nextIndex = (currentIndex + 1) % transitions.length
                updateClipTransition(clip.id, transitions[nextIndex])
              }}
              title="Change transition effect"
            >
              <Sparkles className="w-3 h-3" />
            </Button>

            {/* Split button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 bg-blue-600 hover:bg-blue-700 text-white rounded"
              onClick={(e) => {
                e.stopPropagation()
                splitClip(clip.id)
              }}
              title="Split clip"
            >
              <Scissors className="w-3 h-3" />
            </Button>

            {/* Delete button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 bg-red-600 hover:bg-red-700 text-white rounded"
              onClick={(e) => {
                e.stopPropagation()
                removeClip(clip.id)
              }}
              title="Delete clip"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
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

          {/* Clip Editing Toolbar */}
          <div className="flex items-center gap-1 border-l pl-3 ml-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-xs font-medium text-gray-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => selectedClipId && splitClip(selectedClipId)}
              disabled={!selectedClipId}
              title="Split selected clip"
            >
              <Scissors className="w-3.5 h-3.5 mr-1" />
              Split
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => selectedClipId && removeClip(selectedClipId)}
              disabled={!selectedClipId}
              title="Delete selected clip"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Delete
            </Button>
          </div>

          <div className="flex items-center gap-1 border-l pl-3 ml-1">
            <span className="text-xs text-gray-500">💡 Drag clip edges to resize</span>
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
          <div className="h-16 flex items-center justify-center border-b border-gray-200">
            <div className="flex flex-col items-center gap-1">
              <Type className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-gray-700 font-medium">TEXT</span>
            </div>
          </div>
        </div>

        {/* Track Content */}
        <div ref={timelineRef} className="flex-1 overflow-x-auto overflow-y-hidden">
          <div
            className="relative h-full"
            style={{
              minWidth: `${Math.max(getTotalDuration() * PIXELS_PER_SECOND + 500, 1600)}px`,
              width: `${Math.max(getTotalDuration() * PIXELS_PER_SECOND + 500, 1600)}px`
            }}
          >
            {/* Time Ruler */}
            <div className="h-10 bg-gray-50 border-b border-gray-200 relative">
              <div className="absolute inset-0 pl-2">{generateTimeRulerTicks()}</div>
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

            {/* Text Track */}
            <div
              className={`h-16 bg-orange-50 border-b border-gray-200 relative ${isDraggingOver === 'text' ? 'bg-orange-100 ring-2 ring-orange-400' : ''}`}
            >
              {clips.filter(c => c.track === 'text').length === 0 ? (
                <div className="h-full flex items-center justify-between px-3">
                  <p className="text-xs text-gray-500 font-medium">📝 Text overlays & captions</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs bg-orange-600 text-white hover:bg-orange-700 border-orange-600"
                    onClick={addTextClip}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Text
                  </Button>
                </div>
              ) : (
                <>
                  <div className="absolute inset-0">{renderTrackClips('text')}</div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 text-xs bg-orange-600 text-white hover:bg-orange-700 border-orange-600 z-10"
                    onClick={addTextClip}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Text
                  </Button>
                </>
              )}
            </div>

            {/* Playhead - Draggable */}
            <div
              className="absolute top-10 bottom-0 w-0.5 bg-red-500 z-20 cursor-ew-resize"
              style={{ left: `${currentTime * PIXELS_PER_SECOND}px` }}
              onMouseDown={handlePlayheadMouseDown}
            >
              <div
                className="absolute -top-2 -left-2 w-4 h-4 cursor-ew-resize"
                onMouseDown={handlePlayheadMouseDown}
              >
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-red-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
