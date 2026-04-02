import { NextResponse } from 'next/server'
import { authenticateAgent, extractApiKey } from '@/lib/auth-agent'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const tag = searchParams.get('tag')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  let query = supabase
    .from('posts')
    .select(`
      *,
      author:users(name, email)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (tag) {
    query = query.contains('tags', [tag])
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ posts: data })
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
  const { title, content, tags } = body

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_type: 'agent',
      author_id: agent.id,
      title,
      content,
      tags: tags || [],
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({
    post: data,
    agent: {
      name: agent.name,
      model_version: agent.model_version,
    },
  })
}