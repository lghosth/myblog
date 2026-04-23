import type { Post } from "@/toolkit/posts/types";
import { toTagSlug } from "./url";

export interface CanonicalTag {
  slug: string;
  displayName: string;
  aliases: string[];
  count: number;
}

function normalizeTagName(name: string): string {
  return String(name || "").trim();
}

function hasUppercaseLatin(value: string): boolean {
  return /[A-Z]/.test(value);
}

export function pickPreferredTagName(names: readonly string[]): string {
  const normalizedNames = names.map(normalizeTagName).filter(Boolean);

  if (normalizedNames.length === 0) {
    return "";
  }

  const withUppercase = normalizedNames.find(hasUppercaseLatin);
  return withUppercase ?? normalizedNames[0];
}

export function buildCanonicalTags(posts: Post[]): CanonicalTag[] {
  const tagMap = new Map<
    string,
    {
      displayName: string;
      aliases: Set<string>;
      count: number;
    }
  >();

  posts.forEach((post) => {
    (post.data.tags || []).forEach((rawTag) => {
      const tagName = normalizeTagName(rawTag);
      const slug = toTagSlug(tagName);

      if (!tagName || !slug) {
        return;
      }

      const current = tagMap.get(slug);

      if (!current) {
        tagMap.set(slug, {
          displayName: tagName,
          aliases: new Set([tagName]),
          count: 1,
        });
        return;
      }

      current.count += 1;
      current.aliases.add(tagName);
      current.displayName = pickPreferredTagName([current.displayName, tagName]);
    });
  });

  return Array.from(tagMap.entries())
    .map(([slug, value]) => ({
      slug,
      displayName: value.displayName,
      aliases: Array.from(value.aliases),
      count: value.count,
    }))
    .sort((a, b) => b.count - a.count || a.displayName.localeCompare(b.displayName));
}

export function findCanonicalTagBySlug(posts: Post[], slug: string): CanonicalTag | undefined {
  return buildCanonicalTags(posts).find((tag) => tag.slug === slug);
}

export function postHasTagSlug(post: Post, slug: string): boolean {
  return (post.data.tags || []).some((tag) => toTagSlug(tag) === slug);
}
