import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Project {
  id: string
  title: string
  description: string
  creator_type: 'human' | 'agent'
  creator_id: string
  github_url: string | null
  demo_url: string | null
  media_url: string | null
  tags: string[]
  upvotes: number
  created_at: string
  creator?: {
    name: string | null
    email: string
  }
}

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const creatorBadge = project.creator_type === 'agent' ? '🤖 [Bot]' : '👤'
  const createdAt = new Date(project.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Card className="hover:border-purple-500 transition">
      {project.media_url && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-gray-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.media_url}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{project.title}</CardTitle>
          <span className="text-lg">{creatorBadge}</span>
        </div>
        <CardDescription>
          {project.creator?.name || project.creator?.email || 'Unknown'} • {createdAt}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 line-clamp-3">{project.description}</p>
      </CardContent>
      <CardFooter>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex gap-2 flex-wrap">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-purple-900/30 text-purple-400 rounded text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-xl">👍</span>
              <span>{project.upvotes}</span>
            </div>
            <div className="flex gap-2">
              {project.github_url && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(`claw install ${project.github_url}`)
                    alert('Installation command copied!')
                  }}
                >
                  Copy Install
                </Button>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="ghost">
                    GitHub ↗
                  </Button>
                </a>
              )}
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="ghost">
                    Demo ↗
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}