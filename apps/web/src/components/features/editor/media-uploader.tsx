'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, File, X, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface MediaFile {
  id: string
  name: string
  size: number
  type: string
  url: string
}

interface MediaUploaderProps {
  projectId: string
  onFileUploaded?: (file: MediaFile) => void
}

export function MediaUploader({ projectId, onFileUploaded }: MediaUploaderProps) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const { toast } = useToast()

  // Fetch existing media files on mount
  useEffect(() => {
    const fetchMediaFiles = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/projects/${projectId}/media`)

        if (!response.ok) {
          throw new Error('Failed to fetch media files')
        }

        const data = await response.json()
        const loadedFiles: MediaFile[] = data.files.map((file: any) => ({
          id: file.id,
          name: file.filename,
          size: file.size,
          type: file.type,
          url: file.url,
        }))

        setFiles(loadedFiles)
      } catch (error) {
        console.error('Error fetching media files:', error)
        toast({
          title: 'Error',
          description: 'Failed to load media files',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMediaFiles()
  }, [projectId, toast])

  const uploadFiles = useCallback(async (filesToUpload: FileList) => {
    if (filesToUpload.length === 0) return

    setUploading(true)
    console.log('[MediaUploader] Starting upload of', filesToUpload.length, 'files')

    try {
      const uploadedFiles: MediaFile[] = []

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i]
        console.log('[MediaUploader] Uploading file:', {
          name: file.name,
          type: file.type,
          size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        })

        // Create FormData for upload
        const formData = new FormData()
        formData.append('file', file)
        formData.append('projectId', projectId)
        formData.append('order', String(files.length + i))

        // Upload to API
        console.log('[MediaUploader] Sending request to /api/upload...')
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        console.log('[MediaUploader] Response status:', response.status)

        if (!response.ok) {
          const error = await response.json()
          console.error('[MediaUploader] Upload failed:', error)
          throw new Error(error.error || 'Upload failed')
        }

        const result = await response.json()
        console.log('[MediaUploader] Upload successful:', result.file.id)

        const uploadedFile: MediaFile = {
          id: result.file.id,
          name: result.file.filename,
          size: result.file.size,
          type: result.file.type,
          url: result.file.url,
        }

        uploadedFiles.push(uploadedFile)

        // Notify parent component
        if (onFileUploaded) {
          onFileUploaded(uploadedFile)
        }
      }

      setFiles([...files, ...uploadedFiles])
      console.log('[MediaUploader] All uploads complete')

      toast({
        title: 'Upload successful',
        description: `${uploadedFiles.length} file(s) uploaded successfully`,
      })
    } catch (error) {
      console.error('[MediaUploader] Upload error:', error)
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload files. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }, [files, projectId, onFileUploaded, toast])

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles) return

    await uploadFiles(selectedFiles)
    // Reset the input
    event.target.value = ''
  }, [uploadFiles])

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles) {
      await uploadFiles(droppedFiles)
    }
  }, [uploadFiles])

  const removeFile = async (id: string) => {
    // TODO: Add API call to delete file from server
    setFiles(files.filter(f => f.id !== id))

    toast({
      title: 'File removed',
      description: 'File removed from library',
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-indigo-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/mp3,audio/wav"
          onChange={handleFileSelect}
          disabled={uploading || loading}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          {uploading || loading ? (
            <Loader2 className="w-8 h-8 mx-auto mb-2 text-indigo-500 animate-spin" />
          ) : (
            <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`} />
          )}
          <p className="text-sm text-gray-600 mb-1 font-medium">
            {loading ? 'Loading...' : uploading ? 'Uploading...' : isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-gray-500">
            Images (JPG, PNG, GIF, WebP, SVG)
          </p>
          <p className="text-xs text-gray-500">
            Videos (MP4, WebM, MOV) • Audio (MP3, WAV)
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Max file size: 500MB
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-700 uppercase">
            Uploaded Files ({files.length})
          </h4>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify(file))
                  e.dataTransfer.effectAllowed = 'copy'
                }}
                className="flex items-center gap-2 p-2 bg-white border rounded-lg hover:bg-gray-50 cursor-move"
              >
                {file.type === 'image' && file.url && (
                  <div className="w-10 h-10 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}
                {file.type !== 'image' && (
                  <File className="w-10 h-10 text-gray-500 flex-shrink-0 p-2" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • {file.type}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
