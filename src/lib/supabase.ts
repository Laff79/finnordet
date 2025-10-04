import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type WordSearchGame = {
  id: string;
  title: string;
  grid_size: number;
  grid_data: string[][];
  words: {
    word: string;
    start: { row: number; col: number };
    end: { row: number; col: number };
    direction: string;
  }[];
  created_by?: string;
  created_at: string;
  is_public: boolean;
};
