#!/usr/bin/env bun
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

const IMAGE_REPO = path.join(homedir(), "blog/media/blog-images");
const IMAGE_BASE_URL = "https://img.charolron.top";
const POST_IMAGE_ROOT = "images/posts";
const WEBP_QUALITY = 82;
const WEBP_MAX_WIDTH = 1920;
const CONVERTIBLE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const PASSTHROUGH_EXTENSIONS = new Set([".svg", ".gif", ".avif"]);
const SUPPORTED_EXTENSIONS = new Set([...CONVERTIBLE_EXTENSIONS, ...PASSTHROUGH_EXTENSIONS]);

interface PublishOptions {
  slug: string;
  mdxFile: string;
  write: boolean;
}

interface ImageReference {
  rawPath: string;
  absolutePath: string;
}

interface PublishedImage {
  sourcePath: string;
  outputPath: string;
  url: string;
}

function printUsage(): never {
  console.error(`Usage:
  bun run images:publish <post-slug> <mdx-file> [--write]

Example:
  bun run images:publish ai-coding-workflow-terminal-tmux src/posts/ai-coding-workflow-terminal-tmux.mdx --write`);
  process.exit(1);
}

function parseArgs(argv: string[]): PublishOptions {
  const positional = argv.filter((arg) => !arg.startsWith("--"));
  const write = argv.includes("--write");

  if (positional.length !== 2) {
    printUsage();
  }

  const [slug, mdxFile] = positional;
  if (!/^[a-z0-9][a-z0-9-_/]*$/i.test(slug)) {
    throw new Error(`Invalid post slug: ${slug}`);
  }

  return {
    slug: slug.replace(/^\/+|\/+$/g, ""),
    mdxFile: path.resolve(mdxFile),
    write,
  };
}

function isRemoteOrRootPath(value: string): boolean {
  return (
    /^(https?:)?\/\//i.test(value) ||
    value.startsWith("/") ||
    value.startsWith("#") ||
    value.startsWith("data:")
  );
}

function normalizeReferencePath(value: string): string {
  return decodeURI(value.split(/[?#]/, 1)[0] ?? value).trim();
}

function collectImageReferences(content: string, mdxFile: string): ImageReference[] {
  const refs = new Map<string, ImageReference>();
  const baseDir = path.dirname(mdxFile);
  const patterns = [
    /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
    /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g,
  ];

  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      const rawPath = match[1]?.trim();
      if (!rawPath || isRemoteOrRootPath(rawPath)) {
        continue;
      }

      const normalizedPath = normalizeReferencePath(rawPath);
      const absolutePath = path.resolve(baseDir, normalizedPath);
      const ext = path.extname(absolutePath).toLowerCase();
      if (!SUPPORTED_EXTENSIONS.has(ext)) {
        continue;
      }

      refs.set(rawPath, {
        rawPath,
        absolutePath,
      });
    }
  }

  return [...refs.values()];
}

function slugifyFileName(input: string): string {
  const parsed = path.parse(input);
  const asciiName = parsed.name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return asciiName || "image";
}

async function shortHash(filePath: string): Promise<string> {
  const file = await readFile(filePath);
  return createHash("sha256").update(file).digest("hex").slice(0, 8);
}

async function ensureImageFile(filePath: string): Promise<void> {
  const fileStat = await stat(filePath).catch(() => undefined);
  if (!fileStat?.isFile()) {
    throw new Error(`Image file not found: ${filePath}`);
  }
}

async function importSharp() {
  try {
    const mod = await import("sharp");
    return mod.default;
  } catch (error) {
    throw new Error(
      `sharp is required to convert raster images to webp: ${(error as Error).message}`,
    );
  }
}

async function publishImage(reference: ImageReference, slug: string): Promise<PublishedImage> {
  await ensureImageFile(reference.absolutePath);

  const sourceExt = path.extname(reference.absolutePath).toLowerCase();
  const hash = await shortHash(reference.absolutePath);
  const safeBaseName = `${slugifyFileName(path.basename(reference.absolutePath))}-${hash}`;
  const outputExt = CONVERTIBLE_EXTENSIONS.has(sourceExt) ? ".webp" : sourceExt;
  const outputFileName = `${safeBaseName}${outputExt}`;
  const relativeOutputPath = path.posix.join(POST_IMAGE_ROOT, slug, outputFileName);
  const outputPath = path.join(IMAGE_REPO, ...relativeOutputPath.split("/"));

  await mkdir(path.dirname(outputPath), { recursive: true });

  if (CONVERTIBLE_EXTENSIONS.has(sourceExt)) {
    const sharp = await importSharp();
    await sharp(reference.absolutePath)
      .rotate()
      .resize({ width: WEBP_MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(outputPath);
  } else {
    await copyFile(reference.absolutePath, outputPath);
  }

  return {
    sourcePath: reference.rawPath,
    outputPath,
    url: `${IMAGE_BASE_URL.replace(/\/+$/g, "")}/${relativeOutputPath}`,
  };
}

function replaceReferences(content: string, publishedImages: PublishedImage[]): string {
  let nextContent = content;
  for (const image of publishedImages) {
    nextContent = nextContent.split(image.sourcePath).join(image.url);
  }
  return nextContent;
}

async function runGit(args: string[]): Promise<string> {
  const process = Bun.spawn(["git", ...args], {
    cwd: IMAGE_REPO,
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
    process.exited,
  ]);

  if (exitCode !== 0) {
    throw new Error(`git ${args.join(" ")} failed\n${stderr || stdout}`);
  }

  return stdout.trim();
}

async function publishGitChanges(slug: string, publishedImages: PublishedImage[]): Promise<void> {
  if (publishedImages.length === 0) {
    return;
  }

  await runGit(["pull", "--rebase", "origin", "main"]);
  await runGit(["add", path.posix.join(POST_IMAGE_ROOT, slug)]);

  const status = await runGit(["status", "--short"]);
  if (!status) {
    console.log("No image repository changes to commit.");
    return;
  }

  await runGit(["commit", "-m", `add images for ${slug}`]);
  await runGit(["push", "origin", "main"]);
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const content = await readFile(options.mdxFile, "utf8");
  const references = collectImageReferences(content, options.mdxFile);

  if (references.length === 0) {
    console.log("No local image references found.");
    return;
  }

  const publishedImages: PublishedImage[] = [];
  for (const reference of references) {
    publishedImages.push(await publishImage(reference, options.slug));
  }

  await publishGitChanges(options.slug, publishedImages);

  if (options.write) {
    await writeFile(options.mdxFile, replaceReferences(content, publishedImages));
  }

  console.log("\nPublished images:");
  for (const image of publishedImages) {
    console.log(`${image.sourcePath}\n  -> ${image.url}`);
  }

  if (options.write) {
    console.log(`\nUpdated references in ${options.mdxFile}`);
  } else {
    console.log("\nRun again with --write to replace local references in the MDX file.");
  }
}

main().catch((error) => {
  console.error((error as Error).message);
  process.exit(1);
});
