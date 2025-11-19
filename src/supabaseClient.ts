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
  email: string,
  yearsPlaying: number,
  knowsPieceMovement: boolean,
  playedTournaments: boolean,
  phone?: string,
  finalRating?: number // Added finalRating parameter
) {
  try {
    // Check if a user with the same email already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.warn(`A user with the email ${email} already exists. No new record was created.`);
      return null; // Return null to indicate no new record was created
    }

    if (fetchError && fetchError.code !== 'PGRST116') { // Ignore "No rows found" error
      console.error('Error fetching user:', fetchError);
      return null;
    }

    // Insert a new user record
    const res = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          years_playing: yearsPlaying,
          knows_piece_movement: knowsPieceMovement,
          played_tournaments: playedTournaments,
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