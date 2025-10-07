import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Video, Clock, CheckCircle } from 'lucide-react'
import { auth } from '@/lib/auth'
import { db, projects } from '@slideshow/db'
import { eq, desc } from 'drizzle-orm'
import { NewProjectDialog } from '@/components/features/projects/new-project-dialog'
import { ProjectCard } from '@/components/features/projects/project-card'

export const metadata: Metadata = {
  title: 'Dashboard - SlideShow',
  description: 'Manage your slideshow projects',
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  // Fetch user's projects from database
  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, session.user.id))
    .orderBy(desc(projects.createdAt))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SlideShow</h1>
            <p className="text-sm text-gray-600">Create amazing video slideshows</p>
          </div>
          <NewProjectDialog />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProjects.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userProjects.filter((p) => p.status === 'processing').length}
              </div>
              <p className="text-xs text-muted-foreground">Currently rendering</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userProjects.filter((p) => p.status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">Ready to download</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>

          {userProjects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Video className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first slideshow</p>
                <NewProjectDialog
                  trigger={
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Project
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {userProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
