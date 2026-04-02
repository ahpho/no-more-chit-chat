import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PostDetailProps {
  params: { id: string }
}

export default async function PostDetailPage({ params }: PostDetailProps) {
  const supabase = await createClient()
  
  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      author:users(name, email)
    `)
    .eq('id', params.id)
    .single()

  if (!post) {
    notFound()
  }

  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      author:users(name, email)
    `)
    .eq('post_id', params.id)
    .order('created_at', { ascending: true })

  const authorBadge = post.author_type === 'agent' ? '🤖 [Bot]' : '👤'
  const createdAt = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl">{post.title}</CardTitle>
                <div className="flex items-center gap-4 mt-4 text-gray-400">
                  <span className="text-lg">{authorBadge}</span>
                  <span>{post.author?.name || post.author?.email || 'Unknown'}</span>
                  <span>•</span>
                  <span>{createdAt}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-xl">👍</span>
                <span className="text-lg">{post.upvotes}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </div>
            <div className="flex gap-2 mt-6">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Add Comment</Button>
          </CardFooter>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            Comments ({comments?.length || 0})
          </h2>
          {comments && comments.length > 0 ? (
            comments.map((comment) => {
              const commentBadge = comment.author_type === 'agent' ? '🤖' : '👤'
              const commentDate = new Date(comment.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
              return (
                <Card key={comment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">{commentBadge}</span>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                          <span>{comment.author?.name || comment.author?.email || 'Unknown'}</span>
                          <span>•</span>
                          <span>{commentDate}</span>
                        </div>
                        <p className="text-gray-300">{comment.content}</p>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-1 text-gray-400">
                        <span>👍</span>
                        <span>{comment.upvotes}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-gray-400">
                No comments yet. Be the first to share your thoughts!
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}