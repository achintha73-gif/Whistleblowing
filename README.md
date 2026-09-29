![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
## Research Report

### Abstract

Whistleblowing is an important process that allows employees and other individuals to report unethical, illegal, or inappropriate activities within an organization. A proper whistleblowing system can provide a secure and structured way to submit complaints, manage cases, conduct investigations, and maintain confidentiality.

This research focuses on the design of a Whistleblowing Management System that supports complaint submission, case management, investigation, evidence management, notifications, and administrative functions.

---

## 1. Introduction

Organizations may face different types of unethical activities, including fraud, corruption, misuse of confidential information, harassment, and violations of organizational policies. Employees may hesitate to report such incidents because of confidentiality concerns, fear of retaliation, or the lack of a proper reporting process.

A Whistleblowing Management System can provide a centralized platform where complaints can be submitted and managed securely. The system can also help authorized users investigate complaints and maintain records throughout the investigation process.

---

## 2. Objectives

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

## 3. Main Users

The main users of the system are:

### Employee / Whistleblower
- Submit complaints
- Provide additional information
- View complaint status
- Receive investigation updates and notifications

### Manager
- Review complaints
- Review case information
- Provide feedback
- Monitor relevant reports

### Investigator
- View assigned cases
- Investigate cases
- Analyze case data
- Collect and upload evidence
- Generate investigation reports
- Notify the whistleblower about relevant investigation updates

### System Administrator
- Manage users
- Configure system settings
- Manage roles and permissions
- View system logs

---

## 4. Main System Functions

The main functions of the system include:

- User Authentication
- Complaint Submission
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

## 5. System Design

The system design was developed using UML and database modelling techniques.

The main diagrams included in the research are:

- Use Case Diagram
- Context Diagram
- ER Diagram
- Class Diagram

These diagrams help to identify the system requirements, users, data entities, relationships, and object-oriented structure.

---

## 6. ER Diagram

<img width="1600" height="1357" alt="WhatsApp Image 2026-09-25 at 13 05 54" src="https://github.com/user-attachments/assets/55bddd45-7554-4b7a-92f1-fc773ab6b520" />


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

The ER diagram is designed to maintain relationships between complaints, cases, investigators, evidence, additional information, and investigation reports.
---

## 7. Context Diagram

The Context Diagram shows the main external users and their interaction with the Whistleblowing Management System.

The main external entities are:

- Employee / Whistleblower
- Manager
- Investigator
- System Administrator

Main data flows include:

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

## 8. Class Diagram

The Class Diagram represents the main classes and their relationships within the system.

Main classes include:

- User
- Employee
- Manager
- Investigator
- System Administrator
- Role
- Complaint
- Case
- Evidence
- Additional Information
- Investigation Report
- Case Status History
- Notification
- System Setting
- Department

9. Security and Confidentiality

Security and confidentiality are important aspects of a whistleblowing system. The system should restrict access to sensitive information based on user roles and permissions.

Important security considerations include:

* Authentication
* Role-Based Access Control
* Password protection
* Confidential complaint information
* Controlled access to evidence
* Secure case management
* System activity logging
* Notification security

⸻

10. Benefits of the Proposed System

The proposed system can provide several benefits:

* Centralized complaint management
* Structured investigation process
* Better case tracking
* Secure evidence management
* Improved communication
* Faster access to case information
* Better accountability through system logs
* Improved confidentiality
* Easier generation of investigation reports

⸻

11. Conclusion

The proposed Whistleblowing Management System provides a structured approach to handling whistleblowing complaints and investigations. It supports complaint submission, case management, investigation, evidence collection, additional information, notifications, and administrative activities.

The UML diagrams and ER diagram provide a clear understanding of the system structure and database relationships. The proposed design can be further developed into a web-based system using modern frontend and backend technologies.

⸻

Technologies

Frontend       → Next.js
Backend/API    → Next.js API Routes
Database       → MySQL
ORM            → Prisma
Language       → TypeScript
Architecture   → Vertical Slice Architecture
Authentication → NextAuth/Auth.js or custom authentication

