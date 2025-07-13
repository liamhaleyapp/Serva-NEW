import type { NextApiRequest, NextApiResponse } from 'next'
import { createAgent } from '../../lib/neuralseek'
import { generateSiteCode } from '../../lib/openai'

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

    console.log('=== DEBUG MODE: Agent Creation Process ===')
    console.log('Description:', description)
    console.log('Project Name:', projectName)

    // Step 1: Create agent with NeuralSeek
    console.log('Step 1: Creating agent with NeuralSeek...')
    const agentResult = await createAgent(description)
    
    if (!agentResult.success) {
      console.error('NeuralSeek failed:', agentResult.error)
      return res.status(500).json({ 
        error: `Agent creation failed: ${agentResult.error}`,
        step: 'neuralseek'
      })
    }

    console.log('✅ NeuralSeek Success')
    console.log('Agent JSON:', JSON.stringify(agentResult.agentJson, null, 2))
    console.log('Agent Name:', agentResult.agentName)
    console.log('Improved Prompt:', agentResult.improvedPrompt)

    // Step 2: Generate site code with OpenAI
    console.log('Step 2: Generating site code with OpenAI...')
    
    const siteCode = await generateSiteCode(
      agentResult.agentJson, 
      agentResult.agentName,
      agentResult.improvedPrompt
    )

    if (!siteCode || siteCode.length < 100) {
      console.error('OpenAI generated insufficient code:', siteCode?.length || 0, 'characters')
      return res.status(500).json({ 
        error: 'Generated code is too short or empty',
        step: 'openai'
      })
    }

    console.log('✅ OpenAI Success - Generated', siteCode.length, 'characters of code')
    console.log('Generated Code:', siteCode)

    // Return the debug information without deploying
    return res.status(200).json({
      success: true,
      debug: true,
      agentJson: agentResult.agentJson,
      agentName: agentResult.agentName,
      improvedPrompt: agentResult.improvedPrompt,
      generatedCode: siteCode,
      codeLength: siteCode.length,
    })

  } catch (error) {
    console.error('❌ Unexpected error in debug-agent API:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error',
      step: 'unknown',
      details: error instanceof Error ? error.stack : undefined
    })
  }
} 