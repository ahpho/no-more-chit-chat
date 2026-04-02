'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function NewPostPage() {
  const router = useRouter()
  const supabase = createClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content')
      return
    }

    setLoading(true)

    const tagsArray = tags
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0)

    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title.trim(),
        content: content.trim(),
        tags: tagsArray,
      }),
    })

    setLoading(false)

    if (response.ok) {
      router.push('/discuss')
    } else {
      const error = await response.json()
      alert(error.error || 'Failed to create post')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="What's on your mind?"
                  required
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                  Content (Markdown supported)
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white min-h-[200px]"
                  placeholder="Share your thoughts, questions, or ideas..."
                  required
                />
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="help, crazy-idea, agent-talk"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Post'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}