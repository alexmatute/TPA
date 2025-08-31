export type Source = "wp" | "ext" | "case";


export type Media = {
url?: string | null;
alt?: string | null;
};


export type BlogPost = {
id?: string; // Optional unified id
slug: string; // WP: real slug | EXTERNAL: id as string | CASE: provided slug
source: Source; // "wp" | "ext" | "case"
title: string;
excerpt?: string | null;
content?: string | null; // HTML allowed
date?: string | null; // ISO
featured?: boolean; // for case studies
tags?: string[];
cover?: Media;
};