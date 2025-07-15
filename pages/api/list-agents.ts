import type { NextApiRequest, NextApiResponse } from 'next'
import { getAgentJsonMap } from './ask-agent'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const agentJsonMap = getAgentJsonMap()
    
    const agents = Object.entries(agentJsonMap).map(([agentId, agentJson]) => ({
      id: agentId,
      name: agentId,
      title: (agentJson as any)?.info?.title || agentId,
      description: (agentJson as any)?.info?.description || 'Custom AI Agent',
      version: (agentJson as any)?.info?.version || '1.0.0',
    }))

    return res.status(200).json({
      success: true,
      agents,
      count: agents.length
    })
  } catch (error) {
    console.error('Error listing agents:', error)
    return res.status(500).json({ 
      error: 'Failed to list agents',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 