-- Drop needs_transcription from entries table
ALTER TABLE entries
DROP COLUMN IF EXISTS needs_transcription;
