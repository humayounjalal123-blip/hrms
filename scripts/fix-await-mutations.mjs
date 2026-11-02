import fs from "fs";
import path from "path";

const roots = ["src/app"];

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) out.push(p);
  }
  return out;
}

const files = roots.flatMap((r) => walk(path.join(process.cwd(), r)));

const callNames = [
  "saveData",
  "updateUser",
  "createClass",
  "assignClassTeacher",
  "enrollStudentInClass",
  "removeStudentFromClass",
  "transferStudentToClass",
  "addMemorization",
  "addRevision",
  "updateRevision",
  "updateRevisionStatus",
  "deleteRevision",
  "addAssessment",
  "createMeeting",
  "updateMeeting",
  "updateMeetingStatus",
  "deleteMeeting",
  "resetData",
];

for (const file of files) {
  if (file.includes(`${path.sep}api${path.sep}`)) continue;
  let s = fs.readFileSync(file, "utf8");
  const before = s;

  for (const name of callNames) {
    // const x = name(  -> const x = await name(
    s = s.replace(
      new RegExp(`(?<!await )(const \\w+ = )${name}\\(`, "g"),
      `$1await ${name}(`
    );
    // bare name( at start of statement / after { / ;
    s = s.replace(
      new RegExp(`(?<!\\.|\\w|await )${name}\\(`, "g"),
      `await ${name}(`
    );
  }

  // Fix double await
  s = s.replace(/await await /g, "await ");

  // getStudentProgress(id) -> getStudentProgress(data, id) when data exists in scope pages
  // Handled file-by-file below for progress/reports/dashboard/students

  if (s !== before) {
    fs.writeFileSync(file, s);
    console.log("await-fixed", path.relative(process.cwd(), file));
  }
}
