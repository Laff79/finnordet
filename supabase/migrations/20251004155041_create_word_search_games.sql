/*
  # Ordleting (Word Search) Database Schema

  1. New Tables
    - `word_search_games`
      - `id` (uuid, primary key) - Unique identifier for each game
      - `title` (text) - Game title
      - `grid_size` (integer) - Size of the grid (15 for 15x15)
      - `grid_data` (jsonb) - The 15x15 letter grid
      - `words` (jsonb) - Array of words to find with their positions
      - `created_by` (uuid) - Reference to auth.users
      - `created_at` (timestamptz) - Creation timestamp
      - `is_public` (boolean) - Whether the game is publicly accessible
  
  2. Security
    - Enable RLS on `word_search_games` table
    - Policy for authenticated users to create games
    - Policy for users to view their own games
    - Policy for anyone to view public games
    - Policy for users to update their own games
    - Policy for users to delete their own games
*/

CREATE TABLE IF NOT EXISTS word_search_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Ordleting',
  grid_size integer NOT NULL DEFAULT 15,
  grid_data jsonb NOT NULL,
  words jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  is_public boolean DEFAULT true
);

ALTER TABLE word_search_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create games"
  ON word_search_games
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view own games"
  ON word_search_games
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Anyone can view public games"
  ON word_search_games
  FOR SELECT
  TO anon
  USING (is_public = true);

CREATE POLICY "Authenticated users can view public games"
  ON word_search_games
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can update own games"
  ON word_search_games
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own games"
  ON word_search_games
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS idx_word_search_games_created_by ON word_search_games(created_by);
CREATE INDEX IF NOT EXISTS idx_word_search_games_is_public ON word_search_games(is_public);
CREATE INDEX IF NOT EXISTS idx_word_search_games_created_at ON word_search_games(created_at DESC);