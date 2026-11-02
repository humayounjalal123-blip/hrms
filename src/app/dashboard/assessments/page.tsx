"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/dashboard/TopBar";
import { useAuth } from "@/lib/auth-context";
import { SURAH_LIST } from "@/lib/seed";
import { addAssessment, getData, gradeFromScore } from "@/lib/store";
import { AppData } from "@/lib/types";

export default function AssessmentsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AppData | null>(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    studentId: "",
    surah: SURAH_LIST[1],
    ayahFrom: "1",
    ayahTo: "20",
    score: "85",
    mistakes: "",
    feedback: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const reload = async () => setData(await getData());

  useEffect(() => {
    reload();
    window.addEventListener("hrms-data-updated", reload);
    return () => window.removeEventListener("hrms-data-updated", reload);
  }, []);

  useEffect(() => {
    if (!data || !user || form.studentId) return;
    if (user.role === "teacher") {
      const first = data.users.find(
        (u) => u.role === "student" && u.teacherId === user.id
      );
      if (first) setForm((f) => ({ ...f, studentId: first.id }));
    }
  }, [data, user, form.studentId]);

  const list = useMemo(() => {
    if (!data || !user) return [];
    let items = data.assessments;
    if (user.role === "student") {
      items = items.filter((a) => a.studentId === user.id);
    } else if (user.role === "teacher") {
      items = items.filter((a) => a.teacherId === user.id);
    }
    return items.sort((a, b) => b.date.localeCompare(a.date));
  }, [data, user]);

  if (!user || !data) return <div className="text-slate-500">Loading...</div>;

  const students = data.users.filter((u) => {
    if (user.role === "teacher")
      return u.role === "student" && u.teacherId === user.id && u.active;
    return u.role === "student" && u.active;
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (user.role === "student") return;
    const score = Number(form.score);
    const from = Number(form.ayahFrom);
    const to = Number(form.ayahTo);
    if (!form.studentId || score < 0 || score > 100 || to < from) {
      setMessage("Please enter valid assessment details.");
      return;
    }
    await addAssessment({
      studentId: form.studentId,
      teacherId: user.id,
      surah: form.surah,
      ayahFrom: from,
      ayahTo: to,
      score,
      grade: gradeFromScore(score),
      mistakes: form.mistakes || "None recorded",
      feedback: form.feedback || "No additional feedback",
      date: form.date,
    });
    setMessage("Assessment recorded successfully.");
    setForm((f) => ({ ...f, mistakes: "", feedback: "" }));
  };

  return (
    <div>
      <TopBar
        title="Assessments"
        subtitle="Scores, mistakes, grades, and teacher feedback"
      />

      {(user.role === "teacher" || user.role === "admin") && (
        <form onSubmit={onSubmit} className="card mb-6 grid gap-4 md:grid-cols-3">
          <h2 className="md:col-span-3 text-lg font-bold">Record Assessment</h2>
          <Field label="Student">
            <select
              className="input-base"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              required
            >
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Surah">
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
          </Field>
          <Field label="Date">
            <input
              type="date"
              className="input-base"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </Field>
          <Field label="Ayah From">
            <input
              type="number"
              className="input-base"
              value={form.ayahFrom}
              onChange={(e) => setForm({ ...form, ayahFrom: e.target.value })}
              required
            />
          </Field>
          <Field label="Ayah To">
            <input
              type="number"
              className="input-base"
              value={form.ayahTo}
              onChange={(e) => setForm({ ...form, ayahTo: e.target.value })}
              required
            />
          </Field>
          <Field label="Score (0-100)">
            <input
              type="number"
              min={0}
              max={100}
              className="input-base"
              value={form.score}
              onChange={(e) => setForm({ ...form, score: e.target.value })}
              required
            />
          </Field>
          <Field label="Mistakes" className="md:col-span-3">
            <input
              className="input-base"
              value={form.mistakes}
              onChange={(e) => setForm({ ...form, mistakes: e.target.value })}
              placeholder="Describe mistakes or weak areas"
            />
          </Field>
          <Field label="Feedback" className="md:col-span-3">
            <textarea
              className="input-base resize-none"
              rows={3}
              value={form.feedback}
              onChange={(e) => setForm({ ...form, feedback: e.target.value })}
              placeholder="Teacher feedback"
            />
          </Field>
          <div className="md:col-span-3">
            {message && <p className="mb-3 text-sm text-primary">{message}</p>}
            <button type="submit" className="btn-primary">
              Save Assessment
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {list.map((a) => {
          const student = data.users.find((u) => u.id === a.studentId);
          const teacher = data.users.find((u) => u.id === a.teacherId);
          return (
            <div key={a.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900">
                    {a.surah} ({a.ayahFrom}-{a.ayahTo})
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {user.role !== "student" && (
                      <>Student: {student?.name || "—"} • </>
                    )}
                    Teacher: {teacher?.name || "—"} • {a.date}
                  </p>
                </div>
                <div className="rounded-xl bg-primary-soft px-4 py-2 text-center">
                  <div className="text-xl font-bold text-primary">{a.score}%</div>
                  <div className="text-xs font-semibold text-primary">{a.grade}</div>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase text-slate-400">
                    Mistakes
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{a.mistakes}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase text-slate-400">
                    Feedback
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{a.feedback}</p>
                </div>
              </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="card text-center text-slate-400">
            No assessments found.
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block space-y-1.5 text-sm ${className}`}>
      <span className="font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
