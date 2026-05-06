import Link from 'next/link';
import type { IJob } from '@/types';

interface JobCardProps {
  job:         IJob;
  applied:     boolean;
  onApply:     (job: IJob) => void;  // full object — NOT just the id string
  isRecruiter: boolean;
  isGuest?:    boolean;
}

export default function JobCard({ job, applied, onApply, isRecruiter, isGuest }: JobCardProps) {
  const expired = new Date(job.deadline) < new Date();

  return (
    <div className="card">
      <div className="card-title">
        <Link href={`/jobs/${job._id}`}>{job.title}</Link>
      </div>
      <div className="card-sub">{job.companyName} &mdash; {job.location}</div>

      <div style={{ marginBottom: 8 }}>
        <span className="tag">{job.jobType}</span>
        {job.salary && <span className="tag tag-green">{job.salary}</span>}
        {expired     && <span className="tag tag-red">Deadline Passed</span>}
      </div>

      {job.skills?.length > 0 && (
        <p style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: 8 }}>
          Skills: {job.skills.join(', ')}
        </p>
      )}

      <p style={{ fontSize: '0.76rem', color: '#9ca3af', marginBottom: 10 }}>
        Deadline: {new Date(job.deadline).toLocaleDateString()}
      </p>

      {!isRecruiter && (
        isGuest ? (
          <Link
            href="/login?callbackUrl=/jobs"
            className="btn btn-sm"
            style={{ textDecoration: 'none' }}
          >
            Sign in to Apply
          </Link>
        ) : applied ? (
          <span className="tag tag-green">✓ Applied</span>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onApply(job)}   // ← pass the FULL job object
            disabled={expired}
          >
            {expired ? 'Closed' : 'Quick Apply'}
          </button>
        )
      )}
    </div>
  );
}
