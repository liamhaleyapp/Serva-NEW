import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const generateSiteCode = async (agentJson: any, agentName?: string, improvedPrompt?: string): Promise<string> => {
  try {
    const prompt = `
Generate a complete Next.js React component for a dynamic agent interface based on this agent specification:

Agent Name: ${agentName || 'Custom Agent'}
Agent ID: ${agentName || 'Custom Agent'} (use this as the agentId when calling /api/ask-agent)
Improved Prompt: ${improvedPrompt || 'No additional context'}

Agent JSON Configuration:
${JSON.stringify(agentJson, null, 2)}

CRITICAL REQUIREMENTS:
1. On form submit, POST the user's plain text query and the agent's unique ID to /api/ask-agent as JSON: { query, agentId }.
2. Use "${agentName || 'Custom Agent'}" as the agentId value.
3. Display the response from the backend in the UI.
4. Do NOT use mock data. Do NOT use JSON.parse on user input.
5. Assume the backend endpoint will use the agent's JSON to call NeuralSeek and return the answer.
6. Use the built-in fetch API for all HTTP requests. Do NOT use axios or any other external HTTP library.
7. Return ONLY the React component code - NO markdown formatting, NO code blocks, NO explanatory text
8. Start directly with import statements
9. End with the component export
10. Create a functional React component using Next.js Pages Router (NOT App Router)
11. Component should be a default export from pages/index.tsx
12. Include proper TypeScript types
13. Use Tailwind CSS for styling
14. Include error handling for the API call
15. Show loading state while waiting for response
16. Do NOT wrap in markdown code blocks, do NOT add explanations

The component should have:
- A form with an input field for the user's query
- A submit button
- Display area for the agent's response
- Loading state
- Error handling
- Clean, modern UI with Tailwind CSS

Generate the complete React component code:`

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4000,
      temperature: 0.1,
    })

    let generatedCode = completion.choices[0].message.content || ''
    
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

    // Fallback: Replace axios usage with fetch if present
    if (generatedCode.includes('axios')) {
      generatedCode = generatedCode.replace(/import axios[^;]*;?\n?/g, '')
      generatedCode = generatedCode.replace(/axios\.post\s*\(([^,]+),\s*([^\)]+)\)/g, 'fetch($1, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify($2) }).then(res => res.json())')
      generatedCode = generatedCode.replace(/axios\.get\s*\(([^\)]+)\)/g, 'fetch($1).then(res => res.json())')
    }

    // Enforce POST for fetch calls to /api/ask-agent
    generatedCode = generatedCode.replace(/fetch\((['"])\/api\/ask-agent\1(,\s*\{[^\}]*\})?\)/g, (match, quote, options) => {
      if (options && options.includes('method')) return match; // already has method
      return `fetch('/api/ask-agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, agentId }) })`;
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
        break
      }
    }
    
    return generatedCode
  } catch (error) {
    console.error('Error generating site code:', error)
    throw error
  }
}