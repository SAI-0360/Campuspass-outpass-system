# 🎓 CampusPass — Digital Hostel Outpass & Gate Security System

[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-0284c7?style=flat&logo=react&logoColor=61dafb&labelColor=20232a)](https://react.dev/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-06b6d4?style=flat&logo=tailwindcss&logoColor=38bdf8&labelColor=20232a)](https://tailwindcss.com/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express%205-22c55e?style=flat&logo=nodedotjs&logoColor=5fa04e&labelColor=20232a)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20%2B%20Mongoose-10b981?style=flat&logo=mongodb&logoColor=47a248&labelColor=20232a)](https://www.mongodb.com/)
[![Auth](https://img.shields.io/badge/Auth-JWT%20(HttpOnly%20Cookies)-0f172a?style=flat&logo=jsonwebtokens&logoColor=white&labelColor=20232a)](https://jwt.io/)
[![Storage](https://img.shields.io/badge/Storage-Cloudinary%20CDN-3b82f6?style=flat&logo=cloudinary&logoColor=white&labelColor=20232a)](https://cloudinary.com/)
[![Gate Audit](https://img.shields.io/badge/Gate%20Terminal-Dual%20Photo%20%2B%20Late%20Audit-8b5cf6?style=flat&logo=securityscorecard&logoColor=white&labelColor=20232a)](#4-gate-verification--automated-late-return-engine)
[![Evaluation Mode](https://img.shields.io/badge/Evaluation%20Mode-1--Click%20Demo%20Presets-f59e0b?style=flat&logo=speedtest&logoColor=white&labelColor=20232a)](#-instant-1-click-evaluation-walkthrough)

> A production-ready, full-stack MERN campus egress & hostel gate verification platform featuring a 2-stage distributed approval state machine, accountless single-use cryptographic parent consent links, automated 10:30 PM university curfew enforcement, warden passkey generation (`CP-XXXX`), and gate terminal facial photo audit logging with a real-time late return calculation engine.

---

## 🚀 Deployed Application Link
👉 **https://campuspass-outpass-system.vercel.app**

## 🎥 Demo Video Link
👉 **https://drive.google.com/file/d/1i4h1ohnejjaQGkFQnJrWLLHcoELZV99b/view?usp=sharing**

---

## 📌 Table of Contents
1. [Deployed Application Link](#-deployed-application-link)
2. [Demo Video Link](#-demo-video-link)
3. [Project Overview](#-project-name--overview)
4. [Problem Statement](#-problem-statement)
5. [Target Users](#-target-users)
6. [Solution & Core Innovation](#-solution--core-innovation)
7. [Key Features](#-key-features)
8. [Tech Stack](#-tech-stack)
9. [Architecture & System Design](#-architecture--system-design)
10. [API Reference](#-api-reference)
11. [Local Setup](#-local-setup)
12. [Environment Variables](#-environment-variables)
13. [Deployment Guide](#-deployment)
14. [Demo Video Walkthrough](#-demo-video)
15. [Instant 1-Click Evaluation Walkthrough](#-instant-1-click-evaluation-walkthrough)
16. [Production Architecture vs Evaluation Mode](#-production-architecture-vs-evaluation-mode)

---

## 📌 Project Name & Overview

* **Project Name:** CampusPass
* **Domain:** University Campus Safety & Smart Hostel Egress Management
* **Stack:** Full MERN (MongoDB Atlas, Express 5, React 19, Node.js) + Tailwind CSS v4 + Cloudinary CDN
* **Submission Category:** End-Term Full-Stack Software Application (Year 2)

CampusPass transforms traditional paper hostel register workflows into an automated, multi-party verified digital pipeline that protects student safety, verifies parental consent without login friction, and equips security guards with tamper-resistant gate verification tools.

---

## 🚨 Problem Statement

University hostels housing thousands of residential students face severe logistical, safety, and accountability bottlenecks using legacy manual paper registers:

* **Forged Signatures & Proxy Exits:** Students sign illegible signatures, swap physical ID badges, or forge warden approvals on paper slips. Security guards cannot visually verify whether the student departing the gate matches the approved application.
* **Absence of Parental Consent Verification:** Wardens cannot reliably verify whether parents have authorized overnight leaves or weekend visits, exposing university administration to severe legal liabilities during off-campus emergencies.
* **Curfew Inefficiencies & Administrative Paralysis:** Processing hundreds of routine daytime grocery outings clogs warden offices, whereas critical curfew-breaching returns past **10:30 PM** escape rigorous auditing.
* **Unmonitored Overdue Exits:** When students fail to return before curfew, guards have no automated mechanism to identify missing residents or compute exact overdue delay times.
* **Paper Record Loss & Tampering:** Physical logs are easily manipulated, damaged, or lost, making retrospective safety audits virtually impossible.

---

## 👥 Target Users

| Target User | Responsibilities & Product Value Delivered |
| :--- | :--- |
| **Hostel Residents (Students)** | Residential undergraduate/postgraduate students who need transparent leave applications, live countdown statuses, and instant gate passcodes without waiting in physical queues. |
| **Parents / Guardians** | Family members who receive direct, cryptographic authorization links on their mobile phones to approve or deny leaves without needing to download apps or remember passwords. |
| **Hostel Wardens / Administrators** | Faculty proctors who review verified leave requests, inspect uploaded proof documents, and grant collision-free cryptographically indexed passkeys (`CP-XXXX`). |
| **Campus Security Guards** | Gate personnel stationed at campus exit/entry barriers who rapidly look up passkeys or roll numbers, capture facial verification photos, and monitor overdue returns. |

---

## 💡 Solution & Core Innovation

CampusPass replaces paper registers with a **2-Stage Distributed Security Architecture**:

```text
Student Applies ──► Stage 1: Parent Authorization ──► Stage 2: Warden Clearance ──► Gate Security Verification
```

### 1. The 10:30 PM Hostel Curfew Rule
* **Daytime Freedom:** Same-day outings returning before **10:30 PM** do not require an outpass under university hostel rules (students exit freely with physical student ID cards).
* **Curfew Enforcement:** Outpasses are strictly enforced for returns past 10:30 PM (`curfew_extension`), overnight stays (`night_out`), multi-day home visits (`weekend_home`), and urgent leaves (`emergency`).

> [!NOTE]
> **Hostel Curfew Policy:** If a student attempts to apply for a same-day outing returning before 10:30 PM, the system informs them that routine daytime trips do not require an outpass under campus regulations. This eliminates administrative fatigue and preserves warden capacity for curfew-sensitive requests.

### 2. Stage 1: Accountless 128-bit Parent Consent
* Every curfew-breaching outpass automatically generates a high-entropy, 128-bit cryptographic token via `crypto.randomBytes(16).toString("hex")`.
* Parents access a mobile-optimized consent portal via single-use token—no app installation, registration, or password fatigue required.
* Once the parent authorizes or denies, the link locks into a permanent read-only audit certificate.

> [!IMPORTANT]
> **Zero-Friction Parental Access:** Traditional apps require parents to create accounts and remember passwords, resulting in low adoption. CampusPass uses signed, single-use URL tokens that parents open directly from SMS/WhatsApp notifications.

### 3. Stage 2: Warden Clearance & Passkey Generation
* Wardens review only requests that have already received verified parental authorization.
* Approving an outpass triggers an automated collision-checked generator that issues a unique 7-character Pass Code (e.g., `CP-4821`).

### 4. Gate Verification & Automated Late Return Engine
* Security guards search the `CP-XXXX` passcode or student roll number in under 2 seconds.
* Dual photo verification logs facial captures at Exit and Return to permanently eliminate proxy card swaps.
* When students return past their approved time, the engine automatically calculates exact overdue minutes ($\Delta t$) and alerts the security desk.

---

## ✨ Key Features

### 🎓 1. Student Portal
* **Multi-Persona Login:** Quick-access dropdown on login supporting 3 distinct student personas (**Rahul Verma**, **Ananya Sharma**, and **Rohan Gupta**).
* **1-Click Demo Request Presets:** Instant testing presets for Curfew Extension, Night Out, Weekend Home, and Emergency Leave.
* **Custom Leave Application:** Rich form with datetime pickers, reason, destination, and parent contact information.
* **Cloudinary Document Upload:** Students can attach tickets, medical prescriptions, or consent letters (streamed directly to Cloudinary via RAM buffer).
* **Live Active Digital Pass:** Real-time card showing current state badge, countdowns, parent consent status, and the generated `CP-XXXX` Gate Key.
* **Outpass History:** Complete historical log of all past leaves with warden remarks, timestamps, and return statuses.

### 👨‍👩‍👧 2. Parent Consent Portal
* **Accountless Friction-Free Access:** Single-use cryptographic token URL (`/parent-consent/:token`) accessible from any smartphone browser.
* **Full Leave Summary:** Parents inspect leave type, destination, reason, departure time, and expected return time.
* **One-Click Decision:** Parents click **Authorize Leave** or **Deny Permission** with optional parent remarks.
* **Tamper-Proof Immutability:** Once decided, the link permanently transitions into a read-only audit certificate, preventing double-clicks or retrospective tampering.

### 🛡️ 3. Warden Dashboard
* **Prioritized Queue:** Curfew extensions and overnight passes are prioritized at the top of the queue.
* **Parent Verification Badge:** Clear green indicator displaying parent approval timestamp and parent remarks.
* **Document Inspector:** Built-in modal to view student roll numbers, hostel rooms, and Cloudinary proof attachments.
* **Pass Code Generation:** One-click approval automatically generates a collision-free `CP-XXXX` passcode indexed in MongoDB.
* **Live Operational Metrics:** Real-time summary cards tracking Pending Approvals, Students Currently Outside, and Overdue Returns.

### 👮 4. Security Guard Gate Terminal
* **Dual-Mode Instant Lookup:** Fast search by either the 7-character Pass Code (`CP-4821`) or Student Roll Number (`22CSE104`).
* **Live Gate Feeds:** Two tabbed live feeds:
  * *Ready for Exit:* Approved students cleared to depart campus.
  * *Currently Outside:* Students who have exited and are expected back before curfew.
* **Gate Photo Verification:** Exit and Return photo capture to permanently eliminate proxy card swaps.
* **Automated Late Return Engine:** Computes exact overdue minutes in real time:
  $$\text{lateMinutes} = \text{Math.round}\left(\frac{\text{actualReturnTime} - \text{expectedReturnTime}}{1000 \times 60}\right)$$
  Displays a red overdue alert banner and records permanent metrics in MongoDB.

---

## 🛠️ Tech Stack

```text
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT                                    │
│   React 19  │  Tailwind CSS v4  │  Vite  │  Axios  │  Lucide Icons     │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │  HTTP Requests (withCredentials: true)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                              SERVER                                    │
│   Node.js  │  Express 5 (MVC)  │  JWT (HttpOnly)  │  Multer (Memory)   │
└────────────────────────────────────────────────────────────────────────┘
                 │                                       │
                 │ Mongoose ODM                          │ upload_stream
                 ▼                                       ▼
┌─────────────────────────────────┐     ┌────────────────────────────────┐
│      MongoDB Atlas Cloud        │     │         Cloudinary CDN         │
│  - Users (Students/Warden/Guard)│     │  - Student Proof Documents     │
│  - Outpasses & Gate Logs        │     │  - Gate Facial Photos          │
└─────────────────────────────────┘     └────────────────────────────────┘
```

| Layer | Technologies | Technical Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + Vite | Component-based reactive architecture with instant HMR and optimized production Rollup chunks. |
| **Styling Engine** | Tailwind CSS v4 (`@tailwindcss/vite`) | Utility-first CSS compiled directly via Vite plugin without requiring legacy `tailwind.config.js`. |
| **Routing** | React Router DOM v7 | Declarative routing with `<ProtectedRoute>` guards, programmatic redirect resolution, and public token routing. |
| **HTTP Client** | Axios v1.7 | Centralized Axios instance with `withCredentials: true` for secure cross-origin cookie exchange. |
| **Backend Runtime** | Node.js v20+ & Express 5 | High-throughput asynchronous event-driven REST API structured in strict Model-View-Controller (MVC) layers. |
| **Database & ODM** | MongoDB Atlas & Mongoose v8 | Cloud NoSQL database utilizing sparse unique indexing on `passCode` to eliminate null collision bugs. |
| **Authentication** | Stateless JWT in `HttpOnly` Cookies | Zero vulnerability to Cross-Site Scripting (XSS) token theft. In-memory state hydrated safely via `GET /api/auth/me`. |
| **Password Security** | Bcrypt v5.1 | Salted cryptographic password hashing (`genSalt(10)`) protecting stored credentials. |
| **File Buffer Streaming**| Multer v1.4 + Cloudinary v2 | Files are buffered in server RAM (`req.file.buffer`) and piped directly to Cloudinary, preventing ephemeral disk wipes. |

---

## 🏛️ Architecture & System Design

### 1. State Machine Approval Lifecycle (Mermaid)

```mermaid
flowchart TD
    Start([👨‍🎓 Student Applies for Outpass]) --> RuleCheck{"Hostel Curfew<br/>Rule Check"}
    
    RuleCheck -->|Same-Day Return before 10:30 PM| DayExit["Daytime Free Exit<br/><i>(Tap Physical Student ID Card)</i>"]
    RuleCheck -->|Past 10:30 PM / Overnight / Multi-Day| S1["<b>Stage 1: AWAITING_PARENT</b><br/><i>(Generates 128-bit Cryptographic Token)</i>"]

    subgraph Stage1 ["Stage 1: Parent Authorization Portal"]
        direction TB
        S1 -->|Parent Approves via Token| S2["<b>Stage 2: PENDING</b><br/><i>(Transferred to Warden Review Queue)</i>"]
        S1 -->|Parent Denies Consent| Rej1(["❌ <b>REJECTED</b><br/><i>(Parent Denied Permission)</i>"])
        S1 -->|Student Cancels| Can1(["⛔ <b>CANCELLED</b><br/><i>(Revoked by Student)</i>"])
    end

    subgraph Stage2 ["Stage 2: Warden Review Queue"]
        direction TB
        S2 -->|Warden Approves| S3["<b>APPROVED</b><br/><b>Issues Pass Code: CP-XXXX</b>"]
        S2 -->|Warden Rejects| Rej2(["❌ <b>REJECTED</b><br/><i>(Warden Remarks Logged)</i>"])
        S2 -->|Student Cancels| Can2(["⛔ <b>CANCELLED</b><br/><i>(Revoked by Student)</i>"])
    end

    subgraph Stage3 ["Stage 3: Security Guard Gate Terminal"]
        direction TB
        S3 -->|Guard Scans Code + Exit Photo| S4["<b>EXITED</b><br/><i>(Student Logged Outside Campus)</i>"]
        S4 -->|Guard Confirms Return + Photo| S5["<b>RETURNED</b><br/><i>(Gate Check-In Confirmed)</i>"]
    end

    subgraph Stage4 ["Stage 4: Automated Audit Engine"]
        direction TB
        S5 --> ReturnCheck{"actualReturn <= expectedReturn?"}
        ReturnCheck -->|Yes| OnTime["✅ <b>Returned On Time</b><br/><i>Outpass closed in good standing</i>"]
        ReturnCheck -->|No| Late["⚠️ <b>LATE RETURN FLAGGED</b><br/><i>Calculates exact overdue minutes</i>"]
    end

    style Start fill:#0f172a,stroke:#334155,color:#fff
    style DayExit fill:#f8fafc,stroke:#cbd5e1,color:#475569
    style S1 fill:#fef3c7,stroke:#f59e0b,color:#78350f,stroke-width:2px
    style S2 fill:#ede9fe,stroke:#8b5cf6,color:#4c1d95,stroke-width:2px
    style S3 fill:#dcfce7,stroke:#22c55e,color:#14532d,stroke-width:2px
    style S4 fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e,stroke-width:2px
    style S5 fill:#f1f5f9,stroke:#64748b,color:#0f172a,stroke-width:2px
    style OnTime fill:#dcfce7,stroke:#16a34a,color:#14532d
    style Late fill:#fee2e2,stroke:#ef4444,color:#7f1d1d
    style Rej1 fill:#fee2e2,stroke:#ef4444,color:#7f1d1d
    style Rej2 fill:#fee2e2,stroke:#ef4444,color:#7f1d1d
    style Can1 fill:#f4f4f5,stroke:#71717a,color:#3f3f46
    style Can2 fill:#f4f4f5,stroke:#71717a,color:#3f3f46
```

### 2. Request-Response Architecture Pipeline
```text
Browser / Postman / React Client
         │
         ▼  (HTTP with withCredentials: true)
   Express Server (server/index.js)
         │
         ├──► CORS Middleware (Validates Origin & enables HttpOnly Cookies)
         ├──► express.json() & express.urlencoded() (Payload Parser)
         ├──► cookieParser() (Populates req.cookies.token)
         │
         ▼  (Router Layer)
   Routes Layer (server/routes/*.routes.js)
         │
         ▼  (Middleware Layer)
   isAuthenticated & authorizeRoles('student' | 'warden' | 'guard')
         │
         ▼  (Controller Layer - MVC Architecture)
   Controllers Layer (server/controllers/*.controller.js)
         │
         ├──► File Buffering (Multer Memory Storage)
         │           │
         │           ▼
         │      Cloudinary Stream (upload_stream)
         │
         ▼  (Data Layer)
   MongoDB Atlas Models (Outpass, User)
```

---

## 📡 API Reference

All protected endpoints require an authenticated `HttpOnly` cookie (`token`). The Parent Consent endpoint is public and secured via a 128-bit cryptographic token.

### 1. Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Request Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | `{ name, email, password, phone, studentProfile }` | Register a new student account |
| `POST` | `/api/auth/login` | Public | `{ email, password }` | Authenticate user & set `HttpOnly` JWT cookie |
| `POST` | `/api/auth/demo-login` | Public | `{ role, profileId }` | 1-Click login for demo personas (`student1`, `student2`, `student3`, `warden`, `guard`) |
| `GET` | `/api/auth/me` | Authenticated | *None* | Fetch authenticated user profile & hydrate React state |
| `PUT` | `/api/auth/profile` | Authenticated | `{ name, phone, studentProfile, staffProfile }` | Update profile information, room, parent contacts |
| `PUT` | `/api/auth/password` | Authenticated | `{ currentPassword, newPassword }` | Securely change user account password |
| `POST` | `/api/auth/logout` | Authenticated | *None* | Clear session cookie |

### 2. Student Endpoints (`/api/student`)
| Method | Endpoint | Access | Request Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/student/apply` | Student | `multipart/form-data` | Submit outpass application with optional proof upload |
| `POST` | `/api/student/demo-apply`| Student | `{ preset }` | 1-Click preset application (`curfew_extension`, `night_out`, `weekend_home`, `emergency`) |
| `GET` | `/api/student/active-pass`| Student | *None* | Fetch active outpass (in `AWAITING_PARENT`, `PENDING`, `APPROVED`, or `EXITED` status) |
| `GET` | `/api/student/my-outpasses`| Student | *None* | Retrieve complete leave history of the logged-in student |
| `PATCH`| `/api/student/:id/cancel`| Student | *None* | Cancel pending or parent-awaiting outpass |

### 3. Parent Consent Endpoints (`/api/parent`)
| Method | Endpoint | Access | Request Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/parent/consent/:token` | Public (Token) | *None* | Retrieve leave application details for parental review |
| `POST` | `/api/parent/consent/:token/respond` | Public (Token) | `{ decision, remarks }` | Submit parental decision (`decision: "APPROVE" | "DENY"`) |

### 4. Warden Endpoints (`/api/warden`)
| Method | Endpoint | Access | Request Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/warden/pending` | Warden | *None* | Fetch review queue of parent-approved outpasses |
| `GET` | `/api/warden/stats` | Warden | *None* | Real-time counts (Pending Approvals, Outside Campus, Overdue Returns) |
| `GET` | `/api/warden/all` | Warden | `?status=...&curfew=...&search=...` | Search, filter, and audit all hostel outpass records |
| `PATCH`| `/api/warden/:id/review` | Warden | `{ action, remarks }` | Approve (generates `CP-XXXX` passcode) or Reject outpass with remarks |

### 5. Security Guard Endpoints (`/api/guard`)
| Method | Endpoint | Access | Request Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/guard/lookup/:query` | Guard | *None* | Search outpass by Pass Code (`CP-XXXX`) or Student Roll Number |
| `GET` | `/api/guard/feeds` | Guard | *None* | Live lists of "Ready for Exit" and "Currently Outside" students |
| `PATCH`| `/api/guard/:id/exit` | Guard | `multipart/form-data` | Confirm campus exit & capture gate photo (`status: "EXITED"`) |
| `PATCH`| `/api/guard/:id/return` | Guard | `multipart/form-data` | Confirm return, capture gate photo & compute `lateMinutes` (`status: "RETURNED"`) |

---

## 💻 Local Setup

Follow these step-by-step instructions to run CampusPass locally on your development machine.

### Prerequisites
* **Node.js** (v18.x or v20.x recommended)
* **npm** (v9.x or later)
* **MongoDB Atlas** database URI or local MongoDB instance
* **Cloudinary** account (free tier) for image hosting

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/CampusPass.git
cd CampusPass
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file inside `server/` (refer to [Environment Variables](#-environment-variables)):
```env
PORT=7000
CLIENT_URL=http://localhost:5175
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
Start the backend development server:
```bash
npm run dev
```
Backend API will be live at `http://localhost:7000`.

### 3. Frontend Setup
Open a new terminal window:
```bash
cd client
npm install
```
Start the frontend Vite development server:
```bash
npm run dev
```
Client will be live at `http://localhost:5175`.

---

## 🔑 Environment Variables

### Server (`server/.env`)
| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `PORT` | Express server port | `7000` |
| `CLIENT_URL` | Frontend origin for CORS and cookie exchange | `http://localhost:5175` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/campuspass` |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | `super_secret_jwt_key_2026` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary REST API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abcdefghijklmnopqrstuvwxyz` |

### Client (`client/.env`)
| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL of the backend REST API | `http://localhost:7000/api` |

*(Note: In local development, `api.js` defaults to `http://localhost:7000/api` if `VITE_API_BASE_URL` is omitted).*

---

## 🚀 Deployment

CampusPass is architected for clean separated-tier cloud deployment on free tiers:

```text
┌─────────────────────────────────┐        ┌─────────────────────────────────┐
│         Vercel (Client)         │───────►│         Render (Server)         │
│     https://campuspass.vercel   │◄───────│   https://campuspass.onrender   │
└─────────────────────────────────┘        └─────────────────────────────────┘
                 │                                          │
                 ▼                                          ▼
     VITE_API_BASE_URL=Render                   CLIENT_URL=Vercel & Mongo Atlas
```

> **Live Deployment URL:** **[INSERT_DEPLOYED_FRONTEND_URL_HERE](INSERT_DEPLOYED_FRONTEND_URL_HERE)**

### 1. Backend Deployment (Render / Railway)
1. Create a **New Web Service** pointing to the `CampusPass` repository with root directory `server`.
2. **Build Command:** `npm install`
3. **Start Command:** `npm start`
4. Set the Environment Variables:
   * `PORT=7000`
   * `NODE_ENV=production`
   * `MONGO_URI=<your_atlas_connection_string>`
   * `JWT_SECRET=<your_strong_secret>`
   * `CLOUDINARY_CLOUD_NAME=<your_cloud_name>`
   * `CLOUDINARY_API_KEY=<your_api_key>`
   * `CLOUDINARY_API_SECRET=<your_api_secret>`
   * `CLIENT_URL=INSERT_DEPLOYED_FRONTEND_URL_HERE`

### 2. Frontend Deployment (Vercel)
1. Import repository into Vercel with root directory set to `client`.
2. **Framework Preset:** Vite
3. Set the Environment Variable:
   * `VITE_API_BASE_URL=https://<your-render-app>.onrender.com/api`
4. Deploy. Vercel automatically builds and deploys the optimized production bundle.

---

## 🎥 Demo Video

> **Video Duration:** 3–5 minutes  
> **Direct Demo Video Link:** **[Watch Demo Video on YouTube / Loom](INSERT_DEMO_VIDEO_YOUTUBE_URL_HERE)**

### Video Walkthrough Structure:
* **0:00 – 0:45 | Problem Statement:** The dangers of manual paper outpass registers, proxy exits, and absence of parent verification in university hostels.
* **0:45 – 1:30 | Multi-Persona Student Portal:** Selecting student profiles (**Rahul Verma**, **Ananya Sharma**), launching 1-click presets (**Curfew Extension** past 10:30 PM), and inspecting the active digital pass.
* **1:30 – 2:30 | Accountless Parent Consent:** Opening the tokenized link (`/parent-consent/:token`), reviewing leave details, and granting permission with remarks.
* **2:30 – 3:30 | Warden Review & Passcode Generation:** Reviewing parent authorization badges in the warden queue and approving with automatic `CP-XXXX` passcode generation.
* **3:30 – 4:45 | Guard Terminal & Automated Late Engine:** Looking up passcode `CP-XXXX`, taking exit gate photos, marking returns, and demonstrating the automated late return calculation engine.

---

## 🧪 Instant 1-Click Evaluation Walkthrough

CampusPass is engineered for effortless academic grading and developer evaluation with **zero setup blockers**. You can test the entire multi-role workflow in under 3 minutes using the 1-Click Evaluation buttons on the login screen.

> [!TIP]
> **Zero Database Seeding Required:** Clicking any demo persona on the login screen automatically seeds that exact role and profile into MongoDB Atlas on the fly. You never have to run manual SQL/Mongo seed scripts.

### Step 1: 👨‍🎓 Student 1-Click Persona Login
1. Open the application (`http://localhost:5175/login` or the live deployed URL).
2. Click the **`Student ▾`** button and select any student persona:
   * **Rahul Verma** (`22CSE104` &bull; BH-2 Boys Hostel)
   * **Ananya Sharma** (`22ECE205` &bull; GH-1 Girls Hostel)
   * **Rohan Gupta** (`22MECH310` &bull; BH-2 Boys Hostel)
3. You are redirected straight to `/dashboard`.

### Step 2: 🌙 Instant 1-Click Outpass Preset
1. Under **1-Click Demo Requests**, click **`🌙 Curfew Extension (11:15 PM)`**.
2. An outpass is instantly created with valid dynamic timestamps and enters **Stage 1: Awaiting Parent Authorization**.
3. Notice the amber Stage 1 banner with the button: **`[ 🔗 Open Parent Consent Portal ]`**.

### Step 3: 👨‍👩‍👧 Accountless Parent Authorization
1. Click **`[ Open Parent Consent Portal ]`** (opens `/parent-consent/:token` in a new tab).
2. Inspect the student details, curfew return time, and destination.
3. Add a parent note (e.g., *"Permission granted, return on time."*) and click **Grant Leave Permission**.
4. The consent portal permanently transitions to **Verified** status.

### Step 4: 🛡️ Warden Review & Passcode Generation
1. Click **Logout** and return to the login screen.
2. Click the **`Warden`** 1-click button (logs in as Chief Warden **Dr. A. K. Sharma**).
3. The outpass is sitting in the Warden Review Queue with a green **Parent Consent Verified** badge!
4. Click **Review Request**, inspect the student details and parent note, and click **Approve Outpass**.
5. The system issues a unique 7-character Pass Code (e.g. `CP-4821`).

### Step 5: 👮 Gate Security Verification & Exit Photo
1. Click **Logout** and click the **`Guard`** 1-click button (logs in as **Officer Vikram Singh**).
2. The student appears in the **Ready for Exit** live feed!
3. Alternatively, type the passcode (e.g., `CP-4821`) or the student's Roll Number (`22CSE104`) into the search bar.
4. Click **Confirm Exit** (gate facial snapshot is logged to Cloudinary). The status transitions to `EXITED`.

### Step 6: ⏱️ Return Verification & Late Audit Engine
1. In the Guard terminal, switch to the **Currently Outside** feed.
2. The student is logged as outside campus with their departure timestamp.
3. Click **Confirm Return** (captures return photo).
4. If returned past approved return time, the engine calculates the exact `lateMinutes`, records `wasLate: true`, and displays a red overdue alert banner.

---

## 🌐 Production Architecture vs Evaluation Mode

In enterprise production deployments, university IT infrastructure differs from local grading environments. CampusPass is intentionally designed to reflect enterprise standards while providing smooth developer ergonomics:

| Component | Enterprise Production Architecture | Local Academic Evaluation Mode |
| :--- | :--- | :--- |
| **Parent Consent Delivery** | Dispatched via SMS / WhatsApp Webhooks (Twilio / Gupshup API) and Transactional Email (SendGrid / AWS SES) directly to parent's phone. | Generated token returned in response; rendered as a 1-click test button on the Student Dashboard. |
| **Parent Authentication** | Public single-use 128-bit cryptographic token URL tapped directly from SMS (no password/app required). | Public single-use 128-bit cryptographic token URL (`/parent-consent/:token`). |
| **Gate Verification** | Optical 2D handheld barcode/QR scanners scanning dynamic encrypted QR code on student's mobile screen. | Dual-mode keyboard lookup by 7-character Pass Code (`CP-4821`) or Student Roll Number (`22CSE104`). |
| **Gate Facial Capture** | Industrial USB barrier kiosk camera capturing student face via WebRTC API on gate trigger. | File upload input with automated Cloudinary photo placeholder fallback. |
| **10:30 PM Hostel Curfew** | University gate turnstiles permit daytime exit with Student ID card; outpass strictly required for returns past 10:30 PM. | Validated in controller; same-day outings before 10:30 PM rejected with polite rule explanation. |
| **Late Return Escalation** | Automated SMS alert to parents + push notification to Chief Warden's emergency desk upon overdue gate return. | Real-time `lateMinutes` calculation engine, red overdue alert banner on guard terminal, and MongoDB audit flags. |
| **Curfew Audit Cron** | Nightly background cron job at 10:30 PM (`0 22 * * *` via BullMQ/Agenda) flagging unreturned students. | Dynamic parallel aggregation queries (`GET /api/warden/stats`) computing live overdue students. |
| **Media Persistence** | Multi-region Cloudinary CDN with buffer streaming (`multer.memoryStorage()`). | Cloudinary CDN with buffer streaming (zero server disk dependency). |

---

## 📄 License
This project was developed for the **End-Term Software Engineering Project (Year 2 MERN Stack)**. Licensed under the MIT License.
