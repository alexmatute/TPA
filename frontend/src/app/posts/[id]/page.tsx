"use client";

import { useEffect, useState } from "react";

import { getPost } from "../../../lib/api";
import { useParams } from "next/navigation";

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
