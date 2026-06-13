export function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'var(--rl-green)';
  if (score >= 65) return 'var(--accent)';
  return 'var(--rl-amber)';
}

export function scoreBg(score: number): string {
  if (score >= 80) return 'var(--rl-green-soft)';
  if (score >= 65) return 'var(--accent-soft)';
  return '#fdf4e7';
}

export function scoreLabel(score: number): string {
  if (score >= 80) return 'Strong match';
  if (score >= 65) return 'Good match';
  return 'Needs work';
}

export interface TextSegment {
  text: string;
  highlighted: boolean;
}

export function splitByKeywords(text: string, keywords: string[]): TextSegment[] {
  if (!keywords.length || !text) return [{ text, highlighted: false }];
  const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);
  const keywordsLower = new Set(keywords.map(k => k.toLowerCase()));
  return parts
    .filter(p => p.length > 0)
    .map(part => ({ text: part, highlighted: keywordsLower.has(part.toLowerCase()) }));
}

// Matches impact metrics: "20%", "~30%", "60%+", "2x", "$1M", "10,000", "99.9%"
const IMPACT_RE = /(\$[\d,.]+[KMBkmb]?|~?\d[\d,.]*\s*(?:%\+?|\+\s*%?|x|X)\b|\b\d{4,}\b)/g;

/**
 * Splits text into bold segments for both added keywords AND measurable impact numbers.
 * All bold segments are the same weight — no colour, just bold black.
 */
export function splitWithBold(text: string, keywords: string[]): TextSegment[] {
  if (!text) return [{ text, highlighted: false }];

  const patterns: string[] = [];
  if (keywords.length) {
    patterns.push(...keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  // impact pattern added after keywords so keyword matches take precedence
  patterns.push('\\$[\\d,.]+[KMBkmb]?', '~?\\d[\\d,.]*\\s*(?:%\\+?|\\+\\s*%?|[xX])(?=\\b|\\s|$)', '\\b\\d{4,}\\b');

  const regex = new RegExp(`(${patterns.join('|')})`, 'gi');
  const parts = text.split(regex).filter(p => p.length > 0);
  const kwLower = new Set(keywords.map(k => k.toLowerCase()));

  return parts.map(part => ({
    text: part,
    highlighted: kwLower.has(part.toLowerCase()) || IMPACT_RE.test(part),
  }));
}

export const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  saved:     { bg: 'var(--accent-soft)',    color: 'var(--accent)',        label: 'Saved' },
  applied:   { bg: '#dbeafe',               color: '#1d4ed8',              label: 'Applied' },
  interview: { bg: '#fef9c3',               color: '#a16207',              label: 'Interview' },
  offer:     { bg: 'var(--rl-green-soft)',  color: 'var(--rl-green)',      label: 'Offer' },
  rejected:  { bg: '#fee2e2',               color: '#dc2626',              label: 'Rejected' },
};
