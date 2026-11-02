import { loadAppData, saveAppData, seedDatabase } from "./db/repository";
import { getEmailError, normalizeEmail } from "./email";
import {
  findMeetingConflicts,
  formatMeetingWindow,
  suggestFreeMeetingSlots,
} from "./meetings";
import {
  AppData,
  Assessment,
  ClassCategory,
  ClassRoom,
  ContactMessage,
  MAX_CLASS_SIZE,
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
} from "./meetings";

export async function getData(): Promise<AppData> {
  return loadAppData();
}

export async function saveData(data: AppData): Promise<void> {
  await saveAppData(data);
}

export async function resetData(): Promise<AppData> {
  await seedDatabase(true);
  return loadAppData();
}

export function getJitsiEmbedUrl(roomCode: string, displayName?: string) {
  const room = encodeURIComponent(roomCode.replace(/\s+/g, "-"));
  const user = displayName
    ? `#userInfo.displayName="${encodeURIComponent(displayName)}"`
    : "";
  return `https://meet.jit.si/${room}${user}`;
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
  /** If true, still create even when conflicts exist (not recommended). */
  force?: boolean;
}):
  | { ok: true; meeting: OnlineMeeting }
  | {
      ok: false;
      error: string;
      conflicts?: ReturnType<typeof findMeetingConflicts>;
      suggestions?: ReturnType<typeof suggestFreeMeetingSlots>;
    } {
  const data = await getData();
  const title = input.title.trim();
  if (!title) return { ok: false, error: "Meeting title is required." };
  if (input.provider !== "jitsi" && !input.externalUrl?.trim()) {
    return {
      ok: false,
      error: "Please paste a Zoom or Google Meet link for this provider.",
    };
  }

  const durationMins = input.durationMins || 45;
  const conflicts = findMeetingConflicts(data, {
    scheduledAt: input.scheduledAt,
    durationMins,
    classId: input.classId,
    studentIds: input.studentIds,
    hostId: input.hostId,
  });

  if (conflicts.length > 0 && !input.force) {
    const first = conflicts[0];
    const window = formatMeetingWindow(
      first.meeting.scheduledAt,
      first.meeting.durationMins
    );
    const who =
      first.studentNames.length > 0
        ? first.studentNames.join(", ")
        : `Host ${first.hostName}`;
    const suggestions = suggestFreeMeetingSlots(
      data,
      {
        scheduledAt: input.scheduledAt,
        durationMins,
        classId: input.classId,
        studentIds: input.studentIds,
        hostId: input.hostId,
      },
      conflicts
    );
    return {
      ok: false,
      error: `Time clash: ${who} pehle se booked hain — "${first.meeting.title}" (${window.rangeLabel}, host: ${first.hostName}). Please pehle/baad ka free slot choose karein.`,
      conflicts,
      suggestions,
    };
  }

  const meeting: OnlineMeeting = {
    id: `mtg-${Date.now()}`,
    title,
    description: input.description?.trim() || undefined,
    hostId: input.hostId,
    classId: input.classId || undefined,
    studentIds:
      input.studentIds && input.studentIds.length
        ? Array.from(new Set(input.studentIds))
        : undefined,
    provider: input.provider,
    roomCode:
      input.roomCode?.trim().replace(/\s+/g, "-") ||
      `HRMS-${Date.now().toString(36).toUpperCase()}`,
    externalUrl: input.externalUrl?.trim() || undefined,
    scheduledAt: input.scheduledAt,
    durationMins,
    forInternational: !!input.forInternational,
    status: "scheduled",
    createdAt: new Date().toISOString(),
  };
  data.meetings.unshift(meeting);
  await saveData(data);
  return { ok: true, meeting };
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
):
  | { ok: true; meeting: OnlineMeeting }
  | {
      ok: false;
      error: string;
      conflicts?: ReturnType<typeof findMeetingConflicts>;
      suggestions?: ReturnType<typeof suggestFreeMeetingSlots>;
    } {
  const data = await getData();
  const meeting = data.meetings.find((m) => m.id === id);
  if (!meeting) return { ok: false, error: "Meeting not found." };

  const next = { ...meeting, ...patch };
  const conflicts = findMeetingConflicts(data, {
    scheduledAt: next.scheduledAt,
    durationMins: next.durationMins,
    classId: next.classId,
    studentIds: next.studentIds,
    hostId: options?.hostId || next.hostId,
    excludeMeetingId: id,
  });

  if (conflicts.length > 0 && !options?.force) {
    const first = conflicts[0];
    const window = formatMeetingWindow(
      first.meeting.scheduledAt,
      first.meeting.durationMins
    );
    const suggestions = suggestFreeMeetingSlots(
      data,
      {
        scheduledAt: next.scheduledAt,
        durationMins: next.durationMins,
        classId: next.classId,
        studentIds: next.studentIds,
        hostId: options?.hostId || next.hostId,
        excludeMeetingId: id,
      },
      conflicts
    );
    return {
      ok: false,
      error: `Reschedule clash: student/host already booked during ${window.rangeLabel} ("${first.meeting.title}").`,
      conflicts,
      suggestions,
    };
  }

  Object.assign(meeting, patch);
  await saveData(data);
  return { ok: true, meeting };
}

