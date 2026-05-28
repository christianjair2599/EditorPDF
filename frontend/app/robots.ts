import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const BASE = "https://editorpdf-christian-mayangas-projects.vercel.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/editor", "/converter", "/merge-split", "/pricing", "/support", "/terms", "/privacy", "/legal"],
        disallow: ["/api/", "/profile"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
