import type { Post } from "./types";
import { describe, expect, it } from "bun:test";
import {
  calculatePostStats,
  calculateReadingMinutes,
  calculateTotalWords,
  countWords,
  formatReadingTime,
} from "./calculateStats";

describe("countWords", () => {
  it("should return 0 for empty string", () => {
    expect(countWords("")).toBe(0);
  });

  it("should count English words correctly", () => {
    expect(countWords("hello world")).toBe(2);
    expect(countWords("This is a test.")).toBe(4);
  });

  it("should count Chinese characters correctly", () => {
    expect(countWords("你好世界")).toBe(4);
  });

  it("should count mixed English and Chinese correctly", () => {
    expect(countWords("hello 你好 world")).toBe(4);
  });

  it("should handle punctuation and spaces", () => {
    expect(countWords("hello, world! 你好。")).toBe(4);
  });
});

describe("calculateTotalWords", () => {
  it("should return 0 for empty posts array", () => {
    expect(calculateTotalWords([])).toBe(0);
  });

  it("should calculate total words from posts with body", () => {
    const posts: Post[] = [
      {
        id: "1",
        collection: "posts",
        data: { title: "Test", date: new Date("2023-01-01"), encrypted: false },
        body: "hello world",
      },
      {
        id: "2",
        collection: "posts",
        data: { title: "Test2", date: new Date("2023-01-01"), encrypted: false },
        body: "你好世界",
      },
    ];
    expect(calculateTotalWords(posts)).toBe(6);
  });

  it("should calculate total words from posts with content", () => {
    const posts: Post[] = [
      {
        id: "1",
        collection: "posts",
        data: { title: "Test", date: new Date("2023-01-01"), encrypted: false },
        body: "hello world",
      },
      {
        id: "2",
        collection: "posts",
        data: { title: "Test2", date: new Date("2023-01-01"), encrypted: false },
        body: "你好世界",
      },
    ];
    expect(calculateTotalWords(posts)).toBe(6);
  });

  it("should prefer body over content", () => {
    const posts: Post[] = [
      {
        id: "1",
        collection: "posts",
        data: { title: "Test", date: new Date("2023-01-01"), encrypted: false },
        body: "new body",
      },
    ];
    expect(calculateTotalWords(posts)).toBe(2);
  });
});

describe("calculateReadingMinutes", () => {
  it("should calculate reading minutes with ceil strategy", () => {
    expect(calculateReadingMinutes(0)).toBe(0);
    expect(calculateReadingMinutes(1)).toBe(1);
    expect(calculateReadingMinutes(300)).toBe(1);
    expect(calculateReadingMinutes(301)).toBe(2);
  });

  it("should use custom words per minute", () => {
    expect(calculateReadingMinutes(200, 100)).toBe(2);
  });
});

describe("formatReadingTime", () => {
  it('should return "less than a minute" for 0 words', () => {
    expect(formatReadingTime(0)).toBe("less than a minute");
  });

  it('should return "1 minute" for small word counts', () => {
    expect(formatReadingTime(100)).toBe("1 minute");
  });

  it("should return plural minutes for larger counts", () => {
    expect(formatReadingTime(500)).toBe("2 minutes");
  });

  it("should use custom words per minute", () => {
    expect(formatReadingTime(150, 300)).toBe("1 minute");
    expect(formatReadingTime(300, 150)).toBe("2 minutes");
  });
});

describe("calculatePostStats", () => {
  it("should calculate stats for empty posts", () => {
    const stats = calculatePostStats([]);
    expect(stats.totalWords).toBe(0);
    expect(stats.totalReadingTime).toBe("less than a minute");
  });

  it("should calculate stats for posts", () => {
    const posts: Post[] = [
      {
        id: "1",
        collection: "posts",
        data: { title: "Test", date: new Date("2023-01-01"), encrypted: false },
        body: "hello world 你好",
      },
    ];
    const stats = calculatePostStats(posts);
    expect(stats.totalWords).toBe(4);
    expect(stats.totalReadingTime).toBe("1 minute");
  });

  it("should use custom options", () => {
    const posts: Post[] = [
      {
        id: "1",
        collection: "posts",
        data: { title: "Test", date: new Date("2023-01-01"), encrypted: false },
        body: "hello world 你好",
      },
    ];
    const stats = calculatePostStats(posts, { wordsPerMinute: 200 });
    expect(stats.totalWords).toBe(4);
    expect(stats.totalReadingTime).toBe("1 minute");
  });
});
