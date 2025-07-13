import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Project {
  id: string
  name: string
  description: string
  agent_json: any
  vercel_url: string
  created_at: string
}

export const logProjectToSupabase = async (projectData: Omit<Project, 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      throw new Error(`Failed to log project: ${error.message}`)
    }

    return data[0]
  } catch (error) {
    console.error('Error logging to Supabase:', error)
    throw error
  }
} 