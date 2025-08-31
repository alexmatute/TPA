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
