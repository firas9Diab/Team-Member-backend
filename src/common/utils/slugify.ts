/**
 * Converts a string into a URL-friendly slug:
 *   "Sony WH-1000XM5 Wireless Headphones" -> "sony-wh-1000xm5-wireless-headphones"
 *
 * Lowercases, strips characters that are not letters/numbers/spaces/hyphens,
 * turns whitespace into hyphens and collapses repeated/edge hyphens.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
