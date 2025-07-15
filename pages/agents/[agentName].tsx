import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

interface AgentResponse {
  answer: string
  sourceParts?: any[]
  variables?: any
}

export default function AgentPage() {
  const router = useRouter()
  const { agentName } = router.query
  
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<AgentResponse | null>(null)
  const [error, setError] = useState('')
  const [agentInfo, setAgentInfo] = useState<any>(null)

  // Fetch agent info when component mounts
  useEffect(() => {
    if (agentName) {
      fetchAgentInfo()
    }
  }, [agentName])

  const fetchAgentInfo = async () => {
    try {
      const response = await fetch('/api/debug-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agentName as string,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAgentInfo(data)
      }
    } catch (err) {
      console.error('Failed to fetch agent info:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || !agentName) return

    setIsLoading(true)
    setError('')
    setResponse(null)

    try {
      const response = await fetch('/api/ask-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          agentId: agentName as string,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from agent')
      }

      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (router.isFallback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agent...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{agentName ? `${agentName} - AI Agent` : 'AI Agent'}</title>
        <meta name="description" content="Interact with your custom AI agent" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {agentName || 'AI Agent'}
            </h1>
            {agentInfo && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {agentInfo.description || 'Your custom AI agent is ready to help!'}
              </p>
            )}
            <button
              onClick={() => router.push('/')}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Agent Builder
            </button>
          </div>

          {/* Main Chat Interface */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4">
                {response && (
                  <div className="space-y-4">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg max-w-xs lg:max-w-md">
                        <p className="text-sm">{query}</p>
                      </div>
                    </div>
                    
                    {/* Agent Response */}
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg max-w-xs lg:max-w-md">
                        <p className="text-sm whitespace-pre-wrap">{response.answer}</p>
                        {response.sourceParts && response.sourceParts.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Sources:</p>
                            {response.sourceParts.map((part, index) => (
                              <div key={index} className="text-xs text-gray-600">
                                {part.title || part.content?.substring(0, 100)}...
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex justify-start">
                    <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg max-w-xs lg:max-w-md">
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {!response && !isLoading && !error && (
                  <div className="text-center text-gray-500 py-8">
                    <p>Start a conversation with your AI agent!</p>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <div className="border-t border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="flex space-x-4">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask your agent anything..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      'Send'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Agent Info Panel */}
          {agentInfo && (
            <div className="mt-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Information</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Name:</p>
                    <p className="font-medium">{agentInfo.title || agentName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Version:</p>
                    <p className="font-medium">{agentInfo.version || '1.0.0'}</p>
                  </div>
                  {agentInfo.description && (
                    <div className="md:col-span-2">
                      <p className="text-gray-600">Description:</p>
                      <p className="font-medium">{agentInfo.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
} 