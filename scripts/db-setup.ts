import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { SEED_DATA } from "../src/lib/seed";
import type { AppData } from "../src/lib/types";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config({ path: path.join(process.cwd(), ".env") });

const host = process.env.MYSQL_HOST || "127.0.0.1";
const port = Number(process.env.MYSQL_PORT || 3306);
const user = process.env.MYSQL_USER || "root";
const password = process.env.MYSQL_PASSWORD || "";
const database = process.env.MYSQL_DATABASE || "hrms";

async function saveAppData(
  conn: mysql.Connection,
  data: AppData
): Promise<void> {
  await conn.beginTransaction();
  try {
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    await conn.query("DELETE FROM meeting_students");
    await conn.query("DELETE FROM meetings");
    await conn.query("DELETE FROM assessments");
    await conn.query("DELETE FROM revisions");
    await conn.query("DELETE FROM memorization");
    await conn.query("DELETE FROM contact_messages");
    await conn.query("DELETE FROM users");
    await conn.query("DELETE FROM classes");

    for (const c of data.classes) {
      await conn.execute(
        `INSERT INTO classes
          (id, name, category, teacher_id, max_students, active, created_at)
         VALUES (?, ?, ?, NULL, ?, ?, ?)`,
        [c.id, c.name, c.category, c.maxStudents, c.active ? 1 : 0, c.createdAt]
      );
    }

    for (const u of data.users) {
      await conn.execute(
        `INSERT INTO users
          (id, name, email, password, role, phone, active, avatar, teacher_id, class_id, class_name, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          u.id,
          u.name,
          u.email,
          u.password,
          u.role,
          u.phone || null,
          u.active ? 1 : 0,
          u.avatar || null,
          u.teacherId || null,
          u.classId || null,
          u.className || null,
          u.createdAt,
        ]
      );
    }

    for (const c of data.classes) {
      await conn.execute(`UPDATE classes SET teacher_id = ? WHERE id = ?`, [
        c.teacherId || null,
        c.id,
      ]);
    }

    for (const m of data.memorization) {
      await conn.execute(
        `INSERT INTO memorization
          (id, student_id, surah, ayah_from, ayah_to, date_value, recorded_by, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          m.id,
          m.studentId,
          m.surah,
          m.ayahFrom,
          m.ayahTo,
          m.date,
          m.recordedBy,
          m.notes || null,
        ]
      );
    }

    for (const r of data.revisions) {
      await conn.execute(
        `INSERT INTO revisions
          (id, student_id, surah, ayah_from, ayah_to, due_date, status, assigned_by, completed_at, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          r.id,
          r.studentId,
          r.surah,
          r.ayahFrom,
          r.ayahTo,
          r.dueDate,
          r.status,
          r.assignedBy,
          r.completedAt || null,
          r.notes || null,
        ]
      );
    }

    for (const a of data.assessments) {
      await conn.execute(
        `INSERT INTO assessments
          (id, student_id, teacher_id, surah, ayah_from, ayah_to, score, grade, mistakes, feedback, date_value)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          a.id,
          a.studentId,
          a.teacherId,
          a.surah,
          a.ayahFrom,
          a.ayahTo,
          a.score,
          a.grade,
          a.mistakes,
          a.feedback,
          a.date,
        ]
      );
    }

    for (const msg of data.messages) {
      await conn.execute(
        `INSERT INTO contact_messages (id, name, email, subject, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [msg.id, msg.name, msg.email, msg.subject, msg.message, msg.createdAt]
      );
    }

    for (const m of data.meetings) {
      await conn.execute(
        `INSERT INTO meetings
          (id, title, description, host_id, class_id, provider, room_code, external_url,
           scheduled_at, duration_mins, for_international, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          m.id,
          m.title,
          m.description || null,
          m.hostId,
          m.classId || null,
          m.provider,
          m.roomCode,
          m.externalUrl || null,
          m.scheduledAt,
          m.durationMins,
          m.forInternational ? 1 : 0,
          m.status,
          m.createdAt,
        ]
      );
      for (const studentId of m.studentIds || []) {
        await conn.execute(
          `INSERT INTO meeting_students (meeting_id, student_id) VALUES (?, ?)`,
          [m.id, studentId]
        );
      }
    }

    await conn.query("SET FOREIGN_KEY_CHECKS = 1");
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  }
}

async function main() {
  console.log(`Connecting to MySQL at ${host}:${port} as ${user}...`);
  let rootConn: mysql.Connection;
  try {
    rootConn = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
  } catch (err) {
    console.error("\n❌ MySQL connection failed.");
    console.error("Install XAMPP/WAMP/MySQL/MariaDB, start the service, then set .env.local");
    console.error("Expected defaults: host=127.0.0.1 user=root password=(empty) database=hrms\n");
    console.error(err);
    process.exit(1);
  }

  const schemaPath = path.join(process.cwd(), "src", "lib", "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  console.log("Applying schema...");
  await rootConn.query(schema);
  await rootConn.end();

  const dbConn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true,
  });

  console.log("Seeding demo data...");
  const seed = JSON.parse(JSON.stringify(SEED_DATA)) as AppData;
  await saveAppData(dbConn, seed);
  await dbConn.end();

  console.log("\n✅ MySQL ready.");
  console.log(`   Database: ${database}`);
  console.log("   Demo logins:");
  console.log("   - humayoun@gmail.com / student123");
  console.log("   - ahmedali@gmail.com / teacher123");
  console.log("   - sysadmin@gmail.com / admin123");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
