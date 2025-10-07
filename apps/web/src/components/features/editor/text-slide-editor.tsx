'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Type } from 'lucide-react'

interface TextSlideEditorProps {
  onAddTextSlide?: (slide: TextSlideData) => void
}

export interface TextSlideData {
  id: string
  type: 'text'
  text: string
  font: string
  fontSize: number
  textColor: string
  backgroundColor: string
  duration: number
}

const FONTS = [
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
  { name: 'Times New Roman', value: '"Times New Roman", serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Courier New', value: '"Courier New", monospace' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
  { name: 'Impact', value: 'Impact, sans-serif' },
  { name: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { name: 'Palatino', value: '"Palatino Linotype", serif' },
]

export function TextSlideEditor({ onAddTextSlide }: TextSlideEditorProps) {
  const [text, setText] = useState('')
  const [font, setFont] = useState(FONTS[0].value)
  const [fontSize, setFontSize] = useState(48)
  const [textColor, setTextColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [duration, setDuration] = useState(3)

  const [createdSlides, setCreatedSlides] = useState<TextSlideData[]>([])

  const handleAddSlide = () => {
    if (!text.trim()) return

    const textSlide: TextSlideData = {
      id: `text-${Date.now()}`,
      type: 'text',
      text,
      font,
      fontSize,
      textColor,
      backgroundColor,
      duration,
    }

    setCreatedSlides([...createdSlides, textSlide])

    if (onAddTextSlide) {
      onAddTextSlide(textSlide)
    }

    // Reset form
    setText('')
  }

  const removeSlide = (id: string) => {
    setCreatedSlides(createdSlides.filter(s => s.id !== id))
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Type className="w-4 h-4" />
          Text Slide
        </h3>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="text-content" className="text-xs">Text Content</Label>
          <Input
            id="text-content"
            placeholder="Enter your text..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="font" className="text-xs">Font</Label>
            <select
              id="font"
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="w-full mt-1 text-sm border rounded-md px-2 py-1.5"
            >
              {FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="fontSize" className="text-xs">Size</Label>
            <Input
              id="fontSize"
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value) || 48)}
              min={12}
              max={120}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="textColor" className="text-xs">Text Color</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="textColor"
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="h-9 w-12 p-1"
              />
              <Input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bgColor" className="text-xs">Background</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="bgColor"
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="h-9 w-12 p-1"
              />
              <Input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="duration" className="text-xs">Duration (seconds)</Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 3)}
            min={1}
            max={30}
            className="mt-1"
          />
        </div>

        {/* Preview */}
        <div>
          <Label className="text-xs">Preview</Label>
          <div
            className="mt-1 h-24 rounded-lg flex items-center justify-center p-4 border"
            style={{
              backgroundColor,
              color: textColor,
              fontFamily: font,
              fontSize: `${Math.min(fontSize / 2, 24)}px`,
            }}
          >
            <p className="text-center line-clamp-3">{text || 'Your text will appear here...'}</p>
          </div>
        </div>

        <Button
          onClick={handleAddSlide}
          disabled={!text.trim()}
          className="w-full"
          size="sm"
        >
          <Type className="w-4 h-4 mr-2" />
          Add Text Slide
        </Button>
      </div>

      {/* Created Text Slides */}
      {createdSlides.length > 0 && (
        <div className="space-y-2 pt-4 border-t">
          <h4 className="text-xs font-semibold text-gray-700 uppercase">
            Text Slides ({createdSlides.length})
          </h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {createdSlides.map((slide) => (
              <div
                key={slide.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify(slide))
                  e.dataTransfer.effectAllowed = 'copy'
                }}
                className="relative p-3 rounded-lg border bg-white hover:bg-gray-50 cursor-move"
                style={{
                  backgroundColor: slide.backgroundColor,
                  borderColor: slide.textColor,
                  borderWidth: '2px',
                }}
              >
                <div className="flex items-start gap-2">
                  <Type className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: slide.textColor }} />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{
                        color: slide.textColor,
                        fontFamily: slide.font,
                      }}
                    >
                      {slide.text}
                    </p>
                    <p className="text-xs mt-1" style={{ color: slide.textColor, opacity: 0.7 }}>
                      {slide.duration}s • {slide.font.split(',')[0]}
                    </p>
                  </div>
                  <button
                    onClick={() => removeSlide(slide.id)}
                    className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
                    aria-label="Remove slide"
                  >
                    <svg
                      className="w-4 h-4"
                      style={{ color: slide.textColor }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
