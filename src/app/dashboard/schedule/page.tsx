"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/dashboard/TopBar";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/lib/auth-context";
import { getData } from "@/lib/store";
import { AppData } from "@/lib/types";

export default function SchedulePage() {
  const { user } = useAuth();
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    const load = async () => setData(await getData());
    load();
    window.addEventListener("hrms-data-updated", load);
    return () => window.removeEventListener("hrms-data-updated", load);
  }, []);

  const grouped = useMemo(() => {
    if (!data || !user) return {};
    let tasks = data.revisions;
    if (user.role === "student") {
      tasks = tasks.filter((r) => r.studentId === user.id);
    } else if (user.role === "teacher") {
      const ids = data.users
        .filter((u) => u.teacherId === user.id)
        .map((u) => u.id);
      tasks = tasks.filter((r) => ids.includes(r.studentId));
    }
    const map: Record<string, typeof tasks> = {};
    tasks
      .slice()
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .forEach((t) => {
        if (!map[t.dueDate]) map[t.dueDate] = [];
        map[t.dueDate].push(t);
      });
    return map;
  }, [data, user]);

  if (!user || !data) return <div className="text-slate-500">Loading...</div>;

  const dates = Object.keys(grouped);

  return (
    <div>
      <TopBar
        title="Revision Schedule"
        subtitle="Upcoming revision timeline by due date"
      />

      {dates.length === 0 ? (
        <div className="card text-center text-slate-400">
          No scheduled revision tasks.
        </div>
      ) : (
        <div className="space-y-4">
          {dates.map((date) => (
            <div key={date} className="card">
              <h2 className="mb-3 text-lg font-bold text-primary">{date}</h2>
              <div className="space-y-3">
                {grouped[date].map((t) => {
                  const student = data.users.find((u) => u.id === t.studentId);
                  return (
                    <div
                      key={t.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-3"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">
                          {t.surah} ({t.ayahFrom}-{t.ayahTo})
                        </div>
                        {user.role !== "student" && (
                          <div className="text-xs text-slate-500">
                            {student?.name}
                          </div>
                        )}
                      </div>
                      <StatusBadge status={t.status} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
