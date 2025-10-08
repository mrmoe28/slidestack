'use client'

import { useState } from 'react'
import { Download, Share2, Play, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface RenderedVideo {
  id: string
  title: string
  description: string | null
  outputUrl: string
  createdAt: Date
}

interface RenderedVideosProps {
  videos: RenderedVideo[]
}

export function RenderedVideos({ videos }: RenderedVideosProps) {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleDownload = async (video: RenderedVideo) => {
    try {
      const response = await fetch(video.outputUrl)
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${video.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_slideshow.mp4`
      document.body.appendChild(a)
      a.click()

      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Download started', {
        description: 'Your video is downloading to your Downloads folder.',
      })
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Download failed', {
        description: 'Could not download the video. Please try again.',
      })
    }
  }

  const handleShare = async (video: RenderedVideo) => {
    const shareUrl = video.outputUrl
    const shareText = `Check out my video: ${video.title}`

    // Try native Web Share API first (mobile-friendly)
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: shareText,
          url: shareUrl,
        })
        toast.success('Shared successfully')
      } catch (error) {
        // User cancelled share
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error)
        }
      }
    } else {
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        setCopiedId(video.id)
        setTimeout(() => setCopiedId(null), 2000)
        toast.success('Link copied to clipboard', {
          description: 'Share this link with anyone!',
        })
      } catch (error) {
        console.error('Copy failed:', error)
        toast.error('Failed to copy link')
      }
    }
  }

  if (videos.length === 0) {
    return null
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Rendered Videos</h2>
          <p className="text-sm text-gray-600">Your completed video slideshows</p>
        </div>
        <span className="text-sm text-gray-500">{videos.length} video{videos.length > 1 ? 's' : ''}</span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-video bg-gray-900">
              {playingVideo === video.id ? (
                <video
                  src={video.outputUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                  onEnded={() => setPlayingVideo(null)}
                />
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Button
                    size="lg"
                    className="relative z-10 rounded-full w-16 h-16 bg-white/90 hover:bg-white text-gray-900"
                    onClick={() => setPlayingVideo(video.id)}
                  >
                    <Play className="w-8 h-8 fill-current" />
                  </Button>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{video.title}</h3>
              {video.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDownload(video)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleShare(video)}
                >
                  {copiedId === video.id ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Share2 className="w-4 h-4 mr-2" />
                  )}
                  {copiedId === video.id ? 'Copied!' : 'Share'}
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Completed {new Date(video.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
