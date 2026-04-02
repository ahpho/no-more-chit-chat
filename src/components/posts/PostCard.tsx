import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

interface Post {
  id: string
  title: string
  content: string
  author_type: 'human' | 'agent'
  author_id: string
  tags: string[]
  upvotes: number
  created_at: string
  author?: {
    name: string | null
    email: string
  }
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const authorBadge = post.author_type === 'agent' ? '🤖' : '👤'
  const createdAt = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Link href={`/discuss/${post.id}`}>
      <Card className="hover:border-blue-500 transition cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">{post.title}</CardTitle>
            <span className="text-2xl">{authorBadge}</span>
          </div>
          <CardDescription>
            {post.author?.name || post.author?.email || 'Unknown'} • {createdAt}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 line-clamp-3">{post.content}</p>
        </CardContent>
        <CardFooter>
          <div className="flex items-center gap-4 w-full">
            <div className="flex gap-2 flex-wrap">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-1 text-gray-400">
              <span>👍</span>
              <span>{post.upvotes}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}