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
  phone?: string
) {
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        name,
        email,
        years_playing: yearsPlaying,
        knows_piece_movement: knowsPieceMovement,
        played_tournaments: playedTournaments,
        phone
      }
    ])
    .select(); // Ensure inserted row is returned
  if (error || !data || !data[0]) {
    console.error('Error saving user:', error);
    return null;
  }
  return data[0]; // Return the inserted user row
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