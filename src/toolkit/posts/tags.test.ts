import { describe, expect, it } from "bun:test";
import type { Post } from "@/toolkit/posts/types";
import { buildCanonicalTags, pickPreferredTagName, postHasTagSlug } from "./tags";

interface MockPostInput {
  id: string;
  date: string;
  tags?: string[] | null;
  draft?: boolean;
}

function createPost(input: MockPostInput): Post {
  return {
    id: input.id,
    slug: input.id,
    body: "",
    collection: "posts",
    data: {
      title: input.id,
      date: new Date(input.date),
      tags: input.tags,
      draft: input.draft,
      encrypted: false,
    },
  } as Post;
}

describe("tags helpers", () => {
  it("prefers a clearer display name with uppercase letters", () => {
    expect(pickPreferredTagName(["mdx", "MDX"])).toBe("MDX");
    expect(pickPreferredTagName(["astro", "Astro"])).toBe("Astro");
  });

  it("canonicalizes tag variants by lowercase slug while preserving display name", () => {
    const posts: Post[] = [
      createPost({
        id: "p1",
        date: "2025-01-01T00:00:00.000Z",
        tags: ["astro", "mdx"],
      }),
      createPost({
        id: "p2",
        date: "2025-01-02T00:00:00.000Z",
        tags: ["Astro", "MDX", "OpenAI"],
      }),
      createPost({
        id: "p3",
        date: "2025-01-03T00:00:00.000Z",
        tags: ["openai"],
      }),
    ];

    expect(buildCanonicalTags(posts)).toEqual([
      {
        slug: "astro",
        displayName: "Astro",
        aliases: ["astro", "Astro"],
        count: 2,
      },
      {
        slug: "mdx",
        displayName: "MDX",
        aliases: ["mdx", "MDX"],
        count: 2,
      },
      {
        slug: "openai",
        displayName: "OpenAI",
        aliases: ["OpenAI", "openai"],
        count: 2,
      },
    ]);
  });

  it("matches posts by canonical tag slug", () => {
    const post = createPost({
      id: "p1",
      date: "2025-01-01T00:00:00.000Z",
      tags: ["Astro", "MDX"],
    });

    expect(postHasTagSlug(post, "astro")).toBe(true);
    expect(postHasTagSlug(post, "mdx")).toBe(true);
    expect(postHasTagSlug(post, "svelte")).toBe(false);
  });
});
