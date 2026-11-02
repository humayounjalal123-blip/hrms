"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/dashboard/TopBar";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/lib/auth-context";
import { SURAH_LIST } from "@/lib/seed";
import {
  addMemorization,
  categoryLabel,
  enrollStudentInClass,
  getData,
  getStudentProgress,
  getTeacherClasses,
  getUnassignedStudents,
  removeStudentFromClass,
  transferStudentToClass,
} from "@/lib/store";
import { AppData, CLASS_CATEGORIES } from "@/lib/types";

export default function StudentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AppData | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [form, setForm] = useState({
    studentId: "",
    surah: SURAH_LIST[0],
    ayahFrom: "1",
    ayahTo: "7",
    notes: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [pick, setPick] = useState({ studentId: "", classId: "" });
  const [transfer, setTransfer] = useState({ studentId: "", classId: "" });

  const reload = async () => setData(await getData());

  useEffect(() => {
    if (user && user.role === "student") router.replace("/dashboard");
  }, [user, router]);

  useEffect(() => {
    reload();
    window.addEventListener("hrms-data-updated", reload);
    return () => window.removeEventListener("hrms-data-updated", reload);
  }, []);

  const teacherClasses = useMemo(() => {
    if (!data || !user) return [];
    if (user.role === "teacher") return getTeacherClasses(data, user.id);
    return data.classes.filter((c) => c.active);
  }, [data, user]);

  const students = useMemo(() => {
    if (!data || !user) return [];
    let list =
      user.role === "teacher"
        ? data.users.filter(
            (u) => u.role === "student" && u.teacherId === user.id && u.active
          )
        : data.users.filter((u) => u.role === "student");

    if (categoryFilter !== "all") {
      const classIds = new Set(
        data.classes
          .filter((c) => c.category === categoryFilter)
          .map((c) => c.id)
      );
      list = list.filter((s) => s.classId && classIds.has(s.classId));
    }
    return list;
  }, [data, user, categoryFilter]);

  const grouped = useMemo(() => {
    if (!data) return [];
    const groups: {
      classId: string;
      className: string;
      category: string;
      students: typeof students;
    }[] = [];

    teacherClasses.forEach((cls) => {
      const members = students.filter((s) => s.classId === cls.id);
      groups.push({
        classId: cls.id,
        className: cls.name,
        category: categoryLabel(cls.category),
        students: members,
      });
    });

    if (user?.role === "admin") {
      const unassigned = getUnassignedStudents(data);
      if (unassigned.length) {
        groups.push({
          classId: "unassigned",
          className: "Unassigned Students",
          category: "Pending enrollment",
          students: unassigned,
        });
      }
    }

    return groups;
  }, [data, students, teacherClasses, user]);

  const unassigned = useMemo(
    () => (data ? getUnassignedStudents(data) : []),
    [data]
  );

  if (!user || !data || user.role === "student") {
    return <div className="text-slate-500">Loading...</div>;
  }

  const onMemorize = async (e: FormEvent) => {
    e.preventDefault();
    const from = Number(form.ayahFrom);
    const to = Number(form.ayahTo);
    if (!form.studentId || to < from) {
      setError("Select a student and valid ayah range.");
      setMessage("");
      return;
    }
    await addMemorization({
      studentId: form.studentId,
      surah: form.surah,
      ayahFrom: from,
      ayahTo: to,
      date: form.date,
      recordedBy: user.id,
      notes: form.notes || undefined,
    });
    setMessage("Memorization record added.");
    setError("");
  };

  const onPickStudent = async (e: FormEvent) => {
    e.preventDefault();
    const result = await enrollStudentInClass(pick.studentId, pick.classId);
    if (!result.ok) {
      setError(result.error);
      setMessage("");
      return;
    }
    setMessage("Student linked to class and teacher successfully.");
    setError("");
    setPick({ studentId: "", classId: "" });
  };

  const onTransfer = async (e?: FormEvent) => {
    e?.preventDefault();
    const result = await transferStudentToClass(transfer.studentId, transfer.classId);
    if (!result.ok) {
      setError(result.error);
      setMessage("");
      return;
    }
    setMessage("Student transferred — teacher link updated automatically.");
    setError("");
    setTransfer({ studentId: "", classId: "" });
  };

  const linkedCount = students.filter((s) => s.classId && s.teacherId).length;
  const enrolledStudents = data.users.filter(
    (u) => u.role === "student" && u.active && u.classId
  );

  return (
    <div>
      <TopBar
        title="Students"
        subtitle="Link students ↔ teachers through classes. Transfers keep teacher sync."
      />

      {(message || error) && (
        <div
          className={`mb-4 rounded-xl px-3 py-2 text-sm ${
            error
              ? "bg-rose-50 text-rose-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || message}
        </div>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-primary/10 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Linked to you / filter
          </p>
          <p className="mt-1 text-2xl font-bold text-primary">{linkedCount}</p>
        </div>
        <div className="rounded-2xl border border-primary/10 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Unassigned pool
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{unassigned.length}</p>
        </div>
        <div className="rounded-2xl border border-primary/10 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Your classes
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-800">
            {teacherClasses.filter((c) =>
              user.role === "teacher" ? c.teacherId === user.id : true
            ).length}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            categoryFilter === "all"
              ? "bg-primary text-white"
              : "border border-slate-200 bg-white text-slate-600"
          }`}
        >
          All
        </button>
        {CLASS_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategoryFilter(c.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              categoryFilter === c.id
                ? "bg-primary text-white"
                : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {c.label}
          </button>
        ))}
        <Link href="/dashboard/classes" className="ml-auto text-sm font-semibold text-primary">
          Manage Classes →
        </Link>
      </div>

      {(user.role === "teacher" || user.role === "admin") && (
        <form
          onSubmit={onPickStudent}
          className="card mb-6 grid gap-4 md:grid-cols-3"
        >
          <h2 className="md:col-span-3 text-lg font-bold">
            {user.role === "teacher"
              ? "Select student into my class"
              : "Assign unassigned student to a class"}
          </h2>
          <select
            className="input-base"
            value={pick.studentId}
            onChange={(e) => setPick({ ...pick, studentId: e.target.value })}
            required
          >
            <option value="">Unassigned student</option>
            {unassigned.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            className="input-base"
            value={pick.classId}
            onChange={(e) => setPick({ ...pick, classId: e.target.value })}
            required
          >
            <option value="">Select class</option>
            {teacherClasses
              .filter((c) => (user.role === "admin" ? true : c.teacherId === user.id))
              .filter((c) => c.teacherId)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({categoryLabel(c.category)})
                </option>
              ))}
          </select>
          <button type="submit" className="btn-primary">
            Link Student ↔ Class
          </button>
          {unassigned.length === 0 && (
            <p className="md:col-span-3 text-sm text-slate-400">
              No unassigned students. New student signups appear here until enrolled.
            </p>
          )}
        </form>
      )}

      {user.role === "admin" && (
        <form
          onSubmit={onTransfer}
          className="card mb-6 grid gap-4 md:grid-cols-3"
        >
          <h2 className="md:col-span-3 text-lg font-bold">
            Transfer student to another class
          </h2>
          <p className="md:col-span-3 -mt-2 text-sm text-slate-500">
            Moves the student and auto-updates their linked class teacher.
          </p>
          <select
            className="input-base"
            value={transfer.studentId}
            onChange={(e) =>
              setTransfer({ ...transfer, studentId: e.target.value })
            }
            required
          >
            <option value="">Enrolled student</option>
            {enrolledStudents.map((s) => {
              const teacher = data.users.find((u) => u.id === s.teacherId);
              return (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.className || "Class"}
                  {teacher ? ` · ${teacher.name}` : ""}
                </option>
              );
            })}
          </select>
          <select
            className="input-base"
            value={transfer.classId}
            onChange={(e) =>
              setTransfer({ ...transfer, classId: e.target.value })
            }
            required
          >
            <option value="">Destination class</option>
            {teacherClasses
              .filter((c) => c.teacherId)
              .map((c) => {
                const teacher = data.users.find((u) => u.id === c.teacherId);
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} ({categoryLabel(c.category)})
                    {teacher ? ` · ${teacher.name}` : ""}
                  </option>
                );
              })}
          </select>
          <button type="submit" className="btn-secondary">
            Transfer & Sync Teacher
          </button>
        </form>
      )}

      <form onSubmit={onMemorize} className="card mb-6 grid gap-4 md:grid-cols-3">
        <h2 className="md:col-span-3 text-lg font-bold">
          Record Memorized Surah / Ayah Range
        </h2>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Student</span>
          <select
            className="input-base"
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            required
          >
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.className ? `— ${s.className}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Surah</span>
          <select
            className="input-base"
            value={form.surah}
            onChange={(e) => setForm({ ...form, surah: e.target.value })}
          >
            {SURAH_LIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Date</span>
          <input
            type="date"
            className="input-base"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Ayah From</span>
          <input
            type="number"
            className="input-base"
            value={form.ayahFrom}
            onChange={(e) => setForm({ ...form, ayahFrom: e.target.value })}
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Ayah To</span>
          <input
            type="number"
            className="input-base"
            value={form.ayahTo}
            onChange={(e) => setForm({ ...form, ayahTo: e.target.value })}
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Notes</span>
          <input
            className="input-base"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </label>
        <div className="md:col-span-3">
          <button className="btn-primary" type="submit">
            Save Record
          </button>
        </div>
      </form>

      <div className="space-y-5">
        {grouped.map((group) => (
          <div key={group.classId} className="card overflow-x-auto">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {group.className}
                </h2>
                <p className="text-xs text-slate-500">{group.category}</p>
              </div>
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                {group.students.length} students
              </span>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="pb-3 font-medium">Student</th>
                  <th className="pb-3 font-medium">Teacher</th>
                  <th className="pb-3 font-medium">Progress</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {group.students.map((s) => {
                  const teacher = data.users.find((u) => u.id === s.teacherId);
                  const p = getStudentProgress(data, s.id);
                  return (
                    <tr key={s.id} className="border-b border-slate-50">
                      <td className="py-3">
                        <div className="font-semibold text-slate-800">
                          {s.name}
                        </div>
                        <div className="text-xs text-slate-500">{s.email}</div>
                      </td>
                      <td className="py-3 text-slate-600">
                        {teacher?.name || "—"}
                      </td>
                      <td className="py-3 font-semibold text-primary">
                        {p.overallProgress}%
                      </td>
                      <td className="py-3">
                        <StatusBadge
                          status={s.active ? "active" : "inactive"}
                        />
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          {s.classId && (
                            <Link
                              href="/dashboard/revision"
                              className="text-sm font-semibold text-primary hover:underline"
                            >
                              Assign task
                            </Link>
                          )}
                          {s.classId ? (
                            <button
                              type="button"
                              onClick={async () => {
                                const result = await removeStudentFromClass(s.id);
                                if (!result.ok) setError(result.error);
                                else
                                  setMessage(
                                    "Student unlinked from class and teacher."
                                  );
                              }}
                              className="text-sm font-semibold text-rose-600 hover:underline"
                            >
                              Unlink
                            </button>
                          ) : (
                            <span className="text-slate-400">Awaiting link</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {group.students.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-slate-400"
                    >
                      No students in this class yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}
        {grouped.length === 0 && (
          <div className="card text-center text-slate-400">
            No classes assigned yet. Ask admin to assign you as class teacher.
          </div>
        )}
      </div>
    </div>
  );
}
