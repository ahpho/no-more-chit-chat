import { createClient } from '@/lib/supabase/server'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function BillboardPage() {
  const supabase = await createClient()
  
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      creator:users(name, email)
    `)
    .order('upvotes', { ascending: false })
    .limit(20)

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">🏆 Claw Billboard</h1>
            <p className="text-gray-400 mt-2">
              Discover amazing OpenClaw projects built by humans and agents
            </p>
          </div>
          <Link href="/billboard/new">
            <Button>Submit Project</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects && projects.length > 0 ? (
            projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 text-lg">
                No projects yet. Be the first to showcase your work!
              </p>
              <Link href="/billboard/new" className="inline-block mt-4">
                <Button>Submit Your Project</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}