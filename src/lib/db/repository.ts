import { SEED_DATA } from "@/lib/seed";
import {
  AppData,
  Assessment,
  ClassRoom,
  ContactMessage,
  MemorizationRecord,
  OnlineMeeting,
  RevisionTask,
  User,
} from "@/lib/types";
import { exec, getPool, queryRows, RowDataPacket } from "./pool";

type ClassRow = RowDataPacket & {
  id: string;
  name: string;
  category: ClassRoom["category"];
  teacher_id: string | null;
  max_students: number;
  active: number;
  created_at: string;
};

type UserRow = RowDataPacket & {
  id: string;
  name: string;
  email: string;
  password: string;
  role: User["role"];
  phone: string | null;
  active: number;
  avatar: string | null;
  teacher_id: string | null;
  class_id: string | null;
  class_name: string | null;
  created_at: string;
};

type MemRow = RowDataPacket & {
  id: string;
  student_id: string;
  surah: string;
  ayah_from: number;
  ayah_to: number;
  date_value: string;
  recorded_by: string;
  notes: string | null;
};

type RevRow = RowDataPacket & {
  id: string;
  student_id: string;
  surah: string;
  ayah_from: number;
  ayah_to: number;
  due_date: string;
  status: RevisionTask["status"];
  assigned_by: string;
  completed_at: string | null;
  notes: string | null;
};

type AssessRow = RowDataPacket & {
  id: string;
  student_id: string;
  teacher_id: string;
  surah: string;
  ayah_from: number;
  ayah_to: number;
  score: number;
  grade: string;
  mistakes: string;
  feedback: string;
  date_value: string;
};

type MsgRow = RowDataPacket & {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
};

type MeetingRow = RowDataPacket & {
  id: string;
  title: string;
  description: string | null;
  host_id: string;
  class_id: string | null;
  provider: OnlineMeeting["provider"];
  room_code: string;
  external_url: string | null;
  scheduled_at: string;
  duration_mins: number;
  for_international: number;
  status: OnlineMeeting["status"];
  created_at: string;
};

type MeetingStudentRow = RowDataPacket & {
  meeting_id: string;
  student_id: string;
};

function bool(n: number | boolean | null | undefined) {
  return n === true || n === 1;
}

export async function loadAppData(): Promise<AppData> {
  const [
    classRows,
    userRows,
    memRows,
    revRows,
    assessRows,
    msgRows,
    meetingRows,
    meetingStudentRows,
  ] = await Promise.all([
    queryRows<ClassRow[]>("SELECT * FROM classes ORDER BY created_at ASC"),
    queryRows<UserRow[]>("SELECT * FROM users ORDER BY created_at ASC"),
    queryRows<MemRow[]>("SELECT * FROM memorization ORDER BY date_value ASC"),
    queryRows<RevRow[]>("SELECT * FROM revisions ORDER BY due_date ASC"),
    queryRows<AssessRow[]>("SELECT * FROM assessments ORDER BY date_value ASC"),
    queryRows<MsgRow[]>("SELECT * FROM contact_messages ORDER BY created_at ASC"),
    queryRows<MeetingRow[]>("SELECT * FROM meetings ORDER BY scheduled_at ASC"),
    queryRows<MeetingStudentRow[]>("SELECT * FROM meeting_students"),
  ]);

  const studentsByMeeting = new Map<string, string[]>();
  for (const row of meetingStudentRows) {
    const list = studentsByMeeting.get(row.meeting_id) || [];
    list.push(row.student_id);
    studentsByMeeting.set(row.meeting_id, list);
  }

  const classes: ClassRoom[] = classRows.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    teacherId: c.teacher_id || undefined,
    maxStudents: c.max_students,
    active: bool(c.active),
    createdAt: c.created_at,
  }));

  const users: User[] = userRows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    password: u.password,
    role: u.role,
    phone: u.phone || undefined,
    active: bool(u.active),
    avatar: u.avatar || undefined,
    teacherId: u.teacher_id || undefined,
    classId: u.class_id || undefined,
    className: u.class_name || undefined,
    createdAt: u.created_at,
  }));

  const memorization: MemorizationRecord[] = memRows.map((m) => ({
    id: m.id,
    studentId: m.student_id,
    surah: m.surah,
    ayahFrom: m.ayah_from,
    ayahTo: m.ayah_to,
    date: m.date_value,
    recordedBy: m.recorded_by,
    notes: m.notes || undefined,
  }));

  const revisions: RevisionTask[] = revRows.map((r) => ({
    id: r.id,
    studentId: r.student_id,
    surah: r.surah,
    ayahFrom: r.ayah_from,
    ayahTo: r.ayah_to,
    dueDate: r.due_date,
    status: r.status,
    assignedBy: r.assigned_by,
    completedAt: r.completed_at || undefined,
    notes: r.notes || undefined,
  }));

  const assessments: Assessment[] = assessRows.map((a) => ({
    id: a.id,
    studentId: a.student_id,
    teacherId: a.teacher_id,
    surah: a.surah,
    ayahFrom: a.ayah_from,
    ayahTo: a.ayah_to,
    score: a.score,
    grade: a.grade,
    mistakes: a.mistakes,
    feedback: a.feedback,
    date: a.date_value,
  }));

  const messages: ContactMessage[] = msgRows.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    subject: m.subject,
    message: m.message,
    createdAt: m.created_at,
  }));

  const meetings: OnlineMeeting[] = meetingRows.map((m) => {
    const studentIds = studentsByMeeting.get(m.id);
    return {
      id: m.id,
      title: m.title,
      description: m.description || undefined,
      hostId: m.host_id,
      classId: m.class_id || undefined,
      studentIds: studentIds?.length ? studentIds : undefined,
      provider: m.provider,
      roomCode: m.room_code,
      externalUrl: m.external_url || undefined,
      scheduledAt: m.scheduled_at,
      durationMins: m.duration_mins,
      forInternational: bool(m.for_international),
      status: m.status,
      createdAt: m.created_at,
    };
  });

  return {
    users,
    classes,
    memorization,
    revisions,
    assessments,
    messages,
    meetings,
  };
}

