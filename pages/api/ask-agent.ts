import type { NextApiRequest, NextApiResponse } from 'next'

// In-memory agent JSON map for demo (replace with DB in production)
const agentJsonMap: Record<string, any> = {
  // This will be populated when agents are created
};

// Function to store agent JSON when created
export const storeAgentJson = (agentId: string, agentJson: any) => {
  agentJsonMap[agentId] = agentJson;
  console.log(`Stored agent JSON for ID: ${agentId}`);
};

async function callNeuralSeek(agentJson: any, query: string) {
  try {
    // Extract the agent name from the OpenAPI spec
    const agentName = agentJson?.info?.title || 'Unknown Agent';
    
    // Call NeuralSeek with the specific agent
    const response = await fetch(`https://stagingapi.neuralseek.com/v1/${process.env.NEURALSEEK_INSTANCE}/maistro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEURALSEEK_API_KEY!,
      },
      body: JSON.stringify({
        agent: agentName,
        params: {
          query: query,
          // Add any other parameters the agent expects based on the OpenAPI spec
        },
        options: {
          returnVariables: true,
          returnVariablesExpanded: true,
          debug: false
        }
      })
    });

    if (!response.ok) {
      throw new Error(`NeuralSeek API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    // Return the answer from NeuralSeek
    return { 
      answer: data.answer || 'No response received from agent',
      sourceParts: data.sourceParts || [],
      variables: data.variables || {}
    };
  } catch (error) {
    console.error('Error calling NeuralSeek:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const { query, agentId } = req.body;
    if (!query || !agentId) {
      return res.status(400).json({ error: 'Query and agentId are required' });
    }
    const agentJson = agentJsonMap[agentId];
    if (!agentJson) {
      return res.status(404).json({ error: 'Agent not found. Please create the agent first.' });
    }
    const result = await callNeuralSeek(agentJson, query);
    return res.status(200).json(result);
  } catch (error) {
    // Always return a valid JSON error response
    return res.status(500).json({ error: 'Failed to get answer from NeuralSeek', details: (error instanceof Error ? error.message : String(error)) });
  }
} 