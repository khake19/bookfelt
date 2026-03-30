-- Add date_finished to books table
ALTER TABLE books
ADD COLUMN date_finished timestamptz;
