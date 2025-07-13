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

Requirements:
1. Create a functional React component that renders a form/interface based on the agent JSON
2. Include proper TypeScript types
3. Use Tailwind CSS for modern, professional styling
4. Make it responsive and visually appealing
5. Include form validation where appropriate
6. Handle the agent's specific functionality as described in the JSON
7. Include a header with the agent name and description
8. Add interactive elements that make sense for this specific agent
9. Include loading states and error handling
10. Make it a complete, self-contained page component

The component should be production-ready and user-friendly. Focus on creating an interface that effectively serves the agent's intended purpose.

Return only the React component code starting with 'import' statements and ending with the component export.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4000,
      temperature: 0.1,
    })

    return completion.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Error generating site code:', error)
    throw error
  }
} 