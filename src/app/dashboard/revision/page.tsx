"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { TopBar } from "@/components/dashboard/TopBar";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/lib/auth-context";
import { SURAH_LIST } from "@/lib/seed";
import {
  addRevision,
  deleteRevision,
  getData,
  getTeacherForStudent,
  updateRevision,
  updateRevisionStatus,
} from "@/lib/store";
import { AppData, RevisionTask, TaskStatus } from "@/lib/types";

const emptyForm = {
  studentId: "",
  surah: SURAH_LIST[0],
  ayahFrom: "1",
  ayahTo: "10",
  dueDate: "",
  notes: "",
  status: "upcoming" as TaskStatus,
};

export default function RevisionPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AppData | null>(null);
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const reload = async () => setData(await getData());

  useEffect(() => {
    reload();
    window.addEventListener("hrms-data-updated", reload);
    return () => window.removeEventListener("hrms-data-updated", reload);
  }, []);

  useEffect(() => {
    if (!data || !user || editingId) return;
    if ((user.role === "teacher" || user.role === "admin") && !form.studentId) {
      const first =
        user.role === "teacher"
          ? data.users.find(
              (u) => u.role === "student" && u.teacherId === user.id && u.active
            )
          : data.users.find((u) => u.role === "student" && u.active);
      if (first) setForm((f) => ({ ...f, studentId: first.id }));
    }
  }, [data, user, form.studentId, editingId]);

  const canManage = user?.role === "teacher" || user?.role === "admin";

  const tasks = useMemo(() => {
    if (!data || !user) return [];
    let list = data.revisions;
    if (user.role === "student") {
      list = list.filter((r) => r.studentId === user.id);
    } else if (user.role === "teacher") {
      const ids = data.users
        .filter((u) => u.teacherId === user.id)
        .map((u) => u.id);
      list = list.filter((r) => ids.includes(r.studentId));
    }
    if (filter !== "all") list = list.filter((r) => r.status === filter);
    return list.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [data, user, filter]);

  if (!user || !data) return <div className="text-slate-500">Loading...</div>;

  const students = data.users.filter((u) => {
    if (!u.active || u.role !== "student") return false;
    if (user.role === "teacher") return u.teacherId === user.id;
    return true;
  });

  const resetForm = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      studentId: students[0]?.id || "",
      surah: SURAH_LIST[0],
    });
  };

  const startEdit = (task: RevisionTask) => {
    setEditingId(task.id);
    setForm({
      studentId: task.studentId,
      surah: task.surah,
      ayahFrom: String(task.ayahFrom),
      ayahTo: String(task.ayahTo),
      dueDate: task.dueDate,
      notes: task.notes || "",
      status: task.status,
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const from = Number(form.ayahFrom);
    const to = Number(form.ayahTo);
    if (!form.studentId || !form.dueDate || from < 1 || to < from) {
      setError("Please provide a valid student, ayah range, and due date.");
      setMessage("");
      return;
    }

    if (user.role === "teacher") {
      const student = data.users.find((u) => u.id === form.studentId);
      if (!student || student.teacherId !== user.id) {
        setError("You can only assign tasks to students linked to your class.");
        setMessage("");
        return;
      }
    }

    if (editingId) {
      await updateRevision(editingId, {
        studentId: form.studentId,
        surah: form.surah,
        ayahFrom: from,
        ayahTo: to,
        dueDate: form.dueDate,
        notes: form.notes || undefined,
        status: form.status,
      });
      setMessage("Revision task updated.");
    } else {
      await addRevision({
        studentId: form.studentId,
        surah: form.surah,
        ayahFrom: from,
        ayahTo: to,
        dueDate: form.dueDate,
        status: "upcoming",
        assignedBy: user.id,
        notes: form.notes || undefined,
      });
      setMessage("Revision task created successfully.");
    }
    setError("");
    resetForm();
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("Delete this revision task?")) return;
    await deleteRevision(id);
    if (editingId === id) resetForm();
    setMessage("Task deleted.");
  };

  return (
    <div>
      <TopBar
        title="Revision Tasks"
        subtitle="Assign, edit, and track daily / weekly revision activities"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "pending", "upcoming", "completed", "overdue"] as const).map(
          (s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                filter === s
                  ? "bg-primary text-white"
                  : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {s}
            </button>
          )
        )}
      </div>

      {canManage && (
        <form onSubmit={onSubmit} className="card mb-6 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">
              {editingId ? "Edit Revision Task" : "Create Revision Task"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary"
              >
                <X className="h-4 w-4" /> Cancel edit
              </button>
            )}
          </div>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-slate-700">Student</span>
            <select
              className="input-base"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              required
            >
              <option value="">Select student</option>
              {students.map((s) => {
                const teacher = getTeacherForStudent(data, s.id);
                return (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {s.className ? ` — ${s.className}` : " — Unassigned"}
                    {user.role === "admin" && teacher ? ` · ${teacher.name}` : ""}
                  </option>
                );
              })}
            </select>
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-slate-700">Surah</span>
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
            <span className="font-medium text-slate-700">Due Date</span>
            <input
              type="date"
              className="input-base"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              required
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-slate-700">Ayah From</span>
            <input
              type="number"
              min={1}
              className="input-base"
              value={form.ayahFrom}
              onChange={(e) => setForm({ ...form, ayahFrom: e.target.value })}
              required
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-slate-700">Ayah To</span>
            <input
              type="number"
              min={1}
              className="input-base"
              value={form.ayahTo}
              onChange={(e) => setForm({ ...form, ayahTo: e.target.value })}
              required
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-slate-700">Notes</span>
            <input
              className="input-base"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional"
            />
          </label>
          {editingId && (
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">Status</span>
              <select
                className="input-base"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as TaskStatus })
                }
              >
                <option value="upcoming">Upcoming</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="completed">Completed</option>
              </select>
            </label>
          )}
          <div className="md:col-span-3">
            {(message || error) && (
              <p
                className={`mb-3 text-sm ${
                  error ? "text-rose-600" : "text-primary"
                }`}
              >
                {error || message}
              </p>
            )}
            <button type="submit" className="btn-primary">
              {editingId ? "Save Changes" : "Assign Task"}
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500">
              {canManage && <th className="pb-3 font-medium">Student</th>}
              {user.role === "admin" && (
                <th className="pb-3 font-medium">Teacher</th>
              )}
              <th className="pb-3 font-medium">Surah / Ayah</th>
              <th className="pb-3 font-medium">Due Date</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => {
              const student = data.users.find((u) => u.id === t.studentId);
              const teacher = getTeacherForStudent(data, t.studentId);
              return (
                <tr key={t.id} className="border-b border-slate-50">
                  {canManage && (
                    <td className="py-3 font-medium text-slate-800">
                      <div>{student?.name || "—"}</div>
                      {student?.className && (
                        <div className="text-xs font-normal text-slate-400">
                          {student.className}
                        </div>
                      )}
                    </td>
                  )}
                  {user.role === "admin" && (
                    <td className="py-3 text-slate-600">
                      {teacher?.name || "—"}
                    </td>
                  )}
                  <td className="py-3 text-slate-800">
                    {t.surah} ({t.ayahFrom}-{t.ayahTo})
                    {t.notes && (
                      <div className="text-xs text-slate-400">{t.notes}</div>
                    )}
                  </td>
                  <td className="py-3 text-slate-600">{t.dueDate}</td>
                  <td className="py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {user.role === "student" && t.status !== "completed" ? (
                        <button
                          onClick={async () => {
                            await updateRevisionStatus(t.id, "completed");
                          }}
                          className="text-sm font-semibold text-primary hover:underline"
                        >
                          Mark Completed
                        </button>
                      ) : null}

                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(t)}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(t.id)}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:underline"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                          {t.status === "completed" ? (
                            <button
                              onClick={async () => {
                                await updateRevisionStatus(t.id, "pending");
                              }}
                              className="text-sm font-semibold text-slate-500 hover:underline"
                            >
                              Reopen
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                await updateRevisionStatus(t.id, "pending");
                              }}
                              className="text-sm font-semibold text-amber-700 hover:underline"
                            >
                              Set Pending
                            </button>
                          )}
                        </>
                      )}

                      {user.role === "student" && t.status === "completed" && (
                        <span className="text-slate-400">Done</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No revision tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
