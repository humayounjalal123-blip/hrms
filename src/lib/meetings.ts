import {
  AppData,
  MeetingConflict,
  MeetingSlotSuggestion,
  OnlineMeeting,
} from "./types";

export function meetingStartMs(m: Pick<OnlineMeeting, "scheduledAt">) {
  return new Date(m.scheduledAt).getTime();
}

export function meetingEndMs(
  m: Pick<OnlineMeeting, "scheduledAt" | "durationMins">
) {
  return meetingStartMs(m) + (m.durationMins || 45) * 60_000;
}

export function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
) {
  return aStart < bEnd && bStart < aEnd;
}

/** Students whose calendar is blocked by this meeting */
export function getMeetingParticipantIds(
  data: AppData,
  meeting: Pick<OnlineMeeting, "classId" | "studentIds">
): string[] {
  if (meeting.studentIds && meeting.studentIds.length > 0) {
    return Array.from(new Set(meeting.studentIds));
  }
  if (meeting.classId) {
    return data.users
      .filter(
        (u) =>
          u.role === "student" &&
          u.active &&
          u.classId === meeting.classId
      )
      .map((u) => u.id);
  }
  return [];
}

export function formatMeetingWindow(
  scheduledAt: string,
  durationMins: number
) {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + durationMins * 60_000);
  return {
    startLabel: start.toLocaleString(),
    endLabel: end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    rangeLabel: `${start.toLocaleString()} – ${end.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`,
  };
}

export function findMeetingConflicts(
  data: AppData,
  input: {
    scheduledAt: string;
    durationMins: number;
    classId?: string;
    studentIds?: string[];
    hostId?: string;
    excludeMeetingId?: string;
  }
): MeetingConflict[] {
  const start = new Date(input.scheduledAt).getTime();
  const end = start + (input.durationMins || 45) * 60_000;
  if (!Number.isFinite(start)) return [];

  const targetStudents = new Set(
    getMeetingParticipantIds(data, {
      classId: input.classId,
      studentIds: input.studentIds,
    })
  );

  const conflicts: MeetingConflict[] = [];

  for (const other of data.meetings) {
    if (other.id === input.excludeMeetingId) continue;
    if (other.status === "ended") continue;

    const oStart = meetingStartMs(other);
    const oEnd = meetingEndMs(other);
    if (!rangesOverlap(start, end, oStart, oEnd)) continue;

    const otherStudents = getMeetingParticipantIds(data, other);
    const overlappingStudents = otherStudents.filter((id) =>
      targetStudents.has(id)
    );

    // Student calendar clash
    if (overlappingStudents.length > 0) {
      const host = data.users.find((u) => u.id === other.hostId);
      conflicts.push({
        meeting: other,
        studentIds: overlappingStudents,
        studentNames: overlappingStudents.map(
          (id) => data.users.find((u) => u.id === id)?.name || "Student"
        ),
        hostName: host?.name || "Teacher",
        overlapStart: new Date(Math.max(start, oStart)).toISOString(),
        overlapEnd: new Date(Math.min(end, oEnd)).toISOString(),
      });
      continue;
    }

    // Same host already booked (teacher can't host two rooms at once)
    if (input.hostId && other.hostId === input.hostId) {
      const host = data.users.find((u) => u.id === other.hostId);
      conflicts.push({
        meeting: other,
        studentIds: [],
        studentNames: [],
        hostName: host?.name || "Teacher",
        overlapStart: new Date(Math.max(start, oStart)).toISOString(),
        overlapEnd: new Date(Math.min(end, oEnd)).toISOString(),
      });
    }
  }

  return conflicts;
}

function isSlotFree(
  data: AppData,
  input: {
    scheduledAt: string;
    durationMins: number;
    classId?: string;
    studentIds?: string[];
    hostId?: string;
    excludeMeetingId?: string;
  }
) {
  return findMeetingConflicts(data, input).length === 0;
}

/** Suggest free slots before / after conflicting bookings */
export function suggestFreeMeetingSlots(
  data: AppData,
  input: {
    scheduledAt: string;
    durationMins: number;
    classId?: string;
    studentIds?: string[];
    hostId?: string;
    excludeMeetingId?: string;
  },
  conflicts: MeetingConflict[]
): MeetingSlotSuggestion[] {
  const duration = input.durationMins || 45;
  const durationMs = duration * 60_000;
  const bufferMs = 5 * 60_000;
  const suggestions: MeetingSlotSuggestion[] = [];
  const seen = new Set<string>();

  const push = (iso: string, label: string, reason: string) => {
    const key = new Date(iso).getTime().toString();
    if (seen.has(key)) return;
    if (
      !isSlotFree(data, {
        ...input,
        scheduledAt: iso,
        durationMins: duration,
      })
    ) {
      return;
    }
    seen.add(key);
    suggestions.push({ scheduledAt: iso, label, reason });
  };

  for (const c of conflicts) {
    const busyStart = meetingStartMs(c.meeting);
    const busyEnd = meetingEndMs(c.meeting);

    // Just before the booked meeting
    const before = new Date(busyStart - durationMs - bufferMs).toISOString();
    push(
      before,
      "Thoda pehle",
      `Booked meeting se pehle — ${formatMeetingWindow(before, duration).rangeLabel}`
    );

    // Right after the booked meeting
    const after = new Date(busyEnd + bufferMs).toISOString();
    push(
      after,
      "Thoda baad",
      `Booked meeting ke baad — ${formatMeetingWindow(after, duration).rangeLabel}`
    );
  }

  // Scan next 8 hours in 30-min steps from requested time
  const base = new Date(input.scheduledAt).getTime();
  if (Number.isFinite(base)) {
    for (let i = 1; i <= 16 && suggestions.length < 6; i++) {
      const candidate = new Date(base + i * 30 * 60_000).toISOString();
      push(
        candidate,
        `+${i * 30} min`,
        `Free window — ${formatMeetingWindow(candidate, duration).rangeLabel}`
      );
    }
  }

  return suggestions.slice(0, 4);
}

export function toDatetimeLocalValue(isoOrLocal: string) {
  const d = new Date(isoOrLocal);
  if (!Number.isFinite(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