export async function saveAppData(data: AppData): Promise<void> {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    await conn.query("DELETE FROM meeting_students");
    await conn.query("DELETE FROM meetings");
    await conn.query("DELETE FROM assessments");
    await conn.query("DELETE FROM revisions");
    await conn.query("DELETE FROM memorization");
    await conn.query("DELETE FROM contact_messages");
    await conn.query("DELETE FROM users");
    await conn.query("DELETE FROM classes");

    // Classes first without teacher FK, then users, then link teachers/classes.
    for (const c of data.classes) {
      await conn.execute(
        `INSERT INTO classes
          (id, name, category, teacher_id, max_students, active, created_at)
         VALUES (?, ?, ?, NULL, ?, ?, ?)`,
        [c.id, c.name, c.category, c.maxStudents, c.active ? 1 : 0, c.createdAt]
      );
    }

    for (const u of data.users) {
      await conn.execute(
        `INSERT INTO users
          (id, name, email, password, role, phone, active, avatar, teacher_id, class_id, class_name, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          u.id,
          u.name,
          u.email,
          u.password,
          u.role,
          u.phone || null,
          u.active ? 1 : 0,
          u.avatar || null,
          u.teacherId || null,
          u.classId || null,
          u.className || null,
          u.createdAt,
        ]
      );
    }

    for (const c of data.classes) {
      await conn.execute(`UPDATE classes SET teacher_id = ? WHERE id = ?`, [
        c.teacherId || null,
        c.id,
      ]);
    }

    for (const m of data.memorization) {
      await conn.execute(
        `INSERT INTO memorization
          (id, student_id, surah, ayah_from, ayah_to, date_value, recorded_by, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          m.id,
          m.studentId,
          m.surah,
          m.ayahFrom,
          m.ayahTo,
          m.date,
          m.recordedBy,
          m.notes || null,
        ]
      );
    }

    for (const r of data.revisions) {
      await conn.execute(
        `INSERT INTO revisions
          (id, student_id, surah, ayah_from, ayah_to, due_date, status, assigned_by, completed_at, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          r.id,
          r.studentId,
          r.surah,
          r.ayahFrom,
          r.ayahTo,
          r.dueDate,
          r.status,
          r.assignedBy,
          r.completedAt || null,
          r.notes || null,
        ]
      );
    }

    for (const a of data.assessments) {
      await conn.execute(
        `INSERT INTO assessments
          (id, student_id, teacher_id, surah, ayah_from, ayah_to, score, grade, mistakes, feedback, date_value)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          a.id,
          a.studentId,
          a.teacherId,
          a.surah,
          a.ayahFrom,
          a.ayahTo,
          a.score,
          a.grade,
          a.mistakes,
          a.feedback,
          a.date,
        ]
      );
    }

    for (const msg of data.messages) {
      await conn.execute(
        `INSERT INTO contact_messages (id, name, email, subject, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [msg.id, msg.name, msg.email, msg.subject, msg.message, msg.createdAt]
      );
    }

    for (const m of data.meetings) {
      await conn.execute(
        `INSERT INTO meetings
          (id, title, description, host_id, class_id, provider, room_code, external_url,
           scheduled_at, duration_mins, for_international, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          m.id,
          m.title,
          m.description || null,
          m.hostId,
          m.classId || null,
          m.provider,
          m.roomCode,
          m.externalUrl || null,
          m.scheduledAt,
          m.durationMins,
          m.forInternational ? 1 : 0,
          m.status,
          m.createdAt,
        ]
      );
      for (const studentId of m.studentIds || []) {
        await conn.execute(
          `INSERT INTO meeting_students (meeting_id, student_id) VALUES (?, ?)`,
          [m.id, studentId]
        );
      }
    }

    await conn.query("SET FOREIGN_KEY_CHECKS = 1");
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function countUsers(): Promise<number> {
  const rows = await queryRows<RowDataPacket[]>("SELECT COUNT(*) AS c FROM users");
  return Number(rows[0]?.c || 0);
}

export async function seedDatabase(force = false): Promise<{ seeded: boolean }> {
  const existing = await countUsers().catch(() => -1);
  if (existing > 0 && !force) {
    return { seeded: false };
  }
  const seed = JSON.parse(JSON.stringify(SEED_DATA)) as AppData;
  await saveAppData(seed);
  return { seeded: true };
}

export async function pingDatabase(): Promise<boolean> {
  await exec("SELECT 1");
  return true;
}
