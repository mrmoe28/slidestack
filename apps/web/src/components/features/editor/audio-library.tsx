'use client'

import { useState } from 'react'
import { Music, Play, Pause, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface AudioTrack {
  id: string
  name: string
  duration: number
  url: string
  category: string
}

const AUDIO_TRACKS: AudioTrack[] = [
  // Energetic & Upbeat
  {
    id: 'happy-upbeat-1',
    name: 'Happy Upbeat',
    duration: 295,
    url: '/sample-audio/happy-upbeat-1.mp3',
    category: 'Upbeat',
  },
  {
    id: 'soundhelix-1',
    name: 'Upbeat Energy',
    duration: 359,
    url: '/sample-audio/sample-music-1.mp3',
    category: 'Energetic',
  },

  // Ambient & Calm
  {
    id: 'relaxing-calm-1',
    name: 'Relaxing Calm',
    duration: 348,
    url: '/sample-audio/relaxing-calm-1.mp3',
    category: 'Calm',
  },
  {
    id: 'soundhelix-2',
    name: 'Smooth Ambient',
    duration: 325,
    url: '/sample-audio/sample-music-2.mp3',
    category: 'Ambient',
  },
  {
    id: 'soundhelix-3',
    name: 'Chill Vibes',
    duration: 279,
    url: '/sample-audio/sample-music-3.mp3',
    category: 'Chill',
  },

  // Corporate & Professional
  {
    id: 'corporate-motivational-1',
    name: 'Corporate Motivational',
    duration: 281,
    url: '/sample-audio/corporate-motivational-1.mp3',
    category: 'Corporate',
  },

  // Cinematic & Epic
  {
    id: 'cinematic-epic-1',
    name: 'Cinematic Epic',
    duration: 423,
    url: '/sample-audio/cinematic-epic-1.mp3',
    category: 'Cinematic',
  },
]

export function AudioLibrary() {
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  const handlePlayPause = (track: AudioTrack) => {
    if (playingTrackId === track.id) {
      // Pause current track
      audioElement?.pause()
      setPlayingTrackId(null)
      setAudioElement(null)
    } else {
      // Stop previous track if any
      audioElement?.pause()

      // Play new track
      const audio = new Audio(track.url)
      audio.volume = 0.5 // Set to 50% volume for preview
      audio.play()
      setAudioElement(audio)
      setPlayingTrackId(track.id)

      // Reset when track ends
      audio.onended = () => {
        setPlayingTrackId(null)
        setAudioElement(null)
      }
    }
  }

  const handleAddToTimeline = (track: AudioTrack) => {
    // Create a media file object compatible with timeline
    const mediaFile = {
      id: track.id,
      name: track.name,
      type: 'audio',
      url: track.url,
      duration: track.duration,
      size: 0, // Not applicable for preset tracks
      mimeType: 'audio/mpeg',
    }

    // Trigger drag start programmatically
    const dragData = JSON.stringify(mediaFile)

    // Store in sessionStorage for timeline to pick up
    sessionStorage.setItem('pendingAudioTrack', dragData)

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('audioTrackSelected', { detail: mediaFile }))
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Audio Library</h3>
        <Music className="w-4 h-4 text-gray-500" />
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {AUDIO_TRACKS.map((track) => (
          <Card
            key={track.id}
            className="p-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Music className="w-3 h-3 text-purple-600 flex-shrink-0" />
                  <p className="text-sm font-medium text-gray-900 truncate">{track.name}</p>
                </div>
                <p className="text-xs text-gray-500">{track.category} • {formatDuration(track.duration)}</p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handlePlayPause(track)}
                  title={playingTrackId === track.id ? 'Pause' : 'Preview'}
                >
                  {playingTrackId === track.id ? (
                    <Pause className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                  onClick={() => handleAddToTimeline(track)}
                  title="Add to timeline"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {playingTrackId === track.id && (
              <div className="mt-2 pt-2 border-t">
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full animate-pulse w-1/3" />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="pt-2 border-t">
        <p className="text-xs text-gray-500 italic">
          Royalty-free music from SoundHelix
        </p>
      </div>
    </div>
  )
}
