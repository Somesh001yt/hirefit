'use client';

import { Application } from '@/lib/endpoints';
import { formatDate, STATUS_STYLES } from '@/lib/helpers';
import Button from '@/components/ui/Button';

interface ApplicationCardProps {
  app: Application;
  onEdit: () => void;
  onDelete: () => void;
  confirmingDelete: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

export default function ApplicationCard({
  app, onEdit, onDelete, confirmingDelete, onConfirmDelete, onCancelDelete,
}: ApplicationCardProps) {
  const st = STATUS_STYLES[app.status] ?? STATUS_STYLES.saved;
  const date = app.applied_at ? formatDate(app.applied_at) : formatDate(app.created_at);

  return (
    <div style={{
      background: '#fff', border: '1px solid var(--rl-line)', borderRadius: 16,
      padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, color: 'var(--rl-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {app.company}
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--rl-sub)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {app.role}
          </div>
        </div>
        <span style={{
          flexShrink: 0, fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 99,
          background: st.bg, color: st.color,
        }}>
          {st.label}
        </span>
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--rl-sub)', fontWeight: 600 }}>
        <span>{date}</span>
        {app.jd_url && (
          <a href={app.jd_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            View JD ↗
          </a>
        )}
      </div>

      {app.notes && (
        <p style={{ fontSize: 13, color: 'var(--rl-sub)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {app.notes}
        </p>
      )}

      {/* Actions */}
      {confirmingDelete ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', flex: 1 }}>Delete this application?</span>
          <Button variant="danger" size="sm" onClick={onConfirmDelete}>Yes, delete</Button>
          <Button variant="ghost" size="sm" onClick={onCancelDelete}>Cancel</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
          <Button variant="ghost" size="sm" onClick={onEdit} fullWidth>Edit</Button>
          <Button variant="danger" size="sm" onClick={onDelete} fullWidth>Delete</Button>
        </div>
      )}
    </div>
  );
}
