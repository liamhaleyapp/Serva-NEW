import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const generateSiteCode = async (agentJson: any, agentName?: string, improvedPrompt?: string): Promise<string> => {
  try {
    console.log('=== GPT CODE GENERATION DEBUG ===')
    console.log('Agent Name received:', agentName)
    console.log('Improved Prompt received:', improvedPrompt)
    console.log('Agent JSON type:', typeof agentJson)
    console.log('Agent JSON keys:', Object.keys(agentJson || {}))
    console.log('Agent JSON info.title:', agentJson?.info?.title)
    console.log('Agent JSON info.description:', agentJson?.info?.description)
    console.log('Agent JSON paths count:', Object.keys(agentJson?.paths || {}).length)
    
    const prompt = `
Generate a complete Next.js React component for a dynamic agent interface based on this agent specification:

Agent Name: ${agentName || 'Custom Agent'}
Agent ID: ${agentName || 'Custom Agent'} (use this as the agentId when calling /api/ask-agent)
Improved Prompt: ${improvedPrompt || 'No additional context'}

Agent JSON Configuration:
${JSON.stringify(agentJson, null, 2)}

CRITICAL REQUIREMENTS:
1. Return ONLY valid code. Do NOT include markdown, explanations, or comments outside the code.
2. The file MUST start with an import statement (e.g., import { useState } from 'react').
3. On form submit, POST the user's plain text query and the agent's unique ID to /api/ask-agent as JSON: { query, agentId }.
4. Use "${agentName || 'Custom Agent'}" as the agentId value.
5. Display the response from the backend in the UI.
6. Do NOT use mock data. Do NOT use JSON.parse on user input.
7. Assume the backend endpoint will use the agent's JSON to call NeuralSeek and return the answer.
8. Use fetch, not axios.
9. Always use async/await.

ALSO GENERATE THIS FILE:

Create a Next.js API route at pages/api/ask-agent.ts that:
- Accepts only POST requests with { query, agentId } in the body.
- Calls https://stagingapi.neuralseek.com/v1/liam-demo/{agentId}/maistro with the query as the payload.
- Uses the apikey from the environment variable process.env.NEURALSEEK_API_KEY.
- Returns the NeuralSeek response as JSON.
- Returns 405 for non-POST requests and 400 for missing fields.

Example implementation (as a string, not real code!):

\`\`\`ts
// pages/api/ask-agent.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { query, agentId } = req.body;
  if (!query || !agentId) {
    return res.status(400).json({ error: 'Missing query or agentId' });
  }
  const nsRes = await fetch(
    \`https://stagingapi.neuralseek.com/v1/liam-demo/\${agentId}/maistro\`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEURALSEEK_API_KEY!,
      },
      body: JSON.stringify({ params: { use_case_summary: query } }),
    }
  );
  const data = await nsRes.json();
  return res.status(200).json(data);
}
\`\`\`
`

    console.log('=== GPT PROMPT SENT ===')
    console.log('Prompt length:', prompt.length)
    console.log('Prompt preview (first 500 chars):', prompt.substring(0, 500) + '...')
    console.log('Agent JSON in prompt (first 300 chars):', JSON.stringify(agentJson).substring(0, 300) + '...')

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4000,
      temperature: 0.1,
    })

    let generatedCode = completion.choices[0].message.content || ''
    
    console.log('=== GPT RESPONSE RECEIVED ===')
    console.log('Raw response length:', generatedCode.length)
    console.log('Raw response preview (first 500 chars):', generatedCode.substring(0, 500) + '...')
    
    // Clean up the response to remove any markdown formatting
    generatedCode = generatedCode.trim()
    
    // Remove markdown code blocks if present
    if (generatedCode.startsWith('```')) {
      const lines = generatedCode.split('\n')
      const startIndex = lines.findIndex((line: string) => line.startsWith('```'))
      const endIndex = lines.length - 1 - lines.slice().reverse().findIndex((line: string) => line.startsWith('```'))
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        generatedCode = lines.slice(startIndex + 1, endIndex).join('\n')
        console.log('Removed markdown code blocks')
      }
    }

    // Fallback: Replace axios usage with fetch if present
    if (generatedCode.includes('axios')) {
      generatedCode = generatedCode.replace(/import axios[^;]*;?\n?/g, '')
      generatedCode = generatedCode.replace(/axios\.post\s*\(([^,]+),\s*([^\)]+)\)/g, 'fetch($1, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify($2) }).then(res => res.json())')
      generatedCode = generatedCode.replace(/axios\.get\s*\(([^\)]+)\)/g, 'fetch($1).then(res => res.json())')
      console.log('Replaced axios with fetch')
    }

    // Enforce POST for fetch calls to /api/ask-agent
    generatedCode = generatedCode.replace(/fetch\((['"])\/api\/ask-agent\1(,\s*\{[^\}]*\})?\)/g, (match, quote, options) => {
      if (options && options.includes('method')) return match; // already has method
      return `await fetch('/api/ask-agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, agentId }) });`;
    });
    
    // Remove any trailing explanatory text
    const codeEndMarkers = [
      'Focus on creating',
      'The component',
      'This interface',
      'The page',
      'This code',
      'The above code',
      'This component'
    ]
    
    for (const marker of codeEndMarkers) {
      const markerIndex = generatedCode.indexOf(marker)
      if (markerIndex !== -1) {
        generatedCode = generatedCode.substring(0, markerIndex).trim()
        console.log('Removed trailing text after marker:', marker)
        break
      }
    }
    
    console.log('=== FINAL CLEANED CODE ===')
    console.log('Final code length:', generatedCode.length)
    console.log('Final code preview (first 300 chars):', generatedCode.substring(0, 300) + '...')
    console.log('Final code preview (last 200 chars):', '...' + generatedCode.substring(generatedCode.length - 200))
    console.log('=== END GPT DEBUG ===')
    
    return generatedCode
  } catch (error) {
    console.error('Error generating site code:', error)
    throw error
  }
}