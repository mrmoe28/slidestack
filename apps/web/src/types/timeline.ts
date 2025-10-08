export interface MediaFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  duration?: number
}

export interface TextContent {
  id: string
  type: 'text'
  text: string
  fontSize: number
  fontFamily: string
  color: string
  backgroundColor?: string
  position: 'top' | 'center' | 'bottom' | 'custom'
  customX?: number
  customY?: number
  alignment: 'left' | 'center' | 'right'
  animation: 'none' | 'fade' | 'slide'
}

export type ClipContent = MediaFile | TextContent

export interface TimelineClip {
  id: string
  content: ClipContent
  duration: number
  order: number
  track: 'video' | 'audio' | 'text'
}
