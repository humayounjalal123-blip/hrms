"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/dashboard/TopBar";
import { ProgressRing } from "@/components/ProgressRing";
import { useAuth } from "@/lib/auth-context";
import { getData, getStudentProgress } from "@/lib/store";
import { AppData } from "@/lib/types";

export default function ProgressPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AppData | null>(null);
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const d = await getData();
      if (cancelled) return;
      setData(d);
      if (user?.role === "student") setStudentId(user.id);
      else {
        const first = d.users.find((u) => u.role === "student" && u.active);
        if (first) setStudentId(first.id);
      }
    })().catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [user]);

  const students = useMemo(() => {
    if (!data || !user) return [];
    if (user.role === "student") return data.users.filter((u) => u.id === user.id);
    if (user.role === "teacher")
      return data.users.filter(
        (u) => u.role === "student" && u.teacherId === user.id
      );
    return data.users.filter((u) => u.role === "student");
  }, [data, user]);

  if (!user || !data || !studentId) {
    return <div className="text-slate-500">Loading...</div>;
  }

  const progress = getStudentProgress(data, studentId);
  const records = data.memorization
    .filter((m) => m.studentId === studentId)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <TopBar
        title="My Progress"
        subtitle="Memorization history and progress summaries"
      />

      {(user.role === "teacher" || user.role === "admin") && (
        <div className="mb-5 max-w-sm">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Select Student
          </label>
          <select
            className="input-base"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Surahs Memorized" value={progress.memorizedSurahs} />
        <Metric label="Records Logged" value={progress.memorizedRecords} />
        <Metric label="Tasks Completed" value={progress.completedTasks} />
        <Metric label="Avg Assessment" value={`${progress.avgScore}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card flex flex-col items-center justify-center lg:col-span-1">
          <ProgressRing value={progress.overallProgress} label="Overall" />
          <div className="mt-6 w-full space-y-3">
            <Row label="Memorization" value={progress.memorizationPct} />
            <Row label="Revision" value={progress.revisionPct} />
            <Row label="Assessments" value={progress.assessmentPct} />
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold">Memorization History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="pb-3 font-medium">Surah</th>
                  <th className="pb-3 font-medium">Ayah Range</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50">
                    <td className="py-3 font-medium text-slate-800">{r.surah}</td>
                    <td className="py-3 text-slate-600">
                      {r.ayahFrom} – {r.ayahTo}
                    </td>
                    <td className="py-3 text-slate-600">{r.date}</td>
                    <td className="py-3 text-slate-500">{r.notes || "—"}</td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No memorization records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-medium">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-primary"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
