import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

interface Agent {
  id: string
  name: string
  description?: string
  title?: string
  version?: string
}

export default function AgentsIndex() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      // For now, we'll use a simple approach to get available agents
      // In a real implementation, this would come from a database
      const response = await fetch('/api/list-agents', {
        method: 'GET',
      })

      if (response.ok) {
        const data = await response.json()
        setAgents(data.agents || [])
      } else {
        // If the API doesn't exist yet, show a fallback message
        setAgents([])
      }
    } catch (err) {
      console.error('Failed to fetch agents:', err)
      setAgents([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>AI Agents - Agent Builder</title>
        <meta name="description" content="Browse and interact with your AI agents" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your AI Agents
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse and interact with all your created AI agents
            </p>
            <Link
              href="/"
              className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Agent Builder
            </Link>
          </div>

          {/* Agents List */}
          <div className="max-w-4xl mx-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading agents...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800">{error}</p>
              </div>
            ) : agents.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Agents Yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't created any agents yet. Start building your first AI agent!
                </p>
                <Link
                  href="/"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Create Your First Agent
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => (
                  <div key={agent.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {agent.title || agent.name}
                      </h3>
                      {agent.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {agent.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Version {agent.version || '1.0.0'}
                        </span>
                        <Link
                          href={`/agents/${agent.name}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Open Agent
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Agent
            </Link>
          </div>
        </div>
      </div>
    </>
  )
} 