export type Role = "student" | "teacher" | "admin";

export type TaskStatus = "pending" | "completed" | "upcoming" | "overdue";

export type ClassCategory = "nazira" | "hifz" | "murajah" | "intensive";

export const MAX_CLASS_SIZE = 50;

export const CLASS_CATEGORIES: { id: ClassCategory; label: string }[] = [
  { id: "nazira", label: "Nazira" },
  { id: "hifz", label: "Hifz" },
  { id: "murajah", label: "Muraja'ah" },
  { id: "intensive", label: "Intensive" },
];

export interface ClassRoom {
  id: string;
  name: string;
  category: ClassCategory;
  teacherId?: string;
  maxStudents: number;
  active: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  active: boolean;
  avatar?: string;
  /** Assigned class teacher (synced from class) */
  teacherId?: string;
  /** Assigned class id */
  classId?: string;
  /** Display name of class */
  className?: string;
  createdAt: string;
}

export interface MemorizationRecord {
  id: string;
  studentId: string;
  surah: string;
  ayahFrom: number;
  ayahTo: number;
  date: string;
  recordedBy: string;
  notes?: string;
}

export interface RevisionTask {
  id: string;
  studentId: string;
  surah: string;
  ayahFrom: number;
  ayahTo: number;
  dueDate: string;
  status: TaskStatus;
  assignedBy: string;
  completedAt?: string;
  notes?: string;
}

export interface Assessment {
  id: string;
  studentId: string;
  teacherId: string;
  surah: string;
  ayahFrom: number;
  ayahTo: number;
  score: number;
  grade: string;
  mistakes: string;
  feedback: string;
  date: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export type MeetingProvider = "jitsi" | "zoom" | "google_meet";
export type MeetingStatus = "scheduled" | "live" | "ended";

export interface OnlineMeeting {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  classId?: string;
  /** Specific students invited (1:1 or small group). If empty + classId, whole class is booked. */
  studentIds?: string[];
  provider: MeetingProvider;
  /** Unique room code used for in-site Jitsi */
  roomCode: string;
  /** Optional Zoom / Google Meet URL */
  externalUrl?: string;
  scheduledAt: string;
  durationMins: number;
  forInternational: boolean;
  status: MeetingStatus;
  createdAt: string;
}

export interface MeetingConflict {
  meeting: OnlineMeeting;
  studentIds: string[];
  studentNames: string[];
  hostName: string;
  overlapStart: string;
  overlapEnd: string;
}

export interface MeetingSlotSuggestion {
  scheduledAt: string;
  label: string;
  reason: string;
}

export interface AppData {
  users: User[];
  classes: ClassRoom[];
  memorization: MemorizationRecord[];
  revisions: RevisionTask[];
  assessments: Assessment[];
  messages: ContactMessage[];
  meetings: OnlineMeeting[];
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  teacherId?: string;
  classId?: string;
  className?: string;
}