export async function updateMeetingStatus(id: string, status: MeetingStatus): Promise<OnlineMeeting | null> {
  const data = await getData();
  const m = data.meetings.find((x) => x.id === id);
  if (!m) return null;
  m.status = status;
  await saveData(data);
  return m;
}

export async function deleteMeeting(id: string): Promise<void> {
  const data = await getData();
  data.meetings = data.meetings.filter((m) => m.id !== id);
  await saveData(data);
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

export async function login(email: string, password: string): Promise<SessionUser | null> {
  const data = await getData();
  const user = data.users.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.password === password &&
      u.active
  );
  if (!user) return null;
  return toSessionUser(user);
}


export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role: User["role"];
  phone?: string;
}): Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }> {
  const data = await getData();
  if (input.role === "admin") {
    return {
      ok: false,
      error: "Admin accounts cannot be created from signup. Contact your institute.",
    };
  }
  if (input.role !== "student" && input.role !== "teacher") {
    return { ok: false, error: "Please choose Student or Teacher." };
  }
  const emailErr = getEmailError(input.email);
  if (emailErr) {
    return { ok: false, error: emailErr };
  }
  const email = normalizeEmail(input.email);
  if (data.users.some((u) => u.email.toLowerCase() === email)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const user: User = {
    id: `u-${Date.now()}`,
    name: input.name.trim(),
    email,
    password: input.password,
    role: input.role,
    phone: input.phone,
    active: true,
    createdAt: new Date().toISOString(),
  };
  // New students start unassigned until a teacher/admin enrolls them
  data.users.push(user);
  await saveData(data);
  const session = toSessionUser(user);
  return { ok: true, user: session };
}

export async function updateUser(id: string, patch: Partial<User>): Promise<User | null> {
  const data = await getData();
  const idx = data.users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  data.users[idx] = { ...data.users[idx], ...patch, id };
  await saveData(data);
  return data.users[idx];
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

export async function createClass(input: {
  name: string;
  category: ClassCategory;
  teacherId?: string;
}): { ok: true; class: ClassRoom } | { ok: false; error: string } {
  const data = await getData();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Class name is required." };
  if (data.classes.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
    return { ok: false, error: "A class with this name already exists." };
  }
  if (input.teacherId) {
    const teacher = data.users.find(
      (u) => u.id === input.teacherId && u.role === "teacher" && u.active
    );
    if (!teacher) return { ok: false, error: "Selected teacher not found." };
  }

  const room: ClassRoom = {
    id: `c-${Date.now()}`,
    name,
    category: input.category,
    teacherId: input.teacherId,
    maxStudents: MAX_CLASS_SIZE,
    active: true,
    createdAt: new Date().toISOString(),
  };
  data.classes.push(room);

  if (input.teacherId) {
    const teacher = data.users.find((u) => u.id === input.teacherId);
    if (teacher) teacher.className = room.name;
  }

  await saveData(data);
  return { ok: true, class: room };
}

export async function assignClassTeacher(
  classId: string,
  teacherId: string | ""
): { ok: true } | { ok: false; error: string } {
  const data = await getData();
  const cls = data.classes.find((c) => c.id === classId);
  if (!cls) return { ok: false, error: "Class not found." };

  if (!teacherId) {
    cls.teacherId = undefined;
    data.users.forEach((u) => {
      if (u.role === "student" && u.classId === classId) {
        u.teacherId = undefined;
      }
    });
    await saveData(data);
    return { ok: true };
  }

  const teacher = data.users.find(
    (u) => u.id === teacherId && u.role === "teacher" && u.active
  );
  if (!teacher) return { ok: false, error: "Teacher not found." };

  cls.teacherId = teacherId;
  teacher.className = cls.name;

  data.users.forEach((u) => {
    if (u.role === "student" && u.classId === classId) {
      u.teacherId = teacherId;
      u.className = cls.name;
    }
  });

  await saveData(data);
  return { ok: true };
}

export async function enrollStudentInClass(
  studentId: string,
  classId: string
): { ok: true } | { ok: false; error: string } {
  const data = await getData();
  const student = data.users.find(
    (u) => u.id === studentId && u.role === "student" && u.active
  );
  if (!student) return { ok: false, error: "Student not found." };

  const cls = data.classes.find((c) => c.id === classId && c.active);
  if (!cls) return { ok: false, error: "Class not found." };
  if (!cls.teacherId) {
    return {
      ok: false,
      error: "Assign a class teacher first before enrolling students.",
    };
  }

  if (student.classId && student.classId !== classId) {
    return {
      ok: false,
      error: `${student.name} is already in another class. Remove them first.`,
    };
  }

  const count = getClassStudentCount(data, classId);
  if (!student.classId && count >= (cls.maxStudents || MAX_CLASS_SIZE)) {
    return {
      ok: false,
      error: `Class is full (max ${cls.maxStudents || MAX_CLASS_SIZE} students).`,
    };
  }

  student.classId = classId;
  student.className = cls.name;
  student.teacherId = cls.teacherId;
  await saveData(data);
  return { ok: true };
}

export async function removeStudentFromClass(
  studentId: string
): { ok: true } | { ok: false; error: string } {
  const data = await getData();
  const student = data.users.find(
    (u) => u.id === studentId && u.role === "student"
  );
  if (!student) return { ok: false, error: "Student not found." };
  student.classId = undefined;
  student.className = undefined;
  student.teacherId = undefined;
  await saveData(data);
  return { ok: true };
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

export async function addMemorization(
  record: Omit<MemorizationRecord, "id">
): MemorizationRecord {
  const data = await getData();
  const item: MemorizationRecord = { ...record, id: `m-${Date.now()}` };
  data.memorization.push(item);
  await saveData(data);
  return item;
}

export async function addRevision(task: Omit<RevisionTask, "id">): Promise<RevisionTask> {
  const data = await getData();
  const item: RevisionTask = { ...task, id: `r-${Date.now()}` };
  data.revisions.push(item);
  await saveData(data);
  return item;
}

export async function updateRevisionStatus(id: string, status: TaskStatus): Promise<RevisionTask | null> {
  const data = await getData();
  const task = data.revisions.find((r) => r.id === id);
  if (!task) return null;
  task.status = status;
  task.completedAt =
    status === "completed" ? new Date().toISOString() : undefined;
  await saveData(data);
  return task;
}

export async function updateRevision(
  id: string,
  patch: Partial<Omit<RevisionTask, "id" | "assignedBy">>
): RevisionTask | null {
  const data = await getData();
  const task = data.revisions.find((r) => r.id === id);
  if (!task) return null;
  Object.assign(task, patch);
  if (patch.status === "completed" && !task.completedAt) {
    task.completedAt = new Date().toISOString();
  }
  if (patch.status && patch.status !== "completed") {
    task.completedAt = undefined;
  }
  await saveData(data);
  return task;
}

export async function deleteRevision(id: string): Promise<boolean> {
  const data = await getData();
  const before = data.revisions.length;
  data.revisions = data.revisions.filter((r) => r.id !== id);
  if (data.revisions.length === before) return false;
  await saveData(data);
  return true;
}

/** Admin/teacher helper: move an enrolled student to another class (syncs teacher). */
export async function transferStudentToClass(
  studentId: string,
  classId: string
): { ok: true } | { ok: false; error: string } {
  const data = await getData();
  const student = data.users.find(
    (u) => u.id === studentId && u.role === "student" && u.active
  );
  if (!student) return { ok: false, error: "Student not found." };

  const cls = data.classes.find((c) => c.id === classId && c.active);
  if (!cls) return { ok: false, error: "Class not found." };
  if (!cls.teacherId) {
    return { ok: false, error: "Assign a class teacher before transferring students." };
  }

  if (student.classId === classId) {
    return { ok: false, error: "Student is already in this class." };
  }

  const count = getClassStudentCount(data, classId);
  if (count >= (cls.maxStudents || MAX_CLASS_SIZE)) {
    return { ok: false, error: `Class is full (max ${cls.maxStudents || MAX_CLASS_SIZE}).` };
  }

  student.classId = classId;
  student.className = cls.name;
  student.teacherId = cls.teacherId;
  await saveData(data);
  return { ok: true };
}

export function getTeacherForStudent(data: AppData, studentId: string) {
  const student = data.users.find((u) => u.id === studentId);
  if (!student?.teacherId) return null;
  return data.users.find((u) => u.id === student.teacherId) || null;
}

export async function addAssessment(record: Omit<Assessment, "id">): Promise<Assessment> {
  const data = await getData();
  const item: Assessment = { ...record, id: `a-${Date.now()}` };
  data.assessments.push(item);
  await saveData(data);
  return item;
}

export async function addContactMessage(
  msg: Omit<ContactMessage, "id" | "createdAt">
): Promise<ContactMessage> {
  const data = await getData();
  const item: ContactMessage = {
    ...msg,
    id: `msg-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  data.messages.push(item);
  await saveData(data);
  return item;
}

export async function getStudentProgress(studentId: string) {
  const data = await getData();
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
