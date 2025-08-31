# TPA Project — Next.js + WordPress/ACF
_All-in-one README + Docs_

Frontend built with **Next.js (App Router) + TypeScript + SCSS Modules**.  
Content is managed in **WordPress**, using the **REST API** and **Advanced Custom Fields (ACF)**.  
Includes a **Blog (Learn)** page with **search, sorting, pagination**, a **Featured** section, and an **External API** section.

---

## Table of Contents

1. [README (Quick Start)](#readme-quick-start)  
   1.1. [Architecture Overview](#architecture-overview)  
   1.2. [Local Setup (Quick Start)](#local-setup-quick-start)  
   1.3. [WordPress (Docker) Setup](#wordpress-docker-setup)  
   1.4. [Next.js App Setup](#nextjs-app-setup)  
   1.5. [Data Layer](#data-layer)  
   1.6. [ACF Field Model](#acf-field-model)  
   1.7. [Pages & Components](#pages--components)  
   1.8. [Configuration (Next/TS)](#configuration-nextts)  
   1.9. [Running Locally](#running-locally)  
   1.10. [Deployment (Vercel)](#deployment-vercel)  
   1.11. [Troubleshooting & FAQ](#troubleshooting--faq)  
   1.12. [Contributing Guidelines](#contributing-guidelines)

2. [docs/ (Extended Guide)](#docs-extended-guide)  
   2.1. [Project Overview](#project-overview)  
   2.2. [Environment, Scripts & Tasks](#environment-scripts--tasks)  
   2.3. [WordPress/ACF Setup Guide](#wordpressacf-setup-guide)  
   2.4. [API & Data Contracts](#api--data-contracts)  
   2.5. [Components Catalog](#components-catalog)  
   2.6. [Styling Guide (SCSS Modules + Tailwind utilities)](#styling-guide-scss-modules--tailwind-utilities)  
   2.7. [Quality Checklist (QA/UAT)](#quality-checklist-qauat)  
   2.8. [Deployment Guide (Vercel)](#deployment-guide-vercel)  
   2.9. [Maintenance & Playbooks](#maintenance--playbooks)  
   2.10. [Changelog Template](#changelog-template)

---

## README (Quick Start)

### Architecture Overview

- **Frontend**: Next.js (App Router), TypeScript, SCSS Modules (with some Tailwind utilities).
- **Backend**: WordPress + ACF as headless CMS (REST API enabled).
- **Data Layer**: `src/lib/wp.ts` (WordPress helpers) and `src/lib/blog.ts` (external API).
- **Content Strategy**:
  - Home pulls **heroes**, **logos**, **features**, **FAQs** and a **Featured Carousel** (ACF relationship → fallback to sticky/category).
  - Learn page lists **Featured**, **External API** items, and **All Press Releases** (WP posts) with **search/sort/pagination**.

### Local Setup (Quick Start)

1. Clone this repo.
2. Start WordPress locally (see below).
3. Create `.env.local` in the Next.js app:
   ```bash
   NEXT_PUBLIC_WP_BASE=http://localhost:8080
   NEXT_PUBLIC_EXTERNAL_API=https://jsonplaceholder.typicode.com/posts
   ```
4. Install & run:
   ```bash
   npm install
   npm run dev
   ```
5. Visit Next app at http://localhost:3000 and WP at http://localhost:8080.

### WordPress (Docker) Setup

**docker-compose.yml**
```yaml
version: "3.8"
services:
  db:
    image: mysql:8
    environment:
      MYSQL_DATABASE: wp
      MYSQL_USER: wp
      MYSQL_PASSWORD: wp
      MYSQL_ROOT_PASSWORD: root
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - "3307:3306"

  wordpress:
    image: wordpress:latest
    depends_on:
      - db
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wp
      WORDPRESS_DB_PASSWORD: wp
      WORDPRESS_DB_NAME: wp
    ports:
      - "8080:80"
    volumes:
      - ./wp-content:/var/www/html/wp-content

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    depends_on:
      - db
    environment:
      PMA_HOST: db
    ports:
      - "8081:80"

volumes:
  db_data:
```

**Steps**
1. `docker compose up -d`
2. Open WP at http://localhost:8080 and finish installation.
3. Install & activate: **Advanced Custom Fields** (ACF).  
4. Set **Permalinks** to “Post name”.
5. (Optional) Increase upload limits:
   ```ini
   upload_max_filesize=64M
   post_max_size=64M
   memory_limit=256M
   ```

### Next.js App Setup

Create `.env.local`:
```bash
NEXT_PUBLIC_WP_BASE=http://localhost:8080
NEXT_PUBLIC_EXTERNAL_API=https://jsonplaceholder.typicode.com/posts
```

Install & run:
```bash
npm install
npm run dev
```

### Data Layer

**`src/lib/wp.ts`**
- `WP_BASE` (from env)
- `get<T>(path)` – fetch helper with `revalidate`
- `stripTags(html)` – HTML → text
- `normalizeIds(raw)` – normalizes ACF Relationship inputs
- `fetchMenuServer(slug)`
- `fetchHomePageACF(slug)` → `{ acf }`
- `fetchPostsByIds(ids, type?)` – keeps order of IDs
- `fetchPosts({ page, perPage, q, sort, excludeIds })` – paginated listing
- `fetchFeatured({ limit, useACF, categorySlug })` – ACF (optional) → sticky → category fallback

**Card format (shared)**
```ts
type Card = {
  id: number;
  href: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  imageAlt?: string;
  date?: string;
};
```

**`src/lib/blog.ts` (External API)**
- `fetchExternalAPosts({ page, perPage, q, sort })` → `{ items: Card[] }`
- Replace demo endpoint with your real API + mapping.

### ACF Field Model

**Flexible `sections`** (layouts recognized): `hero`, `hero_block`, `heroSection`  
Fields per hero layout:
- `title`, `subtitle`
- `primary.label` + `primary.href` (or `primary_label` + `primary_url`)
- `secondary.label` + `secondary.href` (or `secondary_label` + `secondary_url`)
- `bg_image` (image object with `url`)

**Footer hero (standalone fields):**
- `hero_title_footer`, `hero_subtitle_footer`
- `hero_primary_label_footer`, `hero_primary_url_footer`
- `hero_secondary_label_footer`, `hero_secondary_url_footer`
- `hero_bg_image_footer`

**Other (optional):** `logos` (images), `features` (cards), `faqs` (array of `{question, answer}`), `featured_posts` (relationship).  
> Ensure ACF fields are **shown in REST** (Field Group → “Show in REST API”).

### Pages & Components

**Home — `src/app/page.tsx` (Server)**  
Renders: `Navbar` → `Hero(top)` → Tabs/FeatureTriplet/Logos → `FeaturedCarousel` → `FAQ` → `Hero(footer)` → `Footer/Privacy`.

**Learn — `src/app/learn/page.tsx` (Server)**  
Sections:
1. SectionHeading (“Blog”)
2. `SearchBar` (Client) – updates `q` + `sort`
3. Featured (WordPress)
4. External API (mapped as cards)
5. All Press Releases (WordPress, paginated)
6. Pager (preserves `q/sort`)

**Featured Carousel**: `Server.tsx` fetches data (ACF/sticky/category) → passes to `Client.tsx` (UI/scroll).

### Configuration (Next/TS)

**`next.config.ts`**
```ts
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: { turbo: { enabled: false } },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8080", pathname: "/wp-content/**" },
      { protocol: "https", hostname: "futureoffounders.com", pathname: "/wp-content/**" }
    ]
  },
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname, "src"),
    };
    return config;
  }
};

export default nextConfig;
```

**`tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "baseUrl": "src",
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "src/**/*", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Running Locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

**Clean cache if needed**
```bash
rm -rf .next
npm run dev
```

### Deployment (Vercel)

1) New Vercel project → link repo.  
2) Set env vars:
   - `NEXT_PUBLIC_WP_BASE` → prod WP URL
   - `NEXT_PUBLIC_EXTERNAL_API` → external API endpoint (optional)  
3) Allow the WP domain in `next.config.ts` → `images.remotePatterns`.  
4) Handle CORS (allow the Vercel domain) or use a proxy.  
5) Deploy.

### Troubleshooting & FAQ

- **“is not a function”** → likely duplicate/mismatched imports. Keep a single canonical data layer in `src/lib/wp.ts`.
- **Mobile nav transparent** → ensure modal wrapper uses `style={{ isolation: 'isolate' }}` and panel `z-index` + `bg-white`.
- **WP images not loading (Vercel)** → add host to `images.remotePatterns`.
- **Pagination with search** → use the provided Pager; it preserves `q/sort`.
- **WP upload limits** → bump `upload_max_filesize`, `post_max_size`, `memory_limit`.
- **CORS** → allow Vercel domain in WP or set a proxy route in Next.

### Contributing Guidelines

- Server Components handle data fetch/render. Client Components handle interactivity only.
- Avoid duplicating helpers/consts. Import from `src/lib/wp.ts` / `src/lib/blog.ts`.
- Small, descriptive commits. Add tests for the data layer if extending.

---

## docs/ (Extended Guide)

### Project Overview

- **Goal**: A scalable, headless setup where marketing teams edit content in WordPress and engineering ships a fast modern frontend.
- **Why hybrid**: WP handles editorial workflows and structured content (ACF). Next.js focuses on performance, routing, and frontend DX.

### Environment, Scripts & Tasks

**Environment variables**
```bash
NEXT_PUBLIC_WP_BASE=http://localhost:8080
NEXT_PUBLIC_EXTERNAL_API=https://jsonplaceholder.typicode.com/posts
```

**Scripts**
```bash
npm run dev     # local dev
npm run build   # production build
npm start       # serve .next/ in production
```

**Housekeeping**
```bash
rm -rf .next    # clear build cache
```

### WordPress/ACF Setup Guide

1. Install **ACF** and ensure Field Groups are set to “Show in REST API”.
2. Create a **Home** page with slug `home`.
3. Add **Flexible Content** field `sections` with **Hero** layout (`hero`/`hero_block`/`heroSection`):
   - `title`, `subtitle`
   - `primary.label` + `primary.href`
   - `secondary.label` + `secondary.href`
   - `bg_image` (image object w/ `url`)
4. Add **Footer Hero** fields:
   - `hero_title_footer`, `hero_subtitle_footer`
   - `hero_primary_label_footer`, `hero_primary_url_footer`
   - `hero_secondary_label_footer`, `hero_secondary_url_footer`
   - `hero_bg_image_footer`
5. Add optional:
   - `logos` (images)
   - `features` (cards)
   - `faqs` (array of q/a)
   - `featured_posts` (Relationship) for the Featured Carousel.

### API & Data Contracts

**WordPress**  
- Menus: custom REST route (exposed via a small MU-plugin if needed):  
  `/wp-json/site/v1/navigation/{slug}` → `NavItem[]`
- Home ACF:  
  `/wp-json/wp/v2/pages?slug=home&_fields=acf`
- Posts/CPT:  
  `/wp-json/wp/v2/posts?...`  
  `/wp-json/wp/v2/{cpt}?...` (e.g., `case-study`)

**Shared Card Model**
```ts
type Card = {
  id: number;
  href: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  imageAlt?: string;
  date?: string;
};
```

**External API**  
- Pluggable in `src/lib/blog.ts`. Map your endpoint into `Card[]`.

**Example: curl (local WP)**
```bash
curl "http://localhost:8080/wp-json/wp/v2/posts?per_page=4&_embed=1"
curl "http://localhost:8080/wp-json/wp/v2/pages?slug=home&_fields=acf"
```

### Components Catalog

- **Navbar**: desktop + mobile (drawer). Accessible, overlay, scroll lock.
- **Hero**: supports top/footer variants via ACF.
- **FeaturedCarousel**: server fetch → client scroll UI; fades + buttons.
- **FAQ**: accordion with clean background and centered heading.
- **Tabs/FeatureTriplet/Logos/Privacy/Footer**: modular, server-first where possible.

**Server vs Client**  
- Server: data fetching + rendering (better perf/SEO).  
- Client: interactivity (SearchBar, carousel’s scrolling).

### Styling Guide (SCSS Modules + Tailwind utilities)

- Prefer SCSS Modules per component: `Component/style/Component.module.scss`.
- Tailwind utilities allowed for spacing/typography in markup when convenient.
- Keep global overrides minimal; sections define their own background.

**Example (FAQ.module.scss)**
```scss
.root { padding: 3.5rem 0; background: #f9fafb; }
.container { max-width: var(--container, 72rem); margin: 0 auto; padding: 0 1.5rem; }
.heading { text-align:center; font-weight:800; font-size:clamp(1.75rem,3vw,2.25rem); margin-bottom:.5rem; color:#0f172a; }
.list { display:grid; gap:.75rem; }
```

### Quality Checklist (QA/UAT)

- **Home**
  - Heroes render (top/footer) based on ACF or flexible content.
  - Featured carousel shows items or hides gracefully.
  - FAQ opens/closes, clean background, heading centered.
- **Learn**
  - Featured shows on page=1 with no `q`.
  - External API renders cards.
  - All Press Releases list paginates; Pager retains `q/sort`.
- **Navbar**
  - Mobile drawer: white panel, overlay dark, scroll locked, accessible.
- **Images**
  - WP domain authorized in `next.config.ts`.
- **Perf/SEO**
  - Server components for fetch-heavy views.
  - Reasonable revalidate windows (60s by default).

### Deployment Guide (Vercel)

- Set environment variables in Project Settings → Environment Variables.
- Allow image domains in `next.config.ts`.
- Handle CORS if WP and Vercel are on different origins.
- Optionally add a Next API proxy if you need custom headers/auth.

### Maintenance & Playbooks

- **Add new CPT**: extend `fetchPostsByIds` or create a typed list function for the CPT.  
- **Change Featured strategy**: toggle `useACF` or change `categorySlug`.  
- **External API changes**: update `src/lib/blog.ts` mapping.  
- **Data layer tests**: add unit tests for `lib/wp.ts` and `lib/blog.ts` when extending.

### Changelog Template

```
## [x.y.z] - YYYY-MM-DD
### Added
- ...

### Changed
- ...

### Fixed
- ...

### Removed
- ...
```

---

**End of Document**
