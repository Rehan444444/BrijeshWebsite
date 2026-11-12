/*
# Create inquiries table for Sandeep Tools contact form

1. New Tables
- `inquiries`
  - `id` (uuid, primary key)
  - `name` (text, required) - the visitor's name
  - `company` (text, optional) - the visitor's company
  - `email` (text, required) - contact email
  - `phone` (text, optional) - contact phone number
  - `interest` (text, optional) - service or product the visitor is interested in
  - `message` (text, required) - the visitor's requirements
  - `created_at` (timestamptz) - when the inquiry was submitted

2. Security
- Enable RLS on `inquiries`.
- Grant INSERT only to `anon` and `authenticated` so the public contact form can submit.
- Single INSERT policy with length checks. No SELECT, UPDATE or DELETE access is granted to public visitors, so submitted inquiries cannot be read or changed from the website.

3. Notes
- Inquiries are read by the business owner from the Supabase dashboard.
*/

CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  company text CHECK (company IS NULL OR char_length(company) <= 160),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 40),
  interest text CHECK (interest IS NULL OR char_length(interest) <= 120),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 3000),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON inquiries TO anon, authenticated;

DROP POLICY IF EXISTS "public_insert_inquiries" ON inquiries;
CREATE POLICY "public_insert_inquiries" ON inquiries FOR INSERT
TO anon, authenticated
WITH CHECK (true);
