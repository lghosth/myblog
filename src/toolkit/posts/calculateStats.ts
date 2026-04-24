import type { Post } from "./types";

export interface PostStats {
  totalWords: number;
  totalReadingTime: string;
}

export const DEFAULT_WORDS_PER_MINUTE = 300;

/**
 * Count words in a string
 * Supports multiple languages including Chinese
 */
export function countWords(text: string): number {
  if (!text) return 0;

  // Remove punctuation
  const cleanedText = text.replace(/[^\w\s\u4E00-\u9FFF]/g, "");

  // Count Chinese characters (each character is one word)
  const chineseCount = (cleanedText.match(/[\u4E00-\u9FFF]/g) || []).length;

  // Remove Chinese characters and count English words
  const englishText = cleanedText.replace(/[\u4E00-\u9FFF]/g, "");
  const englishCount = englishText
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  return chineseCount + englishCount;
}

/**
 * Calculate total words from multiple posts
 */
export function calculateTotalWords(posts: Post[]): number {
  return posts.reduce((total, post) => {
    const content = post.body || "";
    return total + countWords(content);
  }, 0);
}

/**
 * Calculate reading minutes based on word count.
 */
export function calculateReadingMinutes(
  wordCount: number,
  wordsPerMinute: number = DEFAULT_WORDS_PER_MINUTE,
): number {
  if (wordCount <= 0 || wordsPerMinute <= 0) {
    return 0;
  }

  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Format reading time based on word count.
 */
export function formatReadingTime(
  wordCount: number,
  wordsPerMinute: number = DEFAULT_WORDS_PER_MINUTE,
): string {
  const readingMinutes = calculateReadingMinutes(wordCount, wordsPerMinute);

  if (readingMinutes === 0) {
    return "less than a minute";
  } else if (readingMinutes === 1) {
    return "1 minute";
  } else {
    return `${readingMinutes} minutes`;
  }
}

/**
 * Calculate post statistics
 */
export function calculatePostStats(
  posts: Post[],
  options: {
    wordsPerMinute?: number;
    wpm?: number;
    timeUnit?: "minute" | "minutes";
  } = {},
): PostStats {
  const totalWords = calculateTotalWords(posts);
  const totalReadingTime = formatReadingTime(totalWords, options.wordsPerMinute ?? options.wpm);

  return {
    totalWords,
    totalReadingTime,
  };
}
