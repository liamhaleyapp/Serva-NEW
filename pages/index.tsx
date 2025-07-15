import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  const [description, setDescription] = useState('')
  const [projectName, setProjectName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/create-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          projectName: projectName || 'My Agent',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create agent')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Agent Builder</title>
        <meta name="description" content="Build custom AI agents instantly" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Agent Builder
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Describe your ideal AI agent and we'll build a custom web interface for it instantly
            </p>
            <div className="mt-6">
              <Link
                href="/agents"
                className="inline-block text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Agents →
              </Link>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="My Awesome Agent"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Description *
                  </label>
                  <textarea
                    id="description"
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe what your agent should do... For example: 'A customer support agent that can help users with product inquiries and troubleshooting'"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Be specific about the agent's purpose, capabilities, and any special features you need.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !description.trim()}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Building Your Agent...
                    </div>
                  ) : (
                    'Build Now'
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {result && (
                <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">
                    🎉 Agent Created Successfully!
                  </h3>
                  <div className="mb-4">
                    <p className="text-green-700 font-medium">
                      Agent Name: {result.agentName || 'Custom Agent'}
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      Your agent has been created successfully! You can interact with it here:
                    </p>
                  </div>
                  <a
                    href={`/agents/${result.agentName}`}
                    className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    View Your Agent →
                  </a>
                  <div className="mt-4 p-4 bg-white rounded border">
                    <p className="text-sm text-gray-600">
                      <strong>Deployment URL:</strong> {result.deploymentUrl}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Project ID:</strong> {result.projectId}
                    </p>
                    {result.improvedPrompt && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Enhanced Description:</strong> {result.improvedPrompt.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Describe Your Agent</h3>
                <p className="text-gray-600 text-sm">
                  Tell us what you want your AI agent to do and how it should behave
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI Builds Interface</h3>
                <p className="text-gray-600 text-sm">
                  Our AI analyzes your requirements and generates a custom web interface
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Deploy & Share</h3>
                <p className="text-gray-600 text-sm">
                  Your agent is instantly deployed and ready to use with a shareable URL
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 