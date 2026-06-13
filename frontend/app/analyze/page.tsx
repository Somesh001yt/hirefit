'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { aiEndpoints, MatchResponse } from '@/lib/endpoints';
import { extractTextFromPdf } from '@/lib/pdfExtract';
import AppNav from '@/components/layout/AppNav';
import ScoreDial from '@/components/ui/ScoreDial';
import { generateResumePdf } from '@/components/resume/ResumePdf';
import { splitByKeywords, splitWithBold } from '@/lib/helpers';

// ── Design tokens ──────────────────────────────────────────────────────────────
const accent = '#6366f1';
const accentSoft = '#eef2ff';
const accentBorder = '#c7d2fe';
const ink = '#10131c';
const sub = '#5a6072';
const line = '#e6e7ec';
const soft = '#f5f6f9';
const green = '#16a34a';
const greenSoft = '#e8f7ee';
const amber = '#d97706';

// ── Types ──────────────────────────────────────────────────────────────────────
type Screen = 'input' | 'analyzing' | 'results' | 'rewriting' | 'rewrite';

interface ResumeSection {
  role: string;
  org: string;
  location?: string;
  dates: string;
  bullets: string[];
}

interface ResumeProject {
  name: string;
  tech: string;
  link?: string;
  bullets: string[];
}

interface ResumeData {
  name: string;
  title: string;
  contact: string[];
  summary: string;
  experience: ResumeSection[];
  projects?: ResumeProject[];
  skills: string[];
  education: string;
}

// ── Shared primitives ──────────────────────────────────────────────────────────

function PrimaryBtn({ children, onClick, disabled, size = 'md', className = '' }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sz = { sm: { padding: '9px 16px', fontSize: 14 }, md: { padding: '13px 22px', fontSize: 15 }, lg: { padding: '15px 28px', fontSize: 16.5 } }[size];
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} className={className} style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, borderRadius: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, lineHeight: 1, background: accent, color: '#fff', border: '1px solid transparent', boxShadow: disabled ? 'none' : `0 10px 22px -12px ${accent}`, transition: 'transform .12s, filter .12s', minHeight: 44, ...sz }}
      onMouseEnter={e => { if (!disabled) { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.04)'; } }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; (e.currentTarget as HTMLButtonElement).style.filter = 'none'; }}
    >{children}</button>
  );
}

function GhostBtn({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={className} style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13.5, fontWeight: 700, color: sub, background: 'transparent', border: `1px solid ${line}`, borderRadius: 9, padding: '10px 16px', cursor: 'pointer', minHeight: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{children}</button>
  );
}

function KeywordChip({ label, added }: { label: string; added?: boolean }) {
  return (
    <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 600, color: added ? green : accent, background: added ? greenSoft : accentSoft, border: `1px solid ${added ? '#bfe9cd' : accentBorder}`, padding: '6px 11px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ fontWeight: 800 }}>{added ? '✓' : '+'}</span>{label}
    </span>
  );
}

