'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock, CheckCircle, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

interface ProjectCardProps {
  project: {
    id: string
    title: string
    description?: string | null
    status: string
    outputUrl?: string | null
    createdAt: Date
  }
  onDelete?: () => void
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [resetting, setResetting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Prefetch project route on hover for faster navigation
  const handleMouseEnter = () => {
    router.prefetch(`/projects/${project.id}/edit`)
  }

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete project')
      }

      toast({
        title: 'Project deleted',
        description: 'Your project has been deleted successfully.',
      })

      setDeleteDialogOpen(false)
      onDelete?.()
      router.refresh()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete project. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDownload = async () => {
    if (!project.outputUrl) return

    try {
      // Fetch the video file
      const response = await fetch(project.outputUrl)
      const blob = await response.blob()

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_slideshow.mp4`
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Download started',
        description: 'Your video is downloading to your Downloads folder.',
      })
    } catch (error) {
      console.error('Download failed:', error)
      toast({
        title: 'Download failed',
        description: 'Could not download the video. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleResetStatus = async () => {
    setResetting(true)

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'draft',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reset project status')
      }

      toast({
        title: 'Status reset',
        description: 'Project status has been reset to draft.',
      })

      router.refresh()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to reset project status. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setResetting(false)
    }
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription suppressHydrationWarning>
                Created {new Date(project.createdAt).toLocaleDateString()}
                {project.description && ` • ${project.description}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {project.status === 'completed' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </span>
              ) : project.status === 'processing' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Clock className="w-3 h-3 mr-1" />
                  Processing
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Draft
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild onMouseEnter={handleMouseEnter}>
              <Link href={`/projects/${project.id}/edit`} prefetch={true}>
                Edit
              </Link>
            </Button>
            {project.status === 'completed' && project.outputUrl && (
              <Button size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            {project.status === 'processing' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetStatus}
                disabled={resetting}
              >
                {resetting ? 'Resetting...' : 'Reset Status'}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{project.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
