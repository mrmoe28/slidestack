'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, File, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface MediaFile {
  id: string
  name: string
  size: number
  type: string
  url: string
}

export function MediaUploader() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    setUploading(true)

    try {
      const newFiles: MediaFile[] = []

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]

        // Create temporary URL for preview
        const url = URL.createObjectURL(file)

        newFiles.push({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url,
        })
      }

      setFiles([...files, ...newFiles])

      toast({
        title: 'Files uploaded',
        description: `${newFiles.length} file(s) added successfully`,
      })
    } catch {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload files. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }, [files, toast])

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id))
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
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept="image/*,video/*,audio/*"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-1">
            {uploading ? 'Uploading...' : 'Click to upload files'}
          </p>
          <p className="text-xs text-gray-500">
            Images, videos, or audio files
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
                className="flex items-center gap-2 p-2 bg-white border rounded-lg hover:bg-gray-50"
              >
                <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
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
