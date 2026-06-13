'use client';

import { ApplicationStatus } from '@/lib/endpoints';

export type FilterValue = ApplicationStatus | 'all';

const TABS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
];

interface StatusFilterProps {
  active: FilterValue;
  onChange: (v: FilterValue) => void;
  counts: Record<string, number>;
}

export default function StatusFilter({ active, onChange, counts }: StatusFilterProps) {
  return (
    <div style={{
      display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2,
      scrollbarWidth: 'none',
    }}>
      {TABS.map(({ value, label }) => {
        const isActive = active === value;
        const count = value === 'all'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : (counts[value] ?? 0);

        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            style={{
              fontFamily: 'var(--font-head)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
              padding: '7px 13px', borderRadius: 99, border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: isActive ? 'var(--accent)' : 'var(--rl-soft)',
              color: isActive ? '#fff' : 'var(--rl-sub)',
              transition: 'background .15s, color .15s',
              flexShrink: 0,
            }}
          >
            {label}
            <span style={{
              fontSize: 11, fontWeight: 700, lineHeight: 1,
              padding: '2px 6px', borderRadius: 99,
              background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--rl-line)',
              color: isActive ? '#fff' : 'var(--rl-sub)',
            }}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
