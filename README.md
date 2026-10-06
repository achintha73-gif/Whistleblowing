# 🛡️ Whistleblowing Management System

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A full-stack **Whistleblowing Management System** that provides a secure, structured platform for employees to report unethical or illegal activities within an organization, and for managers, investigators, and administrators to manage, investigate, and resolve those reports.

Built with **Next.js (App Router)**, **TypeScript**, **MySQL**, **Prisma ORM**, **Tailwind CSS**, and **Custom JWT authentication** using **Vertical Slice Architecture**.

---

## 📖 Table of Contents

- [Research Report](#-research-report)
  - [Abstract](#abstract)
  - [1. Introduction](#1-introduction)
  - [2. Objectives](#2-objectives)
  - [3. Main Users](#3-main-users)
  - [4. Main System Functions](#4-main-system-functions)
  - [5. System Design](#5-system-design)
  - [6. ER Diagram](#6-er-diagram)
  - [7. Context Diagram](#7-context-diagram)
  - [8. Class Diagram](#8-class-diagram)
  - [9. Security and Confidentiality](#9-security-and-confidentiality)
  - [10. Benefits of the Proposed System](#10-benefits-of-the-proposed-system)
  - [11. Conclusion](#11-conclusion)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Test Credentials](#-test-credentials)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Scripts](#-scripts)
- [License](#-license)

---

## 📘 Research Report

### Abstract

Whistleblowing is an important process that allows employees and other individuals to report unethical, illegal, or inappropriate activities within an organization. A proper whistleblowing system can provide a secure and structured way to submit complaints, manage cases, conduct investigations, and maintain confidentiality.

This research focuses on the design of a Whistleblowing Management System that supports complaint submission, case management, investigation, evidence management, notifications, and administrative functions.

---

### 1. Introduction

Organizations may face different types of unethical activities, including fraud, corruption, misuse of confidential information, harassment, and violations of organizational policies. Employees may hesitate to report such incidents because of confidentiality concerns, fear of retaliation, or the lack of a proper reporting process.

A Whistleblowing Management System can provide a centralized platform where complaints can be submitted and managed securely. The system can also help authorized users investigate complaints and maintain records throughout the investigation process.

---

### 2. Objectives

The main objectives of the proposed system are:

- To provide a structured platform for submitting whistleblowing complaints.
- To maintain complaint and case information securely.
- To allow managers to review complaints and provide feedback.
- To allow investigators to investigate assigned cases.
- To support evidence collection and management.
- To generate investigation reports.
- To provide status updates and notifications.
- To support role-based access control.
- To maintain case status history and system logs.
- To allow system administrators to manage users and system settings.

---

### 3. Main Users

#### Employee / Whistleblower
- Submit complaints (anonymous or identified)
- Provide additional information
- View complaint status
- Receive investigation updates and notifications

#### Manager
- Review complaints
- Review case information
- Provide feedback
- Assign investigators to cases
- Monitor case progress

#### Investigator / Compliance Officer
- View assigned cases
- Investigate cases
- Analyze case data
- Collect and upload evidence
- Generate investigation reports
- Update case status
- Notify the whistleblower about relevant investigation updates
- Close cases

#### System Administrator
- Manage users
- Configure system settings
- Manage roles and permissions
- View system logs

---

### 4. Main System Functions

- User Authentication
- Complaint Submission (anonymous or identified)
- Complaint Management
- Additional Information Management
- Case Management
- Investigator Assignment
- Evidence Management
- Case Status Management
- Case Status History
- Data Analysis
- Investigation Report Generation
- Notifications
- User Management
- Role Management
- System Configuration
- System Log Management

---

### 5. System Design

The system design was developed using UML and database modelling techniques.

The main diagrams included in the research are:

- Use Case Diagram
- Context Diagram
- ER Diagram
- Class Diagram

---

### 6. ER Diagram

The Entity Relationship Diagram represents the main database entities and their relationships.

Main entities include:

- Department
- User
- Role
- Employee
- Complaint
- Case
- Investigator
- Evidence
- Additional Information
- Investigation Report
- Case Status History
- Analyze Data
- Notification
- System Setting

---

### 7. Context Diagram

The Context Diagram shows the main external users and their interaction with the Whistleblowing Management System.

Main external entities:

- Employee / Whistleblower
- Manager
- Investigator
- System Administrator

Main data flows:

- Submit Complaint
- Provide Additional Information
- Receive Complaint Status / Updates
- Review Complaint
- Provide Feedback
- Analyze Case Data
- Upload Evidence
- Generate Investigation Report
- Notify Whistleblower
- Manage Users
- Configure System
- View System Logs

---

### 8. Class Diagram

The Class Diagram represents the main classes and their relationships.

Main classes: User, Employee, Manager, Investigator, System Administrator, Role, Complaint, Case, Evidence, Additional Information, Investigation Report, Case Status History, Notification, System Setting, Department.

---

### 9. Security and Confidentiality

Security and confidentiality are important aspects of a whistleblowing system. The system restricts access to sensitive information based on user roles and permissions.

Important security considerations:

- **Authentication** — Custom JWT (signed with HS256 via `jose`), stored in HttpOnly cookies
- **Password hashing** — bcryptjs (10 rounds)
- **Role-Based Access Control (RBAC)** — enforced in middleware + service layer
- **Confidential complaint information** — anonymous complaints never linked to user identity
- **Controlled access to evidence** — download API requires authentication
- **Secure case management** — atomic Prisma transactions
- **System activity logging** — unified audit timeline
- **Notification security** — only recipient can view/mark their notifications
- **Server-side validation** — Zod schemas for all inputs
- **Password reset** — SHA-256 hashed tokens, 1-hour expiry, one-time use
- **Email enumeration protection** — password reset API always returns success

---

### 10. Benefits of the Proposed System

- Centralized complaint management
- Structured investigation process
- Better case tracking
- Secure evidence management
- Improved communication
- Faster access to case information
- Better accountability through system logs
- Improved confidentiality
- Easier generation of investigation reports

---

### 11. Conclusion

The proposed Whistleblowing Management System provides a structured approach to handling whistleblowing complaints and investigations. It supports complaint submission, case management, investigation, evidence collection, additional information, notifications, and administrative activities.

The UML diagrams and ER diagram provide a clear understanding of the system structure and database relationships.
---

## ✨ Features

### 🔐 Authentication & Authorization
- Custom JWT authentication (signed with jose, HS256)
- HttpOnly, secure cookies
- 4 roles: Employee, Manager, Investigator, Admin
- Role-Based Access Control (RBAC) in middleware + service layer
- Password reset via email (SHA-256 hashed tokens, 1-hour expiry, one-time use)
- Email enumeration protection

### 📝 Complaint Management
- Submit complaints with optional evidence attachments
- Anonymous submission - no login required, returns a WB-XXXX-XXXX reference code
- Category tagging (Fraud, Financial, Corruption, Harassment, Discrimination, Safety, Ethics, Abuse of Power, Other)
- Status flow: PENDING -> UNDER_REVIEW -> APPROVED / REJECTED / CONVERTED_TO_CASE
- Additional information threads (both logged-in and anonymous users)
- Delete rules (USER: own PENDING only; MANAGER: PENDING/REJECTED; ADMIN: all except CONVERTED)

### 🗂️ Case Management
- Managers convert approved complaints into cases (atomic Prisma transactions)
- Assign investigators to cases
- Track case status (OPEN -> INVESTIGATING -> PENDING_REVIEW -> CLOSED / ARCHIVED)
- Set case priority (LOW, MEDIUM, HIGH, CRITICAL)
- Complete case status history (audit trail)

### 🔍 Investigation
- Investigator dashboard with assigned cases
- Collect and upload evidence (files, 5 MB max per file)
- Generate investigation reports (findings + recommendation)
- Close cases with recommendations
- Automatic notifications to managers & whistleblowers

### 📎 Evidence Management
- Real file uploads (PDF, images, docs, videos)
- Stored in private-uploads/ (gitignored)
- Download API with authentication check
- Employees can upload evidence to their own complaints
- Employees can delete their own evidence (if complaint not yet converted)

### 🔔 Notifications
- In-app notifications for key events (assignment, evidence, status change, report)
- Read/unread status
- Role-aware notification routing
- Badge counter in the header

### 👥 User Management (Admin)
- View, search, filter users
- Update user roles and statuses
- Activate / suspend users
- Manage departments

### ⚙️ System Settings (Admin)
- Configure site name, support email, max upload size
- Editable and persisted

### 📊 Activity Log (Admin)
- Unified timeline of all system events
- Search + filter by event type
- Pagination

### 📈 Dashboards
- Employee - My complaints, status overview, submit new
- Manager - Complaints review queue, cases, unassigned cases
- Investigator - Assigned cases, evidence count, unread notifications
- Admin - User stats, department stats, quick links, activity log

### 🎨 UI/UX
- Glassmorphism design - gradient backgrounds, backdrop blur, soft shadows
- Modern sidebar with gradient active states
- Responsive layout (mobile-friendly)
- Time-based greetings
- Lucide icons throughout
- Modern login page with Employee / Anonymous tabs
- Empty states & loading states

---

## 🧰 Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI Library | React 19 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Database | MySQL 8 |
| ORM | Prisma 6 |
| Authentication | Custom JWT (jose) + HttpOnly cookies |
| Password Hashing | bcryptjs |
| Validation | Zod |
| Email (dev) | Nodemailer + Ethereal SMTP |
| CAPTCHA | react-google-recaptcha |
| Dev Tooling | tsx (for seed script) |

---

## 🏛️ Architecture

This project uses Vertical Slice Architecture - code is organized by business feature, not by technical layer.

Each feature folder contains:

- components/ - feature-specific UI components
- services/ - business logic
- repository/ - database access (Prisma queries)
- types.ts - TypeScript types / interfaces

Benefits:

- Easier to navigate
- Higher cohesion, lower coupling
- Features can be understood in isolation
- Easier to test and maintain

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (https://nodejs.org/)
- npm 10+
- MySQL 8+ (https://dev.mysql.com/downloads/installer/)
- Git (https://git-scm.com/)
- VS Code (recommended)

### Installation

1. Clone the repository

   git clone https://github.com/achintha73-gif/Whistleblowing.git
   cd Whistleblowing

2. Install dependencies

   npm install

3. Set up environment variables (see Environment Variables section below)

4. Create the MySQL database

   CREATE DATABASE whistleblowing_db
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci;

5. Run Prisma migrations

   npx prisma migrate dev

6. Seed the database with demo data

   npx prisma db seed

7. Start the development server

   npm run dev

8. Open http://localhost:3000 in your browser

---

## 🔑 Environment Variables

Create a .env file in the project root:

# Database
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/whistleblowing_db"

# JWT (Custom authentication)
JWT_SECRET="your-long-random-secret-here"

# Node environment
NODE_ENV="development"

# SMTP (Ethereal for development)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ethereal-user@ethereal.email
SMTP_PASS=your-ethereal-password
SMTP_FROM=your-ethereal-user@ethereal.email

# App
APP_URL=http://localhost:3000
PASSWORD_RESET_EXPIRY_SECONDS=3600

Generate a secure JWT_SECRET:

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

Get free Ethereal credentials: https://ethereal.email

---

## 🗄️ Database Setup

### Migrations

# Create a new migration after changing schema.prisma
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (drops all data + re-applies migrations + re-seeds)
npx prisma migrate reset --force

### Regenerate Prisma Client

# Warning: Close VS Code first on Windows (EPERM error)
npx prisma generate

### View data with Prisma Studio

npx prisma studio

---

## 🔐 Test Credentials

After running `npx prisma db seed`, the following accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@wb.local | Admin@12345 |
| Manager 1 | manager@wb.local | Manager@12345 |
| Manager 2 | manager2@wb.local | Manager@12345 |
| Investigator 1 | investigator@wb.local | Investigator@12345 |
| Investigator 2 | investigator2@wb.local | Investigator@12345 |
| Investigator 3 | investigator3@wb.local | Investigator@12345 |
| Employee 1 | employee@wb.local | Employee@12345 |
| Employee 2 | employee2@wb.local | Employee@12345 |
| Employee 3 | employee3@wb.local | Employee@12345 |
| Employee 4 | employee4@wb.local | Employee@12345 |
| Employee 5 | employee5@wb.local | Employee@12345 |

### Anonymous Flow (no login required)

1. Visit /report - public anonymous submission form
2. Submit complaint with optional evidence
3. Receive a reference code (format: WB-XXXX-XXXX, no ambiguous characters)
4. Save the code - you will need it to track progress
5. Visit /track - enter the code to view status
6. Add additional information at /track/[code]

---

## 📁 Project Structure

whistleblowing-system/
├── prisma/
│   ├── schema.prisma           All models
│   ├── seed.ts                 Test data (11 users + complaints + cases)
│   └── migrations/             Migration history
├── public/                     Static assets
├── src/
│   ├── app/                    Next.js App Router
│   │   ├── (auth)/             Login, forgot/reset password
│   │   ├── report/             Public anonymous submission
│   │   ├── track/              Public reference-code tracking
│   │   ├── anonymous/          Success page with code
│   │   ├── dashboard/          Protected area (sidebar + glass layout)
│   │   │   ├── admin, manager, investigator, user
│   │   │   ├── complaints, cases, evidence
│   │   │   ├── notifications, profile, support
│   │   │   └── users, settings, logs
│   │   └── api/                REST API routes
│   │       ├── auth/
│   │       ├── complaints/
│   │       ├── cases/
│   │       ├── evidence/
│   │       ├── users/
│   │       ├── settings/
│   │       ├── notifications/
│   │       ├── public/report/
│   │       └── anonymous/
│   ├── features/               Vertical Slice Architecture
│   │   ├── auth, complaints, cases, evidence, investigation
│   │   ├── notifications, users, settings, logs
│   ├── lib/
│   │   ├── auth.ts             getSession, requireAuth, requireRole
│   │   ├── auth-config.ts      JWT_SECRET, SMTP, APP_URL
│   │   ├── db.ts               Prisma singleton
│   │   ├── validation.ts       Zod schemas
│   │   └── reference-code.ts   WB-XXXX-XXXX generator
│   └── middleware.ts           Route protection + public routes
├── private-uploads/            Uploaded evidence (gitignored)
├── .env                        Environment variables (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── README.md

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/login | Sign in | Public |
| POST | /api/auth/logout | Sign out | Auth |
| GET | /api/auth/me | Current user | Auth |
| POST | /api/auth/forgot-password | Request reset link | Public |
| POST | /api/auth/reset-password | Reset password | Public |
| GET | /api/complaints | List complaints | Auth |
| POST | /api/complaints | Submit new complaint | USER |
| GET | /api/complaints/:id | Complaint details | Auth |
| DELETE | /api/complaints/:id | Delete complaint | Owner / MANAGER / ADMIN |
| POST | /api/complaints/:id/additional-info | Add additional info | Auth |
| POST | /api/complaints/upload | Upload evidence to complaint | USER |
| GET | /api/cases | List cases | MANAGER / INVESTIGATOR / ADMIN |
| POST | /api/cases | Create case from complaint | MANAGER |
| GET | /api/cases/:id | Case details | MANAGER / INVESTIGATOR / ADMIN |
| PATCH | /api/cases/:id/status | Update case status | MANAGER / INVESTIGATOR |
| POST | /api/cases/:id/assign | Assign investigator | MANAGER |
| GET | /api/evidence/:id/download | Download file | Auth |
| POST | /api/public/report | Anonymous complaint submission | Public |
| GET | /api/anonymous/complaints/:code | Fetch by reference code | Public |
| POST | /api/anonymous/additional-info | Add info via code | Public |
| GET | /api/notifications | List user notifications | Auth |
| PATCH | /api/notifications/:id/read | Mark as read | Auth |
| GET | /api/users | List users | ADMIN |
| PATCH | /api/users/:id | Update user | ADMIN |
| GET | /api/settings | Get system settings | ADMIN |
| PATCH | /api/settings | Update settings | ADMIN |

API endpoints are subject to change. Refer to src/app/api/ for the current implementation.

---

## 🧪 Available Scripts

| Command | Description |
|---------|-------------|
| npm run dev | Start development server (http://localhost:3000) |
| npm run build | Build for production |
| npm run start | Start production server |
| npm run lint | Run ESLint |
| npx tsc --noEmit | Type-check the project |
| npx prisma migrate dev | Create & apply a new migration |
| npx prisma migrate reset | Reset DB + re-run migrations + seed |
| npx prisma db seed | Seed the database |
| npx prisma studio | Open Prisma Studio (DB GUI) |
| npx prisma generate | Regenerate Prisma Client |

---

## 📸 Screenshots

Add screenshots of the following pages to the project report:

| Page | Path |
|------|------|
| Login (Employee / Anonymous tabs) | /login |
| Employee Dashboard | /dashboard/user |
| Manager Dashboard | /dashboard/manager |
| Investigator Dashboard | /dashboard/investigator |
| Admin Dashboard | /dashboard/admin |
| Complaint List (filters + search) | /dashboard/complaints |
| Case List (filters + search) | /dashboard/cases |
| Case Detail (evidence + report + timeline) | /dashboard/cases/[id] |
| Activity Log | /dashboard/logs |
| Support Page | /dashboard/support |
| Anonymous Report Form | /report |
| Track Complaint | /track |

---

## 📝 License

This project is a university coursework submission. Not licensed for commercial use.

---

## 👤 Author

Achintha - https://github.com/achintha73-gif

---

> Warning: This is a university project built for learning purposes. In production, additional security measures (HTTPS, rate limiting, cloud file storage, 2FA, etc.) would be required.
