import { NextResponse } from "next/server";
import * as store from "@/lib/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ActionName =
  | "login"
  | "registerUser"
  | "updateUser"
  | "createClass"
  | "assignClassTeacher"
  | "enrollStudentInClass"
  | "removeStudentFromClass"
  | "transferStudentToClass"
  | "addMemorization"
  | "addRevision"
  | "updateRevisionStatus"
  | "updateRevision"
  | "deleteRevision"
  | "addAssessment"
  | "addContactMessage"
  | "createMeeting"
  | "updateMeeting"
  | "updateMeetingStatus"
  | "deleteMeeting"
  | "getStudentProgress"
  | "resetData"
  | "saveData";

const ACTIONS: Record<ActionName, (...args: never[]) => unknown> = {
  login: store.login,
  registerUser: store.registerUser,
  updateUser: store.updateUser,
  createClass: store.createClass,
  assignClassTeacher: store.assignClassTeacher,
  enrollStudentInClass: store.enrollStudentInClass,
  removeStudentFromClass: store.removeStudentFromClass,
  transferStudentToClass: store.transferStudentToClass,
  addMemorization: store.addMemorization,
  addRevision: store.addRevision,
  updateRevisionStatus: store.updateRevisionStatus,
  updateRevision: store.updateRevision,
  deleteRevision: store.deleteRevision,
  addAssessment: store.addAssessment,
  addContactMessage: store.addContactMessage,
  createMeeting: store.createMeeting,
  updateMeeting: store.updateMeeting,
  updateMeetingStatus: store.updateMeetingStatus,
  deleteMeeting: store.deleteMeeting,
  getStudentProgress: store.getStudentProgress,
  resetData: store.resetData,
  saveData: store.saveData,
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { action?: string; args?: unknown[] };
    const action = body.action as ActionName | undefined;
    if (!action || !(action in ACTIONS)) {
      return NextResponse.json(
        { ok: false, error: `Unknown action: ${body.action}` },
        { status: 400 }
      );
    }
    const args = Array.isArray(body.args) ? body.args : [];
    const fn = ACTIONS[action] as (...a: unknown[]) => unknown;
    const result = await fn(...args);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("[api/store]", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Store action failed",
      },
      { status: 500 }
    );
  }
}
