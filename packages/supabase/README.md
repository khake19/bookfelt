# Supabase Package

Backend infrastructure for Bookfelt using Supabase (PostgreSQL database, Auth, Storage, Edge Functions).

## 📦 What's Inside

- **`migrations/`** - Database schema migrations (PostgreSQL)
- **`functions/`** - Edge Functions (Deno runtime)
  - `google-books` - Google Books API search
  - `whisper-transcribe` - OpenAI Whisper audio transcription
  - `book-summary` - GPT-4o-mini book summary generation
  - `revenuecat-webhook` - RevenueCat subscription sync
- **`config.toml`** - Supabase CLI configuration

## 🚀 Quick Start

### Prerequisites

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Or using npm
npm install -g supabase
```

### Common Commands

```bash
cd packages/supabase

# Check migration status
supabase migration list

# Create new migration
supabase migration new <name>

# Push migrations to remote
supabase db push

# Deploy edge functions
supabase functions deploy <function-name>
```

## 📖 Documentation

- **[MIGRATIONS.md](./MIGRATIONS.md)** - Complete migration workflow guide
  - Creating migrations
  - Pushing to remote
  - Troubleshooting
  - Best practices

## 🔗 Project Info

- **Project Ref**: `cupjufhlogedybhlgegj`
- **Region**: US East
- **Database**: PostgreSQL 15+

## 🏗️ Architecture

```
Local (WatermelonDB/SQLite)
    ↕ Sync
Remote (Supabase/PostgreSQL)
```

- Local database is the source of truth (offline-first)
- Supabase provides cloud sync + serverless functions
- Sync logic: `apps/mobile/src/lib/sync.ts`

## 🔑 Environment Variables

Required in `apps/mobile/.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://cupjufhlogedybhlgegj.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

## 📝 Related Docs

- [WatermelonDB Schema](../database/README.md)
- [Sync Implementation](../../apps/mobile/src/lib/sync.ts)
- [Edge Functions](./functions/README.md)

---

**Need help with migrations?** See [MIGRATIONS.md](./MIGRATIONS.md)
