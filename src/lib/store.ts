import {
  findMeetingConflicts,
  formatMeetingWindow,
  suggestFreeMeetingSlots,
  toDatetimeLocalValue,
} from "./meetings";
import {
  AppData,
  Assessment,
  ClassCategory,
  ClassRoom,
  ContactMessage,
  MemorizationRecord,
  MeetingProvider,
  MeetingStatus,
  OnlineMeeting,
  RevisionTask,
  SessionUser,
  TaskStatus,
  User,
} from "./types";

export {
  findMeetingConflicts,
  suggestFreeMeetingSlots,
  formatMeetingWindow,
  toDatetimeLocalValue,
};

const SESSION_KEY = "hrms_session_v1";

function notifyDataUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("hrms-data-updated"));
  }
}

async function readJsonSafe(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  if (!text) {
    throw new Error(
      res.ok
        ? "Empty server response."
        : `Server error (${res.status}). Is MySQL running? Try npm run db:setup`
    );
  }
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const snippet = text.replace(/\s+/g, " ").slice(0, 120);
    throw new Error(
      res.status >= 500
        ? `Server crashed (${res.status}). Free disk space, start MariaDB, then restart npm run dev.`
        : `Invalid server response: ${snippet}`
    );
  }
}

async function apiGetData(): Promise<AppData> {
  const res = await fetch("/api/data", { cache: "no-store" });
  const json = await readJsonSafe(res);
  if (!res.ok || !json.ok) {
    throw new Error(
      (typeof json.error === "string" && json.error) ||
        "Failed to load data from MySQL"
    );
  }
  return json.data as AppData;
}

async function apiAction<T>(action: string, ...args: unknown[]): Promise<T> {
  const res = await fetch("/api/store", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, args }),
  });
  const json = await readJsonSafe(res);
  if (!res.ok || !json.ok) {
    throw new Error(
      (typeof json.error === "string" && json.error) ||
        `Action failed: ${action}`
    );
  }
  notifyDataUpdated();
  return json.result as T;
}

export async function getData(): Promise<AppData> {
  return apiGetData();
}

export async function saveData(data: AppData): Promise<void> {
  const res = await fetch("/api/data", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  const json = await readJsonSafe(res);
  if (!res.ok || !json.ok) {
    throw new Error(
      (typeof json.error === "string" && json.error) || "Failed to save data"
    );
  }
  notifyDataUpdated();
}

export async function resetData(): Promise<AppData> {
  const result = await apiAction<AppData>("resetData");
  return result;
}

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function setSession(user: SessionUser | null) {
  if (typeof window === "undefined") return;
  if (!user) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("hrms-session-updated"));
}

export function logout() {
  setSession(null);
}

export function toSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    teacherId: user.teacherId,
    classId: user.classId,
    className: user.className,
  };
}

export async function login(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const session = await apiAction<SessionUser | null>("login", email, password);
  if (session) setSession(session);
  return session;
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role: User["role"];
  phone?: string;
}): Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }> {
  const result = await apiAction<
    { ok: true; user: SessionUser } | { ok: false; error: string }
  >("registerUser", input);
  if (result.ok) setSession(result.user);
  return result;
}

export async function updateUser(id: string, patch: Partial<User>) {
  return apiAction<User | null>("updateUser", id, patch);
}

export async function createClass(input: {
  name: string;
  category: ClassCategory;
  teacherId?: string;
}) {
  return apiAction<{ ok: true; class: ClassRoom } | { ok: false; error: string }>(
    "createClass",
    input
  );
}

export async function assignClassTeacher(classId: string, teacherId: string | "") {
  return apiAction<{ ok: true } | { ok: false; error: string }>(
    "assignClassTeacher",
    classId,
    teacherId
  );
}

export async function enrollStudentInClass(studentId: string, classId: string) {
  return apiAction<{ ok: true } | { ok: false; error: string }>(
    "enrollStudentInClass",
    studentId,
    classId
  );
}

export async function removeStudentFromClass(studentId: string) {
  return apiAction<{ ok: true } | { ok: false; error: string }>(
    "removeStudentFromClass",
    studentId
  );
}

export async function transferStudentToClass(studentId: string, classId: string) {
  return apiAction<{ ok: true } | { ok: false; error: string }>(
    "transferStudentToClass",
    studentId,
    classId
  );
}

export async function addMemorization(record: Omit<MemorizationRecord, "id">) {
  return apiAction<MemorizationRecord>("addMemorization", record);
}

export async function addRevision(task: Omit<RevisionTask, "id">) {
  return apiAction<RevisionTask>("addRevision", task);
}

export async function updateRevisionStatus(id: string, status: TaskStatus) {
  return apiAction<RevisionTask | null>("updateRevisionStatus", id, status);
}

export async function updateRevision(
  id: string,
  patch: Partial<Omit<RevisionTask, "id" | "assignedBy">>
) {
  return apiAction<RevisionTask | null>("updateRevision", id, patch);
}

export async function deleteRevision(id: string) {
  return apiAction<boolean>("deleteRevision", id);
}

export async function addAssessment(record: Omit<Assessment, "id">) {
  return apiAction<Assessment>("addAssessment", record);
}

export async function addContactMessage(
  msg: Omit<ContactMessage, "id" | "createdAt">
) {
  return apiAction<ContactMessage>("addContactMessage", msg);
}

