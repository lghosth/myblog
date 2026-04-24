import type { CollectionEntry } from "astro:content";
import { toPostHref } from "@/toolkit/posts/url";

const DEFAULT_FEED_LIMIT = 50;

export interface FeedItem {
  title: string;
  url: string;
  id: string;
  description: string;
  published: Date;
  updated: Date;
  categories: string[];
}

function uniqueStrings(values: (string | null | undefined)[]): string[] {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])];
}

export function createFeedItems(
  posts: CollectionEntry<"posts">[],
  site: URL,
  limit = DEFAULT_FEED_LIMIT,
): FeedItem[] {
  return posts
    .filter((post) => !post.data.draft)
    .sort(
      (a, b) =>
        (b.data.updated ?? b.data.date).getTime() - (a.data.updated ?? a.data.date).getTime(),
    )
    .slice(0, limit)
    .map((post) => {
      const url = new URL(toPostHref(post.id), site).toString();

      return {
        title: post.data.title,
        url,
        id: url,
        description: post.data.description ?? "",
        published: post.data.date,
        updated: post.data.updated ?? post.data.date,
        categories: uniqueStrings([...(post.data.categories ?? []), ...(post.data.tags ?? [])]),
      };
    });
}

export function getFeedUpdatedDate(items: FeedItem[]): Date {
  return items[0]?.updated ?? new Date(0);
}