// ── Screen 1: Input ────────────────────────────────────────────────────────────
function InputScreen({ jd, resume, setJd, setResume, onAnalyze, error }: {
  jd: string; resume: string;
  setJd: (v: string) => void; setResume: (v: string) => void;
  onAnalyze: () => void; error: string | null;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const jdWords = jd.trim() ? jd.trim().split(/\s+/).length : 0;
  const resWords = resume.trim() ? resume.trim().split(/\s+/).length : 0;
  const ready = jdWords > 12 && resWords > 12;

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    if (f.type === 'application/pdf') {
      const text = await extractTextFromPdf(f);
      setResume(text);
    } else {
      const text = await f.text();
      setResume(text);
    }
  };

  const panelStyle: React.CSSProperties = { background: '#fff', border: `1px solid ${line}`, borderRadius: 18, display: 'flex', flexDirection: 'column', overflow: 'hidden' };
  const headerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${line}` };
  const iconStyle: React.CSSProperties = { width: 30, height: 30, borderRadius: 8, background: accentSoft, display: 'grid', placeItems: 'center', color: accent, fontWeight: 800, fontSize: 13, flexShrink: 0 };
  const taStyle: React.CSSProperties = { flex: 1, border: 'none', outline: 'none', resize: 'none', padding: '16px 18px', fontFamily: "'Manrope', sans-serif", fontSize: 14, lineHeight: 1.6, color: ink, background: 'transparent' };

  return (
    <div className="max-w-270 mx-auto px-4 md:px-8 pt-9 pb-16">
      <div style={{ textAlign: 'center', maxWidth: 580, margin: '0 auto 28px' }}>
        <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Let&apos;s see how you match.</h1>
        <p style={{ fontSize: 15.5, color: sub, fontWeight: 500, marginTop: 10, lineHeight: 1.5 }}>Paste the job you&apos;re targeting and your current resume. We&apos;ll find every keyword you&apos;re missing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 items-stretch">
        {/* JD panel */}
        <div style={panelStyle}>
          <div style={headerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={iconStyle}>JD</div>
              <div>
                <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14.5, fontWeight: 700, color: ink }}>Job description</div>
                <div style={{ fontSize: 12, color: sub, fontWeight: 600 }}>{jdWords > 0 ? `${jdWords} words` : 'Paste the role you want'}</div>
              </div>
            </div>
            <button onClick={() => setJd(SAMPLE_JD)} style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, fontWeight: 700, color: accent, background: accentSoft, border: `1px solid ${accentBorder}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>Use sample JD</button>
          </div>
          <textarea value={jd} onChange={e => setJd(e.target.value)}
            placeholder="Paste the full job description here — responsibilities, requirements, the works…"
            spellCheck={false} className="min-h-50 md:min-h-75" style={taStyle} />
        </div>

        {/* Resume panel */}
        <div style={panelStyle}>
          <div style={headerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={iconStyle}>CV</div>
              <div>
                <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14.5, fontWeight: 700, color: ink }}>Your resume</div>
                <div style={{ fontSize: 12, color: sub, fontWeight: 600 }}>{fileName || (resWords > 0 ? `${resWords} words` : 'Paste text or upload a file')}</div>
              </div>
            </div>
            <button onClick={() => { setResume(SAMPLE_RESUME); setFileName(''); }} style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, fontWeight: 700, color: accent, background: accentSoft, border: `1px solid ${accentBorder}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>Use sample</button>
          </div>
          <textarea value={resume} onChange={e => setResume(e.target.value)}
            placeholder="Paste your resume text, or upload a PDF / DOCX / TXT file below…"
            spellCheck={false} className="min-h-50 md:min-h-75" style={taStyle} />
          <div style={{ borderTop: `1px solid ${line}`, padding: '11px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" onChange={onFile} style={{ display: 'none' }} />
            <button onClick={() => fileRef.current?.click()} className="flex-1 md:flex-none" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 700, color: ink, background: soft, border: `1px solid ${line}`, borderRadius: 8, padding: '8px 13px', cursor: 'pointer', minHeight: 44 }}>
              <span style={{ fontSize: 15 }}>⤓</span> Upload file
            </button>
            <span style={{ fontSize: 12, color: sub, fontWeight: 600 }}>PDF · DOCX · TXT</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 mt-7">
        {error && <p style={{ fontSize: 13.5, color: '#dc2626', fontWeight: 600 }}>{error}</p>}
        <PrimaryBtn size="lg" disabled={!ready} onClick={onAnalyze} className="w-full sm:w-auto justify-center">
          {ready ? '⚡ Analyze match' : 'Add a job description and resume to continue'}
        </PrimaryBtn>
        <div style={{ fontSize: 12.5, color: sub, fontWeight: 600 }}>
          {ready ? 'Takes about 5 seconds · powered by Gemini' : `${jdWords} JD words · ${resWords} resume words`}
        </div>
      </div>
    </div>
  );
}

// ── Screen 2: Analyzing loader ─────────────────────────────────────────────────
function AnalyzingScreen() {
  const steps = ['Reading the job description…', 'Parsing your resume…', 'Extracting target keywords…', 'Scoring your match…'];
  const [i, setI] = useState(0);
  useEffect(() => {
    const tick = setInterval(() => setI(p => Math.min(p + 1, steps.length - 1)), 1100);
    return () => clearInterval(tick);
  }, [steps.length]);
  return (
    <div style={{ minHeight: '68vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <div className="rl-spin" style={{ position: 'absolute', inset: 0, borderRadius: 99, border: `3px solid ${line}`, borderTopColor: accent }} />
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: accent, fontSize: 22 }}>◆</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 300 }}>
        {steps.map((s, idx) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: idx <= i ? 1 : 0.3, transition: 'opacity .3s' }}>
            <div style={{ width: 22, height: 22, borderRadius: 99, flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800, color: '#fff', background: idx < i ? green : (idx === i ? accent : line) }}>{idx < i ? '✓' : ''}</div>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, fontWeight: 600, color: idx <= i ? ink : sub }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Screen 3: Results ──────────────────────────────────────────────────────────
function ResultsScreen({ result, onRewrite, onBack }: {
  result: MatchResponse;
  onRewrite: () => void;
  onBack: () => void;
}) {
  const ceiling = Math.min(99, result.score + Math.min(28, result.missing_keywords.length * 5 + 6));
  const verdict = result.score >= 80 ? 'Strong match' : result.score >= 65 ? 'Good match — fixable gaps' : 'Needs repositioning';

  const suggestions = buildSuggestions(result.missing_keywords);

  return (
    <div className="max-w-270 mx-auto px-4 md:px-8 pt-8 pb-18">
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: accent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Analysis complete</div>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', margin: '5px 0 0' }}>Here&apos;s where you stand.</h1>
        </div>
        <GhostBtn onClick={onBack}>← Edit inputs</GhostBtn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.82fr_1.18fr] gap-4.5 items-start">
        {/* Score card */}
        <div style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 18, padding: 26 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ScoreDial value={result.score} size={160} stroke={12} />
          </div>
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 700 }}>{verdict}</div>
            <p style={{ fontSize: 13.5, color: sub, fontWeight: 500, marginTop: 6, lineHeight: 1.5 }}>
              Matched <b style={{ color: ink }}>{result.matched_keywords.length}</b> of <b style={{ color: ink }}>{result.matched_keywords.length + result.missing_keywords.length}</b> key requirements.
              Closing the gaps lifts you to an estimated <b style={{ color: accent }}>{ceiling}%</b>.
            </p>
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: 18, background: soft, borderRadius: 12, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: sub, marginBottom: 7 }}>
              <span>Now</span><span>After rewrite</span>
            </div>
            <div style={{ position: 'relative', height: 9, background: '#e7e9ef', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${ceiling}%`, background: accentSoft }} />
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${result.score}%`, background: accent, borderRadius: 99 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontFamily: "'Manrope', sans-serif", fontSize: 13.5, fontWeight: 700 }}>
              <span style={{ color: accent }}>{result.score}%</span><span style={{ color: sub }}>{ceiling}%</span>
            </div>
          </div>
        </div>

        {/* Keywords */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 18, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 13 }}>
              <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 15.5, fontWeight: 700 }}>Missing keywords</span>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: amber, background: '#fdf0dd', padding: '3px 8px', borderRadius: 99 }}>{result.missing_keywords.length} gaps</span>
            </div>
            {result.missing_keywords.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {result.missing_keywords.map(k => <KeywordChip key={k} label={k} />)}
              </div>
            ) : <p style={{ fontSize: 14, color: green, fontWeight: 600 }}>✓ No major keyword gaps — your resume already speaks the role&apos;s language.</p>}
          </div>

          <div style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 18, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 13 }}>
              <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 15.5, fontWeight: 700 }}>Already covered</span>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: green, background: greenSoft, padding: '3px 8px', borderRadius: 99 }}>{result.matched_keywords.length} matched</span>
            </div>
            {result.matched_keywords.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {result.matched_keywords.map(k => <KeywordChip key={k} label={k} added />)}
              </div>
            ) : <p style={{ fontSize: 14, color: sub, fontWeight: 500 }}>Run an analysis to see matched keywords.</p>}
          </div>

          {result.recommendation && (
            <div style={{ background: soft, border: `1px solid ${line}`, borderRadius: 18, padding: 22 }}>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13.5, fontWeight: 700, marginBottom: 6 }}>AI recommendation</div>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: sub, fontWeight: 500, margin: 0 }}>{result.recommendation}</p>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div style={{ marginTop: 26 }}>
          <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 13 }}>How to close the gap</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.25">
            {suggestions.map((s, i) => (
              <div key={i} style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 14, padding: '17px 19px', display: 'flex', gap: 13 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: accentSoft, color: accent, display: 'grid', placeItems: 'center', fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 12 }}>{i + 1}</div>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, color: accent, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.sec}</div>
                  <p style={{ fontSize: 14, lineHeight: 1.5, color: ink, fontWeight: 500, margin: '4px 0 0' }}>{s.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-7 px-6 py-6 md:px-7.5" style={{ background: ink, borderRadius: 18 }}>
        <div>
          <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 20, fontWeight: 700, color: '#fff' }}>Let HireFit rewrite it for you.</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginTop: 3 }}>We&apos;ll weave all {result.missing_keywords.length} missing keywords in naturally and hand you a polished PDF.</div>
        </div>
        <PrimaryBtn size="lg" onClick={onRewrite} className="w-full sm:w-auto justify-center shrink-0">⚡ Rewrite my resume → {ceiling}%</PrimaryBtn>
      </div>
    </div>
  );
}

// ── Screen 4: Rewriting loader ─────────────────────────────────────────────────
function RewritingScreen() {
  const lines = ['Loading your resume structure…', 'Mapping missing keywords to sections…', 'Rewriting bullets with Gemini…', 'Typesetting resume…'];
  const [i, setI] = useState(0);
  useEffect(() => {
    const tick = setInterval(() => setI(p => Math.min(p + 1, lines.length - 1)), 1200);
    return () => clearInterval(tick);
  }, [lines.length]);
  return (
    <div style={{ minHeight: '68vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <div className="rl-spin" style={{ width: 64, height: 64, borderRadius: 99, border: `3px solid ${line}`, borderTopColor: accent }} />
      <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 20, fontWeight: 700 }}>Rewriting your resume…</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: sub }}>{lines[i]}</div>
    </div>
  );
}

// ── Screen 5: Rewrite preview ──────────────────────────────────────────────────
function RewriteScreen({ rewrittenResume, originalScore, ceiling, addedKeywords, onBack }: {
  rewrittenResume: ResumeData;
  originalScore: number;
  ceiling: number;
  addedKeywords: string[];
  onBack: () => void;
}) {
  const [view, setView] = useState<'improved' | 'source'>('improved');
  const [downloading, setDownloading] = useState(false);

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const blob = await generateResumePdf(rewrittenResume, addedKeywords);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${rewrittenResume.name.replace(/\s+/g, '_')}_resume.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const latexSource = buildLatex(rewrittenResume);

  return (
    <div className="max-w-285 mx-auto px-4 md:px-8 pt-7 pb-18">
      {/* Header row */}
      <div className="rl-noprint flex items-center justify-between mb-5 flex-wrap gap-3">
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <GhostBtn onClick={onBack}>← Results</GhostBtn>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, fontWeight: 600, color: green, letterSpacing: '0.06em', textTransform: 'uppercase' }}>✓ Rewrite ready</div>
            <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: '3px 0 0' }}>Your tailored resume</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <GhostBtn onClick={() => setView(v => v === 'improved' ? 'source' : 'improved')} className="flex-1 sm:flex-none">{view === 'source' ? '◧ Preview' : '⟨⟩ LaTeX source'}</GhostBtn>
          <PrimaryBtn onClick={downloadPDF} disabled={downloading} className="flex-1 sm:flex-none justify-center">{downloading ? 'Generating…' : '⤓ Download PDF'}</PrimaryBtn>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5.5 items-start">
        {/* Preview pane */}
        <div style={{ background: soft, border: `1px solid ${line}`, borderRadius: 16, padding: '22px 20px', minHeight: 600 }}>
          <div className="rl-noprint flex items-center justify-between mb-5">
            <div style={{ display: 'flex', background: '#fff', border: `1px solid ${line}`, borderRadius: 9, padding: 3, gap: 2 }}>
              {(['improved', 'source'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 700, padding: '7px 13px', borderRadius: 7, border: 'none', cursor: 'pointer', background: view === v ? accent : 'transparent', color: view === v ? '#fff' : sub }}>
                  {v === 'improved' ? '✦ Resume' : '⟨⟩ LaTeX'}
                </button>
              ))}
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: sub }}>{view === 'source' ? 'resume.tex' : 'resume.pdf'}</span>
          </div>

          {view === 'source' ? (
            <pre style={{ margin: 0, background: '#0e1117', color: '#cdd6e2', borderRadius: 10, padding: 18, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.65, overflow: 'auto', whiteSpace: 'pre-wrap' }}>{latexSource}</pre>
          ) : (
            <ResumePage data={rewrittenResume} addedKeywords={addedKeywords} />
          )}
        </div>

        {/* Side rail */}
        <div className="rl-noprint flex flex-col gap-3.5 lg:sticky lg:top-20">

          {/* Score card */}
          <div style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: sub, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Projected match</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 9, marginTop: 8 }}>
              <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 15, fontWeight: 700, color: sub, textDecoration: 'line-through' }}>{originalScore}%</span>
              <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 34, fontWeight: 700, color: accent, lineHeight: 1 }}>{ceiling}%</span>
            </div>
            <div style={{ marginTop: 11, height: 6, background: soft, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${ceiling}%`, height: '100%', background: accent, borderRadius: 99, transition: 'width 1s ease' }} />
            </div>
            <div style={{ fontSize: 12.5, color: green, fontWeight: 700, marginTop: 9 }}>▲ +{ceiling - originalScore} points
            </div>
          </div>

          {/* What changed panel */}
          <ChangesPanel resume={rewrittenResume} addedKeywords={addedKeywords} />

          <PrimaryBtn onClick={downloadPDF} disabled={downloading} className="w-full justify-center">{downloading ? 'Generating…' : '⤓ Download PDF'}</PrimaryBtn>
          <button onClick={onBack} style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 700, color: sub, background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>Tweak the analysis again</button>
        </div>
      </div>
    </div>
  );
}

