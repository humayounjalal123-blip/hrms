"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/dashboard/TopBar";
import { useAuth } from "@/lib/auth-context";
import {
  assignClassTeacher,
  categoryLabel,
  createClass,
  enrollStudentInClass,
  getClassStudentCount,
  getData,
  getTeacherClasses,
  getUnassignedStudents,
  removeStudentFromClass,
} from "@/lib/store";
import {
  AppData,
  CLASS_CATEGORIES,
  ClassCategory,
  MAX_CLASS_SIZE,
} from "@/lib/types";

export default function ClassesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AppData | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newClass, setNewClass] = useState({
    name: "",
    category: "hifz" as ClassCategory,
    teacherId: "",
  });
  const [enroll, setEnroll] = useState({ studentId: "", classId: "" });

  const reload = async () => setData(await getData());

  useEffect(() => {
    if (user && user.role === "student") router.replace("/dashboard");
  }, [user, router]);

  useEffect(() => {
    reload();
    window.addEventListener("hrms-data-updated", reload);
    return () => window.removeEventListener("hrms-data-updated", reload);
  }, []);

  const teachers = useMemo(
    () => data?.users.filter((u) => u.role === "teacher" && u.active) || [],
    [data]
  );

  const visibleClasses = useMemo(() => {
    if (!data || !user) return [];
    if (user.role === "teacher") return getTeacherClasses(data, user.id);
    return data.classes.filter((c) => c.active);
  }, [data, user]);

  const unassigned = useMemo(
    () => (data ? getUnassignedStudents(data) : []),
    [data]
  );

  const classesByCategory = useMemo(() => {
    const map: Record<string, typeof visibleClasses> = {};
    CLASS_CATEGORIES.forEach((c) => {
      map[c.id] = visibleClasses.filter((x) => x.category === c.id);
    });
    return map;
  }, [visibleClasses]);

  if (!user || !data || user.role === "student") {
    return <div className="text-slate-500">Loading...</div>;
  }

  const flash = (ok: string, err?: string) => {
    setMessage(ok);
    setError(err || "");
  };

  const onCreateClass = async (e: FormEvent) => {
    e.preventDefault();
    const result = await createClass({
      name: newClass.name,
      category: newClass.category,
      teacherId: newClass.teacherId || undefined,
    });
    if (!result.ok) {
      flash("", result.error);
      return;
    }
    flash("Class created successfully.");
    setNewClass({ name: "", category: "hifz", teacherId: "" });
  };

  const onEnroll = async () => {
    const result = await enrollStudentInClass(enroll.studentId, enroll.classId);
    if (!result.ok) {
      flash("", result.error);
      return;
    }
    flash("Student enrolled in class.");
    setEnroll({ studentId: "", classId: "" });
  };

  const enrollableClasses =
    user.role === "teacher"
      ? visibleClasses.filter((c) => c.teacherId === user.id)
      : visibleClasses.filter((c) => c.teacherId);

  return (
    <div>
      <TopBar
        title="Classes"
        subtitle={
          user.role === "admin"
            ? "Create classes by category and assign class teachers"
            : "Select students for your classes (max 50 per class)"
        }
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

      {user.role === "admin" && (
        <form
          onSubmit={onCreateClass}
          className="card mb-6 grid gap-4 md:grid-cols-4"
        >
          <h2 className="md:col-span-4 text-lg font-bold">
            Create Class (separate by category)
          </h2>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Class Name</span>
            <input
              className="input-base"
              placeholder="e.g. Hifz Class C"
              value={newClass.name}
              onChange={(e) =>
                setNewClass({ ...newClass, name: e.target.value })
              }
              required
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Category</span>
            <select
              className="input-base"
              value={newClass.category}
              onChange={(e) =>
                setNewClass({
                  ...newClass,
                  category: e.target.value as ClassCategory,
                })
              }
            >
              {CLASS_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Class Teacher</span>
            <select
              className="input-base"
              value={newClass.teacherId}
              onChange={(e) =>
                setNewClass({ ...newClass, teacherId: e.target.value })
              }
            >
              <option value="">Assign later</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full">
              Create Class
            </button>
          </div>
          <p className="md:col-span-4 text-xs text-slate-500">
            Each class holds up to {MAX_CLASS_SIZE} students. Categories stay
            separate (Nazira, Hifz, Muraja&apos;ah, Intensive).
          </p>
        </form>
      )}

      <form
        onSubmit={onEnroll}
        className="card mb-6 grid gap-4 md:grid-cols-3"
      >
        <h2 className="md:col-span-3 text-lg font-bold">
          {user.role === "teacher"
            ? "Select Student for Your Class"
            : "Enroll Student into Class"}
        </h2>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Unassigned Student</span>
          <select
            className="input-base"
            value={enroll.studentId}
            onChange={(e) =>
              setEnroll({ ...enroll, studentId: e.target.value })
            }
            required
          >
            <option value="">Select student</option>
            {unassigned.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Class</span>
          <select
            className="input-base"
            value={enroll.classId}
            onChange={(e) => setEnroll({ ...enroll, classId: e.target.value })}
            required
          >
            <option value="">Select class</option>
            {enrollableClasses.map((c) => {
              const count = getClassStudentCount(data, c.id);
              return (
                <option key={c.id} value={c.id}>
                  {c.name} — {categoryLabel(c.category)} ({count}/
                  {c.maxStudents})
                </option>
              );
            })}
          </select>
        </label>
        <div className="flex items-end">
          <button type="submit" className="btn-primary w-full">
            Enroll Student
          </button>
        </div>
        {unassigned.length === 0 && (
          <p className="md:col-span-3 text-sm text-slate-500">
            No unassigned students right now. New signups appear here until
            enrolled.
          </p>
        )}
      </form>

      <div className="space-y-8">
        {CLASS_CATEGORIES.map((cat) => {
          const list = classesByCategory[cat.id] || [];
          if (user.role === "teacher" && list.length === 0) return null;
          return (
            <section key={cat.id}>
              <h2 className="mb-3 text-lg font-bold text-slate-900">
                {cat.label} Classes
              </h2>
              {list.length === 0 ? (
                <div className="card text-sm text-slate-400">
                  No {cat.label} classes yet.
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {list.map((cls) => {
                    const teacher = data.users.find(
                      (u) => u.id === cls.teacherId
                    );
                    const students = data.users.filter(
                      (u) =>
                        u.role === "student" &&
                        u.classId === cls.id &&
                        u.active
                    );
                    const count = students.length;
                    return (
                      <div key={cls.id} className="card">
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-slate-900">
                              {cls.name}
                            </h3>
                            <p className="text-xs text-slate-500">
                              {categoryLabel(cls.category)} • {count}/
                              {cls.maxStudents} students
                            </p>
                          </div>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                              count >= cls.maxStudents
                                ? "border-rose-200 bg-rose-50 text-rose-700"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {count >= cls.maxStudents ? "Full" : "Open"}
                          </span>
                        </div>

                        {user.role === "admin" ? (
                          <label className="mb-4 block space-y-1.5 text-sm">
                            <span className="font-medium">
                              Assign Class Teacher
                            </span>
                            <select
                              className="input-base"
                              value={cls.teacherId || ""}
                              onChange={async (e) => {
                                const result = await assignClassTeacher(
                                  cls.id,
                                  e.target.value
                                );
                                if (!result.ok) flash("", result.error);
                                else flash("Class teacher updated.");
                              }}
                            >
                              <option value="">No teacher assigned</option>
                              {teachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : (
                          <p className="mb-3 text-sm text-slate-600">
                            Class Teacher:{" "}
                            <span className="font-semibold">
                              {teacher?.name || "—"}
                            </span>
                          </p>
                        )}

                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Students in this class
                        </div>
                        <div className="max-h-56 space-y-2 overflow-y-auto">
                          {students.map((s) => (
                            <div
                              key={s.id}
                              className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm"
                            >
                              <div>
                                <div className="font-medium text-slate-800">
                                  {s.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {s.email}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={async () => {
                                  const result = await removeStudentFromClass(s.id);
                                  if (!result.ok) flash("", result.error);
                                  else flash("Student removed from class.");
                                }}
                                className="text-xs font-semibold text-rose-600 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          {students.length === 0 && (
                            <p className="text-sm text-slate-400">
                              No students enrolled yet.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
