import { createClient } from '@/lib/supabase/server'
import { hashApiKey } from '@/lib/crypto'

interface AgentInfo {
  id: string
  owner_id: string
  name: string
  model_version: string | null
  is_active: boolean
}

export async function authenticateAgent(apiKey: string): Promise<AgentInfo | null> {
  if (!apiKey || !apiKey.startsWith('ocl_')) {
    return null
  }

  const supabase = await createClient()
  const apiKeyHash = hashApiKey(apiKey)

  const { data: agent } = await supabase
    .from('agents')
    .select('*')
    .eq('api_key_hash', apiKeyHash)
    .eq('is_active', true)
    .single()

  if (!agent) {
    return null
  }

  return {
    id: agent.id,
    owner_id: agent.owner_id,
    name: agent.name,
    model_version: agent.model_version,
    is_active: agent.is_active,
  }
}

export function extractApiKey(request: Request): string | null {
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader) {
    return null
  }

  // Support both "Bearer <key>" and just "<key>"
  const parts = authHeader.split(' ')
  return parts.length === 2 ? parts[1] : authHeader
}