// ── ChangesPanel: shows every updated bullet in the side rail ──────────────────
function InlineHighlight({ text, keywords }: { text: string; keywords: string[] }) {
  const segments = splitByKeywords(text, keywords);
  return (
    <>
      {segments.map((seg, i) =>
        seg.highlighted
          ? <mark key={i} style={{ background: accentSoft, color: accent, borderRadius: 2, padding: '0 2px', fontWeight: 700, fontStyle: 'normal' }}>{seg.text}</mark>
          : <span key={i}>{seg.text}</span>
      )}
    </>
  );
}

interface ChangeEntry { section: string; text: string; }

function collectChanges(resume: ResumeData, keywords: string[]): ChangeEntry[] {
  if (!keywords.length) return [];
  const kw = keywords.map(k => k.toLowerCase());
  const hits = (t: string) => kw.some(k => t.toLowerCase().includes(k));
  const out: ChangeEntry[] = [];

  if (hits(resume.summary))
    out.push({ section: 'Summary', text: resume.summary });

  resume.experience.forEach(job => {
    job.bullets.forEach(b => {
      if (hits(b)) out.push({ section: `Experience · ${job.org}`, text: b });
    });
  });

  (resume.projects ?? []).forEach(proj => {
    proj.bullets.forEach(b => {
      if (hits(b)) out.push({ section: `Projects · ${proj.name}`, text: b });
    });
  });

  resume.skills.forEach(s => {
    if (hits(s)) out.push({ section: 'Technical Skills', text: s });
  });

  return out;
}

