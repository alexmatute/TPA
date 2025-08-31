export const stripTags = (html?: string | null) =>
(html || "").replace(/<[^>]*>/g, "").trim();


export const toISO = (d?: string) => (d ? new Date(d).toISOString() : null);


export const sortByDateDesc = <T extends { date?: string | null }>(arr: T[]) =>
[...arr].sort((a, b) => {
const da = a.date ? new Date(a.date).getTime() : 0;
const db = b.date ? new Date(b.date).getTime() : 0;
return db - da;
});