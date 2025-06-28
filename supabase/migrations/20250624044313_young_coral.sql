/*
  # Update waitlist table for enhanced signup system

  1. New Columns
    - `job_title` (text, optional) - User's job position
    - `newsletter_consent` (boolean, default false) - Newsletter subscription consent

  2. Security
    - Update existing RLS policies for better data validation
    - Add policies for authenticated users to manage waitlist entries

  3. Indexes
    - Maintain existing unique email constraint
    - Add index on created_at for better query performance
*/

-- Add new columns to waitlist table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'waitlist' AND column_name = 'job_title'
  ) THEN
    ALTER TABLE waitlist ADD COLUMN job_title text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'waitlist' AND column_name = 'newsletter_consent'
  ) THEN
    ALTER TABLE waitlist ADD COLUMN newsletter_consent boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Update existing RLS policies
DROP POLICY IF EXISTS "Allow public insert to waitlist" ON waitlist;
DROP POLICY IF EXISTS "Admins can view waitlist" ON waitlist;

-- Create improved RLS policies
CREATE POLICY "Allow public insert to waitlist"
  ON waitlist
  FOR INSERT
  TO anon
  WITH CHECK (
    email IS NOT NULL AND 
    name IS NOT NULL AND 
    newsletter_consent IS NOT NULL
  );

CREATE POLICY "Authenticated users can view waitlist"
  ON waitlist
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update waitlist"
  ON waitlist
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete waitlist"
  ON waitlist
  FOR DELETE
  TO authenticated
  USING (true);

-- Add index on created_at for better performance
CREATE INDEX IF NOT EXISTS waitlist_created_at_idx ON waitlist (created_at DESC);