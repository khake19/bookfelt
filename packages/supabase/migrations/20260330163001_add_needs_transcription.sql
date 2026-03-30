-- Add needs_transcription to entries table
ALTER TABLE entries
ADD COLUMN needs_transcription boolean DEFAULT false NOT NULL;
