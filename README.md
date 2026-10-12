# Classroom Attendance Management System

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vite-5.3-646CFF?logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white"/>
  <img src="https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express-5.0-000000?logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/Prisma-6.0-FBD38D?logo=prisma&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-Auth-000000?logo=json-web-token&logoColor=white"/>
</p>

<h1 align="center">Classroom Attendance Management System</h1>

<h3 align="center">Full-stack attendance platform with RBAC, live timetable validation, and immutable correction audit history</h3>

## Overview

This project serves students, faculty, and admins with a role-based attendance workflow, JWT authentication, and production-safe operational upgrades for the three key issues identified during implementation:

- Timetable conflict detection and validation during scheduling
- Audit-preserving correction workflow without overwriting prior state
- Precomputed attendance summaries to avoid repeated recalculation on reads

## Implemented upgrades

### 1) Timetable overlap fix
- Added strict time parsing and half-open interval validation
- Prevented invalid time ranges and exact room/section/faculty conflicts
- Kept adjacent sessions allowed while blocking overlapping ones
- Made lecture generation idempotent at the application layer

### 2) Audit-preserving correction workflow
- Added immutable correction event records to preserve the full decision timeline
- Kept the original attendance state intact while recording each request and decision
- Supported student submission, faculty decision, escalation, and admin review in one append-only audit trail

### 3) Precomputed attendance summaries
- Added a summary cache keyed by student and subject/section context
- Backfilled historic totals from existing attendance records
- Replaced repeated aggregate queries with a single summary-read path while preserving the current API contract

## Current status

### Verified live database state
- Prisma schema validation passed
- Pending database migration chain was repaired and applied to the live instance
- Attendance summary backfill completed with zero mismatches
- Backend health check returned `{"status":"ok"}`
- Frontend production build passed

### Completed work
- [x] Shared timetable validation utilities
- [x] Conflict checks for room, faculty, and section scheduling
- [x] Immutable correction audit model and event writes
- [x] Attendance summary schema, backfill, and shared delta logic
- [x] Summary/report reads switched to precomputed counters
- [x] Frontend correction history and conflict handling updates
- [x] Live migration and database repair validation
- [x] Full admin portal navigation and data-backed management views
- [x] Admin academic setup, user management, timetable, session generation, and reports UI
- [x] Responsive admin navigation for all dashboard sections

### Admin portal coverage

The admin dashboard now exposes the existing administrative API through focused tabs:

- Overview metrics
- Departments, sections, subjects, and faculty assignments
- Faculty and student account creation and lists
- Room management
- Timetable conflict-aware slot management and lecture-session generation
- Correction escalation review
- Attendance summary, defaulter, Excel, and PDF reports



## Project structure

```text
Classroom-Attendance-Management-System/
├── Backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── lib/
│   └── prisma/
├── Frontend/
│   └── src/
├── README.md
│   
└── ...
```

## Quick start

### Prerequisites
- Node.js 20+
- MySQL 8+
- npm

### Install and run

```bash
cd Backend
npm install
npx prisma generate
npx prisma migrate status
npm start
```

```bash
cd Frontend
npm install
npm run build
```


