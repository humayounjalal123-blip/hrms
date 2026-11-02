"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  ExternalLink,
  Globe2,
  Pencil,
  Radio,
  Video,
  X,
} from "lucide-react";
import { TopBar } from "@/components/dashboard/TopBar";
import { useAuth } from "@/lib/auth-context";
import {
  createMeeting,
  deleteMeeting,
  findMeetingConflicts,
  formatMeetingWindow,
  getData,
  getTeacherClasses,
  getVisibleMeetings,
  suggestFreeMeetingSlots,
  toDatetimeLocalValue,
  updateMeeting,
  updateMeetingStatus,
} from "@/lib/store";
import {
  AppData,
  MeetingConflict,
  MeetingProvider,
  MeetingSlotSuggestion,
  OnlineMeeting,
} from "@/lib/types";
import { getMeetingParticipantIds } from "@/lib/meetings";
import { motion } from "framer-motion";

type FormState = {
  title: string;
  description: string;
  classId: string;
  studentIds: string[];
  provider: MeetingProvider;
  roomCode: string;
  externalUrl: string;
  scheduledAt: string;
  durationMins: string;
  forInternational: boolean;
};

const blankForm = (): FormState => ({
  title: "",
  description: "",
  classId: "",
  studentIds: [],
  provider: "jitsi",
  roomCode: "",
  externalUrl: "",
  scheduledAt: toDatetimeLocalValue(new Date().toISOString()),
  durationMins: "45",
  forInternational: true,
});

