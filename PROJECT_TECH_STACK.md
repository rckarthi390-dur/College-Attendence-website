# 🎓 College Attendance Management System — Technology Stack & Architecture

## 📋 Overview
This project is a modern, full-stack, responsive College Attendance Management System featuring real-time cloud synchronization, dual attendance modes (Period-wise & Daily Work), role-based authentication, interactive analytics, and audit logging.

---

## 🛠️ 1. Programming Languages & Core Technologies
| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Scripting** | **JavaScript (ES6+) / JSX** | Modern React components, async state handling, and data transformation |
| **Markup** | **HTML5** | Semantic structure, responsive viewport settings, and accessible layouts |
| **Styling** | **CSS3 & Tailwind CSS** | Utility-first styling, glassmorphism, responsive flex/grid layouts, custom gradients |
| **Backend Runtime** | **Node.js** | High-performance asynchronous JavaScript runtime environment for backend APIs |

---

## 🖥️ 2. Frontend (Client-side Architecture)
* **Framework / Library**: **React 18** (Functional components, React Hooks, Context API)
* **Build Tool & Bundler**: **Vite 5** (Fast HMR, optimized production minification and chunking)
* **State Management**:
  * `AppContext.jsx`: Centralized store for users, courses, departments, leaves, attendance records, and settings.
  * `AuthContext.jsx`: Multi-role session management (Admin, Faculty, Student with Roll Number & DOB authentication).
  * `ToastContext.jsx`: Real-time interactive toast notification dispatch system.
* **Data Visualization & Charts**: **Recharts** (Bar charts, percentage progress rings, monthly attendance trend analysis)
* **PDF & Document Reports**: **jsPDF**, **jspdf-autotable**, **html2canvas** (Client-side downloadable official institutional PDF reports)
* **Storage & Cloud Sync**:
  * **Offline Cache**: Browser `localStorage`
  * **Online Sync Engine**: Real-time background `fetch()` polling and auto-sync with the Render cloud backend

---

## ⚙️ 3. Backend (Server-side Architecture)
* **Framework**: **Express.js** (RESTful API architecture)
* **Database**: **Lowdb / JSON Document Database** (`db.json` document store)
* **Authentication & Security**:
  * **bcryptjs**: Secure password hashing
  * **jsonwebtoken (JWT)**: Tokenized session validation
  * **CORS**: Cross-Origin Resource Sharing middleware configured for multi-device clients
* **Unique ID Generation**: **uuid (v4)**

---

## 🌐 4. Cloud Infrastructure & Hosting
* **Static Client Hosting**: **GitHub Pages** (Automated CI/CD via GitHub Actions)
* **API & Backend Cloud Hosting**: **Render.com** (Continuous deployment from GitHub `main` branch)
* **24/7 Server Liveness Monitor**: **UptimeRobot** (Continuous 5-minute health check pings to eliminate cold starts)
* **Version Control**: **Git & GitHub** (`rckarthi390-dur/College-Attendence-website`)

---

## 🌟 5. Key System Features
1. **Dual Attendance Tracking Modes**:
   * **Period-wise Attendance**: Granular tracking per course, period, and subject.
   * **Daily Work Attendance**: Institution-level day roster.
2. **Auto-Calculation Engine**: Automatically aggregates and stores Daily Attendance from Period-wise attendance.
3. **Manual Working Days Target**: Configurable Total College Working Days for accurate attendance percentage metrics.
4. **Role-Based Access Control**:
   * **Administrator**: Manage users, courses, departments, HODs, system policies, and audit logs.
   * **Faculty**: Mark/update attendance, review leave/OD requests, view class analytics.
   * **Student**: View personalized attendance breakdown, trends, history, and apply for Leave/OD.
5. **Universal Date Standard**: Standardized `DD/MM/YYYY` date representation across all tables, forms, and logs.
6. **Cross-Device Real-Time Sync**: Instant synchronization across mobiles, laptops, and tablets.
