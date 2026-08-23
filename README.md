# Photography — nategrebelsky.com

A fast, minimal photography portfolio. Static site deployed to GitHub Pages.

## Origin

Originally forked from [rampatra/photography](https://github.com/rampatra/photography) (a Jekyll-based template). Has since been completely rewritten — now uses Astro for static generation, sharp for build-time image processing, and vanilla JS for interactions.

## Stack

- **Astro** — static site generator (zero JS shipped by default)
- **Sharp** — build-time thumbnail generation (800px, quality 85, mozjpeg)
- **Vanilla JS** — lightbox, lazy-load fade-in, scroll-aware nav
- **GitHub Actions** — automated build + deploy to Pages

## Adding / Removing Photos

1. Drop images into `public/images/fulls/GalleryName/` (any `.jpg`, `.jpeg`, `.png`, `.webp`)
2. Run `npm run thumbnails` to generate thumbnails and update the manifest
3. Build or restart dev server — galleries and nav links auto-update

To add a new gallery, just create a new folder. To remove one, delete the folder. No config changes needed.

## Local Development

```bash
npm install
npm run thumbnails   # generate thumbs + manifest
npm run dev          # start dev server (localhost:4321)
```

## Build & Deploy

```bash
npm run build        # generates thumbnails + builds static site to dist/
```

Deployment is handled by `.github/workflows/deploy.yml` — pushes to `master` trigger an automatic build and deploy to GitHub Pages. Make sure repo Settings → Pages → Source is set to "GitHub Actions".

## Structure

```
public/images/fulls/   — original full-resolution photos (source of truth)
public/images/thumbs/  — generated thumbnails (gitignored, rebuilt in CI)
src/pages/             — Astro pages (index gallery + about)
src/layouts/           — shared layout with dynamic nav
src/lib/galleries.ts   — build-time gallery scanner
scripts/               — thumbnail generation script
```
