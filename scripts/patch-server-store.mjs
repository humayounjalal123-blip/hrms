import fs from "fs";

let s = fs.readFileSync("src/lib/server-store.ts", "utf8");

const names = [
  "createMeeting",
  "updateMeeting",
  "updateMeetingStatus",
  "deleteMeeting",
  "login",
  "registerUser",
  "updateUser",
  "createClass",
  "assignClassTeacher",
  "enrollStudentInClass",
  "removeStudentFromClass",
  "addMemorization",
  "addRevision",
  "updateRevisionStatus",
  "updateRevision",
  "deleteRevision",
  "transferStudentToClass",
  "addAssessment",
  "addContactMessage",
  "getStudentProgress",
];

for (const n of names) {
  s = s.replaceAll(`export function ${n}(`, `export async function ${n}(`);
}

s = s.replaceAll("const data = getData();", "const data = await getData();");
s = s.replaceAll("saveData(data);", "await saveData(data);");

// login: drop setSession
s = s.replace(
  /export async function login\(email: string, password: string\): SessionUser \| null \{[\s\S]*?^\}/m,
  `export async function login(email: string, password: string): Promise<SessionUser | null> {
  const data = await getData();
  const user = data.users.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.password === password &&
      u.active
  );
  if (!user) return null;
  return toSessionUser(user);
}`
);

// registerUser return type + no setSession
s = s.replace(
  /export async function registerUser\(input: \{[\s\S]*?\}\): \{ ok: true; user: SessionUser \} \| \{ ok: false; error: string \} \{/,
  `export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role: User["role"];
  phone?: string;
}): Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }> {`
);

s = s.replace(
  /data\.users\.push\(user\);\s*await saveData\(data\);\s*const session = toSessionUser\(user\);\s*setSession\(session\);\s*return \{ ok: true, user: session \};/,
  `data.users.push(user);
  await saveData(data);
  const session = toSessionUser(user);
  return { ok: true, user: session };`
);

// Remove getSession / setSession / logout localStorage helpers if present
s = s.replace(
  /\nexport function getSession\(\): SessionUser \| null \{[\s\S]*?\n\}\n\nexport function setSession\(user: SessionUser \| null\) \{[\s\S]*?\n\}\n\n/,
  "\n"
);
s = s.replace(/\nexport function logout\(\) \{\s*setSession\(null\);\s*\}\n/, "\n");

// Promise return types for common mutants
s = s.replace(
  "export async function updateMeetingStatus(id: string, status: MeetingStatus) {",
  "export async function updateMeetingStatus(id: string, status: MeetingStatus): Promise<OnlineMeeting | null> {"
);
s = s.replace(
  "export async function deleteMeeting(id: string) {",
  "export async function deleteMeeting(id: string): Promise<void> {"
);
s = s.replace(
  "export async function updateUser(id: string, patch: Partial<User>) {",
  "export async function updateUser(id: string, patch: Partial<User>): Promise<User | null> {"
);
s = s.replace(
  "export async function updateRevisionStatus(id: string, status: TaskStatus) {",
  "export async function updateRevisionStatus(id: string, status: TaskStatus): Promise<RevisionTask | null> {"
);
s = s.replace(
  "export async function deleteRevision(id: string) {",
  "export async function deleteRevision(id: string): Promise<boolean> {"
);
s = s.replace(
  "export async function addContactMessage(\n  msg: Omit<ContactMessage, \"id\" | \"createdAt\">\n) {",
  `export async function addContactMessage(
  msg: Omit<ContactMessage, "id" | "createdAt">
): Promise<ContactMessage> {`
);

fs.writeFileSync("src/lib/server-store.ts", s);
console.log("server-store patched");
