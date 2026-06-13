'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { useApplications } from '@/hooks/useApplications';
import { Application, ApplicationPayload } from '@/lib/endpoints';
import AppNav from '@/components/layout/AppNav';
import StatusFilter, { FilterValue } from '@/components/applications/StatusFilter';
import ApplicationCard from '@/components/applications/ApplicationCard';
import ApplicationRow from '@/components/applications/ApplicationRow';
import ApplicationForm from '@/components/applications/ApplicationForm';
import Modal from '@/components/ui/Modal';

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();

  const { data: all, loading, error, create, update, remove } = useApplications();

  const [filter, setFilter] = useState<FilterValue>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Application | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  const counts = all.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  const filtered = filter === 'all' ? all : all.filter(a => a.status === filter);

  const handleCreate = useCallback(async (payload: ApplicationPayload) => {
    setSaving(true);
    try {
      await create(payload);
      setShowAdd(false);
    } finally {
      setSaving(false);
    }
  }, [create]);

  const handleUpdate = useCallback(async (payload: ApplicationPayload) => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await update(editTarget.id, payload);
      setEditTarget(null);
    } finally {
      setSaving(false);
    }
  }, [editTarget, update]);

  const handleDelete = useCallback(async (id: string) => {
    await remove(id);
    setDeleteTarget(null);
  }, [remove]);

  if (authLoading || !user) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--rl-soft)', fontFamily: 'var(--font-head)' }}>
      <AppNav />

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: 'var(--rl-ink)' }}>
              Applications
            </h1>
            <p style={{ fontSize: 14, color: 'var(--rl-sub)', fontWeight: 500, margin: '4px 0 0' }}>
              {all.length} total · track your job search pipeline
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700,
              padding: '11px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'var(--accent)', color: '#fff',
              boxShadow: '0 8px 20px -10px var(--accent)',
              display: 'inline-flex', alignItems: 'center', gap: 7,
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add application
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ marginBottom: 20 }}>
          <StatusFilter active={filter} onChange={setFilter} counts={counts} />
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 18px', color: '#dc2626', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, height: 110, border: '1px solid var(--rl-line)', opacity: 0.5 }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 20, border: '1px solid var(--rl-line)' }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>📋</div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, color: 'var(--rl-ink)', marginBottom: 8 }}>
              {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
            </div>
            <p style={{ fontSize: 14, color: 'var(--rl-sub)', fontWeight: 500, marginBottom: 20 }}>
              {filter === 'all' ? 'Start tracking your job search by adding your first application.' : 'Try a different filter or add a new application.'}
            </p>
            <button
              onClick={() => setShowAdd(true)}
              style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, padding: '11px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'var(--accent)', color: '#fff' }}
            >
              + Add application
            </button>
          </div>
        )}

        {/* Desktop table — md+ */}
        {!loading && filtered.length > 0 && (
          <>
            <div className="hidden md:block" style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--rl-line)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--rl-soft)' }}>
                    {['Company', 'Role', 'Status', 'Date', 'Notes', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: 'var(--rl-sub)', letterSpacing: '0.04em', textTransform: 'uppercase', borderBottom: '1px solid var(--rl-line)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(app => (
                    <ApplicationRow
                      key={app.id}
                      app={app}
                      onEdit={() => setEditTarget(app)}
                      onDelete={() => setDeleteTarget(app.id)}
                      confirmingDelete={deleteTarget === app.id}
                      onConfirmDelete={() => handleDelete(app.id)}
                      onCancelDelete={() => setDeleteTarget(null)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards — <md */}
            <div className="md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(app => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  onEdit={() => setEditTarget(app)}
                  onDelete={() => setDeleteTarget(app.id)}
                  confirmingDelete={deleteTarget === app.id}
                  onConfirmDelete={() => handleDelete(app.id)}
                  onCancelDelete={() => setDeleteTarget(null)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add application">
        <ApplicationForm
          onSubmit={handleCreate}
          onCancel={() => setShowAdd(false)}
          loading={saving}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit application">
        {editTarget && (
          <ApplicationForm
            initial={editTarget}
            onSubmit={handleUpdate}
            onCancel={() => setEditTarget(null)}
            loading={saving}
          />
        )}
      </Modal>
    </div>
  );
}
