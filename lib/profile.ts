import { supabase } from './supabase/client'

export interface UserProfile {
  id: string
  name: string
  number: string | null
  description: string | null
  interests: string | null
  city: string | null
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profile')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data as UserProfile
}

export async function hasProfile(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_profile')
    .select('id')
    .eq('id', userId)
    .single()

  return !error && !!data
}

export interface TutorProfile {
  id: string
  name: string
  number: string | null
  description: string | null
  instagram: string | null
  facebook: string | null
}

export async function getTutorProfile(userId: string): Promise<TutorProfile | null> {
  const { data, error } = await supabase
    .from('tutor_profile')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data as TutorProfile
}

export async function hasTutorProfile(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('tutor_profile')
    .select('id')
    .eq('id', userId)
    .single()

  return !error && !!data
}
