'use client';

import { Application } from '@/lib/endpoints';
import { formatDate, STATUS_STYLES } from '@/lib/helpers';
import Button from '@/components/ui/Button';

interface ApplicationRowProps {
  app: Application;
  onEdit: () => void;
  onDelete: () => void;
  confirmingDelete: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

export default function ApplicationRow({
  app, onEdit, onDelete, confirmingDelete, onConfirmDelete, onCancelDelete,
}: ApplicationRowProps) {
  const st = STATUS_STYLES[app.status] ?? STATUS_STYLES.saved;
  const date = app.applied_at ? formatDate(app.applied_at) : formatDate(app.created_at);

  const cellBase: React.CSSProperties = {
    padding: '14px 16px', fontSize: 14, color: 'var(--rl-ink)',
    borderBottom: '1px solid var(--rl-line)', verticalAlign: 'middle',
  };

  return (
    <tr style={{ background: '#fff' }}>
      <td style={{ ...cellBase, fontWeight: 700, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {app.jd_url
          ? <a href={app.jd_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--rl-ink)', textDecoration: 'none' }}>
              {app.company} <span style={{ color: 'var(--accent)', fontSize: 12 }}>↗</span>
            </a>
          : app.company
        }
      </td>
      <td style={{ ...cellBase, color: 'var(--rl-sub)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {app.role}
      </td>
      <td style={cellBase}>
        <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: st.bg, color: st.color }}>
          {st.label}
        </span>
      </td>
      <td style={{ ...cellBase, color: 'var(--rl-sub)', fontSize: 13 }}>{date}</td>
      <td style={{ ...cellBase, color: 'var(--rl-sub)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
        {app.notes ?? '—'}
      </td>
      <td style={{ ...cellBase, whiteSpace: 'nowrap' }}>
        {confirmingDelete ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Button variant="danger" size="sm" onClick={onConfirmDelete}>Delete</Button>
            <Button variant="ghost" size="sm" onClick={onCancelDelete}>Cancel</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 6 }}>
            <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
            <Button variant="danger" size="sm" onClick={onDelete}>Delete</Button>
          </div>
        )}
      </td>
    </tr>
  );
}
