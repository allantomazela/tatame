import { createClient } from '@supabase/supabase-js'

// Try different possible environment variable names
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_PROJECT_URL

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_API_KEY

// Temporary fallback - replace with your actual Supabase credentials
const fallbackUrl = 'https://YOUR_PROJECT_ID.supabase.co'
const fallbackKey = 'YOUR_ANON_KEY_HERE'

const finalUrl = supabaseUrl || fallbackUrl
const finalKey = supabaseAnonKey || fallbackKey

console.log('🔧 Supabase Configuration:')
console.log('URL:', finalUrl)
console.log('Has Key:', !!finalKey)
console.log('Using fallback?', !supabaseUrl || !supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Using fallback Supabase credentials. Please configure your environment variables.')
}

export const supabase = createClient(finalUrl, finalKey)

export type UserType = 'mestre' | 'aluno' | 'responsavel'

export interface Profile {
  id: string
  user_type: UserType
  full_name: string
  email: string
  avatar_url?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  profile_id: string
  belt_color: string
  belt_degree: number
  date_joined: string
  responsible_id?: string
  birth_date?: string
  address?: string
  emergency_contact?: string
  medical_info?: string
  active: boolean
  profile?: Profile
}