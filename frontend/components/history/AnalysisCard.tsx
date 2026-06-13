'use client';

import { AiAnalysis } from '@/lib/endpoints';
import { relativeDate, scoreColor, scoreBg, scoreLabel } from '@/lib/helpers';

interface AnalysisCardProps {
  item: AiAnalysis;
  onClick: () => void;
}

export default function AnalysisCard({ item, onClick }: AnalysisCardProps) {
  const isMatch = item.score != null;
  const isRewrite = !!item.rewritten_summary && !isMatch;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      style={{
        background: '#fff', border: '1px solid var(--rl-line)', borderRadius: 16,
        padding: '18px 20px', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 12,
        transition: 'box-shadow .15s, border-color .15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent-border)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px -8px rgba(99,102,241,0.18)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--rl-line)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Type badge + date */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99,
          background: isRewrite ? 'var(--rl-soft)' : 'var(--accent-soft)',
          color: isRewrite ? 'var(--rl-sub)' : 'var(--accent)',
          letterSpacing: '0.04em', textTransform: 'uppercase' as const,
        }}>
          {isRewrite ? 'Rewrite' : 'Match'}
        </span>
        <span style={{ fontSize: 12, color: 'var(--rl-sub)', fontWeight: 600 }}>
          {relativeDate(item.created_at)}
        </span>
      </div>

      {/* Score ring */}
      {isMatch && item.score != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 99, flexShrink: 0,
            display: 'grid', placeItems: 'center', background: scoreBg(item.score),
          }}>
            <span style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, color: scoreColor(item.score) }}>
              {item.score}%
            </span>
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--rl-ink)' }}>
              {scoreLabel(item.score)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--rl-sub)', fontWeight: 500, marginTop: 2 }}>
              {item.matched_keywords?.length ?? 0} matched · {item.missing_keywords?.length ?? 0} missing
            </div>
          </div>
        </div>
      )}

      {/* Rewrite preview */}
      {isRewrite && item.rewritten_summary && (
        <p style={{ fontSize: 13.5, color: 'var(--rl-sub)', lineHeight: 1.55, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.rewritten_summary}
        </p>
      )}

      {/* Recommendation preview */}
      {item.recommendation && (
        <p style={{ fontSize: 13, color: 'var(--rl-sub)', fontStyle: 'italic', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          &ldquo;{item.recommendation}&rdquo;
        </p>
      )}

      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>View details →</span>
    </div>
  );
}
