# 🎓 CampusPass — Digital Hostel Outpass & Gate Verification System

A full-stack MERN platform that replaces paper hostel outpasses with a secure, role-based digital workflow featuring student leave applications, warden approvals with unique passkeys, and security guard gate verification with photo capture and automated late return tracking.

---

## 🚀 Key Features

* **Student Portal:**
  * Apply for Day Out, Night Out, Weekend Home, and Emergency leaves.
  * Upload proof documents (ticket / medical certificate / parent letter) via Cloudinary.
  * Live Active Digital Pass with dynamic status badge and generated Pass Code.
  * Complete outpass history tracking.

* **Warden Dashboard:**
  * Real-time review queue of pending outpass applications.
  * View student details, room numbers, and inspect uploaded proof documents.
  * One-click Approve (generates unique Pass Code) or Reject (with remarks).
  * Live metrics: Pending Requests, Students Outside Campus, and Overdue Returns.

* **Security Guard Gate Terminal:**
  * Fast lookup by Pass Code or Student Roll Number.
  * "Ready for Exit" and "Currently Outside" live feeds.
  * Gate photo capture at Exit and Return to prevent proxy outpass abuse.
  * Automated Late Return Detection with exact overdue minute calculation.

---

## 🛠️ Technology Stack

* **Frontend:** React 19, Vite, Tailwind CSS, Axios, Lucide Icons
* **Backend:** Node.js, Express 5, REST API (MVC Architecture)
* **Database:** MongoDB & Mongoose
* **Authentication:** Stateless JWT stored in secure `HttpOnly` cookies + Bcrypt password hashing
* **File & Media Storage:** Multer + Cloudinary SDK
