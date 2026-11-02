"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/dashboard/TopBar";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/lib/auth-context";
import {
  assignClassTeacher,
  categoryLabel,
  getClassStudentCount,
  getData,
  updateUser,
} from "@/lib/store";
import { AppData } from "@/lib/types";

export default function TeachersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AppData | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  useEffect(() => {
    const load = async () => setData(await getData());
    load();
    window.addEventListener("hrms-data-updated", load);
    return () => window.removeEventListener("hrms-data-updated", load);
  }, []);

  const teachers = useMemo(
    () => data?.users.filter((u) => u.role === "teacher") || [],
    [data]
  );

  if (!user || !data || user.role !== "admin") {
    return <div className="text-slate-500">Loading...</div>;
  }

  return (
    <div>
      <TopBar
        title="Teachers"
        subtitle="Assign class teachers and view their students by class"
      />

      {message && (
        <div className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="mb-4">
        <Link href="/dashboard/classes" className="text-sm font-semibold text-primary">
          Open Classes → create / assign class teachers
        </Link>
      </div>

      <div className="space-y-5">
        {teachers.map((t) => {
          const myClasses = data.classes.filter(
            (c) => c.active && c.teacherId === t.id
          );
          const studentCount = data.users.filter(
            (u) => u.role === "student" && u.teacherId === t.id && u.active
          ).length;

          return (
            <div key={t.id} className="card">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{t.name}</h2>
                  <p className="text-sm text-slate-500">{t.email}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {t.phone || "No phone"} • {studentCount} total students
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={t.active ? "active" : "inactive"} />
                  <button
                    onClick={async () => {
                      await updateUser(t.id, { active: !t.active });
                    }}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    {t.active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>

              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Classes where this teacher is Class Teacher
              </div>

              {myClasses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-4">
                  <p className="mb-3 text-sm text-slate-500">
                    Not assigned as class teacher yet.
                  </p>
                  <label className="block max-w-sm space-y-1.5 text-sm">
                    <span className="font-medium">Assign to a class</span>
                    <select
                      className="input-base"
                      defaultValue=""
                      onChange={async (e) => {
                        if (!e.target.value) return;
                        const result = await assignClassTeacher(
                          e.target.value,
                          t.id
                        );
                        if (result.ok) {
                          setMessage(`${t.name} assigned as class teacher.`);
                        }
                        e.target.value = "";
                      }}
                    >
                      <option value="">Select class</option>
                      {data.classes
                        .filter((c) => c.active && !c.teacherId)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({categoryLabel(c.category)})
                          </option>
                        ))}
                    </select>
                  </label>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {myClasses.map((cls) => {
                    const count = getClassStudentCount(data, cls.id);
                    const students = data.users.filter(
                      (u) =>
                        u.role === "student" &&
                        u.classId === cls.id &&
                        u.active
                    );
                    return (
                      <div
                        key={cls.id}
                        className="rounded-xl border border-slate-100 p-3"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-slate-800">
                              {cls.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {categoryLabel(cls.category)} • {count}/
                              {cls.maxStudents}
                            </div>
                          </div>
                          <select
                            className="input-base max-w-[140px] text-xs"
                            value={cls.teacherId || ""}
                            onChange={async (e) => {
                              await assignClassTeacher(cls.id, e.target.value);
                              setMessage("Class teacher updated.");
                            }}
                          >
                            <option value="">Unassign</option>
                            {teachers
                              .filter((x) => x.active)
                              .map((x) => (
                                <option key={x.id} value={x.id}>
                                  {x.name}
                                </option>
                              ))}
                          </select>
                        </div>
                        <ul className="max-h-32 space-y-1 overflow-y-auto text-sm text-slate-600">
                          {students.map((s) => (
                            <li key={s.id}>• {s.name}</li>
                          ))}
                          {students.length === 0 && (
                            <li className="text-slate-400">No students yet</li>
                          )}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
