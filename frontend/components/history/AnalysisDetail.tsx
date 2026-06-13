'use client';

import { useRouter } from 'next/navigation';
import { AiAnalysis } from '@/lib/endpoints';
import { formatDate, scoreColor, scoreBg, scoreLabel } from '@/lib/helpers';
import Modal from '@/components/ui/Modal';
import ScoreDial from '@/components/ui/ScoreDial';
import Button from '@/components/ui/Button';

interface AnalysisDetailProps {
  item: AiAnalysis | null;
  onClose: () => void;
}

function KeywordChip({ label, matched }: { label: string; matched: boolean }) {
  return (
    <span style={{
      fontSize: 12.5, fontWeight: 600, padding: '5px 10px', borderRadius: 8,
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: matched ? 'var(--rl-green-soft)' : 'var(--accent-soft)',
      color: matched ? 'var(--rl-green)' : 'var(--accent)',
      border: `1px solid ${matched ? '#bfe9cd' : 'var(--accent-border)'}`,
    }}>
      <span style={{ fontWeight: 800 }}>{matched ? '✓' : '+'}</span>{label}
    </span>
  );
}

export default function AnalysisDetail({ item, onClose }: AnalysisDetailProps) {
  const router = useRouter();
  const isMatch = item?.score != null;

  return (
    <Modal open={!!item} onClose={onClose} title={isMatch ? 'Match analysis' : 'Rewrite summary'}>
      {item && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxHeight: '70vh', overflowY: 'auto', paddingRight: 2 }}>

          {/* Date */}
          <div style={{ fontSize: 12.5, color: 'var(--rl-sub)', fontWeight: 600 }}>
            {formatDate(item.created_at)}
          </div>

          {/* Score dial — match only */}
          {isMatch && item.score != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: 'var(--rl-soft)', borderRadius: 14, padding: '18px 20px' }}>
              <ScoreDial value={item.score} size={100} stroke={9} />
              <div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, color: 'var(--rl-ink)' }}>
                  {scoreLabel(item.score)}
                </div>
                <div style={{ fontSize: 13, color: 'var(--rl-sub)', fontWeight: 500, marginTop: 4 }}>
                  {item.matched_keywords?.length ?? 0} matched · {item.missing_keywords?.length ?? 0} missing
                </div>
              </div>
            </div>
          )}

          {/* Missing keywords */}
          {isMatch && (item.missing_keywords?.length ?? 0) > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--rl-ink)', marginBottom: 9 }}>
                Missing keywords
                <span style={{ marginLeft: 7, fontSize: 11.5, fontWeight: 700, background: '#fdf0dd', color: 'var(--rl-amber)', padding: '2px 7px', borderRadius: 99 }}>
                  {item.missing_keywords!.length} gaps
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {item.missing_keywords!.map(k => <KeywordChip key={k} label={k} matched={false} />)}
              </div>
            </div>
          )}

          {/* Matched keywords */}
          {isMatch && (item.matched_keywords?.length ?? 0) > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--rl-ink)', marginBottom: 9 }}>
                Already covered
                <span style={{ marginLeft: 7, fontSize: 11.5, fontWeight: 700, background: 'var(--rl-green-soft)', color: 'var(--rl-green)', padding: '2px 7px', borderRadius: 99 }}>
                  {item.matched_keywords!.length} matched
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {item.matched_keywords!.map(k => <KeywordChip key={k} label={k} matched />)}
              </div>
            </div>
          )}

          {/* Recommendation */}
          {item.recommendation && (
            <div style={{ background: 'var(--rl-soft)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--rl-sub)', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
                AI recommendation
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--rl-ink)', margin: 0 }}>{item.recommendation}</p>
            </div>
          )}

          {/* Rewritten summary */}
          {item.rewritten_summary && (
            <div style={{ background: 'var(--rl-soft)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--rl-sub)', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
                Rewritten summary
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--rl-ink)', margin: 0 }}>{item.rewritten_summary}</p>
            </div>
          )}

          {/* Score badge (rewrite only) */}
          {!isMatch && item.score != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--rl-sub)' }}>Score:</span>
              <span style={{ fontSize: 14, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: scoreBg(item.score), color: scoreColor(item.score) }}>
                {item.score}%
              </span>
            </div>
          )}

          {/* CTA */}
          <div style={{ paddingTop: 4 }}>
            <Button onClick={() => { onClose(); router.push('/analyze'); }} fullWidth>
              Run a new analysis →
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
