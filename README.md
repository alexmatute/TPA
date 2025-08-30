# 🚀 Next.js + Tailwind + WordPress REST API

Frontend en **Next.js 15 (App Router)** con **TailwindCSS**, que consume datos desde la API de **WordPress**:  
👉 `https://futureoffounders.com/wp-json/wp/v2/posts`

---

## 📦 Requisitos

- **macOS/Linux** con:
  - [Homebrew](https://brew.sh/)  
  - [Colima](https://github.com/abiosoft/colima) + Docker (opcional si usas WP local)
  - Node.js (20+) + npm (10+)  
  - Git  

---

## ⚡ Configuración del proyecto

### 1. Clonar el repo
```bash
git clone TU_REPO_URL frontend
cd frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto:
```env
NEXT_PUBLIC_API_URL=https://futureoffounders.com/wp-json/wp/v2
```

---

## 🎨 TailwindCSS

Ya está configurado. Archivos clave:

📌 `tailwind.config.js`
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
};
```

📌 `postcss.config.js`
```js
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
```

📌 `styles/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 🔧 Configuración Next.js

📌 `next.config.ts`
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // cualquiera de las dos sirve; dejo ambas por seguridad
    domains: [
      "futureoffounders.com",
      "i0.wp.com",
      "i1.wp.com",
      "i2.wp.com",
      "secure.gravatar.com",
      "s.w.org",
    ],
    remotePatterns: [
      { protocol: "https", hostname: "futureoffounders.com", pathname: "/**" },
      { protocol: "https", hostname: "i0.wp.com", pathname: "/**" },
      { protocol: "https", hostname: "i1.wp.com", pathname: "/**" },
      { protocol: "https", hostname: "i2.wp.com", pathname: "/**" },
      { protocol: "https", hostname: "secure.gravatar.com", pathname: "/**" },
      { protocol: "https", hostname: "s.w.org", pathname: "/**" },
    ],
  },
  // experimental: { turbo: { enabled: false } },
};

export default nextConfig;




```

---

## 📡 API Client

📌 `lib/api.ts`
```ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://futureoffounders.com/wp-json/wp/v2";

export async function getPosts() {
  const res = await axios.get(`${API_URL}/posts?per_page=6&_embed`);
  return res.data;
}

export async function getPost(id: string | number) {
  const res = await axios.get(`${API_URL}/posts/${id}?_embed`);
  return res.data;
}
```

---

## 📂 Páginas (App Router)

### Home (listado de posts)
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

### Detalle (un post)
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

## ▶️ Ejecutar en local
```bash
npm run dev
```
- Home → [http://localhost:3000](http://localhost:3000)  
- Detalle → [http://localhost:3000/posts/ID](http://localhost:3000/posts/ID)

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
