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
    .maybeSingle()

  if (error || !data) return null
  return data as UserProfile
}

export async function hasProfile(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_profile')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  return !error && !!data
}

export interface TutorProfile {
  id: string
  name: string
  number: string | null
  description: string | null
  instagram: string | null
  facebook: string | null
  relationship: string | null
  factors: string | null
}

export async function getTutorProfile(userId: string): Promise<TutorProfile | null> {
  const { data, error } = await supabase
    .from('tutor_profile')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return null
  return data as TutorProfile
}

export async function hasTutorProfile(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('tutor_profile')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  return !error && !!data
}

export interface FriendProfile {
  id: string
  name: string
  number: string | null
  description: string | null
  instagram: string | null
  facebook: string | null
  relationship: string | null
  factors: string | null
}

export async function getFriendProfile(userId: string): Promise<FriendProfile | null> {
  const { data, error } = await supabase
    .from('friend_profile')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return null
  return data as FriendProfile
}

export async function hasFriendProfile(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('friend_profile')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  return !error && !!data
}

export interface UserMemoryFact {
  text: string
  category: 'hard' | 'soft'
  created_at: string
}

export interface UserMemory {
  id: string
  facts: UserMemoryFact[]
  narrative: string | null
  updated_at: string
}

export async function getUserMemory(userId: string): Promise<UserMemory | null> {
  const { data, error } = await supabase
    .from('user_memory')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return null
  return data as UserMemory
}
