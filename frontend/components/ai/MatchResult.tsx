'use client';

import { MatchResponse } from '@/lib/endpoints';

interface MatchResultProps {
  result: MatchResponse;
}

function scoreColor(score: number): string {
  if (score >= 70) return 'var(--color-success)';
  if (score >= 40) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

export default function MatchResult({ result }: MatchResultProps) {
  const color = scoreColor(result.score);
  const pct = Math.min(100, Math.max(0, result.score));

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2">
        <span
          className="text-6xl font-bold tabular-nums"
          style={{ color }}
        >
          {result.score}
        </span>
        <span className="text-sm text-[var(--color-text-secondary)]">
          Match Score
        </span>
        <div className="w-full max-w-xs h-3 rounded-full bg-[var(--color-background)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
            Matched Keywords
          </h3>
          {result.matched_keywords.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)]">None found</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {result.matched_keywords.map((kw) => (
                <span
                  key={kw}
                  style={{
                    backgroundColor: 'var(--color-status-offer)',
                    color: 'var(--color-status-offer-text)',
                  }}
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
            Missing Keywords
          </h3>
          {result.missing_keywords.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)]">None missing</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {result.missing_keywords.map((kw) => (
                <span
                  key={kw}
                  style={{
                    backgroundColor: 'var(--color-status-rejected)',
                    color: 'var(--color-status-rejected-text)',
                  }}
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {result.recommendation && (
        <div className="rounded-lg bg-[var(--color-background)] p-4 border border-[var(--color-border)]">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
            Recommendation
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {result.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}
