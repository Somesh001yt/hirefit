'use client';

import { useState, useEffect } from 'react';

interface ScoreDialProps {
  value: number;
  size?: number;
  stroke?: number;
}

export default function ScoreDial({ value, size = 140, stroke = 11 }: ScoreDialProps) {
  const [v, setV] = useState(0);

  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    const dur = 1100;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size, transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" strokeWidth={stroke}
          style={{ stroke: 'var(--rl-line)' }}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)}
          strokeLinecap="round"
          style={{ stroke: 'var(--accent)', transition: 'stroke-dashoffset .35s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: size * 0.26, fontWeight: 700, color: 'var(--rl-ink)', lineHeight: 1 }}>
          {v}<span style={{ fontSize: size * 0.14 }}>%</span>
        </div>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 11, fontWeight: 700, color: 'var(--rl-sub)', marginTop: 3 }}>MATCH</div>
      </div>
    </div>
  );
}
