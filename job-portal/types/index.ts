export type Role = 'student' | 'recruiter';

export type JobType = 'full-time' | 'part-time' | 'internship' | 'contract' | 'remote';

export type ApplicationStatus =
  | 'pending'
  | 'reviewed'
  | 'interview'
  | 'on-hold'
  | 'selected'
  | 'rejected';

export interface IJob {
  _id:         string;
  recruiterId: string;
  companyName: string;
  title:       string;
  description: string;
  location:    string;
  jobType:     JobType;
  salary:      string;
  skills:      string[];
  deadline:    string;
  eligibility: string;
  createdAt:   string;
  updatedAt:   string;
}

export interface IApplication {
  _id:       string;
  jobId:     IJob | string;
  studentId: { _id: string; name: string; email: string } | string;
  status:    ApplicationStatus;
  createdAt: string;
}

export interface IRecruiterProfile {
  _id:         string;
  userId:      string;
  firmName:    string;
  firmWebsite: string;
  designation: string;
  phone:       string;
}

export interface JobFormData {
  companyName: string;
  title:       string;
  description: string;
  location:    string;
  jobType:     JobType | '';
  salary:      string;
  skills:      string;
  deadline:    string;
  eligibility: string;
}

// ── Chat types ──────────────────────────────────────────────────────────────

export interface IConversationParticipant {
  _id:   string;
  name:  string;
  email: string;
  role:  Role;
}

export interface IConversation {
  _id:                string;
  participants:       IConversationParticipant[];
  jobId:              IJob | null;
  lastMessagePreview: string;
  lastMessageAt:      string;
  createdAt:          string;
}

export interface IMessage {
  _id:            string;
  conversationId: string;
  senderId:       { _id: string; name: string } | string;
  content:        string;
  readBy:         string[];
  createdAt:      string;
}

// ── Review types ─────────────────────────────────────────────────────────────

export interface IReview {
  _id:          string;
  reviewerId:   { _id: string; name: string; role: Role } | string;
  revieweeId:   { _id: string; name: string; role: Role } | string;
  jobId:        { _id: string; title: string; companyName: string } | string | null;
  rating:       1 | 2 | 3 | 4 | 5;
  content:      string;
  reviewerRole: Role;
  createdAt:    string;
}
