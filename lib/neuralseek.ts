interface NeuralSeekResponse {
  answer: string
  variables?: {
    use_case_summary?: string
    user?: string
    contextUser?: string
    runid?: string
    resultslink?: string
    loopCount?: string
    improved_prompt?: string
    agentName?: string
    'makeNTL.ntl'?: string
    ntl_object?: string
    json?: string
    agentCurrentStep?: string
  }
  sourceParts?: string[]
  render?: any[]
  variablesExpanded?: Array<{
    name: string
    value: string
  }>
}

export const createAgent = async (description: string): Promise<any> => {
  try {
    const response = await fetch(`https://stagingapi.neuralseek.com/v1/${process.env.NEURALSEEK_INSTANCE}/maistro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEURALSEEK_API_KEY!,
      },
      body: JSON.stringify({
        agent: 'Create-agent',
        params: {
          use_case_summary: description
        },
        options: {
          returnVariables: true,
          returnVariablesExpanded: true,
          debug: false
        }
      })
    })

    if (!response.ok) {
      throw new Error(`NeuralSeek API error: ${response.status}`)
    }

    const data: NeuralSeekResponse = await response.json()
    
    // Extract JSON from the response variables
    let agentJson = null
    if (data.variables && data.variables.json) {
      try {
        agentJson = JSON.parse(data.variables.json)
      } catch (e) {
        console.error('Failed to parse JSON from variables.json:', e)
        // Fallback to raw json string
        agentJson = data.variables.json
      }
    } else if (data.answer) {
      // Try to extract JSON from answer text as fallback
      const jsonMatch = data.answer.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          agentJson = JSON.parse(jsonMatch[0])
        } catch (e) {
          console.error('Failed to parse JSON from answer:', e)
        }
      }
    }

    return {
      success: true,
      agentJson,
      agentName: data.variables?.agentName,
      improvedPrompt: data.variables?.improved_prompt,
      ntlObject: data.variables?.ntl_object,
      fullResponse: data
    }
  } catch (error) {
    console.error('Error creating agent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
} 