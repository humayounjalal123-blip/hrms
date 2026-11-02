"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/dashboard/TopBar";
import { useAuth } from "@/lib/auth-context";
import { getData, getStudentProgress } from "@/lib/store";
import { AppData } from "@/lib/types";

export default function ReportsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AppData | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => setData(await getData());
    load();
    window.addEventListener("hrms-data-updated", load);
    return () => window.removeEventListener("hrms-data-updated", load);
  }, []);

  const rows = useMemo(() => {
    if (!data || !user) return [];
    let students = data.users.filter((u) => u.role === "student");
    if (user.role === "student") {
      students = students.filter((u) => u.id === user.id);
    } else if (user.role === "teacher") {
      students = students.filter((u) => u.teacherId === user.id);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      students = students.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.className || "").toLowerCase().includes(q)
      );
    }
    return students.map((s) => {
      const p = getStudentProgress(data, s.id);
      const teacher = data.users.find((u) => u.id === s.teacherId);
      return { student: s, progress: p, teacher };
    });
  }, [data, user, query]);

  if (!user || !data) return <div className="text-slate-500">Loading...</div>;

  return (
    <div>
      <TopBar
        title="Reports"
        subtitle="Search, filter, and review progress / revision summaries"
      />

      <div className="mb-5 flex flex-wrap gap-3">
        <input
          className="input-base max-w-md"
          placeholder="Search by student, email, or class..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="btn-secondary"
          onClick={() => window.print()}
          type="button"
        >
          Print / Export
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Summary
          label="Students in report"
          value={rows.length}
        />
        <Summary
          label="Revision tasks tracked"
          value={
            user.role === "student"
              ? data.revisions.filter((r) => r.studentId === user.id).length
              : user.role === "teacher"
                ? data.revisions.filter((r) =>
                    rows.some((x) => x.student.id === r.studentId)
                  ).length
                : data.revisions.length
          }
        />
        <Summary
          label="Assessments tracked"
          value={
            user.role === "student"
              ? data.assessments.filter((a) => a.studentId === user.id).length
              : user.role === "teacher"
                ? data.assessments.filter((a) => a.teacherId === user.id).length
                : data.assessments.length
          }
        />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500">
              <th className="pb-3 font-medium">Student</th>
              <th className="pb-3 font-medium">Teacher</th>
              <th className="pb-3 font-medium">Memorized</th>
              <th className="pb-3 font-medium">Pending Tasks</th>
              <th className="pb-3 font-medium">Assessments</th>
              <th className="pb-3 font-medium">Avg Score</th>
              <th className="pb-3 font-medium">Progress</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ student, progress, teacher }) => (
              <tr key={student.id} className="border-b border-slate-50">
                <td className="py-3 font-semibold text-slate-800">
                  {student.name}
                </td>
                <td className="py-3 text-slate-600">{teacher?.name || "—"}</td>
                <td className="py-3">{progress.memorizedSurahs}</td>
                <td className="py-3">{progress.pendingTasks}</td>
                <td className="py-3">{progress.assessmentCount}</td>
                <td className="py-3">{progress.avgScore}%</td>
                <td className="py-3 font-bold text-primary">
                  {progress.overallProgress}%
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No matching records.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}
