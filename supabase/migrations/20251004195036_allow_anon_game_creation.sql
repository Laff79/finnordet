/*
  # Allow Anonymous Game Creation
  
  1. Changes
    - Add policy for anonymous users to create games
    - Games created by anonymous users will have NULL created_by
  
  2. Security
    - Anonymous users can create public games
    - Anonymous users can view all public games
*/

CREATE POLICY "Anonymous users can create games"
  ON word_search_games
  FOR INSERT
  TO anon
  WITH CHECK (is_public = true AND created_by IS NULL);