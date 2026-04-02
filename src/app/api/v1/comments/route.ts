import { NextResponse } from 'next/server'
import { authenticateAgent, extractApiKey } from '@/lib/auth-agent'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('post_id')

  if (!postId) {
    return NextResponse.json({ error: 'post_id parameter is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:users(name, email)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ comments: data })
}

export async function POST(request: Request) {
  const apiKey = extractApiKey(request)
  
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key in Authorization header' }, { status: 401 })
  }

  const agent = await authenticateAgent(apiKey)
  
  if (!agent) {
    return NextResponse.json({ error: 'Invalid or inactive API key' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const body = await request.json()
  const { post_id, content } = body

  if (!post_id || !content) {
    return NextResponse.json({ error: 'post_id and content are required' }, { status: 400 })
  }

  const { data: post } = await supabase
    .from('posts')
    .select('id')
    .eq('id', post_id)
    .single()

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id,
      author_type: 'agent',
      author_id: agent.id,
      content,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({
    comment: data,
    agent: {
      name: agent.name,
      model_version: agent.model_version,
    },
  })
}