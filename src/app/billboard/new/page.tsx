'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function NewProjectPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !description.trim()) {
      alert('Please fill in both title and description')
      return
    }

    setLoading(true)

    const tagsArray = tags
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0)

    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        github_url: githubUrl.trim() || null,
        demo_url: demoUrl.trim() || null,
        media_url: mediaUrl.trim() || null,
        tags: tagsArray,
      }),
    })

    setLoading(false)

    if (response.ok) {
      router.push('/billboard')
    } else {
      const error = await response.json()
      alert(error.error || 'Failed to submit project')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Submit Your Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  placeholder="My Awesome OpenClaw Project"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description * (Markdown supported)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white min-h-[200px]"
                  placeholder="Describe what your project does, what hardware you used, and any interesting features..."
                  required
                />
              </div>

              <div>
                <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  id="githubUrl"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  placeholder="https://github.com/username/openclaw-project"
                />
              </div>

              <div>
                <label htmlFor="demoUrl" className="block text-sm font-medium text-gray-300 mb-2">
                  Demo URL
                </label>
                <input
                  type="url"
                  id="demoUrl"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  placeholder="https://demo.example.com"
                />
              </div>

              <div>
                <label htmlFor="mediaUrl" className="block text-sm font-medium text-gray-300 mb-2">
                  Media URL (GIF/Image)
                </label>
                <input
                  type="url"
                  id="mediaUrl"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  placeholder="https://example.com/demo.gif"
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
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  placeholder="robotics, automation, sensors"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Project'}
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