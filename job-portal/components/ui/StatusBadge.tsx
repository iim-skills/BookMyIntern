import React from 'react';

type StatusType =
  | 'pending'
  | 'reviewed'
  | 'interview'
  | 'on-hold'
  | 'selected'
  | 'rejected'
  | 'applied'
  | 'shortlisted'
  | 'offered'
  | 'closed'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const normStatus = status.toLowerCase();

  const config: Record<string, { label: string; bg: string; text: string }> = {
    pending: { label: 'Pending Review', bg: 'bg-accent-amber/15', text: 'text-accent-amber' },
    reviewed: { label: 'Reviewed', bg: 'bg-primary/15', text: 'text-primary' },
    interview: { label: 'Interview Scheduled', bg: 'bg-accent-indigo/15', text: 'text-accent-indigo' },
    'on-hold': { label: 'On Hold', bg: 'bg-text-secondary/15', text: 'text-text-secondary' },
    selected: { label: 'Offer Received', bg: 'bg-accent-teal/15', text: 'text-accent-teal' },
    rejected: { label: 'Rejected', bg: 'bg-accent-rose/15', text: 'text-accent-rose' },
    applied: { label: 'Applied', bg: 'bg-primary/15', text: 'text-primary' },
    shortlisted: { label: 'Shortlisted', bg: 'bg-accent-teal/15', text: 'text-accent-teal' },
    offered: { label: 'Offered', bg: 'bg-accent-teal/15', text: 'text-accent-teal' },
    closed: { label: 'Closed', bg: 'bg-text-muted/15', text: 'text-text-muted' },
  };

  const current = config[normStatus] || {
    label: status,
    bg: 'bg-text-secondary/15',
    text: 'text-text-secondary',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${current.bg} ${current.text} ${className}`}
    >
      {current.label}
    </span>
  );
}
