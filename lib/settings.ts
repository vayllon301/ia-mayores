import { supabase } from '@/lib/supabase/client';

export interface UserSettings {
  id: string;
  font_size: 'normal' | 'large' | 'xlarge';
  theme: 'light' | 'dark';
}

const DEFAULTS: Omit<UserSettings, 'id'> = {
  font_size: 'normal',
  theme: 'light',
};

export async function getUserSettings(userId: string): Promise<UserSettings> {
  // Try Supabase first
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('id', userId)
      .single();

    if (data && !error) {
      return data as UserSettings;
    }
  } catch {
    // Table might not exist yet
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(`menteviva_settings_${userId}`);
    if (stored) {
      return { id: userId, ...DEFAULTS, ...JSON.parse(stored) };
    }
  } catch {
    // SSR or localStorage not available
  }

  return { id: userId, ...DEFAULTS };
}

export async function updateUserSettings(
  userId: string,
  updates: Partial<Omit<UserSettings, 'id'>>
): Promise<void> {
  // Save to localStorage immediately
  try {
    const stored = localStorage.getItem(`menteviva_settings_${userId}`);
    const current = stored ? JSON.parse(stored) : DEFAULTS;
    const merged = { ...current, ...updates };
    localStorage.setItem(`menteviva_settings_${userId}`, JSON.stringify(merged));
  } catch {
    // SSR or localStorage not available
  }

  // Sync to Supabase
  try {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.warn('Settings saved locally only:', error.message);
    }
  } catch {
    // Table might not exist
  }
}
