import { describe, expect, it } from "bun:test";
import type { CollectionEntry } from "astro:content";
import { createFeedItems, getFeedUpdatedDate } from "./feed";

function createPost(
  id: string,
  data: Partial<CollectionEntry<"posts">["data"]> & {
    title: string;
    date: Date;
  },
): CollectionEntry<"posts"> {
  return {
    id,
    collection: "posts",
    body: "",
    data: {
      title: data.title,
      date: data.date,
      description: data.description,
      updated: data.updated,
      tags: data.tags,
      categories: data.categories,
      draft: data.draft,
      encrypted: data.encrypted ?? false,
    },
  } as CollectionEntry<"posts">;
}

describe("feed helpers", () => {
  const site = new URL("https://blog.example.com/");

  it("filters drafts and sorts by updated date first", () => {
    const items = createFeedItems(
      [
        createPost("old-post", {
          title: "Old Post",
          date: new Date("2026-01-01T00:00:00.000Z"),
        }),
        createPost("draft-post", {
          title: "Draft Post",
          date: new Date("2026-04-01T00:00:00.000Z"),
          draft: true,
        }),
        createPost("updated-post", {
          title: "Updated Post",
          date: new Date("2026-02-01T00:00:00.000Z"),
          updated: new Date("2026-05-01T00:00:00.000Z"),
        }),
      ],
      site,
    );

    expect(items.map((item) => item.title)).toEqual(["Updated Post", "Old Post"]);
    expect(items[0].updated.toISOString()).toBe("2026-05-01T00:00:00.000Z");
  });

  it("builds absolute post URLs with trailing slash", () => {
    const [item] = createFeedItems(
      [
        createPost("notes/hello world", {
          title: "Hello World",
          date: new Date("2026-04-24T00:00:00.000Z"),
        }),
      ],
      site,
    );

    expect(item.url).toBe("https://blog.example.com/posts/notes/hello%20world/");
    expect(item.id).toBe(item.url);
  });

  it("deduplicates and trims categories from categories and tags", () => {
    const [item] = createFeedItems(
      [
        createPost("feed-post", {
          title: "Feed Post",
          date: new Date("2026-04-24T00:00:00.000Z"),
          categories: [" Astro ", "Blog"],
          tags: ["Astro", "", "RSS"],
        }),
      ],
      site,
    );

    expect(item.categories).toEqual(["Astro", "Blog", "RSS"]);
  });

  it("respects the feed item limit", () => {
    const items = createFeedItems(
      [
        createPost("first", {
          title: "First",
          date: new Date("2026-04-24T00:00:00.000Z"),
        }),
        createPost("second", {
          title: "Second",
          date: new Date("2026-04-23T00:00:00.000Z"),
        }),
      ],
      site,
      1,
    );

    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("First");
  });

  it("uses the first item updated date or unix epoch fallback", () => {
    const items = createFeedItems(
      [
        createPost("feed-post", {
          title: "Feed Post",
          date: new Date("2026-04-24T00:00:00.000Z"),
        }),
      ],
      site,
    );

    expect(getFeedUpdatedDate(items).toISOString()).toBe("2026-04-24T00:00:00.000Z");
    expect(getFeedUpdatedDate([]).toISOString()).toBe("1970-01-01T00:00:00.000Z");
  });
});
