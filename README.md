# 🚀 Next.js + Tailwind + WordPress REST API

Frontend en **Next.js 15 (App Router)** con **TailwindCSS**, consume data of API **WordPress**:  
👉 `https://futureoffounders.com/wp-json/wp/v2/posts`

---

## 📦 Required

- **macOS/Linux** con:
  - [Homebrew](https://brew.sh/)  
  - [Colima](https://github.com/abiosoft/colima) + Docker (opcional if WP local)
  - Node.js (20+) + npm (10+)  
  - Git  
---

## ⚡ FRONTEND CONFIG START HERE.
---

### 1. Clonar el repo
```bash
git clone https://github.com/alexmatute/TPA.git
cd frontend
```
---

### 2. Instalar dependencias
```bash
npm install
```
---

## ▶️ run in local fronted Next.js
```bash
npm run dev
```
- Home → [http://localhost:3000](http://localhost:3000)  
- Blog → [http://localhost:3000/learn/slug](http://localhost:3000/learn)
- Blog/Details → [http://localhost:3000/learn/slug](http://localhost:3000/learn/[slug])

---

## ⚡ BACKEND CONFIG START HERE.
## Install Colima with homebrew
  ```bash
  brew install colima docker docker-compose
  ```
  - Start Colima
  ```
  colima start
  ```
---

## 🐳 Deploy Backend Docker

  - Rename wp-content Folder
  - in terminal made sure be in root
  ```bash
  docker-compose up -d or docker compose up -d //Depend of your Alias
  ```
  - Show runnig procees on Docker
  ```
  docker compose ps
  ```
  - Containers
  * wp_app (WordPress)
  * wp_db (MySQL)
  * wp_phpmyadmin (opcional)

  - Stop runnig process on Docker when you done.
  ```
  docker compose down -v
  ```
---

## ⚡ IMPORT PLUGINS and Theme
  - From folder import-wordpress move all plugin to wp-content > plugins each by one.
  - go to dashboard > plugins >  active all (Site Navigation REST && TPA CPT - Case Study ) don't need be activate works disabled too. 
  - from folder import-wordpress move theme twentytwentyfive-child to wp-content > themes
  - go to dashboard > apparience > Themes active twentytwentyfive-child  
  ---

## ⚡ Plugins configuration
  - SCF Secure Custom Fields made sure have Featured on Home	&& Home Content
  - If not import from JSON-wordpress made sure that settings > Group setting be active && Show in REST API
  - dummy content > generated posts > choose post type cant mark include img and click in generate.
  - on the home page edit home Featured Posts select from case-study or post 
  - in apparience editor navigation if there aren't one create new name main in option on the right top corner swict to code editor and copy and paste Snippet-Menu


## Endpoints Backend 
  * WordPress → http://localhost:8080
  * phpMyAdmin → http://localhost:8081
  * Usuario DB: wpuser / wppassword
  * Root DB: root / rootpassword
---

## Wordpress Dashboard  
   * WordPress → http://localhost:8080/wp-admin

  - Usuario: admin
  - Password: JZ!Dlf^t^mx1FJY1(E

---



## 📂 Pages (App Router)
---

### Home (show's posts)
📌 `app/page.tsx`
```tsx
"use client";

import { useEffect, useState } from "react";
import { getPosts } from "../lib/api";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    getPosts().then(setPosts);
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Últimos Posts</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article key={post.id} className="p-4 border rounded-lg shadow">
            {post._embedded?.["wp:featuredmedia"] && (
              <img
                src={post._embedded["wp:featuredmedia"][0].source_url}
                alt={post.title.rendered}
                className="rounded mb-3"
              />
            )}
            <h2
              className="text-xl font-semibold"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />
            <div
              className="text-gray-600 mt-2"
              dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
            />
            <a
              href={`/posts/${post.id}`}
              className="text-blue-600 mt-4 inline-block"
            >
              Leer más →
            </a>
          </article>
        ))}
      </div>
    </main>
  );
}
```
---

### Details posts (un post)
📌 `app/posts/[id]/page.tsx`
```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPost } from "../../../lib/api";

export default function PostDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    if (id) getPost(id).then(setPost);
  }, [id]);

  if (!post) return <p className="p-8">Cargando...</p>;

  return (
    <main className="p-8">
      <h1
        className="text-4xl font-bold mb-4"
        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
      />
      {post._embedded?.["wp:featuredmedia"] && (
        <img
          src={post._embedded["wp:featuredmedia"][0].source_url}
          alt={post.title.rendered}
          className="mb-6 rounded"
        />
      )}
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
      />
    </main>
  );
}
```

---



## 🚀 Deploy en Vercel

1. Sube tu repo a GitHub/GitLab.  
2. En Vercel → importa el proyecto.  
3. En **Settings → Environment Variables** añade:
   ```
   NEXT_PUBLIC_API_URL=https://futureoffounders.com/wp-json/wp/v2
   ```
4. Deploy automático 🎉  

---

## 🛠 Troubleshooting

- **Module not found `../lib/api`**  
  Revisa que `lib/api.ts` esté en raíz:  
  - Import en `app/page.tsx`: `../lib/api`  
  - Import en `app/posts/[id]/page.tsx`: `../../../lib/api`  

- **Error Turbopack**  
  Ya desactivado en `next.config.ts`.  

- **Error PostCSS**  
  Usa `@tailwindcss/postcss` en `postcss.config.js`.  

- **API WP no responde**  
  Si usas un WordPress local, revisa que los enlaces permanentes estén configurados como “Nombre de la entrada”.



# LIMITATIONS => Why this project cannot be deployed to Vercel (as it is)

## 1. Dependency on WordPress + MySQL in Docker

The project assumes a WordPress instance running at
http://localhost:8080 (WP_BASE variable) and a MySQL database seeded via
docker-compose.

Vercel does not run multi-service Docker containers (docker-compose) nor
internal database services.

Your docker-compose.yml mounts ./wp-content and imports .sql seeds at
startup --- this is stateful and relies on a persistent filesystem,
which Vercel does not provide at runtime.

## 2. Strong coupling to "localhost"

In lib/blog.ts and/or wp.ts there is:

    const WP_BASE = process.env.NEXT_PUBLIC_WP_BASE || "http://localhost:8080";

On Vercel, localhost:8080 does not exist. If the build tries to do
SSG/ISR against that URL, it fails (cannot reach your local WordPress
during build or runtime).

## 3. PHP and phpMyAdmin in the stack

Vercel does not run PHP natively. WordPress cannot be hosted there.

Instead, WordPress must live on an external host (WP Engine, Kinsta,
Hostinger, AWS EC2/RDS, etc.), and your Next.js app should consume its
REST API.

## 4. Database seeds and state at build

Your current flow assumes seeding a database (./seed/\*.sql) and having
data preloaded for getStaticProps/generateStaticParams.

On Vercel you cannot "seed" state at runtime, nor depend on local DB
content existing during build.

## 5. Filesystem writes

If any code writes/reads files under wp-content (or similar), this will
fail. Vercel's filesystem is ephemeral and not valid for persistent
content.

------------------------------------------------------------------------

# Technology Stack

-   **Frontend**: Next.js (App Router), React, TypeScript
-   **Headless CMS (local dev)**: WordPress (PHP) in Docker + MySQL
    (with SQL seeds)
-   **Data layer**:
    -   wp.ts: WordPress REST API calls (posts, media, slugs, etc.)
    -   external.ts: consumption of an external API (adds "External API"
        posts)
    -   blog.ts: orchestrates/merges WP + external posts into unified
        "cards"
-   **Infrastructure (local)**: docker-compose.yml orchestrates MySQL,
    WordPress, phpMyAdmin, with mounted wp-content and seed/ folder for
    SQL import.

------------------------------------------------------------------------

# Project Structure (summary)

-   `src/app/learn/page.tsx` → List view (WP + external API "cards" with
    search/pagination)
-   `src/app/learn/[slug]/page.tsx` → Post detail view (uses
    generateStaticParams, generateMetadata)
-   `src/lib/`
    -   wp.ts → WordPress API helpers
    -   external.ts → External API helpers
    -   blog.ts → merged fetch, prev/next, related posts
    -   types.ts, utils.ts → shared types/utilities
-   `docker-compose.yml` → spins up WordPress + MySQL + phpMyAdmin
    locally, mounts ./wp-content, imports ./seed/\*.sql.

------------------------------------------------------------------------

# How it works (local flow)

1.  Run `docker-compose up`:
    -   Starts MySQL, then WordPress at http://localhost:8080,
        phpMyAdmin at http://localhost:8081
    -   Seeds MySQL with ./seed/\*.sql so WP already has posts/media
2.  Run Next.js dev server:
    -   WP_BASE points to http://localhost:8080
    -   `/learn` fetches and merges posts from WP + external API into
        cards
    -   `/learn/[slug]` resolves slug via WP (or external), also gets
        prev/next and related posts
3.  Build/SSG:
    -   `generateStaticParams()` pulls slugs from WP
    -   On Vercel, this breaks because localhost:8080 isn't available.

------------------------------------------------------------------------

# Endpoints

## Consumed (data sources)

-   **WordPress REST API**:
    -   GET {WP_BASE}/wp-json/wp/v2/posts?...
    -   GET {WP_BASE}/wp-json/wp/v2/posts?slug={slug}&\_embed
    -   GET {WP_BASE}/wp-json/wp/v2/media/{id}
-   **External API**:
    -   GET {EXTERNAL_BASE}/posts?...
    -   GET {EXTERNAL_BASE}/posts/{slug}

## Exposed (UI pages)

-   GET /learn → list of posts (merged WP + external)
-   GET /learn/\[slug\] → post detail (SSG/ISR)

------------------------------------------------------------------------

# What you need to deploy on Vercel

1.  **Host WordPress + MySQL externally** (WP Engine, Kinsta, Cloudways,
    Hostinger, AWS EC2/RDS, etc.).
    -   Upload wp-content/ and restore your DB there.
2.  **Update WP_BASE**
    -   On Vercel, set `NEXT_PUBLIC_WP_BASE=https://your-wp-domain.com`
3.  **Avoid local filesystem/state**
    -   Do not write/read from wp-content in Next.js.
    -   Data must already exist in hosted WP before build.
4.  **Consider SSR/ISR**
    -   If posts may change frequently, use ISR (`revalidate`) or SSR
        (`cache: no-store`).

------------------------------------------------------------------------

# TL;DR

The blocker is that your app depends on a local Dockerized WordPress +
MySQL.\
Vercel cannot run those services or persist filesystem/database state.

👉 To deploy: - Move WordPress to a public host - Point WP_BASE to its
URL - Ensure no code assumes localhost or a writable FS

# Wiki Documentation and structure Base of Knowledge 
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/alexmatute/TPA)
