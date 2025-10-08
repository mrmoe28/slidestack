'use client'

import { useEffect, useState } from 'react'
import { Type, AlignLeft, AlignCenter, AlignRight, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { TextContent, TimelineClip } from '@/types/timeline'

interface TextEditorPanelProps {
  selectedClip: TimelineClip | null
  onUpdate: (clipId: string, updates: Partial<TextContent>) => void
}

const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Courier New',
  'Verdana',
  'Impact',
  'Comic Sans MS',
]

const FONT_SIZES = [12, 16, 20, 24, 32, 40, 48, 56, 64, 72, 96]

const POSITIONS = [
  { value: 'top', label: 'Top' },
  { value: 'center', label: 'Center' },
  { value: 'bottom', label: 'Bottom' },
]

const ALIGNMENTS = [
  { value: 'left', icon: AlignLeft, label: 'Left' },
  { value: 'center', icon: AlignCenter, label: 'Center' },
  { value: 'right', icon: AlignRight, label: 'Right' },
]

export function TextEditorPanel({ selectedClip, onUpdate }: TextEditorPanelProps) {
  const [text, setText] = useState('')
  const [fontSize, setFontSize] = useState(48)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [color, setColor] = useState('#FFFFFF')
  const [backgroundColor, setBackgroundColor] = useState('rgba(0, 0, 0, 0.5)')
  const [position, setPosition] = useState<'top' | 'center' | 'bottom' | 'custom'>('center')
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center')

  useEffect(() => {
    if (selectedClip && selectedClip.content.type === 'text') {
      const textContent = selectedClip.content as TextContent
      setText(textContent.text)
      setFontSize(textContent.fontSize)
      setFontFamily(textContent.fontFamily)
      setColor(textContent.color)
      setBackgroundColor(textContent.backgroundColor || 'rgba(0, 0, 0, 0.5)')
      // Handle custom position by defaulting to center
      setPosition(textContent.position === 'custom' ? 'center' : textContent.position)
      setAlignment(textContent.alignment)
    }
  }, [selectedClip])

  const handleUpdate = (updates: Partial<TextContent>) => {
    if (selectedClip) {
      onUpdate(selectedClip.id, updates)
    }
  }

  if (!selectedClip || selectedClip.content.type !== 'text') {
    return (
      <Card className="p-4">
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <Type className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">
            Select a text clip to edit its properties
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
      <div className="flex items-center gap-2 pb-3 border-b">
        <Type className="w-5 h-5 text-orange-600" />
        <h3 className="font-semibold text-gray-900">Text Properties</h3>
      </div>

      {/* Text Content */}
      <div className="space-y-2">
        <Label htmlFor="text-content" className="text-xs font-medium text-gray-700">
          Text Content
        </Label>
        <textarea
          id="text-content"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            handleUpdate({ text: e.target.value })
          }}
          className="w-full min-h-[80px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Enter your text here..."
        />
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <Label htmlFor="font-family" className="text-xs font-medium text-gray-700">
          Font Family
        </Label>
        <select
          id="font-family"
          value={fontFamily}
          onChange={(e) => {
            setFontFamily(e.target.value)
            handleUpdate({ fontFamily: e.target.value })
          }}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <Label htmlFor="font-size" className="text-xs font-medium text-gray-700">
          Font Size: {fontSize}px
        </Label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            id="font-size"
            min="12"
            max="96"
            step="4"
            value={fontSize}
            onChange={(e) => {
              const size = parseInt(e.target.value)
              setFontSize(size)
              handleUpdate({ fontSize: size })
            }}
            className="flex-1"
          />
          <select
            value={fontSize}
            onChange={(e) => {
              const size = parseInt(e.target.value)
              setFontSize(size)
              handleUpdate({ fontSize: size })
            }}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md"
          >
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Text Color */}
      <div className="space-y-2">
        <Label htmlFor="text-color" className="text-xs font-medium text-gray-700">
          Text Color
        </Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            id="text-color"
            value={color}
            onChange={(e) => {
              setColor(e.target.value)
              handleUpdate({ color: e.target.value })
            }}
            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
          />
          <Input
            type="text"
            value={color}
            onChange={(e) => {
              setColor(e.target.value)
              handleUpdate({ color: e.target.value })
            }}
            className="flex-1 text-sm"
            placeholder="#FFFFFF"
          />
        </div>
      </div>

      {/* Background Color */}
      <div className="space-y-2">
        <Label htmlFor="bg-color" className="text-xs font-medium text-gray-700">
          Background Color
        </Label>
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-gray-500" />
          <Input
            type="text"
            id="bg-color"
            value={backgroundColor}
            onChange={(e) => {
              setBackgroundColor(e.target.value)
              handleUpdate({ backgroundColor: e.target.value })
            }}
            className="flex-1 text-sm"
            placeholder="rgba(0, 0, 0, 0.5)"
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => {
              const newBg = 'transparent'
              setBackgroundColor(newBg)
              handleUpdate({ backgroundColor: newBg })
            }}
          >
            Transparent
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => {
              const newBg = 'rgba(0, 0, 0, 0.7)'
              setBackgroundColor(newBg)
              handleUpdate({ backgroundColor: newBg })
            }}
          >
            Dark
          </Button>
        </div>
      </div>

      {/* Position */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-gray-700">Position</Label>
        <div className="grid grid-cols-3 gap-2">
          {POSITIONS.map((pos) => (
            <Button
              key={pos.value}
              size="sm"
              variant={position === pos.value ? 'default' : 'outline'}
              className="text-xs"
              onClick={() => {
                const newPos = pos.value as 'top' | 'center' | 'bottom'
                setPosition(newPos)
                handleUpdate({ position: newPos })
              }}
            >
              {pos.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Alignment */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-gray-700">Text Alignment</Label>
        <div className="grid grid-cols-3 gap-2">
          {ALIGNMENTS.map((align) => {
            const Icon = align.icon
            return (
              <Button
                key={align.value}
                size="sm"
                variant={alignment === align.value ? 'default' : 'outline'}
                className="text-xs"
                onClick={() => {
                  const newAlign = align.value as 'left' | 'center' | 'right'
                  setAlignment(newAlign)
                  handleUpdate({ alignment: newAlign })
                }}
              >
                <Icon className="w-3 h-3 mr-1" />
                {align.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Preview */}
      <div className="pt-3 border-t">
        <Label className="text-xs font-medium text-gray-700 mb-2 block">Preview</Label>
        <div className="relative bg-gray-900 rounded-lg aspect-video overflow-hidden">
          <div
            className={`absolute left-0 right-0 px-8 ${
              position === 'top' ? 'top-8' : position === 'bottom' ? 'bottom-8' : 'top-1/2 -translate-y-1/2'
            } ${
              alignment === 'left' ? 'text-left' : alignment === 'right' ? 'text-right' : 'text-center'
            }`}
          >
            <p
              style={{
                color: color,
                fontSize: `${fontSize * 0.2}px`,
                fontFamily: fontFamily,
                backgroundColor: backgroundColor,
                padding: '4px 8px',
                display: 'inline-block',
                borderRadius: '4px',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
              }}
            >
              {text || 'Your text here'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
