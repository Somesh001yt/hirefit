'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { useAiHistory } from '@/hooks/useAiHistory';
import { AiAnalysis } from '@/lib/endpoints';
import AppNav from '@/components/layout/AppNav';
import AnalysisCard from '@/components/history/AnalysisCard';
import AnalysisDetail from '@/components/history/AnalysisDetail';
import Button from '@/components/ui/Button';

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const authReady = !authLoading && !!user;
  const { data, loading, error, refetch } = useAiHistory(authReady);
  const [selected, setSelected] = useState<AiAnalysis | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--rl-soft)', fontFamily: 'var(--font-head)' }}>
      <AppNav />

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: 'var(--rl-ink)' }}>
              Analysis History
            </h1>
            <p style={{ fontSize: 14, color: 'var(--rl-sub)', fontWeight: 500, margin: '4px 0 0' }}>
              Your last {data.length} AI analyses
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={refetch} loading={loading}>
            Refresh
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 18px', color: '#dc2626', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, height: 160, border: '1px solid var(--rl-line)', opacity: 0.5 }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && data.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 20, border: '1px solid var(--rl-line)' }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🔍</div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, color: 'var(--rl-ink)', marginBottom: 8 }}>
              No analyses yet
            </div>
            <p style={{ fontSize: 14, color: 'var(--rl-sub)', fontWeight: 500, marginBottom: 20, maxWidth: 340, margin: '0 auto 20px' }}>
              Run your first resume analysis to see results here.
            </p>
            <Button onClick={() => router.push('/analyze')}>
              Analyze my resume →
            </Button>
          </div>
        )}

        {/* Grid */}
        {!loading && data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map(item => (
              <AnalysisCard
                key={item.id}
                item={item}
                onClick={() => setSelected(item)}
              />
            ))}
          </div>
        )}

        {/* CTA when there are results */}
        {!loading && data.length > 0 && (
          <div style={{
            marginTop: 36, padding: '28px 32px', background: 'var(--rl-ink)', borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, color: '#fff' }}>
                Ready for another round?
              </div>
              <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', fontWeight: 500, marginTop: 4 }}>
                Paste a new job description and run a fresh analysis.
              </div>
            </div>
            <Button onClick={() => router.push('/analyze')}>
              New analysis →
            </Button>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <AnalysisDetail item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
