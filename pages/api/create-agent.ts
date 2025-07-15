import type { NextApiRequest, NextApiResponse } from 'next'
import { createAgent } from '../../lib/neuralseek'
import { generateSiteCode } from '../../lib/openai'
import { deployToVercel } from '../../lib/vercel'
import { logProjectToSupabase } from '../../lib/supabase'
import { storeAgentJson } from './ask-agent'
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

    console.log('=== Starting Agent Creation Process ===')
    console.log('Description:', description)
    console.log('Project Name:', projectName)

    // Step 1: Create agent with NeuralSeek
    console.log('Step 1: Creating agent with NeuralSeek...')
    console.log('Input to NeuralSeek:', { description, projectName })
    
    const agentResult = await createAgent(description)
    
    if (!agentResult.success) {
      console.error('NeuralSeek failed:', agentResult.error)
      return res.status(500).json({ 
        error: `Agent creation failed: ${agentResult.error}`,
        step: 'neuralseek'
      })
    }

    if (!agentResult.agentJson) {
      console.error('No JSON returned from NeuralSeek')
      return res.status(500).json({ 
        error: 'No JSON returned from agent creation',
        step: 'neuralseek'
      })
    }

    console.log('✅ NeuralSeek Success - Agent JSON received')
    console.log('Agent JSON Preview:', JSON.stringify(agentResult.agentJson, null, 2).substring(0, 500) + '...')
    console.log('Agent Name:', agentResult.agentName)
    console.log('Improved Prompt:', agentResult.improvedPrompt)
    console.log('Full NeuralSeek Response Keys:', Object.keys(agentResult.fullResponse || {}))
    
    // Add complete JSON logging
    console.log("=== COMPLETE EXTRACTED JSON ===");
    console.log(JSON.stringify(agentResult.agentJson, null, 2));
    console.log("=== END COMPLETE JSON ===");

    // Store the agent JSON for later use by ask-agent endpoint
    const agentId = agentResult.agentName || `agent-${Date.now()}`
    storeAgentJson(agentId, agentResult.agentJson)
    console.log('✅ Stored agent JSON for ID:', agentId)

    // Step 2: Generate site code with OpenAI
    console.log('Step 2: Generating site code with OpenAI...')
    console.log('Input to OpenAI - Agent JSON (first 300 chars):', JSON.stringify(agentResult.agentJson).substring(0, 300) + '...')
    console.log('Input to OpenAI - Agent Name:', agentResult.agentName)
    console.log('Input to OpenAI - Improved Prompt:', agentResult.improvedPrompt)
    
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
    console.log('Generated Code Preview (first 500 chars):', siteCode.substring(0, 500) + '...')
    console.log('Generated Code Preview (last 200 chars):', '...' + siteCode.substring(siteCode.length - 200))

    // Step 3: Deploy to Vercel
    console.log('Step 3: Deploying to Vercel...')
    console.log('Project Name for Vercel:', projectName || 'My Agent')
    console.log('Full code length being deployed:', siteCode.length)
    
    try {
      const deploymentUrl = await deployToVercel(siteCode, projectName || 'My Agent')
      console.log('✅ Vercel Success - Deployed to:', deploymentUrl)

      // Step 4: Log to Supabase
      const projectId = uuidv4()
      try {
        console.log('Step 4: Logging to Supabase...')
        await logProjectToSupabase({
          id: projectId,
          name: projectName || 'My Agent',
          description,
          agent_json: agentResult.agentJson,
          vercel_url: deploymentUrl,
        })
        console.log('✅ Supabase Success - Logged project')
      } catch (supabaseError) {
        console.error('❌ Supabase logging failed (non-critical):', supabaseError)
        // Continue even if logging fails
      }

      console.log('=== Agent Creation Complete ===')
      
      return res.status(200).json({
        success: true,
        deploymentUrl,
        agentJson: agentResult.agentJson,
        agentName: agentResult.agentName,
        improvedPrompt: agentResult.improvedPrompt,
        projectId,
      })

    } catch (vercelError) {
      console.error('❌ Vercel deployment failed:', vercelError)
      return res.status(500).json({ 
        error: `Deployment failed: ${vercelError instanceof Error ? vercelError.message : 'Unknown error'}`,
        step: 'vercel',
        details: vercelError instanceof Error ? vercelError.stack : undefined
      })
    }

  } catch (error) {
    console.error('❌ Unexpected error in create-agent API:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error',
      step: 'unknown',
      details: error instanceof Error ? error.stack : undefined
    })
  }
}