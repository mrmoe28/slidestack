'use client'

import { useState, useEffect, useRef } from 'react'
import { Music, Play, Pause, Plus, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface AudioTrack {
  id: string
  name: string
  duration: number
  url: string
  category: string
  isCustom?: boolean
}

interface AudioLibraryProps {
  projectId: string
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

export function AudioLibrary({ projectId }: AudioLibraryProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [customTracks, setCustomTracks] = useState<AudioTrack[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch user-uploaded audio files
  useEffect(() => {
    const fetchAudioFiles = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/projects/${projectId}/media`)

        if (!response.ok) throw new Error('Failed to fetch audio files')

        const data = await response.json()

        // Filter only audio files
        const audioFiles: AudioTrack[] = data.files
          .filter((file: any) => file.type.startsWith('audio/'))
          .map((file: any) => ({
            id: file.id,
            name: file.filename,
            duration: file.duration || 0,
            url: file.url,
            category: 'Custom',
            isCustom: true,
          }))

        setCustomTracks(audioFiles)
      } catch (error) {
        console.error('Failed to fetch audio files:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAudioFiles()
  }, [projectId])

  const handlePlayPause = async (track: AudioTrack) => {
    if (playingTrackId === track.id) {
      // Pause current track
      audioElement?.pause()
      setPlayingTrackId(null)
      setAudioElement(null)
    } else {
      // Stop previous track if any
      if (audioElement) {
        audioElement.pause()
        audioElement.currentTime = 0
      }

      // Play new track
      const audio = new Audio(track.url)
      audio.volume = 0.5 // Set to 50% volume for preview

      try {
        // Wait for audio to be ready and play
        await audio.play()
        setAudioElement(audio)
        setPlayingTrackId(track.id)

        // Reset when track ends
        audio.onended = () => {
          setPlayingTrackId(null)
          setAudioElement(null)
        }

        // Handle errors during playback
        audio.onerror = () => {
          console.error('Audio playback error:', track.url)
          setPlayingTrackId(null)
          setAudioElement(null)
        }
      } catch (error) {
        console.error('Failed to play audio:', error)
        setPlayingTrackId(null)
        setAudioElement(null)
      }
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      const file = files[0]

      // Validate file type
      if (!file.type.startsWith('audio/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an audio file (MP3, WAV, OGG, etc.)',
          variant: 'destructive',
        })
        return
      }

      // Upload file
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)
      formData.append('order', String(customTracks.length))

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()

      // Add to custom tracks
      const newTrack: AudioTrack = {
        id: data.file.id,
        name: data.file.filename,
        duration: data.file.duration || 0,
        url: data.file.url,
        category: 'Custom',
        isCustom: true,
      }

      setCustomTracks((prev) => [newTrack, ...prev])

      toast({
        title: 'Audio uploaded',
        description: 'Your audio file has been uploaded successfully.',
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload audio file. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
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

  // Combine custom tracks and preset tracks
  const allTracks = [...customTracks, ...AUDIO_TRACKS]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Audio Library</h3>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-7"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Upload className="w-3 h-3" />
          )}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {allTracks.map((track) => (
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
      )}

      <div className="pt-2 border-t">
        <p className="text-xs text-gray-500 italic">
          {customTracks.length > 0 ? `${customTracks.length} custom track${customTracks.length > 1 ? 's' : ''} • ` : ''}Royalty-free music from SoundHelix
        </p>
      </div>
    </div>
  )
}
