const TOKEN_RE = /^[\p{L}][\p{L}'-]*$/u;

const BLOCKLIST = new Set([
  "the",
  "of",
  "to",
  "in",
  "on",
  "ao",
  "etc",
]);

export function isValidToken(word: string): boolean {
  const cleaned = word.trim().toLowerCase();
  if (cleaned.length < 2) return false;
  if (!TOKEN_RE.test(cleaned)) return false;
  if (BLOCKLIST.has(cleaned)) return false;
  return true;
}
