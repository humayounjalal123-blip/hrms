"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarClock,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import { TopBar } from "@/components/dashboard/TopBar";
import { StatusBadge } from "@/components/StatusBadge";
import { ProgressRing } from "@/components/ProgressRing";
import { MosqueSilhouette } from "@/components/MosqueArt";
import { useAuth } from "@/lib/auth-context";
import {
  categoryLabel,
  getData,
  getStudentProgress,
  getTeacherClasses,
  getUnassignedStudents,
} from "@/lib/store";
import { AppData } from "@/lib/types";
import { AnimatedCard, FadeUp, motion } from "@/components/motion";

export default function DashboardHome() {
  const { user } = useAuth();
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    const load = async () => setData(await getData());
    load();
    window.addEventListener("hrms-data-updated", load);
    return () => window.removeEventListener("hrms-data-updated", load);
  }, []);

  if (!user || !data) {
    return <div className="text-slate-500">Loading...</div>;
  }

  if (user.role === "student") {
    return <StudentDashboard data={data} userId={user.id} name={user.name} />;
  }
  if (user.role === "teacher") {
    return <TeacherDashboard data={data} teacherId={user.id} />;
  }
  return <AdminDashboard data={data} />;
}

function StudentDashboard({
  data,
  userId,
  name,
}: {
  data: AppData;
  userId: string;
  name: string;
}) {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh when data snapshot changes
  const progress = useMemo(
    () => getStudentProgress(data, userId),
    [userId, data]
  );
  const me = data.users.find((u) => u.id === userId);
  const teacher = data.users.find((u) => u.id === me?.teacherId);
  const tasks = data.revisions
    .filter((r) => r.studentId === userId)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const stats = [
    {
      label: "Memorized Surahs",
      value: progress.memorizedSurahs,
      icon: BookOpen,
      hint: "of recorded portions",
    },
    {
      label: "Revision Pending",
      value: progress.pendingTasks,
      icon: CalendarClock,
      hint: "tasks due soon",
    },
    {
      label: "Assessments",
      value: progress.assessmentCount,
      icon: ClipboardList,
      hint: `avg score ${progress.avgScore}%`,
    },
    {
      label: "Overall Progress",
      value: `${progress.overallProgress}%`,
      icon: TrendingUp,
      hint: "based on records",
    },
  ];

  return (
    <div>
      <TopBar />

      <motion.div
        className="relative mb-6 overflow-hidden rounded-[1.75rem] border border-primary/10 bg-arch-fade px-6 py-8 text-white shadow-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <MosqueSilhouette className="absolute bottom-0 right-0 w-2/3 text-white opacity-20" />
        <div className="pointer-events-none absolute inset-0 shimmer-bg opacity-25" />
        <div className="relative max-w-xl">
          <p className="font-display text-xl italic text-green-50">
            Keep going, every Ayah brings you closer to your goal.
          </p>
          <p className="mt-2 text-sm text-green-100/80">
            Assalamu Alaikum, {name}. Your Hifz journey continues with HRMS.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/dashboard/progress" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:scale-[1.02]">
              View Progress
            </Link>
            <Link href="/dashboard/revision" className="rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
              Revision Tasks
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Your connection
          </p>
          {me?.classId && teacher ? (
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-sm text-slate-500">Class</p>
                <p className="text-lg font-bold text-slate-900">{me.className}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Class teacher</p>
                <p className="font-semibold text-primary">{teacher.name}</p>
                <p className="text-xs text-slate-500">{teacher.email}</p>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <p className="font-semibold text-amber-700">Not linked to a class yet</p>
              <p className="mt-1 text-sm text-slate-500">
                After signup, wait for a teacher or admin to enroll you in a class.
                Then tasks and assessments appear here.
              </p>
            </div>
          )}
        </div>
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            How linking works
          </p>
          <ol className="mt-3 list-decimal space-y-1.5 ps-4 text-sm text-slate-600">
            <li>Admin creates a class and assigns a teacher</li>
            <li>Teacher enrolls you from the unassigned pool</li>
            <li>Teacher assigns revision tasks you can complete</li>
          </ol>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <AnimatedCard key={s.label} delay={i * 0.07} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{s.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{s.hint}</p>
                </div>
                <motion.div
                  className="rounded-xl bg-primary-soft p-2.5 text-primary"
                  whileHover={{ rotate: -8, scale: 1.08 }}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
              </div>
            </AnimatedCard>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <FadeUp className="card lg:col-span-3" delay={0.1}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Upcoming Revision</h2>
            <Link href="/dashboard/revision" className="text-sm font-semibold text-primary">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="pb-3 font-medium">Surah / Ayah</th>
                  <th className="pb-3 font-medium">Due Date</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50">
                    <td className="py-3 font-medium text-slate-800">
                      {t.surah} ({t.ayahFrom}-{t.ayahTo})
                    </td>
                    <td className="py-3 text-slate-600">{t.dueDate}</td>
                    <td className="py-3">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400">
                      No revision tasks yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </FadeUp>

        <FadeUp className="card lg:col-span-2" delay={0.18}>
          <h2 className="mb-4 text-lg font-bold text-slate-900">Progress Overview</h2>
          <div className="flex justify-center">
            <ProgressRing value={progress.overallProgress} label="Hifz Progress" />
          </div>
          <div className="mt-6 space-y-3">
            <Bar label="Memorization" value={progress.memorizationPct} />
            <Bar label="Revision" value={progress.revisionPct} />
            <Bar label="Assessments" value={progress.assessmentPct} />
          </div>
        </FadeUp>
      </div>

      <FadeUp className="mt-6 rounded-[1.5rem] border border-primary/10 bg-primary-soft px-5 py-5 text-center" delay={0.25}>
        <p className="font-display text-lg italic text-primary">
          “And We have certainly made the Qur’an easy for remembrance…” — Al-Qamar 54:17
        </p>
      </FadeUp>
    </div>
  );
}

function TeacherDashboard({
  data,
  teacherId,
}: {
  data: AppData;
  teacherId: string;
}) {
  const myClasses = getTeacherClasses(data, teacherId);
  const students = data.users.filter(
    (u) => u.role === "student" && u.teacherId === teacherId && u.active
  );
  const pending = data.revisions.filter(
    (r) =>
      students.some((s) => s.id === r.studentId) &&
      (r.status === "pending" || r.status === "upcoming")
  );
  const recentAssessments = data.assessments
    .filter((a) => a.teacherId === teacherId)
    .slice(-5)
    .reverse();
  const unassigned = getUnassignedStudents(data);

  return (
    <div>
      <TopBar
        title="Teacher Dashboard"
        subtitle="Link students from the pool, assign tasks, and edit them anytime"
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/dashboard/students" className="btn-primary !px-4 !py-2 text-sm">
          Link students
        </Link>
        <Link href="/dashboard/revision" className="btn-secondary !px-4 !py-2 text-sm">
          Assign / edit tasks
        </Link>
        <Link href="/dashboard/classes" className="btn-secondary !px-4 !py-2 text-sm">
          My classes
        </Link>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="My Classes" value={myClasses.length} />
        <StatCard label="Linked Students" value={students.length} />
        <StatCard label="Open Revision Tasks" value={pending.length} />
        <StatCard
          label="Unassigned Pool"
          value={unassigned.length}
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        {myClasses.map((cls) => {
          const classStudents = students.filter((s) => s.classId === cls.id);
          return (
            <div key={cls.id} className="card">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">{cls.name}</h2>
                  <p className="text-xs text-slate-500">
                    {categoryLabel(cls.category)} • {classStudents.length}/
                    {cls.maxStudents} students
                  </p>
                </div>
                <Link
                  href="/dashboard/classes"
                  className="text-sm font-semibold text-primary"
                >
                  Manage
                </Link>
              </div>
              <div className="space-y-2">
                {classStudents.map((s) => {
                  const p = getStudentProgress(data, s.id);
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          {s.name}
                        </div>
                        <div className="text-xs text-slate-500">{s.email}</div>
                      </div>
                      <div className="text-sm font-bold text-primary">
                        {p.overallProgress}%
                      </div>
                    </div>
                  );
                })}
                {classStudents.length === 0 && (
                  <p className="text-sm text-slate-400">
                    No students yet — select from unassigned pool in Classes.
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {myClasses.length === 0 && (
          <div className="card text-sm text-slate-500 lg:col-span-2">
            Admin has not assigned you as a class teacher yet.
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Select Students</h2>
            <Link href="/dashboard/classes" className="text-sm font-semibold text-primary">
              Open Classes
            </Link>
          </div>
          <p className="mb-3 text-sm text-slate-500">
            Unassigned students available to enroll (max 50 per class):
          </p>
          <div className="space-y-2">
            {unassigned.slice(0, 6).map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-slate-100 px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-800">{s.name}</span>
                <span className="ml-2 text-xs text-slate-400">{s.email}</span>
              </div>
            ))}
            {unassigned.length === 0 && (
              <p className="text-sm text-slate-400">No unassigned students.</p>
            )}
          </div>
        </div>
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent Assessments</h2>
            <Link href="/dashboard/assessments" className="text-sm font-semibold text-primary">
              Open
            </Link>
          </div>
          <div className="space-y-3">
            {recentAssessments.map((a) => {
              const student = data.users.find((u) => u.id === a.studentId);
              return (
                <div key={a.id} className="rounded-xl border border-slate-100 px-3 py-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-800">
                      {student?.name || "Student"}
                    </div>
                    <span className="text-sm font-bold text-primary">
                      {a.score}% ({a.grade})
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {a.surah} {a.ayahFrom}-{a.ayahTo} • {a.date}
                  </div>
                </div>
              );
            })}
            {recentAssessments.length === 0 && (
              <p className="text-sm text-slate-400">No assessments yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ data }: { data: AppData }) {
  const students = data.users.filter((u) => u.role === "student");
  const teachers = data.users.filter((u) => u.role === "teacher");
  const unassigned = getUnassignedStudents(data);
  const classes = data.classes.filter((c) => c.active);

  return (
    <div>
      <TopBar title="Administrator Dashboard" subtitle="All users, classes, and system overview" />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Users" value={data.users.length} />
        <StatCard label="Students" value={students.length} />
        <StatCard label="Teachers" value={teachers.length} />
        <StatCard label="Classes" value={classes.length} />
        <StatCard label="Unassigned Students" value={unassigned.length} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Link href="/dashboard/classes" className="card hover:shadow-md">
          <h3 className="font-bold text-slate-900">Classes & Class Teachers</h3>
          <p className="mt-2 text-sm text-slate-500">
            Create category classes and assign which teacher leads each class.
          </p>
        </Link>
        <Link href="/dashboard/users" className="card hover:shadow-md">
          <h3 className="font-bold text-slate-900">User Management</h3>
          <p className="mt-2 text-sm text-slate-500">
            Create, update, and deactivate student/teacher accounts. View everyone.
          </p>
        </Link>
        <Link href="/dashboard/students" className="card hover:shadow-md">
          <h3 className="font-bold text-slate-900">All Students by Class</h3>
          <p className="mt-2 text-sm text-slate-500">
            See every student, enroll unassigned ones, manage class links.
          </p>
        </Link>
      </div>

      <div className="card mt-6">
        <h2 className="mb-4 text-lg font-bold">All Classes Overview</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {classes.map((cls) => {
            const teacher = data.users.find((u) => u.id === cls.teacherId);
            const count = data.users.filter(
              (u) => u.role === "student" && u.classId === cls.id && u.active
            ).length;
            return (
              <div
                key={cls.id}
                className="rounded-xl border border-slate-100 px-3 py-3 text-sm"
              >
                <div className="font-semibold text-slate-900">{cls.name}</div>
                <div className="text-xs text-slate-500">
                  {categoryLabel(cls.category)} • Teacher:{" "}
                  {teacher?.name || "Not assigned"} • {count}/{cls.maxStudents}{" "}
                  students
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="card mt-6">
        <h2 className="mb-4 text-lg font-bold">System Snapshot</h2>
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <div className="rounded-xl bg-primary-soft p-4">
            <div className="text-2xl font-bold text-primary">{data.memorization.length}</div>
            <div className="text-slate-600">Memorization records</div>
          </div>
          <div className="rounded-xl bg-primary-soft p-4">
            <div className="text-2xl font-bold text-primary">{data.revisions.length}</div>
            <div className="text-slate-600">Revision tasks</div>
          </div>
          <div className="rounded-xl bg-primary-soft p-4">
            <div className="text-2xl font-bold text-primary">{data.assessments.length}</div>
            <div className="text-slate-600">Assessments</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-medium text-slate-600">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-2 rounded-full bg-primary"
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.min(100, value)}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
