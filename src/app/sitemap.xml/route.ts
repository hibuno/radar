import { db } from "@/db";
import { repositoriesTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://radar.hibuno.com";

  try {
    // Get all repositories for sitemap
    const repositories = await db
      .select({
        repository: repositoriesTable.repository,
        updated_at: repositoriesTable.updated_at,
        created_at: repositoriesTable.created_at,
      })
      .from(repositoriesTable)
      .where(eq(repositoriesTable.publish, true))
      .orderBy(desc(repositoriesTable.stars))
      .limit(1000); // Limit to prevent sitemap from being too large

    const repos = repositories;

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${repos
    .map((repo) => {
      const slug = repo.repository?.replace("https://github.com/", "") || "";
      const lastmod =
        repo.updated_at || repo.created_at || new Date().toISOString();

      return `  <url>
    <loc>${baseUrl}/${slug}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join("\n")}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);

    // Return minimal sitemap on error
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(fallbackSitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  }
}
