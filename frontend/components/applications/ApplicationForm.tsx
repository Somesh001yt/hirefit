'use client';

import { useState } from 'react';
import { Application, ApplicationPayload, ApplicationStatus } from '@/lib/endpoints';
import Button from '@/components/ui/Button';

const STATUS_OPTIONS: ApplicationStatus[] = ['saved', 'applied', 'interview', 'offer', 'rejected'];

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-head)', fontSize: 12.5, fontWeight: 700,
  color: 'var(--rl-sub)', marginBottom: 5, display: 'block',
};

const inputStyle: React.CSSProperties = {
  width: '100%', fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 500,
  color: 'var(--rl-ink)', background: 'var(--rl-soft)',
  border: '1px solid var(--rl-line)', borderRadius: 10,
  padding: '10px 13px', outline: 'none', boxSizing: 'border-box',
};

interface ApplicationFormProps {
  initial?: Application;
  onSubmit: (payload: ApplicationPayload) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function ApplicationForm({ initial, onSubmit, onCancel, loading }: ApplicationFormProps) {
  const [company, setCompany] = useState(initial?.company ?? '');
  const [role, setRole] = useState(initial?.role ?? '');
  const [status, setStatus] = useState<ApplicationStatus>(initial?.status ?? 'saved');
  const [jdUrl, setJdUrl] = useState(initial?.jd_url ?? '');
  const [appliedAt, setAppliedAt] = useState(initial?.applied_at?.slice(0, 10) ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [errors, setErrors] = useState<{ company?: string; role?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!company.trim()) e.company = 'Company is required';
    if (!role.trim()) e.role = 'Role is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      company: company.trim(),
      role: role.trim(),
      status,
      jd_url: jdUrl.trim() || undefined,
      applied_at: appliedAt || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={labelStyle}>Company *</label>
        <input
          value={company} onChange={e => setCompany(e.target.value)}
          placeholder="e.g. Stripe"
          style={{ ...inputStyle, borderColor: errors.company ? '#fca5a5' : 'var(--rl-line)' }}
        />
        {errors.company && <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, marginTop: 4, display: 'block' }}>{errors.company}</span>}
      </div>

      <div>
        <label style={labelStyle}>Role *</label>
        <input
          value={role} onChange={e => setRole(e.target.value)}
          placeholder="e.g. Senior Product Manager"
          style={{ ...inputStyle, borderColor: errors.role ? '#fca5a5' : 'var(--rl-line)' }}
        />
        {errors.role && <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, marginTop: 4, display: 'block' }}>{errors.role}</span>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={labelStyle}>Status</label>
          <select
            value={status} onChange={e => setStatus(e.target.value as ApplicationStatus)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Applied date</label>
          <input
            type="date" value={appliedAt} onChange={e => setAppliedAt(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>JD URL</label>
        <input
          value={jdUrl} onChange={e => setJdUrl(e.target.value)}
          placeholder="https://..."
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Notes</label>
        <textarea
          value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Any notes about this application…"
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.55 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <Button type="submit" loading={loading} fullWidth>
          {initial ? 'Save changes' : 'Add application'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
