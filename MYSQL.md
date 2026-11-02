# HRMS MySQL Setup

This app now stores all data in **MySQL** (users, classes, memorization, revisions, assessments, meetings, contact messages).

## 1. Install MySQL

Any of these works:

- [XAMPP](https://www.apachefriends.org/) (start **MySQL** from the control panel)
- [WAMP](https://www.wampserver.com/)
- MySQL Server / MariaDB

Default local settings used by this project:

| Setting  | Value      |
|----------|------------|
| Host     | `127.0.0.1` |
| Port     | `3306`     |
| User     | `root`     |
| Password | _(empty)_  |
| Database | `hrms`     |

Edit `.env.local` if your password is different.

## 2. Create tables + seed demo data

```bash
npm run db:setup
```

## 3. Run the app

```bash
npm run dev
```

Open http://localhost:3000 (or 3001 if busy).

### Demo accounts

- Student: `humayoun@gmail.com` / `student123`
- Teacher: `ahmedali@gmail.com` / `teacher123`
- Admin: `sysadmin@gmail.com` / `admin123`

## Notes

- API routes: `GET/PUT /api/data`, `POST /api/store`
- Schema file: `src/lib/db/schema.sql`
- Re-seed / reset: Settings → Reset, or run `npm run db:setup` again
