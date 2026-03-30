# Supabase Migration Guide

## 📋 Table of Contents
- [Quick Reference](#quick-reference)
- [Workflow](#workflow)
- [Common Commands](#common-commands)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Quick Reference

```bash
cd packages/supabase

# Check status
supabase migration list

# Create new migration
supabase migration new <name>

# Push to remote
supabase db push

# Pull from remote
supabase db pull

# Check differences
supabase db diff
```

---

## Workflow

### 1. Before Making Changes

**Always check sync status first:**

```bash
supabase migration list
```

Expected output:
```
Local          | Remote         | Time (UTC)
----------------|----------------|---------------------
20260326185700 | 20260326185700 | 2026-03-26 18:57:00 ✅
```

If remote has migrations you don't have locally:
```bash
supabase db pull
```

### 2. Creating a New Migration

```bash
# Create migration file
supabase migration new add_user_preferences

# Edit the generated file in migrations/
# Example: migrations/20260401120000_add_user_preferences.sql
```

**Migration Template:**
```sql
-- Migration: Add user_preferences table
-- Purpose: Store user app preferences

-- Create table
CREATE TABLE "public"."user_preferences" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" uuid REFERENCES auth.users(id) NOT NULL,
  "theme" text DEFAULT 'light',
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE "public"."user_preferences" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
ON "public"."user_preferences"
FOR SELECT
USING (auth.uid() = user_id);

-- Add indexes if needed
CREATE INDEX "user_preferences_user_id_idx" ON "public"."user_preferences"("user_id");

-- Add comments for documentation
COMMENT ON TABLE "public"."user_preferences" IS 'Stores user application preferences';
```

### 3. Testing Migration Locally (Optional)

```bash
# Start local Supabase
supabase start

# Apply migration locally
supabase db reset

# Test your changes
# ...

# Stop local instance
supabase stop
```

### 4. Pushing to Remote

```bash
# Check what will be pushed
supabase migration list

# Push migration
supabase db push

# Verify it was applied
supabase migration list
```

### 5. Committing to Git

```bash
# Stage the migration
git add packages/supabase/migrations/

# Commit with descriptive message
git commit -m "db: add user_preferences table for theme settings"

# Push to repository
git push
```

---

## Common Commands

### Check Migration Status
```bash
supabase migration list
```
Shows which migrations are applied locally vs remotely.

### Create New Migration
```bash
supabase migration new <descriptive_name>
```
Creates a timestamped migration file.

### Push Migrations to Remote
```bash
supabase db push
```
Applies all pending local migrations to remote database.

### Pull Remote Schema
```bash
supabase db pull [migration_name]
```
Creates a migration from remote schema changes. Use when remote has changes not in local migrations.

### Check Schema Differences
```bash
supabase db diff
```
Shows differences between local migrations and remote schema (useful for debugging).

### Repair Migration History
```bash
# Mark a remote migration as reverted (ignore it)
supabase migration repair --status reverted <migration_id>

# Mark a local migration as applied on remote
supabase migration repair --status applied <migration_id>
```

---

## Troubleshooting

### Issue: "Remote migration versions not found in local migrations directory"

**Symptom:**
```
Remote migration versions not found in local migrations directory.
supabase migration repair --status reverted 20260326193053
```

**Cause:** Remote database has migrations that don't exist locally.

**Solution:**

**Option 1: Accept Remote Changes (Recommended)**
```bash
# Pull the remote migration
supabase db pull temp_migration_name

# Review the generated file
# If it looks good, keep it and push your changes
supabase db push
```

**Option 2: Revert Remote Migration**
```bash
# If the remote migration is wrong/outdated
supabase migration repair --status reverted <migration_id>

# Then sync local migration
supabase migration repair --status applied <local_migration_id>

# Push your changes
supabase db push
```

### Issue: "Cannot find project ref"

**Cause:** Project not linked or `config.toml` missing.

**Solution:**
```bash
# Initialize if config.toml doesn't exist
supabase init

# Move config.toml to correct location if needed
mv supabase/config.toml .
rm -rf supabase/

# Link to project
supabase link --project-ref <your-project-ref>

# Find project ref in .env file or Supabase dashboard URL
# Format: https://supabase.com/dashboard/project/<project-ref>
```

### Issue: Migration Applied But Shows as Pending

**Cause:** Migration history table out of sync.

**Solution:**
```bash
# Mark as applied manually
supabase migration repair --status applied <migration_id>

# Verify
supabase migration list
```

---

## Best Practices

### ✅ DO

1. **Always Create Migrations Locally**
   - Never make schema changes directly in Supabase Dashboard
   - Always use migration files for reproducibility

2. **Use Descriptive Names**
   ```bash
   # Good
   supabase migration new add_needs_transcription_to_entries

   # Bad
   supabase migration new update_db
   ```

3. **Check Status Before Push**
   ```bash
   supabase migration list
   ```

4. **Test Complex Migrations Locally First**
   ```bash
   supabase start
   supabase db reset
   # Test...
   supabase stop
   ```

5. **Document Your Migrations**
   ```sql
   -- Migration: Add user preferences
   -- Purpose: Store theme and notification settings
   -- Related: Issue #123

   CREATE TABLE...
   ```

6. **Commit Migrations to Git Immediately**
   ```bash
   git add packages/supabase/migrations/
   git commit -m "db: add user_preferences table"
   ```

7. **Use Transactions When Possible**
   ```sql
   BEGIN;

   -- Your changes here
   ALTER TABLE...
   CREATE INDEX...

   COMMIT;
   ```

### ❌ DON'T

1. **Don't Make Manual Schema Changes in Dashboard**
   - Always use migration files
   - Exception: Emergency hotfixes (but document them immediately)

2. **Don't Edit Applied Migrations**
   - Once pushed, migrations are immutable
   - Create a new migration to fix issues

3. **Don't Delete Migration Files**
   - They're part of the database history
   - Even if reverted, keep them for reference

4. **Don't Use `--no-verify` Unless Necessary**
   ```bash
   # Avoid this unless you know what you're doing
   supabase db push --no-verify
   ```

5. **Don't Skip `supabase migration list` Before Push**
   - Always check sync status first
   - Prevents conflicts and loops

---

## Project Structure

```
packages/supabase/
├── config.toml              # Supabase CLI configuration
├── functions/               # Edge Functions
│   ├── google-books/
│   ├── whisper-transcribe/
│   └── book-summary/
├── migrations/              # Database migrations (DO NOT EDIT after push)
│   ├── 20260326185700_remote_schema.sql
│   └── 20260330_add_needs_transcription.sql
├── MIGRATIONS.md           # This file
└── README.md               # Package overview
```

---

## Local Development Setup

### First Time Setup

```bash
# 1. Install Supabase CLI
# https://supabase.com/docs/guides/cli/getting-started

# 2. Initialize (if not already done)
cd packages/supabase
supabase init

# 3. Link to project
supabase link --project-ref cupjufhlogedybhlgegj

# 4. Verify connection
supabase migration list
```

### Running Local Supabase Instance

```bash
# Start local instance (PostgreSQL + Auth + Storage + Edge Functions)
supabase start

# Your local Supabase is now running at:
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres

# Stop when done
supabase stop
```

---

## Related Documentation

- **WatermelonDB Migrations**: `packages/database/src/migrations.ts`
- **Sync Logic**: `apps/mobile/src/lib/sync.ts`
- **Edge Functions**: `packages/supabase/functions/*/README.md`

---

## Emergency Procedures

### Rollback a Migration

**Option 1: Create Reverting Migration (Recommended)**
```bash
supabase migration new revert_user_preferences

# Edit the file to undo changes
# Example:
# DROP TABLE "public"."user_preferences";
```

**Option 2: Database Rollback (Dangerous)**
```sql
-- In Supabase Dashboard SQL Editor
-- Manually revert the changes
-- Then update migration history
```

### Sync Issues After Team Member Push

```bash
# Pull their changes
git pull

# Sync with remote database
supabase db pull

# Check status
supabase migration list

# If needed, repair history
supabase migration repair --status applied <migration_id>
```

---

## Contact & Support

- **Supabase Docs**: https://supabase.com/docs/guides/cli
- **CLI Reference**: https://supabase.com/docs/reference/cli
- **Discord**: https://discord.supabase.com

---

**Last Updated**: March 30, 2026
**Supabase CLI Version**: v2.75.0+
**Project**: Bookfelt (cupjufhlogedybhlgegj)
