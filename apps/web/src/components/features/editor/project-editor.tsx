'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Image, Type, Music, Scissors, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface ProjectEditorProps {
  projectId: string
  projectTitle: string
}

interface Slide {
  id: string
  type: 'image' | 'video' | 'text'
  duration: number
  content?: string
}

export function ProjectEditor({ projectId: _projectId, projectTitle: _projectTitle }: ProjectEditorProps) {
  const [slides, setSlides] = useState<Slide[]>([])
  const [selectedSlide, setSelectedSlide] = useState<string | null>(null)

  const addSlide = (type: Slide['type']) => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      type,
      duration: 3,
    }
    setSlides([...slides, newSlide])
  }

  const deleteSlide = (id: string) => {
    setSlides(slides.filter(s => s.id !== id))
    if (selectedSlide === id) {
      setSelectedSlide(null)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Editing Toolbar */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Add Slide</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col h-auto py-3 gap-1"
              onClick={() => addSlide('image')}
            >
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image className="w-5 h-5" />
              <span className="text-xs">Image</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col h-auto py-3 gap-1"
              onClick={() => addSlide('video')}
            >
              <Upload className="w-5 h-5" />
              <span className="text-xs">Video</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col h-auto py-3 gap-1"
              onClick={() => addSlide('text')}
            >
              <Type className="w-5 h-5" />
              <span className="text-xs">Text</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col h-auto py-3 gap-1"
            >
              <Music className="w-5 h-5" />
              <span className="text-xs">Audio</span>
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Transitions</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              <Scissors className="w-4 h-4 mr-1" />
              <span className="text-xs">Fade</span>
            </Button>
            <Button variant="outline" size="sm">
              <Scissors className="w-4 h-4 mr-1" />
              <span className="text-xs">Slide</span>
            </Button>
            <Button variant="outline" size="sm">
              <Scissors className="w-4 h-4 mr-1" />
              <span className="text-xs">Zoom</span>
            </Button>
            <Button variant="outline" size="sm">
              <Scissors className="w-4 h-4 mr-1" />
              <span className="text-xs">None</span>
            </Button>
          </div>
        </div>

        {slides.length > 0 && (
          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Slides ({slides.length})</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {slides.map((slide, index) => (
                <Card
                  key={slide.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedSlide === slide.id
                      ? 'bg-indigo-50 border-indigo-300'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedSlide(slide.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line jsx-a11y/alt-text */}
                      {slide.type === 'image' && <Image className="w-4 h-4 text-gray-600" />}
                      {slide.type === 'video' && <Upload className="w-4 h-4 text-gray-600" />}
                      {slide.type === 'text' && <Type className="w-4 h-4 text-gray-600" />}
                      <div>
                        <p className="text-sm font-medium">Slide {index + 1}</p>
                        <p className="text-xs text-gray-500">{slide.duration}s</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSlide(slide.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
