import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';
import path from 'path';
import fs from 'fs';

// Force Node.js runtime — required for fs/path.
// Without this, Next.js may use Edge runtime where these modules don't exist.
export const runtime = 'nodejs';

const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB

function getResumeDir(): string {
  return path.join(process.cwd(), 'public', 'resumes');
}

function ensureResumeDir(): void {
  const dir = getResumeDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // ── Auth check ────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can apply.' },
        { status: 401 }
      );
    }

    // ── Parse multipart form data ─────────────────────────────────────────
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: 'Could not read form data. Please try again.' },
        { status: 400 }
      );
    }

    const jobId             = (formData.get('jobId')             as string | null)?.trim() ?? '';
    const phone             = (formData.get('phone')             as string | null)?.trim() ?? '';
    const yearsOfExperience = (formData.get('yearsOfExperience') as string | null)?.trim() ?? '';
    const education         = (formData.get('education')         as string | null)?.trim() ?? '';
    const applicantSkills   = (formData.get('applicantSkills')   as string | null)?.trim() ?? '';
    const coverLetter       = (formData.get('coverLetter')       as string | null)?.trim() ?? '';
    const resumeEntry       = formData.get('resume');

    // ── Basic validation ──────────────────────────────────────────────────
    if (!jobId || jobId === 'undefined') {
      return NextResponse.json({ error: 'jobId is required.' }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    }
    if (!yearsOfExperience) {
      return NextResponse.json({ error: 'Experience level is required.' }, { status: 400 });
    }
    if (!education) {
      return NextResponse.json({ error: 'Education level is required.' }, { status: 400 });
    }

    // ── DB checks ─────────────────────────────────────────────────────────
    await connectDB();

    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
    }
    if (new Date(job.deadline) < new Date()) {
      return NextResponse.json(
        { error: 'Application deadline has passed.' },
        { status: 400 }
      );
    }

    const existing = await Application.findOne({
      jobId,
      studentId: session.user.id,
    });
    if (existing) {
      return NextResponse.json(
        { error: 'You have already applied for this job.' },
        { status: 409 }
      );
    }

    // ── Resume upload ─────────────────────────────────────────────────────
    // FIX: do NOT rely on File.size — it can be 0 on Windows even when the
    // file has content. Instead, always call arrayBuffer() and check byteLength.
    let resumePath     = '';
    let resumeFilename = '';

    if (resumeEntry && resumeEntry instanceof File && resumeEntry.name) {
      let buffer: Buffer;
      try {
        const ab = await resumeEntry.arrayBuffer();
        buffer   = Buffer.from(ab);
      } catch {
        // arrayBuffer() failed — skip the upload rather than crashing
        buffer = Buffer.alloc(0);
      }

      if (buffer.byteLength > 0) {
        // Validate MIME type from the File object
        const mime = resumeEntry.type || '';
        if (!mime.includes('pdf')) {
          return NextResponse.json(
            { error: 'Resume must be a PDF file.' },
            { status: 400 }
          );
        }

        // Validate size
        if (buffer.byteLength > MAX_RESUME_BYTES) {
          return NextResponse.json(
            { error: `Resume must be ${MAX_RESUME_BYTES / 1024 / 1024} MB or smaller.` },
            { status: 400 }
          );
        }

        // Build a safe, collision-proof filename
        const baseName = safeFilename(
          resumeEntry.name.replace(/\.pdf$/i, '') || 'resume'
        );
        const stored = `resume-${session.user.id}-${jobId}-${Date.now()}-${baseName}.pdf`;

        try {
          ensureResumeDir();
          fs.writeFileSync(path.join(getResumeDir(), stored), buffer);
          resumePath     = `/resumes/${stored}`;
          resumeFilename = resumeEntry.name;
        } catch (fsErr) {
          console.error('[Resume] fs write failed:', fsErr);
          // Don't block the application — just skip the resume
          resumePath     = '';
          resumeFilename = '';
        }
      }
    }

    // ── Create the application document ──────────────────────────────────
    const app = await Application.create({
      jobId,
      studentId:         session.user.id,
      phone,
      yearsOfExperience,
      education,
      applicantSkills,
      coverLetter,
      resumePath,
      resumeFilename,
    });

    return NextResponse.json(
      JSON.parse(JSON.stringify(app)),
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('[POST /api/applications]', err);
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: 'You have already applied for this job.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
