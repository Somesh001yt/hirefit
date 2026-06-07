'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';

const accent = '#6366f1';
const accentSoft = '#eef2ff';
const accentBorder = '#c7d2fe';
const ink = '#10131c';
const sub = '#5a6072';
const line = '#e6e7ec';
const soft = '#f5f6f9';
const green = '#16a34a';
const greenSoft = '#e8f7ee';

function Logo({ size = 20 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: size + 8, height: size + 8, borderRadius: 8, background: accent, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <div style={{ width: size * 0.55, height: size * 0.55, border: '2.5px solid #fff', borderRadius: 2, transform: 'rotate(45deg)' }} />
      </div>
      <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: size, fontWeight: 700, letterSpacing: '-0.02em', color: ink }}>HireFit</span>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 700, padding: '7px 13px', borderRadius: 100, color: accent, background: accentSoft }}>
      <span style={{ width: 7, height: 7, borderRadius: 99, background: 'currentColor' }} />{children}
    </span>
  );
}

function Btn({ children, onClick, kind = 'primary', size = 'md', className = '' }: {
  children: React.ReactNode;
  onClick?: () => void;
  kind?: 'primary' | 'dark' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = { md: { padding: '13px 22px', fontSize: 15.5 }, lg: { padding: '15px 28px', fontSize: 16.5 }, sm: { padding: '9px 15px', fontSize: 14 } };
  const kinds = {
    primary: { background: accent, color: '#fff', border: '1px solid transparent', boxShadow: `0 10px 22px -12px ${accent}` },
    dark: { background: ink, color: '#fff', border: '1px solid transparent' },
    ghost: { background: '#fff', color: ink, border: `1px solid ${line}` },
  };
  return (
    <button
      onClick={onClick}
      className={className}
      style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, borderRadius: 10, cursor: 'pointer', transition: 'transform .12s ease, filter .12s ease', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, lineHeight: 1, minHeight: 44, ...sizes[size], ...kinds[kind] }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.04)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; (e.currentTarget as HTMLButtonElement).style.filter = 'none'; }}
    >{children}</button>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuthContext();

  const handleStart = () => router.push(user ? '/analyze' : '/login');
  const h: React.CSSProperties = { fontFamily: "'Manrope', sans-serif", letterSpacing: '-0.02em', margin: 0 };

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", color: ink, background: '#fff' }}>

      {/* ── Nav ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${line}` }}>
        <div className="max-w-270 mx-auto px-4 md:px-8 flex items-center justify-between h-17">
          <Logo />
          <div className="flex items-center gap-4 md:gap-7">
            {user ? (
              <Btn kind="dark" size="sm" onClick={handleStart}>Open app →</Btn>
            ) : (
              <>
                <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: sub, textDecoration: 'none' }}>Sign in</Link>
                <Btn kind="dark" size="sm" onClick={handleStart}>Get started free</Btn>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="max-w-270 mx-auto px-4 md:px-8 pt-12 pb-7 lg:pt-18 grid grid-cols-1 lg:grid-cols-[1.04fr_0.96fr] gap-10 lg:gap-14 items-center">
        <div>
          <Pill>AI-powered resume optimizer</Pill>
          <h1 className="text-4xl md:text-[46px] lg:text-[54px]" style={{ ...h, lineHeight: 1.04, fontWeight: 700, marginTop: 22 }}>
            Make your resume<br />match the job —<br /><span style={{ color: accent }}>in 30 seconds.</span>
          </h1>
          <p className="text-[15px] md:text-[18px]" style={{ lineHeight: 1.55, color: sub, maxWidth: 440, marginTop: 22, fontWeight: 500 }}>
            Paste a job description, drop in your resume. Get your fit score, the exact keywords you&apos;re missing, and an AI rewrite delivered as a polished PDF.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8 items-stretch sm:items-center">
            <Btn kind="primary" size="lg" onClick={handleStart} className="w-full sm:w-auto justify-center">Optimize my resume →</Btn>
            <Btn kind="ghost" size="lg" onClick={handleStart} className="w-full sm:w-auto justify-center">See how it works</Btn>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 22, fontSize: 13, color: sub, fontWeight: 600 }}>
            <span style={{ display: 'flex' }}>{['#c7d2fe', '#a5b4fc', '#fcd9bd', '#bbf7d0'].map((c, i) => <span key={i} style={{ width: 24, height: 24, borderRadius: 99, background: c, border: '2px solid #fff', marginLeft: i ? -8 : 0 }} />)}</span>
            Trusted by job seekers switching careers
          </div>
        </div>

        {/* Hero preview card */}
        <div style={{ background: soft, border: `1px solid ${line}`, borderRadius: 20, padding: 24, boxShadow: '0 30px 60px -30px rgba(16,19,28,0.20)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: sub, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Match analysis</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: green, background: greenSoft, padding: '4px 10px', borderRadius: 99 }}>● Live</span>
          </div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', background: '#fff', border: `1px solid ${line}`, borderRadius: 14, padding: 18 }}>
            <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
              <svg viewBox="0 0 90 90" style={{ width: 90, height: 90, transform: 'rotate(-90deg)' }}>
                <circle cx={45} cy={45} r={38} fill="none" stroke={line} strokeWidth={8} />
                <circle cx={45} cy={45} r={38} fill="none" stroke={accent} strokeWidth={8}
                  strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 * (1 - 0.71)}
                  strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 700, color: ink, lineHeight: 1 }}>71<span style={{ fontSize: 12 }}>%</span></span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>Good match — fixable gaps</div>
              <div style={{ fontSize: 13, color: sub, fontWeight: 500, marginTop: 4, lineHeight: 1.4 }}>6 missing keywords found. Apply the rewrite to reach <b style={{ color: accent }}>94%</b>.</div>
            </div>
          </div>
          <div style={{ marginTop: 14, fontSize: 11.5, fontWeight: 700, color: sub, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>Missing keywords</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {['Stakeholder management', 'Roadmapping', 'SQL', 'A/B testing', 'OKRs', 'Go-to-market'].map(k => (
              <span key={k} style={{ fontSize: 12.5, fontWeight: 600, color: accent, background: accentSoft, border: `1px solid ${accentBorder}`, padding: '6px 11px', borderRadius: 8 }}>+ {k}</span>
            ))}
          </div>
          <div onClick={handleStart} style={{ cursor: 'pointer', marginTop: 16, background: ink, color: '#fff', textAlign: 'center', padding: '13px', borderRadius: 11, fontWeight: 700, fontSize: 14, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡ Rewrite resume with these keywords</div>
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="py-12 md:py-[70px]" style={{ background: soft, borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}` }}>
        <div className="max-w-270 mx-auto px-4 md:px-8">
          <Pill>How it works</Pill>
          <h2 className="text-[24px] md:text-4xl" style={{ ...h, fontWeight: 700, marginTop: 18, maxWidth: 580 }}>From mismatch to interview-ready in three steps.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 mt-11">
            {[
              { n: '01', t: 'Paste the job', d: 'Drop in any job description. HireFit reads the requirements, responsibilities and the keywords recruiters and ATS systems scan for.' },
              { n: '02', t: 'Upload your resume', d: 'PDF, DOCX or plain text. We parse every section and compare it line-by-line against the role you actually want.' },
              { n: '03', t: 'Get your rewrite', d: "See your match score, the exact keywords you're missing, and a one-click AI rewrite delivered as a polished, ATS-safe PDF." },
            ].map(s => (
              <div key={s.n} style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 16, padding: 26 }}>
                <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, fontWeight: 700, color: accent, letterSpacing: '0.05em' }}>{s.n}</div>
                <div style={{ ...h, fontSize: 20, fontWeight: 700, marginTop: 12 }}>{s.t}</div>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, color: sub, fontWeight: 500, marginTop: 10 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <div className="max-w-270 mx-auto px-4 md:px-8 py-14 md:py-18">
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 44px' }}>
          <Pill>Features</Pill>
          <h2 className="text-[24px] md:text-4xl" style={{ ...h, fontWeight: 700, marginTop: 18 }}>Everything you need to beat the filter.</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4.5">
          <div style={{ background: accent, color: '#fff', borderRadius: 18, padding: 32, position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, opacity: 0.8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Match score</div>
            <div style={{ ...h, fontSize: 26, fontWeight: 700, marginTop: 10, maxWidth: 340, color: '#fff' }}>Know your fit before you apply.</div>
            <p style={{ fontSize: 15, lineHeight: 1.55, opacity: 0.9, fontWeight: 500, marginTop: 12, maxWidth: 360 }}>A single number that tells you how closely your resume matches the role — and exactly what&apos;s dragging it down.</p>
            <div style={{ position: 'absolute', right: -30, bottom: -30, width: 170, height: 170, borderRadius: 99, border: '22px solid rgba(255,255,255,0.14)' }} />
          </div>
          <div className="grid grid-rows-2 gap-4.5">
            {[
              { t: 'Missing keyword finder', d: 'Surfaces the skills, tools and phrases the JD expects but your resume omits.' },
              { t: 'One-click AI rewrite', d: 'Rewrites bullets to weave in keywords naturally — no keyword stuffing.' },
            ].map(f => (
              <div key={f.t} style={{ background: soft, border: `1px solid ${line}`, borderRadius: 18, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: accentSoft, display: 'grid', placeItems: 'center', marginBottom: 14 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, border: `2.5px solid ${accent}`, transform: 'rotate(45deg)' }} />
                </div>
                <div style={{ ...h, fontSize: 17, fontWeight: 700 }}>{f.t}</div>
                <p style={{ fontSize: 14, lineHeight: 1.5, color: sub, fontWeight: 500, marginTop: 7 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Before / after ── */}
      <div className="py-12 md:py-[70px]" style={{ background: soft, borderTop: `1px solid ${line}` }}>
        <div className="max-w-270 mx-auto px-4 md:px-8">
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 40px' }}>
            <Pill>Before / after</Pill>
            <h2 className="text-[24px] md:text-4xl" style={{ ...h, fontWeight: 700, marginTop: 18 }}>The same experience, repositioned.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
            <div style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 16, padding: 26 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: sub, background: '#eceef2', padding: '5px 10px', borderRadius: 7, letterSpacing: '0.06em' }}>BEFORE</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: sub }}>71% match</span>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Product Manager</div>
              <p style={{ fontSize: 15, lineHeight: 1.62, fontWeight: 500 }}>Managed projects and worked with different teams to deliver products on time.</p>
            </div>
            <div style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 16, padding: 26 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: '#fff', background: accent, padding: '5px 10px', borderRadius: 7, letterSpacing: '0.06em' }}>AFTER</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>94% match</span>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Product Manager</div>
              <p style={{ fontSize: 15, lineHeight: 1.62, fontWeight: 500 }}>
                Drove cross-functional <mark style={{ background: accentSoft, color: accent, fontWeight: 700, padding: '0 3px', borderRadius: 3 }}>stakeholder management</mark> and <mark style={{ background: accentSoft, color: accent, fontWeight: 700, padding: '0 3px', borderRadius: 3 }}>roadmapping</mark> across 4 teams, shipping 12 products and lifting on-time delivery 38% via <mark style={{ background: accentSoft, color: accent, fontWeight: 700, padding: '0 3px', borderRadius: 3 }}>OKR</mark> alignment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="max-w-270 mx-auto px-4 md:px-8 py-14 md:py-19">
        <div className="px-6 py-12 md:px-11 md:py-14 text-center" style={{ background: ink, borderRadius: 24 }}>
          <h2 className="text-[24px] md:text-[38px]" style={{ ...h, fontWeight: 700, color: '#fff', maxWidth: 520, margin: '0 auto', lineHeight: 1.1 }}>Your next role is reading your resume right now.</h2>
          <p style={{ fontSize: 16.5, color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginTop: 16 }}>Make sure it says the right things.</p>
          <div className="mt-7">
            <Btn kind="primary" size="lg" onClick={handleStart} className="w-full sm:w-auto justify-center">Optimize my resume — free →</Btn>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: `1px solid ${line}` }}>
        <div className="max-w-270 mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 py-5 sm:h-18" style={{ fontSize: 13, color: sub, fontWeight: 600 }}>
          <Logo size={17} />
          <span>© 2026 HireFit · AI-powered resume optimization</span>
        </div>
      </div>
    </div>
  );
}
