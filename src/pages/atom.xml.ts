import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import themeConfig from "@/theme.config";
import { createFeedItems, getFeedUpdatedDate } from "@/toolkit/feed";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const GET: APIRoute = async (context) => {
  const posts = await getCollection("posts");
  const site = context.site ?? new URL("https://blog.charolron.top/");
  const items = createFeedItems(posts, site);
  const siteUrl = site.toString();
  const atomUrl = new URL("/atom.xml", site).toString();

  const entries = items
    .map((item) => {
      const categories = item.categories
        .map((category) => `    <category term="${escapeXml(category)}" />`)
        .join("\n");

      return `  <entry>
    <title>${escapeXml(item.title)}</title>
    <link href="${escapeXml(item.url)}" />
    <id>${escapeXml(item.id)}</id>
    <published>${item.published.toISOString()}</published>
    <updated>${item.updated.toISOString()}</updated>
    <summary>${escapeXml(item.description)}</summary>${categories ? `\n${categories}` : ""}
  </entry>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(themeConfig.siteName)}</title>
  <subtitle>${escapeXml(themeConfig.sidebar?.description ?? "")}</subtitle>
  <link href="${escapeXml(siteUrl)}" />
  <link rel="self" href="${escapeXml(atomUrl)}" />
  <id>${escapeXml(siteUrl)}</id>
  <updated>${getFeedUpdatedDate(items).toISOString()}</updated>
${entries}
</feed>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
    },
  });
};
