import type { MetadataRoute } from "next";

const BASE = "https://editorpdf-christian-mayangas-projects.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE,                     lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/editor`,         lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/converter`,      lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/merge-split`,    lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/pricing`,        lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/support`,        lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/terms`,          lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/privacy`,        lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/legal`,          lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];
}
