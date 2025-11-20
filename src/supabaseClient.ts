import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ebuwcgbikwckibixhryu.supabase.co';
const supabaseKey = 'sb_publishable_IgRjuAc4-MQhjOfEQCIUng_bTAj0q2z';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test Supabase connection
export async function testSupabaseConnection() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (error) {
    console.error('Supabase connection error:', error);
    return false;
  } else {
    console.log('Supabase connection successful. Sample user data:', data);
    return true;
  }
}
// Save user info to Supabase
export async function saveUser(
  name: string,
  phone?: string,
  finalRating?: number // Added finalRating parameter
) {
  try {
    // Note: phone is the unique identifier at app level
    // Insert a new user record with only relevant columns
    const res = await supabase
      .from('users')
      .insert([
        {
          name,
          phone,
          final_rating: finalRating,
        }
      ])
      .select()
      .single();

    const { data, error, status, statusText } = res as any;
    if (error || !data) {
      console.error('Error saving user - insert failed', {
        error: error ?? null,
        status: status ?? null,
        statusText: statusText ?? null,
        data: data ?? null,
      });
      return null;
    }

    return data; // single inserted user row
  } catch (err) {
    console.error('Exception saving user:', err);
    return null;
  }
}

// Save puzzle result for a user
export async function savePuzzleResult(
  userId: string,
  puzzleLevel: number,
  puzzleNumber: number,
  result: boolean
) {
  const { data, error } = await supabase
    .from('puzzle_results')
    .insert([
      {
        user_id: userId,
        puzzle_level: puzzleLevel,
        puzzle_number: puzzleNumber,
        result
      }
    ]);
  if (error) {
    console.error('Error saving puzzle result:', error);
    return null;
  }
  return data;
}

// Update final_rating for an existing user
export async function updateFinalRating(userId: string, finalRating: number) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ final_rating: finalRating })
      .eq('id', userId);
    if (error) {
      console.error('Error updating final rating for user', userId, error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Exception updating final rating:', err);
    return null;
  }
}

// Lookup user by phone (returns user row or null)
export async function getUserByPhone(phone?: string) {
  if (!phone) return null;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();
    if (error) {
      // If no rows found, supabase returns an error; return null for not found
      // Other errors are logged
      // PGRST116 is 'No rows found' for PostgREST
      if ((error as any)?.code === 'PGRST116') return null;
      console.error('Error fetching user by phone:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Exception fetching user by phone:', err);
    return null;
  }
}