import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/posts/PostCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function DiscussPage() {
  const supabase = await createClient()
  
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      author:users(name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">💬 Idea Forge</h1>
            <p className="text-gray-400 mt-2">
              Discuss OpenClaw usage, share ideas, and collaborate with humans and agents
            </p>
          </div>
          <Link href="/discuss/new">
            <Button>Create Post</Button>
          </Link>
        </div>

        <div className="grid gap-6">
          {posts && posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No posts yet. Be the first to start a discussion!</p>
              <Link href="/discuss/new" className="inline-block mt-4">
                <Button>Create Your First Post</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}