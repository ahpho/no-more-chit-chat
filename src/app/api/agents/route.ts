import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateApiKey, hashApiKey } from '@/lib/crypto'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Don't return the API key hash
  const agents = data.map((agent) => ({
    ...agent,
    api_key_hash: undefined,
  }))

  return NextResponse.json({ agents })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, model_version } = body

  if (!name) {
    return NextResponse.json({ error: 'Agent name is required' }, { status: 400 })
  }

  const apiKey = generateApiKey()
  const apiKeyHash = hashApiKey(apiKey)

  const { data, error } = await supabase
    .from('agents')
    .insert({
      owner_id: user.id,
      name,
      model_version: model_version || null,
      api_key_hash: apiKeyHash,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Return the API key only once
  return NextResponse.json({
    agent: {
      ...data,
      api_key_hash: undefined,
    },
    api_key: apiKey,
    warning: 'Save this API key securely. It will not be shown again.',
  })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const agentId = searchParams.get('id')

  if (!agentId) {
    return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', agentId)
    .eq('owner_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}