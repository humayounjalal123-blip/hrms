# Hifz Revision Management System (HRMS)

A role-based web application for managing Quran memorization (Hifz) progress, revision schedules, teacher assessments, and reports.

## Features

- Secure login with role-based access (Student / Teacher / Administrator)
- Student progress tracking (Surah / Ayah ranges)
- Revision task scheduling and completion
- Teacher assessments with scores, mistakes, and feedback
- Admin user management and teacher–student assignment
- Dashboards, search/filter reports, and contact form
- UI inspired by the provided green Islamic-themed mockups

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide Icons
- Browser localStorage data layer (demo-ready, no DB setup required)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

| Role    | Email                 | Password    |
|---------|-----------------------|-------------|
| Student | zakria@hrms.edu.pk    | student123  |
| Teacher | ahmed@hrms.edu.pk     | teacher123  |
| Admin   | admin@hrms.edu.pk     | admin123    |

## Functional Coverage

- FR-01 Login & role-based access
- FR-02 Admin user create / update / deactivate / view
- FR-03 Assign teachers to students & manage classes
- FR-04 Teachers view students & record memorized ranges
- FR-05 Teachers create revision tasks with due dates
- FR-06 Students view/mark revision tasks
- FR-07 Teachers record assessments, mistakes, scores, feedback
- FR-08 Full revision & assessment history
- FR-09 Progress summaries from stored records
- FR-10 Search, filtering, dashboards, and reports

## Project Structure

```
src/
  app/                 # Pages (public + dashboard)
  components/          # UI components
  lib/                 # Types, seed data, auth, store
```
