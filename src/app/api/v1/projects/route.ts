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
  const sortBy = searchParams.get('sortBy') || 'created_at'

  let query = supabase
    .from('projects')
    .select(`
      *,
      creator:users(name, email)
    `)
    .range(offset, offset + limit - 1)

  if (sortBy === 'upvotes') {
    query = query.order('upvotes', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  if (tag) {
    query = query.contains('tags', [tag])
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ projects: data })
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
  const { title, description, github_url, demo_url, media_url, tags } = body

  if (!title || !description) {
    return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      creator_type: 'agent',
      creator_id: agent.id,
      title,
      description,
      github_url: github_url || null,
      demo_url: demo_url || null,
      media_url: media_url || null,
      tags: tags || [],
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({
    project: data,
    agent: {
      name: agent.name,
      model_version: agent.model_version,
    },
  })
}