function ChangesPanel({ resume, addedKeywords }: { resume: ResumeData; addedKeywords: string[] }) {
  const entries = collectChanges(resume, addedKeywords);

  return (
    <div style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 14, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13.5, fontWeight: 700, color: ink }}>What changed</div>
          <div style={{ fontSize: 11.5, color: sub, fontWeight: 500, marginTop: 2 }}>{entries.length} updated sentence{entries.length !== 1 ? 's' : ''}</div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: accent, background: accentSoft, border: `1px solid ${accentBorder}`, padding: '3px 9px', borderRadius: 99 }}>
          {addedKeywords.length} keywords
        </span>
      </div>

      {/* Entry list */}
      <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {entries.length === 0 ? (
          <div style={{ padding: '20px 18px', fontSize: 13, color: sub, fontWeight: 500 }}>
            No specific bullets matched — keywords may be in the summary.
          </div>
        ) : entries.map((e, i) => (
          <div
            key={i}
            style={{
              padding: '12px 16px',
              borderBottom: i < entries.length - 1 ? `1px solid ${line}` : 'none',
              background: i % 2 === 0 ? '#fff' : soft,
            }}
          >
            {/* Section label */}
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9.5,
              fontWeight: 700,
              color: accent,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 5,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: 99, background: accent, display: 'inline-block', flexShrink: 0 }} />
              {e.section}
            </div>
            {/* Bullet text with inline highlights */}
            <p style={{
              margin: 0,
              fontSize: 12,
              lineHeight: 1.55,
              color: '#333',
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 500,
            }}>
              <InlineHighlight text={e.text} keywords={addedKeywords} />
            </p>
          </div>
        ))}
      </div>

      {/* Footer keyword pills */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${line}`, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {addedKeywords.map(k => (
          <span key={k} style={{ fontSize: 11, fontWeight: 600, color: accent, background: accentSoft, border: `1px solid ${accentBorder}`, padding: '3px 8px', borderRadius: 6 }}>✓ {k}</span>
        ))}
      </div>
    </div>
  );
}

// Inline bold highlighter: keywords + impact numbers, bold black only
function Highlighted({ text, keywords }: { text: string; keywords: string[] }) {
  const segments = splitWithBold(text, keywords);
  return (
    <>
      {segments.map((seg, i) =>
        seg.highlighted
          ? <strong key={i} style={{ fontWeight: 700, color: '#111' }}>{seg.text}</strong>
          : <span key={i}>{seg.text}</span>
      )}
    </>
  );
}

// Skills line: "Category: items" → bold category prefix + inline bold for keywords/impact
function SkillLine({ text, keywords, serif }: { text: string; keywords: string[]; serif: string }) {
  const colon = text.indexOf(':');
  if (colon > 0 && colon < 30) {
    const cat = text.slice(0, colon + 1);
    const rest = text.slice(colon + 1);
    return (
      <div style={{ fontSize: 10.5, lineHeight: 1.7, color: '#222', fontFamily: serif }}>
        <span style={{ fontWeight: 700 }}>{cat}</span>
        <Highlighted text={rest} keywords={keywords} />
      </div>
    );
  }
  return (
    <div style={{ fontSize: 10.5, lineHeight: 1.7, color: '#222', fontFamily: serif }}>
      <Highlighted text={text} keywords={keywords} />
    </div>
  );
}

function SectionHead({ label, serif }: { label: string; serif: string }) {
  return (
    <div style={{ marginBottom: 8, marginTop: 2 }}>
      <span style={{
        fontFamily: serif,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase' as const,
        fontVariant: 'small-caps',
        color: '#111',
        display: 'block',
        marginBottom: 3,
      }}>{label}</span>
      <div style={{ height: 1, background: '#111' }} />
    </div>
  );
}

// HTML resume preview — matches the reference ATS LaTeX template (single-column, centered header)
function ResumePage({ data, addedKeywords = [] }: { data: ResumeData; addedKeywords?: string[] }) {
  const serif = "'Georgia', 'Times New Roman', serif";
  const entryRow = (left: React.ReactNode, right: React.ReactNode) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
      <div>{left}</div>
      <div style={{ whiteSpace: 'nowrap', fontSize: 11, color: '#333', fontStyle: 'italic' }}>{right}</div>
    </div>
  );

  return (
    <div className="rl-pdf-page" style={{
      background: '#fff',
      width: '100%',
      maxWidth: 760,
      margin: '0 auto',
      fontFamily: serif,
      fontSize: 11,
      color: '#1a1a1a',
      boxShadow: '0 16px 48px -18px rgba(16,19,28,0.22)',
      border: '1px solid #e6e7ec',
      borderRadius: 4,
      padding: '40px 48px',
      lineHeight: 1.45,
    }}>

      {/* ── Centered Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <div style={{
          fontFamily: serif,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase' as const,
          fontVariant: 'small-caps',
          marginBottom: 5,
        }}>{data.name}</div>
        {/* Contact row */}
        <div style={{ fontSize: 10.5, color: '#333', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 0 }}>
          {data.contact.map((c, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
              {i > 0 && <span style={{ margin: '0 7px', color: '#777' }}>|</span>}
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* ── Summary ── */}
      {data.summary && (
        <div style={{ marginBottom: 12 }}>
          <SectionHead label="Summary" serif={serif} />
          <p style={{ fontSize: 10.5, lineHeight: 1.6, margin: 0, color: '#222' }}>
            <Highlighted text={data.summary} keywords={addedKeywords} />
          </p>
        </div>
      )}

      {/* ── Experience ── */}
      {data.experience.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <SectionHead label="Experience" serif={serif} />
          {data.experience.map((job, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              {entryRow(
                <span style={{ fontWeight: 700, fontSize: 11.5 }}>{job.org}</span>,
                <span>{job.location ?? ''}</span>
              )}
              {entryRow(
                <span style={{ fontStyle: 'italic', fontSize: 10.5, color: '#444' }}>{job.role}</span>,
                <span style={{ fontStyle: 'italic', fontSize: 10.5 }}>{job.dates}</span>
              )}
              <ul style={{ margin: '3px 0 0', paddingLeft: 18 }}>
                {job.bullets.map((b, j) => (
                  <li key={j} style={{ fontSize: 10.5, lineHeight: 1.55, marginBottom: 2, color: '#222' }}>
                    <Highlighted text={b} keywords={addedKeywords} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* ── Projects ── */}
      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <SectionHead label="Projects" serif={serif} />
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <div style={{ fontSize: 10.5 }}>
                  <span style={{ fontWeight: 700 }}>{proj.name}</span>
                  <span style={{ fontStyle: 'italic', color: '#555', marginLeft: 4 }}>| {proj.tech}</span>
                </div>
                {proj.link && <span style={{ fontSize: 10, color: '#6366f1', fontStyle: 'italic', whiteSpace: 'nowrap' }}>{proj.link}</span>}
              </div>
              <ul style={{ margin: '3px 0 0', paddingLeft: 18 }}>
                {proj.bullets.map((b, j) => (
                  <li key={j} style={{ fontSize: 10.5, lineHeight: 1.55, marginBottom: 2, color: '#222' }}>
                    <Highlighted text={b} keywords={addedKeywords} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* ── Technical Skills ── */}
      <div style={{ marginBottom: 12 }}>
        <SectionHead label="Technical Skills" serif={serif} />
        <div>
          {data.skills.map((s, i) => (
            <SkillLine key={i} text={s} keywords={addedKeywords} serif={serif} />
          ))}
        </div>
      </div>

      {/* ── Education ── */}
      <div style={{ marginBottom: 12 }}>
        <SectionHead label="Education" serif={serif} />
        <p style={{ fontSize: 10.5, lineHeight: 1.6, margin: 0, color: '#222' }}>{data.education}</p>
      </div>

    </div>
  );
}

// LaTeX source generator — matches the reference ATS-optimized template
function buildLatex(data: ResumeData): string {
  const esc = (s: string) => s
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/#/g, '\\#')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');

  const expSection = data.experience.map(job => {
    const bullets = job.bullets.map(b => `        \\resumeItem{${esc(b)}}`).join('\n');
    return `    \\resumeSubheading
      {${esc(job.org)}}{${esc(job.location ?? '')}}
      {${esc(job.role)}}{${esc(job.dates)}}
      \\resumeItemListStart
${bullets}
      \\resumeItemListEnd`;
  }).join('\n\n');

  const projSection = (data.projects ?? []).map(proj => {
    const bullets = proj.bullets.map(b => `        \\resumeItem{${esc(b)}}`).join('\n');
    const heading = `\\textbf{${esc(proj.name)}} $|$ \\emph{${esc(proj.tech)}}`;
    const link = proj.link ? `\\href{${esc(proj.link)}}{\\underline{${esc(proj.link)}}}` : '';
    return `    \\resumeProjectHeading
        {${heading}}
        {${link}}
      \\resumeItemListStart
${bullets}
      \\resumeItemListEnd`;
  }).join('\n\n');

  const skillsLines = data.skills.map(s => `     \\textbf{${esc(s.split(':')[0]?.trim() ?? 'Skills')}:} ${esc(s.split(':').slice(1).join(':').trim() || s)}`).join(' \\\\\n');

  return `%-------------------------
% ATS-Optimized Resume
% Compiler: XeLaTeX or pdfLaTeX
%-------------------------
\\documentclass[letterpaper,10.5pt]{article}

\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage{tabularx}

% ---------- PAGE STYLE ----------
\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.65in}
\\addtolength{\\textheight}{1.3in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% ---------- SECTION FORMATTING ----------
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% ---------- CUSTOM COMMANDS ----------
\\newcommand{\\resumeItem}[1]{
  \\item\\small{#1 \\vspace{-2pt}}
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

% ======================================================
%                     DOCUMENT START
% ======================================================
\\begin{document}

% ---------- HEADER ----------
\\begin{center}
    {\\Huge \\scshape \\textbf{${esc(data.name)}}} \\\\ \\vspace{4pt}
    \\small
    ${data.contact.join(' \\quad $|$ \\quad ')}
\\end{center}

% ---------- SUMMARY ----------
\\section{Summary}
${esc(data.summary)}

% ---------- EXPERIENCE ----------
\\section{Experience}
  \\resumeSubHeadingListStart

${expSection}

  \\resumeSubHeadingListEnd
${(data.projects ?? []).length > 0 ? `
% ---------- PROJECTS ----------
\\section{Projects}
    \\resumeSubHeadingListStart

${projSection}

    \\resumeSubHeadingListEnd` : ''}

% ---------- SKILLS ----------
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${skillsLines}
    }}
 \\end{itemize}

% ---------- EDUCATION ----------
\\section{Education}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {${esc(data.education)}}{}{}{}
  \\resumeSubHeadingListEnd

\\end{document}`;
}

// Suggestions generator
function buildSuggestions(missing: string[]): { sec: string; tip: string }[] {
  const has = (s: string) => missing.some(k => k.toLowerCase().includes(s));
  const out: { sec: string; tip: string }[] = [];
  if (has('stakeholder') || has('cross-functional'))
    out.push({ sec: 'Summary', tip: 'Reframe your opening around cross-functional leadership and stakeholder management — the JD leads with it.' });
  if (has('sql') || has('a/b') || has('data') || has('dashboard'))
    out.push({ sec: 'Experience', tip: 'Add quantified, data-driven results. Name the tools (SQL, A/B testing) the role asks for explicitly.' });
  if (has('okr') || has('kpi') || has('metric'))
    out.push({ sec: 'Experience', tip: 'Tie outcomes to OKRs/KPIs so achievements map to how this team measures success.' });
  if (has('road') || has('lifecycle') || has('go-to-market'))
    out.push({ sec: 'Skills', tip: 'Surface product roadmapping & go-to-market in your skills band — recruiters scan it first.' });
  out.push({ sec: 'Keywords', tip: 'Mirror the exact phrasing from the JD. ATS systems match on literal terms, not synonyms.' });
  return out.slice(0, 4);
}

// Sample data
const SAMPLE_JD = `Senior Product Manager — Growth

We're hiring a Senior Product Manager to own our activation and retention roadmap.

Responsibilities:
- Define and drive the product roadmap in close partnership with engineering, design and marketing
- Lead cross-functional teams through the full product lifecycle, from discovery to launch
- Set and track OKRs and KPIs; report progress to the leadership team
- Run user research and competitive analysis to inform prioritization
- Design and analyze A/B tests; use SQL and dashboards to make data-driven decisions
- Build go-to-market strategy with marketing and own stakeholder management across the org

Requirements:
- 5+ years in product management with strong experimentation and analytics background
- Comfortable with SQL, A/B testing and metrics
- Excellent executive communication and stakeholder management
- Experience with Agile/Scrum delivery`;

const SAMPLE_RESUME = `Jordan Avery
Operations & Project Lead
jordan.avery@email.com | (415) 555-0142 | San Francisco, CA

Summary
Operations leader with 8 years turning messy processes into reliable systems. Managed projects and cross-functional teams to deliver on time and on budget.

Experience
Operations Lead, Northwind Logistics (2019–present)
- Managed projects and worked with different teams to deliver products on time
- Improved process efficiency and reduced costs across the fulfilment org
- Owned vendor relationships and budget for a $4M operation

Project Coordinator, Cadence Retail (2016–2019)
- Coordinated launches across warehouse, support and marketing teams
- Built reporting to track delivery performance

Skills
Project management, process optimization, budget management, vendor management, reporting, team leadership

Education
B.S. Business Administration, State University`;

// ── Main page component ────────────────────────────────────────────────────────
export default function AnalyzePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();

  const [screen, setScreen] = useState<Screen>('input');
  const [jd, setJd] = useState('');
  const [resume, setResume] = useState('');
  const [matchResult, setMatchResult] = useState<MatchResponse | null>(null);
  const [rewriteResult, setRewriteResult] = useState<ResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  const handleAnalyze = useCallback(async () => {
    if (!jd.trim() || !resume.trim()) return;
    setError(null);
    setScreen('analyzing');
    try {
      const res = await aiEndpoints.match({ resume_text: resume, jd_text: jd });
      setMatchResult(res.data);
      setScreen('results');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setError(err.response?.data?.detail ?? 'Analysis failed. Please try again.');
      setScreen('input');
    }
  }, [jd, resume]);

  const handleRewrite = useCallback(async () => {
    if (!matchResult) return;
    setScreen('rewriting');
    try {
      const res = await aiEndpoints.rewriteResume({
        resume_text: resume,
        jd_text: jd,
        missing_keywords: matchResult.missing_keywords,
      });
      setRewriteResult(res.data.rewritten_resume as ResumeData);
      setScreen('rewrite');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setError(err.response?.data?.detail ?? 'Rewrite failed. Please try again.');
      setScreen('results');
    }
  }, [matchResult, resume, jd]);

  if (authLoading || !user) return null;

  const ceiling = matchResult
    ? Math.min(99, matchResult.score + Math.min(28, matchResult.missing_keywords.length * 5 + 6))
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Manrope', sans-serif" }}>
      <AppNav />

      {/* Step indicator — only shown after input screen */}
      {screen !== 'input' && screen !== 'analyzing' && (
        <div className="rl-noprint" style={{ borderBottom: `1px solid ${line}`, background: soft }}>
          <div className="max-w-285 mx-auto px-4 md:px-8 flex items-center justify-center gap-2 sm:gap-3 h-11">
            {(['input', 'results', 'rewrite'] as const).map((s, i) => {
              const active = screen === s || (s === 'rewrite' && screen === 'rewriting');
              const done = (s === 'input' && ['results', 'rewriting', 'rewrite', 'analyzing'].includes(screen)) ||
                (s === 'results' && ['rewriting', 'rewrite'].includes(screen));
              return (
                <div key={s} className="flex items-center gap-1 sm:gap-2">
                  {i > 0 && <div className="w-4 sm:w-6 h-px" style={{ background: line }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 99, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, background: done ? green : (active ? accent : line), color: (done || active) ? '#fff' : sub, transition: 'all .2s' }}>{done ? '✓' : i + 1}</div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: active ? ink : sub, display: active ? 'inline' : undefined }} className={active ? '' : 'hidden sm:inline'}>{s === 'input' ? 'Input' : s === 'results' ? 'Results' : 'Rewrite'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Screen router */}
      {screen === 'input' && (
        <InputScreen jd={jd} resume={resume} setJd={setJd} setResume={setResume} onAnalyze={handleAnalyze} error={error} />
      )}
      {screen === 'analyzing' && <AnalyzingScreen />}
      {screen === 'results' && matchResult && (
        <ResultsScreen result={matchResult} onRewrite={handleRewrite} onBack={() => setScreen('input')} />
      )}
      {screen === 'rewriting' && <RewritingScreen />}
      {screen === 'rewrite' && rewriteResult && matchResult && (
        <RewriteScreen
          rewrittenResume={rewriteResult}
          originalScore={matchResult.score}
          ceiling={ceiling}
          addedKeywords={matchResult.missing_keywords}
          onBack={() => setScreen('results')}
        />
      )}
    </div>
  );
}
