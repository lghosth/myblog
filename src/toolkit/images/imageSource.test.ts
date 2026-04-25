import type { ImageMetadata } from "astro";
import { describe, expect, it } from "bun:test";
import {
  isAstroImageMetadata,
  isImageSource,
  isRemoteImageSource,
  isStringImageSource,
  resolveImageSrc,
} from "./imageSource";

const metadata = {
  src: "/_astro/cover.hash.avif",
  width: 1920,
  height: 1440,
  format: "avif",
} as ImageMetadata;

describe("imageSource", () => {
  it("detects Astro image metadata", () => {
    expect(isAstroImageMetadata(metadata)).toBe(true);
    expect(isAstroImageMetadata({ src: "/missing-size.webp" })).toBe(false);
    expect(isAstroImageMetadata(null)).toBe(false);
  });

  it("detects string and remote image sources", () => {
    expect(isStringImageSource("https://img.charolron.top/cover.webp")).toBe(true);
    expect(isStringImageSource("")).toBe(false);
    expect(isRemoteImageSource("https://img.charolron.top/cover.webp")).toBe(true);
    expect(isRemoteImageSource("/images/cover.webp")).toBe(false);
  });

  it("accepts both local metadata and string sources", () => {
    expect(isImageSource(metadata)).toBe(true);
    expect(isImageSource("https://img.charolron.top/cover.webp")).toBe(true);
    expect(isImageSource({ src: "/missing-size.webp" })).toBe(false);
  });

  it("resolves renderable image src values", () => {
    expect(resolveImageSrc(metadata)).toBe("/_astro/cover.hash.avif");
    expect(resolveImageSrc("https://img.charolron.top/cover.webp")).toBe(
      "https://img.charolron.top/cover.webp",
    );
    expect(resolveImageSrc(undefined)).toBeUndefined();
  });
});
