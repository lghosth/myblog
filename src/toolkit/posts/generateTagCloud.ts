import { TinyColor } from "@ctrl/tinycolor";

interface Tag {
  name: string;
  count: number;
}

interface TagCloudOptions {
  minFontSize: number; // 最小字体大小（例如 12）
  maxFontSize: number; // 最大字体大小（例如 32）
  startColor?: string; // 起始颜色，例如 '#888888' / 'var(--grey-6)'
  endColor?: string; // 终止颜色，例如 '#ff0000' / 'var(--color-blue)'
  limit?: number; // 最大处理数量
}

const DEFAULT_TAG_CLOUD_START_COLOR = "var(--grey-6)";
const DEFAULT_TAG_CLOUD_END_COLOR = "var(--color-blue)";

interface TagCloudItem {
  name: string;
  count: number;
  fontSize: number;
  color: string;
}

/**
 * 生成标签云
 * @param tags 标签列表
 * @param options 配置项
 * @param options.minFontSize 最小字体大小
 * @param options.maxFontSize 最大字体大小
 * @param options.startColor 起始颜色
 * @param options.endColor 终止颜色
 * @param options.limit 最大处理数量
 * @returns 标签云数据
 */
export function generateTagCloud(tags: Tag[], options: TagCloudOptions): TagCloudItem[] {
  const { minFontSize, maxFontSize, startColor, endColor, limit } = options;

  const effectiveStartColor = startColor || DEFAULT_TAG_CLOUD_START_COLOR;
  const effectiveEndColor = endColor || DEFAULT_TAG_CLOUD_END_COLOR;

  const sorted = [...tags].sort((a, b) => b.count - a.count);
  const limited = typeof limit === "number" ? sorted.slice(0, limit) : sorted;

  const maxCount = limited[0]?.count || 1;
  const minCount = limited[limited.length - 1]?.count || 1;
  const range = maxCount - minCount || 1;

  const start = new TinyColor(effectiveStartColor);
  const end = new TinyColor(effectiveEndColor);
  const canUseTinyColor = start.isValid && end.isValid;

  return limited.map((tag) => {
    const weight = (tag.count - minCount) / range;
    const fontSize = Math.round(minFontSize + (maxFontSize - minFontSize) * weight);
    const mixPercent = weight * 100;
    const color = canUseTinyColor
      ? start.mix(effectiveEndColor, mixPercent).toHexString()
      : `color-mix(in oklch, ${effectiveStartColor} ${100 - mixPercent}%, ${effectiveEndColor} ${mixPercent}%)`;

    return {
      name: tag.name,
      count: tag.count,
      fontSize,
      color,
    };
  });
}
