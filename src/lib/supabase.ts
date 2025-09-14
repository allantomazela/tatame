import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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