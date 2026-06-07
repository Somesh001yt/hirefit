'use client';

import { ApplicationStatus } from '@/lib/endpoints';

interface BadgeProps {
  status: ApplicationStatus;
}

const statusConfig: Record<
  ApplicationStatus,
  { bg: string; color: string; label: string }
> = {
  saved: {
    bg: 'var(--color-status-saved)',
    color: 'var(--color-status-saved-text)',
    label: 'Saved',
  },
  applied: {
    bg: 'var(--color-status-applied)',
    color: 'var(--color-status-applied-text)',
    label: 'Applied',
  },
  interview: {
    bg: 'var(--color-status-interview)',
    color: 'var(--color-status-interview-text)',
    label: 'Interview',
  },
  offer: {
    bg: 'var(--color-status-offer)',
    color: 'var(--color-status-offer-text)',
    label: 'Offer',
  },
  rejected: {
    bg: 'var(--color-status-rejected)',
    color: 'var(--color-status-rejected-text)',
    label: 'Rejected',
  },
};

export default function Badge({ status }: BadgeProps) {
  const { bg, color, label } = statusConfig[status];
  return (
    <span
      style={{ backgroundColor: bg, color }}
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    >
      {label}
    </span>
  );
}