export async function createMeeting(input: {
  title: string;
  description?: string;
  hostId: string;
  classId?: string;
  studentIds?: string[];
  provider: MeetingProvider;
  roomCode?: string;
  externalUrl?: string;
  scheduledAt: string;
  durationMins: number;
  forInternational?: boolean;
  force?: boolean;
}) {
  return apiAction<
    | { ok: true; meeting: OnlineMeeting }
    | {
        ok: false;
        error: string;
        conflicts?: ReturnType<typeof findMeetingConflicts>;
        suggestions?: ReturnType<typeof suggestFreeMeetingSlots>;
      }
  >("createMeeting", input);
}

export async function updateMeeting(
  id: string,
  patch: Partial<
    Pick<
      OnlineMeeting,
      | "title"
      | "description"
      | "classId"
      | "studentIds"
      | "provider"
      | "roomCode"
      | "externalUrl"
      | "scheduledAt"
      | "durationMins"
      | "forInternational"
      | "status"
    >
  >,
  options?: { hostId?: string; force?: boolean }
) {
  return apiAction<
    | { ok: true; meeting: OnlineMeeting }
    | {
        ok: false;
        error: string;
        conflicts?: ReturnType<typeof findMeetingConflicts>;
        suggestions?: ReturnType<typeof suggestFreeMeetingSlots>;
      }
  >("updateMeeting", id, patch, options);
}

export async function updateMeetingStatus(id: string, status: MeetingStatus) {
  return apiAction<OnlineMeeting | null>("updateMeetingStatus", id, status);
}

export async function deleteMeeting(id: string) {
  return apiAction<void>("deleteMeeting", id);
}

export function getStudentProgress(data: AppData, studentId: string) {
  const memorized = data.memorization.filter((m) => m.studentId === studentId);
  const revisions = data.revisions.filter((r) => r.studentId === studentId);
  const assessments = data.assessments.filter((a) => a.studentId === studentId);
  const uniqueSurahs = new Set(memorized.map((m) => m.surah));
  const pending = revisions.filter(
    (r) => r.status === "pending" || r.status === "overdue"
  ).length;
  const completed = revisions.filter((r) => r.status === "completed").length;
  const avgScore =
    assessments.length === 0
      ? 0
      : Math.round(
          assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length
        );
  const overall = Math.min(
    100,
    Math.round((uniqueSurahs.size / 114) * 100 + completed * 2)
  );

  return {
    memorizedSurahs: uniqueSurahs.size,
    memorizedRecords: memorized.length,
    pendingTasks: pending,
    completedTasks: completed,
    assessmentCount: assessments.length,
    avgScore,
    overallProgress: Math.min(overall, 100),
    memorizationPct: Math.min(100, Math.round((uniqueSurahs.size / 30) * 100)),
    revisionPct:
      revisions.length === 0
        ? 0
        : Math.round((completed / revisions.length) * 100),
    assessmentPct: Math.min(100, avgScore),
  };
}

export function getJitsiEmbedUrl(roomCode: string, displayName?: string) {
  const room = encodeURIComponent(roomCode.replace(/\s+/g, "-"));
  const user = displayName
    ? `#userInfo.displayName="${encodeURIComponent(displayName)}"`
    : "";
  return `https://meet.jit.si/${room}${user}`;
}

export function getVisibleMeetings(
  data: AppData,
  userId: string,
  role: User["role"]
) {
  if (role === "admin") return data.meetings;
  if (role === "teacher") {
    const myClassIds = new Set(
      data.classes.filter((c) => c.teacherId === userId).map((c) => c.id)
    );
    const myStudentIds = new Set(
      data.users
        .filter((u) => u.role === "student" && u.teacherId === userId)
        .map((u) => u.id)
    );
    return data.meetings.filter(
      (m) =>
        m.hostId === userId ||
        (m.classId && myClassIds.has(m.classId)) ||
        (m.studentIds || []).some((id) => myStudentIds.has(id)) ||
        m.forInternational
    );
  }
  const me = data.users.find((u) => u.id === userId);
  return data.meetings.filter((m) => {
    if (m.studentIds?.includes(userId)) return true;
    if (m.forInternational) return true;
    if (!m.classId && !m.studentIds?.length) return true;
    return me?.classId === m.classId;
  });
}

export function getClassStudentCount(data: AppData, classId: string) {
  return data.users.filter(
    (u) => u.role === "student" && u.classId === classId && u.active
  ).length;
}

export function getStudentsInClass(data: AppData, classId: string) {
  return data.users.filter(
    (u) => u.role === "student" && u.classId === classId && u.active
  );
}

export function getUnassignedStudents(data: AppData) {
  return data.users.filter(
    (u) => u.role === "student" && u.active && !u.classId
  );
}

export function getTeacherClasses(data: AppData, teacherId: string) {
  return data.classes.filter((c) => c.active && c.teacherId === teacherId);
}

export function getTeacherForStudent(data: AppData, studentId: string) {
  const student = data.users.find((u) => u.id === studentId);
  if (!student?.teacherId) return null;
  return data.users.find((u) => u.id === student.teacherId) || null;
}

export function categoryLabel(category: ClassCategory) {
  const map: Record<ClassCategory, string> = {
    nazira: "Nazira",
    hifz: "Hifz",
    murajah: "Muraja'ah",
    intensive: "Intensive",
  };
  return map[category] || category;
}

export function gradeFromScore(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 85) return "A";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";
  if (score >= 70) return "C+";
  if (score >= 60) return "C";
  return "D";
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
