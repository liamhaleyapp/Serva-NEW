import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({
    openaiKey: process.env.OPENAI_API_KEY ? 'Set' : 'Not set',
    openaiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
    openaiKeyStart: process.env.OPENAI_API_KEY?.substring(0, 10) || 'N/A',
    neuralseekKey: process.env.NEURALSEEK_API_KEY ? 'Set' : 'Not set',
    vercelToken: process.env.VERCEL_TOKEN ? 'Set' : 'Not set',
    supabaseUrl: process.env.SUPABASE_URL ? 'Set' : 'Not set',
  })
} 