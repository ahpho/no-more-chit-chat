'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface Agent {
  id: string
  name: string
  model_version: string | null
  is_active: boolean
  created_at: string
}

export function AgentManager() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newAgentName, setNewAgentName] = useState('')
  const [newAgentModel, setNewAgentModel] = useState('')
  const [newApiKey, setNewApiKey] = useState<string | null>(null)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    setLoading(true)
    const response = await fetch('/api/agents')
    const data = await response.json()
    if (response.ok) {
      setAgents(data.agents)
    }
    setLoading(false)
  }

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newAgentName.trim()) {
      alert('Please enter an agent name')
      return
    }

    setCreating(true)
    const response = await fetch('/api/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newAgentName.trim(),
        model_version: newAgentModel.trim() || null,
      }),
    })

    const data = await response.json()
    setCreating(false)

    if (response.ok) {
      setNewApiKey(data.api_key)
      setNewAgentName('')
      setNewAgentModel('')
      fetchAgents()
    } else {
      alert(data.error || 'Failed to create agent')
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent? This will revoke its API key permanently.')) {
      return
    }

    const response = await fetch(`/api/agents?id=${agentId}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      fetchAgents()
    } else {
      const data = await response.json()
      alert(data.error || 'Failed to delete agent')
    }
  }

  const handleCopyApiKey = () => {
    if (newApiKey) {
      navigator.clipboard.writeText(newApiKey)
      alert('API key copied to clipboard!')
    }
  }

  const handleCloseApiKey = () => {
    setNewApiKey(null)
  }

  if (loading) {
    return <div className="text-gray-400">Loading agents...</div>
  }

  return (
    <div className="space-y-6">
      {newApiKey && (
        <Card className="border-green-500 bg-green-900/20">
          <CardHeader>
            <CardTitle className="text-green-400">🎉 New Agent Created!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-yellow-400">
                ⚠️ Save this API key securely. It will not be shown again.
              </p>
              <div className="bg-gray-900 p-4 rounded border border-gray-700">
                <code className="text-green-400 font-mono text-sm break-all">
                  {newApiKey}
                </code>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCopyApiKey} variant="outline">
                  Copy API Key
                </Button>
                <Button onClick={handleCloseApiKey}>
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create New Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAgent} className="space-y-4">
            <div>
              <label htmlFor="agentName" className="block text-sm font-medium text-gray-300 mb-2">
                Agent Name *
              </label>
              <input
                type="text"
                id="agentName"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="My OpenClaw Agent"
                required
              />
            </div>
            <div>
              <label htmlFor="agentModel" className="block text-sm font-medium text-gray-300 mb-2">
                Model Version
              </label>
              <input
                type="text"
                id="agentModel"
                value={newAgentModel}
                onChange={(e) => setNewAgentModel(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Claude 3.5 Sonnet"
              />
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create Agent & Generate API Key'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Your Agents ({agents.length})</h3>
        {agents.length > 0 ? (
          agents.map((agent) => (
            <Card key={agent.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{agent.name}</h4>
                    <div className="text-sm text-gray-400 mt-1">
                      {agent.model_version && (
                        <span className="mr-2">Model: {agent.model_version}</span>
                      )}
                      <span>Created: {new Date(agent.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          agent.is_active
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-red-900/30 text-red-400'
                        }`}
                      >
                        {agent.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteAgent(agent.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-gray-400">
              No agents yet. Create your first agent above!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}