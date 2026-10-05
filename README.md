# Whistleblowing Management System

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A full-stack **Whistleblowing Management System** that provides a secure, structured platform for employees to report unethical or illegal activities within an organization, and for managers, investigators, and administrators to manage, investigate, and resolve those reports.

Built with **Next.js (App Router)**, **TypeScript**, **MySQL**, **Prisma ORM**, **Tailwind CSS**, and **NextAuth** using **Vertical Slice Architecture**.

---

## 📋 Table of Contents

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

## 📖 Research Report

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

- Authentication (NextAuth with session-based auth)
- Role-Based Access Control (RBAC)
- Password hashing (bcrypt, 12 rounds)
- Confidential complaint information
- Controlled access to evidence
- Secure case management
- System activity logging
- Notification security
- Server-side validation (Zod)

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
- Secure login with NextAuth (session-based)
- Password hashing with bcrypt (12 rounds)
- Role-based access control (RBAC) — `ADMIN`, `MANAGER`, `INVESTIGATOR`, `USER`
- Protected routes with middleware
- Sign out & session management

### 📝 Complaint Management
- Submit complaints (anonymous or identified)
- Categorize complaints (Fraud, Harassment, Data Protection, etc.)
- View complaint status and history
- Provide additional information to complaints
- Manager review workflow (`PENDING → UNDER_REVIEW → APPROVED/REJECTED → CONVERTED_TO_CASE`)

### 📁 Case Management
- Convert approved complaints into cases
- Assign investigators to cases
- Track case status (`OPEN → INVESTIGATING → PENDING_REVIEW → CLOSED/ARCHIVED`)
- Set case priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- Complete case status history (audit trail)

### 🔍 Investigation
- Investigator dashboard with assigned cases
- Collect and upload evidence (files)
- Analyse case data
- Generate investigation reports
- Close cases with recommendations
- Automatic notifications to managers & whistleblowers

### 📎 Evidence Management
- Upload files (PDF, images, spreadsheets, etc.)
- File metadata tracking (name, type, description)
- Evidence linked to specific cases

### 🔔 Notifications
- In-app notifications for key events
- Read/unread status
- Role-aware notification routing
- Badge counter in the header

### 👥 User Management (Admin)
- View, search, filter users
- Update user roles and statuses
- Activate / suspend users
- Manage departments
- View system activity log

### ⚙️ System Settings (Admin)
- Configure site name
- Enable/disable anonymous complaints
- Configure default case priority
- Password policy (minimum length)
- Complaint retention period
- Email notification toggle

### 📊 Dashboards
- **Employee** — My complaints, status overview, submit new
- **Manager** — Complaints review queue, cases, unassigned cases, recent complaints
- **Investigator** — Assigned cases, evidence count, unread notifications, recent cases
- **Admin** — User stats, department stats, quick links, activity log

