import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, content, tags } = body

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_type: 'human',
      author_id: user.id,
      title,
      content,
      tags: tags || [],
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ post: data })
}