# Bookfelt Landing Page

Marketing website for Bookfelt - the reading journal app that captures your emotional journey through books.

## Tech Stack

- **Framework:** Next.js 15+ with App Router
- **Styling:** TailwindCSS 3.4+ with Bookfelt brand theme
- **Fonts:** Lora (serif), Source Sans 3 (sans), Courier Prime (mono)
- **Icons:** React Icons
- **Deployment:** Vercel

## Development

```bash
# Start dev server
nx serve landing

# Build for production
nx build landing

# Lint
nx lint landing
```

The dev server runs at http://localhost:3000

## Project Structure

```
apps/landing/
├── public/
│   ├── images/
│   │   ├── app-icon.png
│   │   └── screenshots/        # User-provided screenshots
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout + metadata
│   │   ├── page.tsx            # Homepage
│   │   ├── privacy/page.tsx    # Privacy policy
│   │   ├── terms/page.tsx      # Terms of service
│   │   ├── not-found.tsx       # 404 page
│   │   └── globals.css         # Tailwind + theme
│   └── components/
│       ├── Navigation.tsx      # Header with logo + nav
│       ├── Hero.tsx            # Hero section
│       ├── Features.tsx        # Feature grid
│       ├── AppPreview.tsx      # Screenshot showcase
│       ├── Differentiation.tsx # "Why Bookfelt?"
│       ├── Pricing.tsx         # Free vs Premium
│       ├── FAQ.tsx             # Accordion FAQ
│       ├── DownloadCTA.tsx     # App store badges
│       └── Footer.tsx          # Footer with links
```

## Brand Theme

The landing page uses Bookfelt's exact brand colors and typography from the mobile app:

**Colors (HSL):**
- Background: `36 40% 92%` (Cream #E8E0D4)
- Foreground: `20 33% 18%` (Dark brown #382C21)
- Primary: `35 52% 50%` (Amber/gold #C79446)
- Accent: `109 22% 33%` (Olive green #546E4A)

**Typography:**
- **Lora** (serif): Headings
- **Source Sans 3** (sans): Body text
- **Courier Prime** (mono): Accents

## Environment Variables

Create `.env.local` for local development:

```bash
NEXT_PUBLIC_APP_STORE_URL=https://apps.apple.com/app/id[APP_ID]
NEXT_PUBLIC_PLAY_STORE_URL=https://play.google.com/store/apps/details?id=com.kerk.bookfeltmobile
```

## Deployment

### Vercel (Recommended)

1. Connect GitHub repo to Vercel
2. Set root directory: `apps/landing`
3. Build command: `nx build landing`
4. Output directory: `dist/apps/landing/.next`
5. Add environment variables
6. Deploy

The site will auto-deploy on push to `main`.

## Adding Real Screenshots

Replace placeholder screenshots in `public/images/screenshots/`:
- `hero.png` (1200x800px recommended)
- `feature-1.png`, `feature-2.png`, `feature-3.png` (800x1600px recommended)
- `og-image.png` (1200x630px for social sharing)

Then update the components to use real images instead of placeholders.

## SEO

- **Sitemap:** `/sitemap.xml`
- **Robots:** `/robots.txt`
- **Metadata:** Configured in `app/layout.tsx`
- **Structured Data:** JSON-LD on homepage

## Performance Targets

- Lighthouse score: 90+ on all metrics
- LCP: < 2.5s
- CLS: < 0.1
- Images optimized with Next.js `<Image>` component

## Accessibility

- WCAG AA compliant
- Semantic HTML
- Keyboard navigation support
- Color contrast: 4.5:1 minimum
- Alt text for all images
- ARIA labels where needed
