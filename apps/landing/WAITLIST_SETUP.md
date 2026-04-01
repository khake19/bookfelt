# Waitlist Feature Setup

## ✅ What Was Added

### 1. Waitlist Component (`src/components/Waitlist.tsx`)
- Email signup form with validation
- "Coming Soon" badge
- Success/error states with animations
- Clean, branded design matching Bookfelt theme

### 2. Updated Download Buttons (`src/components/DownloadCTA.tsx`)
- Now shows "Coming Soon on App Store"
- Shows "Closed Testing on Google Play"
- Links scroll to waitlist section (#waitlist)
- Easy to switch to live downloads later (just change `variant` prop)

### 3. Homepage Integration
- Waitlist section added before footer
- Removed redundant final CTA section
- All CTAs now direct to waitlist

---

## 🔌 Connecting to Email Service

The waitlist form is currently a **placeholder** that simulates success. You need to connect it to an email service to actually collect emails.

### Option 1: Supabase (Recommended - You Already Use It!)

**Step 1: Create Table**
```sql
-- Run in Supabase SQL Editor
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (but not read)
CREATE POLICY "Anyone can join waitlist"
  ON waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);
```

**Step 2: Create Edge Function**
```bash
cd packages/supabase
supabase functions new waitlist
```

**Step 3: Function Code** (`supabase/functions/waitlist/index.ts`)
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { email } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { error } = await supabase
      .from('waitlist')
      .insert({ email })

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  }
})
```

**Step 4: Deploy Function**
```bash
supabase functions deploy waitlist
```

**Step 5: Update Waitlist Component**

In `apps/landing/src/components/Waitlist.tsx`, replace the TODO section:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setStatus('loading')

  try {
    const response = await fetch(
      'https://your-project.supabase.co/functions/v1/waitlist',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }
    )

    if (!response.ok) throw new Error('Failed to join waitlist')

    setStatus('success')
    setMessage("You're on the list! We'll notify you when Bookfelt launches.")
    setEmail('')
  } catch (error) {
    setStatus('error')
    setMessage('Something went wrong. Please try again.')
  }
}
```

---

### Option 2: Mailchimp

**Step 1: Get API Key**
1. Go to Mailchimp → Account → Extras → API Keys
2. Create new API key
3. Create an audience/list

**Step 2: Create API Route**

Create `apps/landing/src/app/api/waitlist/route.ts`:

```typescript
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    const response = await fetch(
      `https://${process.env.MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
        }),
      }
    )

    if (!response.ok) throw new Error('Failed to subscribe')

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 400 }
    )
  }
}
```

**Step 3: Add Environment Variables**

In `apps/landing/.env.local`:
```bash
MAILCHIMP_API_KEY=your_api_key
MAILCHIMP_LIST_ID=your_list_id
MAILCHIMP_DC=us1  # Your data center (us1, us2, etc.)
```

**Step 4: Update Waitlist Component**

```typescript
const response = await fetch('/api/waitlist', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email }),
})
```

---

### Option 3: ConvertKit (Simple)

**Step 1: Get Form ID**
1. Go to ConvertKit → Forms
2. Create a new form
3. Get the form ID from the embed code

**Step 2: Direct Form Submission**

Update the form in `Waitlist.tsx`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setStatus('loading')

  try {
    const response = await fetch(
      `https://api.convertkit.com/v3/forms/${process.env.NEXT_PUBLIC_CONVERTKIT_FORM_ID}/subscribe`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: process.env.NEXT_PUBLIC_CONVERTKIT_API_KEY,
          email,
        }),
      }
    )

    if (!response.ok) throw new Error('Failed to subscribe')

    setStatus('success')
    setMessage("You're on the list! We'll notify you when Bookfelt launches.")
    setEmail('')
  } catch (error) {
    setStatus('error')
    setMessage('Something went wrong. Please try again.')
  }
}
```

Add to `.env.local`:
```bash
NEXT_PUBLIC_CONVERTKIT_FORM_ID=your_form_id
NEXT_PUBLIC_CONVERTKIT_API_KEY=your_api_key
```

---

## 📧 Notifying Users When You Launch

Once you're ready to launch, you'll want to send an email to everyone on the waitlist.

### Export Emails from Supabase
```sql
SELECT email, created_at
FROM waitlist
ORDER BY created_at ASC;
```

Download as CSV and import into your email service.

### Suggested Launch Email Template

```
Subject: 🎉 Bookfelt is Live!

Hi there,

Thank you for joining our waitlist! We're excited to announce that Bookfelt is now available on iOS and Android.

Bookfelt helps you capture your thoughts and feelings as you read—tracking your emotional journey through every book.

📱 Download now:
- iOS: [App Store Link]
- Android: [Google Play Link]

As a thank you for your early support, enjoy [optional: special offer/bonus].

Happy reading!
The Bookfelt Team

P.S. We'd love to hear your feedback! Reply to this email anytime.
```

---

## 🔄 Switching to Live Downloads Later

When your apps are live, update `DownloadCTA` usage:

**Current (Coming Soon):**
```tsx
<DownloadCTA variant="coming-soon" />
```

**When Live:**
```tsx
<DownloadCTA variant="default" />
```

And update `.env.local`:
```bash
NEXT_PUBLIC_APP_STORE_URL=https://apps.apple.com/app/bookfelt/id[YOUR_APP_ID]
NEXT_PUBLIC_PLAY_STORE_URL=https://play.google.com/store/apps/details?id=com.kerk.bookfeltmobile
```

---

## Current Status

✅ Waitlist UI complete and styled
✅ Form validation working
✅ Success/error states implemented
✅ CTAs updated to "Coming Soon"
⏳ Email service integration (choose option above)

**Build Status:** ✅ Compiles successfully
**Ready to:** Deploy with email service integration
