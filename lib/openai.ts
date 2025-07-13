import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const generateSiteCode = async (agentJson: any, agentName?: string, improvedPrompt?: string): Promise<string> => {
  try {
    const prompt = `
Generate a complete Next.js React component for a dynamic agent interface based on this agent specification:

Agent Name: ${agentName || 'Custom Agent'}
Improved Prompt: ${improvedPrompt || 'No additional context'}

Agent JSON Configuration:
${JSON.stringify(agentJson, null, 2)}

CRITICAL REQUIREMENTS:
1. Return ONLY the React component code - NO markdown formatting, NO code blocks, NO explanatory text
2. Start directly with import statements
3. End with the component export
4. Create a functional React component using Next.js Pages Router (NOT App Router)
5. Component should be a default export from pages/index.tsx
6. Include proper TypeScript types and import statements
7. Use Tailwind CSS for modern, professional styling (only standard utility classes)
8. Make it responsive and visually appealing
9. Include form validation where appropriate
10. Handle the agent's specific functionality as described in the JSON
11. Include a header with the agent name and description
12. Add interactive elements that make sense for this specific agent
13. Include loading states and error handling
14. Make it a complete, self-contained page component
15. DO NOT use any external dependencies beyond React, Next.js, and Tailwind
16. DO NOT import any custom components or utilities
17. Include proper Next.js Head component for SEO
18. Ensure all code is production-ready and follows TypeScript best practices

IMPORTANT: Return ONLY the raw TypeScript/React code. Do NOT wrap in markdown code blocks, do NOT add explanations, do NOT include any text outside the actual code.

Example of what to return (start exactly like this):
import { useState } from 'react'
import Head from 'next/head'

export default function AgentPage() {
  // Component logic here
  
  return (
    <>
      <Head>
        <title>${agentName || 'Custom Agent'}</title>
        <meta name="description" content="..." />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Component JSX here */}
      </div>
    </>
  )
}

Focus on creating an interface that effectively serves the agent's intended purpose and provides excellent user experience.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4000,
      temperature: 0.1,
    })

    let generatedCode = completion.choices[0]?.message?.content || ''
    
    // Clean up the response to remove any markdown formatting
    generatedCode = generatedCode.trim()
    
    // Remove markdown code blocks if present
    if (generatedCode.startsWith('```')) {
      const lines = generatedCode.split('\n')
      const startIndex = lines.findIndex((line: string) => line.startsWith('```'))
      const endIndex = lines.length - 1 - lines.slice().reverse().findIndex((line: string) => line.startsWith('```'))
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        generatedCode = lines.slice(startIndex + 1, endIndex).join('\n')
      }
    }
    
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
        break
      }
    }
    
    return generatedCode
  } catch (error) {
    console.error('Error generating site code:', error)
    throw error
  }
}