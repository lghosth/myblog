import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import themeConfig from "@/theme.config";
import { createFeedItems, getFeedUpdatedDate } from "@/toolkit/feed";

export const GET: APIRoute = async (context) => {
  const posts = await getCollection("posts");
  const site = context.site ?? new URL("https://blog.charolron.top/");
  const items = createFeedItems(posts, site);

  return rss({
    title: themeConfig.siteName,
    description: themeConfig.sidebar?.description ?? "",
    site,
    customData: `<lastBuildDate>${getFeedUpdatedDate(items).toUTCString()}</lastBuildDate><atom:link href="${new URL("/rss.xml", site).toString()}" rel="self" type="application/rss+xml" />`,
    xmlns: {
      atom: "http://www.w3.org/2005/Atom",
    },
    items: items.map((item) => ({
      title: item.title,
      link: item.url,
      pubDate: item.published,
      description: item.description,
      categories: item.categories,
    })),
  });
};