export default function MeetingsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AppData | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [conflicts, setConflicts] = useState<MeetingConflict[]>([]);
  const [suggestions, setSuggestions] = useState<MeetingSlotSuggestion[]>([]);
  const [activeMeeting, setActiveMeeting] = useState<OnlineMeeting | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blankForm);

  const reload = async () => setData(await getData());

  useEffect(() => {
    reload();
    window.addEventListener("hrms-data-updated", reload);
    return () => window.removeEventListener("hrms-data-updated", reload);
  }, []);

  const meetings = useMemo(() => {
    if (!data || !user) return [];
    return getVisibleMeetings(data, user.id, user.role).sort((a, b) =>
      a.scheduledAt.localeCompare(b.scheduledAt)
    );
  }, [data, user]);

  const teacherClasses = useMemo(() => {
    if (!data || !user) return [];
    if (user.role === "teacher") return getTeacherClasses(data, user.id);
    return data.classes.filter((c) => c.active);
  }, [data, user]);

  const selectableStudents = useMemo(() => {
    if (!data || !user) return [];
    let list = data.users.filter((u) => u.role === "student" && u.active);
    if (user.role === "teacher") {
      list = list.filter((u) => u.teacherId === user.id);
    }
    if (form.classId) {
      list = list.filter((u) => u.classId === form.classId);
    }
    return list;
  }, [data, user, form.classId]);

  // Live conflict preview while scheduling
  useEffect(() => {
    if (!data || !user) return;
    if (user.role === "student") return;
    if (!form.scheduledAt) {
      setConflicts([]);
      setSuggestions([]);
      return;
    }
    const durationMins = Number(form.durationMins) || 45;
    const payload = {
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      durationMins,
      classId: form.classId || undefined,
      studentIds: form.studentIds.length ? form.studentIds : undefined,
      hostId: user.id,
      excludeMeetingId: editingId || undefined,
    };
    const found = findMeetingConflicts(data, payload);
    setConflicts(found);
    setSuggestions(
      found.length ? suggestFreeMeetingSlots(data, payload, found) : []
    );
  }, [data, user, form, editingId]);

  if (!user || !data) return <div className="text-slate-500">Loading...</div>;

  const canHost = user.role === "teacher" || user.role === "admin";

  const resetForm = () => {
    setEditingId(null);
    setForm(blankForm());
    setConflicts([]);
    setSuggestions([]);
  };

  const startEdit = (m: OnlineMeeting) => {
    setEditingId(m.id);
    setForm({
      title: m.title,
      description: m.description || "",
      classId: m.classId || "",
      studentIds: m.studentIds || [],
      provider: m.provider,
      roomCode: m.roomCode,
      externalUrl: m.externalUrl || "",
      scheduledAt: toDatetimeLocalValue(m.scheduledAt),
      durationMins: String(m.durationMins),
      forInternational: m.forInternational,
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const applySuggestion = (iso: string) => {
    setForm((f) => ({ ...f, scheduledAt: toDatetimeLocalValue(iso) }));
    setError("");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const durationMins = Number(form.durationMins) || 45;
    const scheduledAt = new Date(form.scheduledAt).toISOString();

    if (conflicts.length > 0) {
      setError(
        "Is time pe student/host pehle se booked hain. Neeche suggested free slot choose karein, ya time change karein."
      );
      setMessage("");
      return;
    }

    if (editingId) {
      const result = await updateMeeting(
        editingId,
        {
          title: form.title,
          description: form.description,
          classId: form.classId || undefined,
          studentIds: form.studentIds.length ? form.studentIds : undefined,
          provider: form.provider,
          roomCode: form.roomCode || undefined,
          externalUrl: form.externalUrl || undefined,
          scheduledAt,
          durationMins,
          forInternational: form.forInternational,
        },
        { hostId: user.id }
      );
      if (!result.ok) {
        setError(result.error);
        setConflicts(result.conflicts || []);
        setSuggestions(result.suggestions || []);
        setMessage("");
        return;
      }
      setMessage("Meeting updated — calendar synced.");
      setError("");
      resetForm();
      return;
    }

    const result = await createMeeting({
      title: form.title,
      description: form.description,
      hostId: user.id,
      classId: form.classId || undefined,
      studentIds: form.studentIds.length ? form.studentIds : undefined,
      provider: form.provider,
      roomCode: form.roomCode || undefined,
      externalUrl: form.externalUrl || undefined,
      scheduledAt,
      durationMins,
      forInternational: form.forInternational,
    });
    if (!result.ok) {
      setError(result.error);
      setConflicts(result.conflicts || []);
      setSuggestions(result.suggestions || []);
      setMessage("");
      return;
    }
    setMessage("Meeting scheduled. Students in this slot are now booked.");
    setError("");
    resetForm();
  };

  const toggleStudent = (id: string) => {
    setForm((f) => ({
      ...f,
      studentIds: f.studentIds.includes(id)
        ? f.studentIds.filter((x) => x !== id)
        : [...f.studentIds, id],
    }));
  };

  const joinInSite = async (m: OnlineMeeting) => {
    await updateMeetingStatus(m.id, "live");
    setActiveMeeting(m);
  };

  return (
    <div>
      <TopBar
        title="Online Meetings"
        subtitle="Schedule carefully — student time slots cannot overlap"
      />

      {/* How booking works */}
      <div className="card mb-6 border-primary/20 bg-primary-mist/40">
        <div className="flex items-start gap-3">
          <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="space-y-2 text-sm text-slate-700">
            <h2 className="text-base font-bold text-slate-900">
              Meeting booking kaise kaam karti hai?
            </h2>
            <p>
              Example: Teacher A ne Class / 1–2 students ke liye{" "}
              <strong>raat 8:00</strong> pe 45-minute meeting book ki. Us waqt
              woh students <strong>busy</strong> maane jaate hain.
            </p>
            <p>
              Agar Teacher B unhi students (ya unke class) ki meeting{" "}
              <strong>8:00 pe</strong> rakhna chahe, system clash dikhayega —
              pehle wali meeting ka title, host, aur time window. Phir aap{" "}
              <strong>thoda pehle</strong> (jaise 7:10) ya{" "}
              <strong>thoda baad</strong> (jaise 8:50) free slot choose karke
              schedule kar sakte ho.
            </p>
            <ul className="list-disc space-y-1 ps-5 text-slate-600">
              <li>Class select = us class ke saare linked students book</li>
              <li>Specific students tick = sirf unke calendars block</li>
              <li>Same teacher do meetings ek saath host nahi kar sakta</li>
              <li>Ended meetings clash nahi karti</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative mb-6 overflow-hidden rounded-[1.75rem] border border-primary/10 bg-arch-fade px-6 py-8 text-white shadow-card">
        <div className="pointer-events-none absolute inset-0 shimmer-bg opacity-25" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-green-100">
              Smart Scheduling
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
              Student calendar pe double-booking nahi
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-green-50/90">
              Clash hone par suggested free times dikhengi — pehle / baad shift
              karke meeting set karein. Join Jitsi in-site ya Zoom / Meet link.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-sm backdrop-blur">
            <Globe2 className="h-5 w-5" />
            Conflict-aware
          </div>
        </div>
      </div>

      {(message || error) && (
        <div
          className={`mb-4 rounded-xl px-3 py-2 text-sm ${
            error ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || message}
        </div>
      )}

      {canHost && (
        <form onSubmit={onSubmit} className="card mb-6 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">
              {editingId ? "Edit Meeting Schedule" : "Schedule Online Meeting"}
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

          <label className="block space-y-1.5 text-sm md:col-span-2">
            <span className="font-medium">Title</span>
            <input
              className="input-base"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Class Hifz check-in / 1:1 muraja'ah"
              required
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Provider</span>
            <select
              className="input-base"
              value={form.provider}
              onChange={(e) =>
                setForm({
                  ...form,
                  provider: e.target.value as MeetingProvider,
                })
              }
            >
              <option value="jitsi">In-website (Jitsi)</option>
              <option value="zoom">Zoom Link</option>
              <option value="google_meet">Google Meet Link</option>
            </select>
          </label>

          <label className="block space-y-1.5 text-sm md:col-span-3">
            <span className="font-medium">Description</span>
            <input
              className="input-base"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Topic, agenda, notes for students"
            />
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Class</span>
            <select
              className="input-base"
              value={form.classId}
              onChange={(e) =>
                setForm({
                  ...form,
                  classId: e.target.value,
                  studentIds: [],
                })
              }
            >
              <option value="">Open / no whole-class block</option>
              {teacherClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-400">
              Class choose karne se us class ke saare students us time booked
              ho jaate hain (jab tak alag students select na kiye hon).
            </span>
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Date & Time</span>
            <input
              type="datetime-local"
              className="input-base"
              value={form.scheduledAt}
              onChange={(e) =>
                setForm({ ...form, scheduledAt: e.target.value })
              }
              required
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Duration (mins)</span>
            <input
              type="number"
              min={15}
              className="input-base"
              value={form.durationMins}
              onChange={(e) =>
                setForm({ ...form, durationMins: e.target.value })
              }
            />
          </label>

          <div className="md:col-span-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-800">
              Specific students (optional — 1:1 ya chhoti group)
            </p>
            <p className="mb-3 text-xs text-slate-500">
              Agar students tick karoge to sirf unke calendars block hongi. Agar
              koi student tick nahi aur class selected hai, to poori class book
              hogi.
            </p>
            <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
              {selectableStudents.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleStudent(s.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    form.studentIds.includes(s.id)
                      ? "border-primary bg-primary text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-primary/40"
                  }`}
                >
                  {s.name}
                </button>
              ))}
              {selectableStudents.length === 0 && (
                <p className="text-xs text-slate-400">
                  Pehle class assign / enroll karein, phir students yahan
                  dikhenge.
                </p>
              )}
            </div>
          </div>

          {form.provider === "jitsi" ? (
            <label className="block space-y-1.5 text-sm md:col-span-2">
              <span className="font-medium">Room code (optional)</span>
              <input
                className="input-base"
                value={form.roomCode}
                onChange={(e) => setForm({ ...form, roomCode: e.target.value })}
                placeholder="HRMS-ClassA-8PM"
              />
            </label>
          ) : (
            <label className="block space-y-1.5 text-sm md:col-span-2">
              <span className="font-medium">
                {form.provider === "zoom" ? "Zoom" : "Google Meet"} URL
              </span>
              <input
                className="input-base"
                value={form.externalUrl}
                onChange={(e) =>
                  setForm({ ...form, externalUrl: e.target.value })
                }
                placeholder="https://zoom.us/j/..."
                required
              />
            </label>
          )}
          <label className="flex items-center gap-2 text-sm md:col-span-1">
            <input
              type="checkbox"
              checked={form.forInternational}
              onChange={(e) =>
                setForm({ ...form, forInternational: e.target.checked })
              }
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            Mark for international students
          </label>

          {conflicts.length > 0 && (
            <div className="md:col-span-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2 text-amber-900">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="space-y-2 text-sm">
                  <p className="font-bold">
                    Clash detected — ye time pehle se booked hai
                  </p>
                  {conflicts.map((c) => {
                    const win = formatMeetingWindow(
                      c.meeting.scheduledAt,
                      c.meeting.durationMins
                    );
                    return (
                      <div
                        key={c.meeting.id + c.overlapStart}
                        className="rounded-xl border border-amber-200 bg-white/80 px-3 py-2"
                      >
                        <p className="font-semibold">{c.meeting.title}</p>
                        <p className="text-xs text-amber-800/90">
                          Host: {c.hostName} · {win.rangeLabel}
                          {c.studentNames.length > 0 &&
                            ` · Busy students: ${c.studentNames.join(", ")}`}
                          {c.studentNames.length === 0 &&
                            " · Aap (host) is waqt pehle se busy hain"}
                        </p>
                      </div>
                    );
                  })}
                  {suggestions.length > 0 && (
                    <div className="pt-1">
                      <p className="mb-2 font-semibold text-amber-950">
                        Free slots (pehle / baad) — click karke apply karein:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map((s) => (
                          <button
                            key={s.scheduledAt}
                            type="button"
                            onClick={() => applySuggestion(s.scheduledAt)}
                            className="rounded-full border border-primary/30 bg-white px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary-soft"
                            title={s.reason}
                          >
                            {s.label}:{" "}
                            {new Date(s.scheduledAt).toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {conflicts.length === 0 && form.scheduledAt && (
            <p className="md:col-span-3 text-sm text-emerald-700">
              ✓ Selected window free lag rahi hai
              {form.studentIds.length
                ? ` (${form.studentIds.length} student selected)`
                : form.classId
                  ? " (whole class will be booked)"
                  : " (open session / host calendar)"}
              .
            </p>
          )}

          <div className="md:col-span-3">
            <button
              type="submit"
              className="btn-primary"
              disabled={conflicts.length > 0}
            >
              {editingId ? "Save Schedule" : "Schedule Meeting"}
            </button>
          </div>
        </form>
      )}

      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">Scheduled agenda</h2>
        <p className="text-sm text-slate-500">
          Har meeting ke participants us time slot ke liye booked rehte hain.
        </p>
      </div>

      <div className="grid gap-4">
        {meetings.map((m, i) => {
          const host = data.users.find((u) => u.id === m.hostId);
          const cls = data.classes.find((c) => c.id === m.classId);
          const participantIds = getMeetingParticipantIds(data, m);
          const names = participantIds
            .map((id) => data.users.find((u) => u.id === id)?.name)
            .filter(Boolean) as string[];
          const win = formatMeetingWindow(m.scheduledAt, m.durationMins);

          return (
            <motion.div
              key={m.id}
              className="card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {m.title}
                    </h3>
                    <StatusPill status={m.status} />
                    {m.forInternational && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
                        <Globe2 className="h-3 w-3" /> International
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {m.description || "Online Hifz session"}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Host: {host?.name || "Teacher"}
                    {cls ? ` • ${cls.name}` : ""} • {win.rangeLabel} •{" "}
                    {m.durationMins} mins • {providerLabel(m.provider)}
                  </p>
                  {names.length > 0 && (
                    <p className="mt-1 text-xs font-medium text-primary">
                      Booked students ({names.length}): {names.slice(0, 6).join(", ")}
                      {names.length > 6 ? "…" : ""}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {m.provider === "jitsi" ? (
                    <button
                      type="button"
                      onClick={() => joinInSite(m)}
                      className="btn-primary gap-2"
                    >
                      <Video className="h-4 w-4" />
                      Join in Website
                    </button>
                  ) : (
                    <a
                      href={m.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary gap-2"
                      onClick={async () => {
                        await updateMeetingStatus(m.id, "live");
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open {providerLabel(m.provider)}
                    </a>
                  )}
                  {(user.role === "admin" || m.hostId === user.id) && (
                    <>
                      <button
                        type="button"
                        className="btn-secondary gap-1"
                        onClick={() => startEdit(m)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit time
                      </button>
                      {m.status !== "ended" && (
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={async () => {
                            await updateMeetingStatus(m.id, "ended");
                          }}
                        >
                          End
                        </button>
                      )}
                      <button
                        type="button"
                        className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                        onClick={async () => {
                          await deleteMeeting(m.id);
                          if (activeMeeting?.id === m.id) setActiveMeeting(null);
                          if (editingId === m.id) resetForm();
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        {meetings.length === 0 && (
          <div className="card text-center text-slate-400">
            No meetings scheduled yet.
          </div>
        )}
      </div>

      {activeMeeting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm">
          <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h3 className="font-bold text-slate-900">{activeMeeting.title}</h3>
                <p className="text-xs text-slate-500">
                  In-website meeting room • {activeMeeting.roomCode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveMeeting(null)}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                aria-label="Close meeting"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <iframe
              title={activeMeeting.title}
              src={`https://meet.jit.si/${activeMeeting.roomCode}#userInfo.displayName="${encodeURIComponent(user.name)}"`}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="h-full w-full flex-1 border-0 bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: OnlineMeeting["status"] }) {
  const styles = {
    scheduled: "bg-amber-50 text-amber-700 border-amber-200",
    live: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ended: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status]}`}
    >
      {status === "live" && <Radio className="h-3 w-3" />}
      {status}
    </span>
  );
}

function providerLabel(p: MeetingProvider) {
  if (p === "jitsi") return "In-website";
  if (p === "zoom") return "Zoom";
  return "Google Meet";
}