### 🎨 UI/UX
- Modern, responsive design with Tailwind CSS
- Gradient stat cards
- Time-based greetings
- Empty states & loading states
- Accessible navigation

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database** | [MySQL 8](https://www.mysql.com/) |
| **ORM** | [Prisma 6](https://www.prisma.io/) |
| **Authentication** | [NextAuth.js 4](https://next-auth.js.org/) |
| **Password Hashing** | [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Validation** | [Zod](https://zod.dev/) |
| **Dev Tooling** | [tsx](https://github.com/privatenumber/tsx) (for seed script) |

---

## 🏗 Architecture

This project uses **Vertical Slice Architecture** — code is organized by **business feature**, not by technical layer.

Each feature folder contains:
- `components/` — feature-specific UI components
- `services/` — business logic
- `repository/` — database access (Prisma queries)
- `types.ts` — TypeScript types / interfaces

**Benefits:**
- Easier to navigate
- Higher cohesion, lower coupling
- Features can be understood in isolation
- Easier to test and maintain


---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ ([download](https://nodejs.org/))
- **npm** 10+
- **MySQL** 8+ ([download](https://dev.mysql.com/downloads/installer/))
- **Git** ([download](https://git-scm.com/))
- **VS Code** (recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/achintha73-gif/Whistleblowing.git
   cd Whistleblowing

2. **Install dependencies**
    npm install

3. **Set up environment variables (see Environment Variables)**

4. **Create the MySQL database**
  CREATE DATABASE whistleblowing_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

5. **Run Prisma migrations**
    npx prisma migrate dev

6. **Seed the database with demo data**
    npx prisma db seed

7. **Start the development server**
   npm run dev

8. **Open http://localhost:3000 in your browser**

### Environment Variables
# Database Connection
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/whistleblowing_db"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

Generate a secure NEXTAUTH_SECRET: openssl rand -base64 32

### Database Setup
1. **Migrations** 
   # Create a new migration after changing schema.prisma
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (drops all data + re-applies migrations + re-seeds)
npx prisma migrate reset --force


### Project Structure
whistleblowing-system/
├── prisma/
│   ├── schema.prisma           # Database schema (12 models, 6 enums)
│   ├── seed.ts                 # Seed script
│   └── migrations/             # Migration history
│
├── public/                     # Static assets
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Login, register
│   │   ├── dashboard/          # Role-based dashboards
│   │   │   ├── admin/
│   │   │   ├── manager/
│   │   │   ├── investigator/
│   │   │   ├── user/
│   │   │   ├── complaints/
│   │   │   ├── cases/
│   │   │   ├── evidence/
│   │   │   ├── notifications/
│   │   │   ├── settings/
│   │   │   ├── logs/
│   │   │   └── users/
│   │   └── api/                # REST API route handlers
│   │
│   ├── features/               # Vertical slices (business features)
│   │   ├── auth/
│   │   ├── complaints/
│   │   ├── cases/
│   │   ├── investigation/
│   │   ├── evidence/
│   │   ├── notifications/
│   │   └── users/
│   │
│   └── lib/
│       ├── db.ts               # Prisma Client singleton
│       ├── auth.ts             # NextAuth configuration
│       └── validation.ts       # Zod schemas
│
├── .env                        # Environment variables (not committed)
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── README.md

### API Endpoints

Method	Endpoint	Description	Access
POST	/api/auth/[...nextauth]	NextAuth sign in/out	Public
GET	/api/complaints	List complaints	Auth
POST	/api/complaints	Submit new complaint	USER
GET	/api/complaints/:id	Get complaint details	Auth
POST	/api/complaints/:id/additional-info	Add additional info	USER
GET	/api/cases	List cases	MANAGER/INVESTIGATOR/ADMIN
POST	/api/cases	Create case from complaint	MANAGER
GET	/api/cases/:id	Get case details	MANAGER/INVESTIGATOR/ADMIN
PATCH	/api/cases/:id/status	Update case status	MANAGER/INVESTIGATOR
POST	/api/cases/:id/assign	Assign investigator	MANAGER
GET	/api/evidence	List evidence	MANAGER/INVESTIGATOR
POST	/api/evidence	Upload evidence	INVESTIGATOR
GET	/api/notifications	List user notifications	Auth
PATCH	/api/notifications/:id	Mark as read	Auth
GET	/api/users	List users	ADMIN
PATCH	/api/users/:id	Update user	ADMIN
API endpoints are subject to change. Refer to the src/app/api/ directory for the current implementation.

### Scripts
Command	Description
npm run dev	Start development server (http://localhost:3000)
npm run build	Build for production
npm run start	Start production server
npm run lint	Run ESLint
npx prisma migrate dev	Create & apply a new migration
npx prisma migrate reset	Reset DB + re-run migrations + seed
npx prisma db seed	Seed the database
npx prisma studio	Open Prisma Studio (DB GUI)
npx prisma generate	Regenerate Prisma Client