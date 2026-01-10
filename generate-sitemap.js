// generate-sitemap.js
const fs = require("fs");

const baseUrl = "https://estuve.eu";
const lastmod = new Date().toISOString().split("T")[0];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
    <url>
    <loc>${baseUrl}/plan/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

fs.writeFileSync("dist/sitemap.xml", sitemap);
console.log("✅ sitemap.xml generated");
