import type { NextApiRequest, NextApiResponse } from 'next'
import { createAgent } from '../../lib/neuralseek'
import { generateSiteCode } from '../../lib/openai'
import { deployToVercel } from '../../lib/vercel'
import { logProjectToSupabase } from '../../lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { description, projectName } = req.body

    if (!description) {
      return res.status(400).json({ error: 'Description is required' })
    }

    // Step 1: Create agent with NeuralSeek
    console.log('Creating agent with NeuralSeek...')
    const agentResult = await createAgent(description)
    
    if (!agentResult.success) {
      return res.status(500).json({ error: `Agent creation failed: ${agentResult.error}` })
    }

    if (!agentResult.agentJson) {
      return res.status(500).json({ error: 'No JSON returned from agent creation' })
    }

    // Step 2: Generate site code with OpenAI
    console.log('Generating site code with OpenAI...')
    console.log('OpenAI Key:', process.env.OPENAI_API_KEY?.slice(0, 8));
    const siteCode = await generateSiteCode(
      agentResult.agentJson, 
      agentResult.agentName,
      agentResult.improvedPrompt
    )

    // Step 3: Deploy to Vercel
    console.log('Deploying to Vercel...')
    const deploymentUrl = await deployToVercel(siteCode, projectName || 'My Agent')

    // Step 4: Log to Supabase
    const projectId = uuidv4()
    try {
      await logProjectToSupabase({
        id: projectId,
        name: projectName || 'My Agent',
        description,
        agent_json: agentResult.agentJson,
        vercel_url: deploymentUrl,
      })
    } catch (supabaseError) {
      console.error('Supabase logging failed:', supabaseError)
      // Continue even if logging fails
    }

    return res.status(200).json({
      success: true,
      deploymentUrl,
      agentJson: agentResult.agentJson,
      agentName: agentResult.agentName,
      improvedPrompt: agentResult.improvedPrompt,
      projectId,
    })

  } catch (error) {
    console.error('Error in create-agent API:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
} 