import type { ImageMetadata } from "astro";

export type ImageSource = ImageMetadata | string;

export function isAstroImageMetadata(source: unknown): source is ImageMetadata {
  if (!source || typeof source !== "object") {
    return false;
  }

  const candidate = source as Partial<ImageMetadata>;
  return (
    typeof candidate.src === "string" &&
    typeof candidate.width === "number" &&
    typeof candidate.height === "number" &&
    typeof candidate.format === "string"
  );
}

export function isStringImageSource(source: unknown): source is string {
  return typeof source === "string" && source.length > 0;
}

export function isRemoteImageSource(source: unknown): source is string {
  return isStringImageSource(source) && /^https?:\/\//i.test(source);
}

export function isImageSource(source: unknown): source is ImageSource {
  return isStringImageSource(source) || isAstroImageMetadata(source);
}

export function resolveImageSrc(source: unknown): string | undefined {
  if (isStringImageSource(source)) {
    return source;
  }

  if (isAstroImageMetadata(source)) {
    return source.src;
  }

  return undefined;
}
