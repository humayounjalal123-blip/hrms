import fs from "fs";
import path from "path";

const files = [
  "src/app/login/page.tsx",
  "src/app/signup/page.tsx",
  "src/app/contact/page.tsx",
  "src/app/dashboard/page.tsx",
  "src/app/dashboard/users/page.tsx",
  "src/app/dashboard/students/page.tsx",
  "src/app/dashboard/classes/page.tsx",
  "src/app/dashboard/meetings/page.tsx",
  "src/app/dashboard/revision/page.tsx",
  "src/app/dashboard/assessments/page.tsx",
  "src/app/dashboard/progress/page.tsx",
  "src/app/dashboard/schedule/page.tsx",
  "src/app/dashboard/teachers/page.tsx",
  "src/app/dashboard/reports/page.tsx",
  "src/app/dashboard/settings/page.tsx",
];

for (const rel of files) {
  const p = path.join(process.cwd(), rel);
  let s = fs.readFileSync(p, "utf8");
  const before = s;

  // Common reload helpers
  s = s.replace(
    /const reload = \(\) => setData\(getData\(\)\);/g,
    "const reload = async () => setData(await getData());"
  );
  s = s.replace(
    /const load = \(\) => setData\(getData\(\)\);/g,
    "const load = async () => setData(await getData());"
  );

  // login page
  s = s.replace(
    /const result = login\(email, password\);/g,
    "const result = await login(email, password);"
  );
  s = s.replace(
    /const onSubmit = \(e: FormEvent\) => \{/g,
    "const onSubmit = async (e: FormEvent) => {"
  );

  // signup
  s = s.replace(
    /const result = registerUser\(\{ name, email, password, role \}\);/g,
    "const result = await registerUser({ name, email, password, role });"
  );

  // contact
  s = s.replace(
    /addContactMessage\(\{ name, email, subject, message \}\);/g,
    "await addContactMessage({ name, email, subject, message });"
  );

  if (s !== before) {
    fs.writeFileSync(p, s);
    console.log("patched", rel);
  } else {
    console.log("no change", rel);
  }
}
