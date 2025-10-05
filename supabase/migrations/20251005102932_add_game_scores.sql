/*
  # Add Game Scores Table

  1. New Tables
    - `game_scores`
      - `id` (uuid, primary key)
      - `game_id` (uuid, references word_search_games)
      - `score` (integer, player's final score)
      - `time_seconds` (integer, time taken in seconds)
      - `words_found` (integer, number of words found)
      - `completed` (boolean, whether all words were found)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `game_scores` table
    - Allow anonymous users to insert their scores
    - Allow anyone to view all scores (leaderboard)
*/

CREATE TABLE IF NOT EXISTS game_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES word_search_games(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  time_seconds integer NOT NULL DEFAULT 0,
  words_found integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scores"
  ON game_scores
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert scores"
  ON game_scores
  FOR INSERT
  TO anon
  WITH CHECK (true);