# 🧠 Mentorium - Server

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express.js-Server-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green)

This is the **server-side** codebase for **Mentorium**, an educational platform designed to streamline class management, teacher onboarding, enrollment, assignment submissions, feedback, and more.

Built with **Express.js**, **MongoDB**, and **Firebase**, the server handles RESTful APIs, secure role-based access control, and dynamic data interactions for various user roles like Admin, Teacher, and Student.

---

## 🚀 Features

- 🔐 JWT and Firebase-based Authentication
- 👩‍🏫 Teacher Request and Approval System
- 🏫 Class Management (Add, Update, Delete, Approve)
- 👨‍🎓 Student Enrollment and Class Access
- 📝 Assignment Creation and Submission
- 📊 Stats and Dashboards ( Admin, Teacher and Student )
- 💬 Feedback System
- 💵 Stripe Payment Integration

---

## 🛠️ Technologies Used

- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **Firebase Admin SDK**
- **Stripe API**
- **TanStack Query (Frontend Integration)**
- **SweetAlert2 (Frontend Integration)**
- **Vercel (Deployment)**

---

## 📁 Folder Structure

```
mentorium-server/
│
├── src/
│   ├── config/               # Configuration files (DB, Firebase, Stripe)
│   ├── controllers/          # Request handler logic
│   ├── middlewares/          # Auth and role-based verification
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express routes for each feature
│   ├── app.js                # App config and middleware setup
│   └── index.js              # Entry point
│
├── .env                      # Environment variables
├── firebase-adminsdk.json    # Firebase Admin credentials
├── keyConvert.js             # Firebase key parser
├── package.json
└── vercel.json               # Vercel deployment config
```

---

## 🔐 Environment Variables

Create a `.env` file at the root and include:

```
PORT=5000
DB_URI=your_mongodb_uri
FB_SERVICE_KEY=Firebase_Service_Key
PAYMENT_SK_KEY=your_stripe_key
```

> ⚠️ Ensure `.env` and `firebase-adminsdk.json` are listed in `.gitignore`.

---

## 🚦 API Routes Overview

| Resource    | Route File             | Prefix               |
| ----------- | ---------------------- | -------------------- |
| Assignments | `assignmentRoutes.js`  | `/assignmentRoutes`  |
| Classes     | `classRoutes.js`       | `/classRoutes`       |
| Enrollments | `enrollmentsRoutes.js` | `/enrollmentsRoutes` |
| Feedback    | `feedbackRoutes.js`    | `/feedbackRoutes`    |
| Stats       | `statsRoutes.js`       | `/statsRoutes`       |
| Submissions | `submissionRoutes.js`  | `/submissionRoutes`  |
| Users       | `userRoutes.js`        | `/userRoutes`        |

---

## 🧪 Running Locally

```bash
git clone https://github.com/rafiqmia65/mentorium-server.git
npm install
npm run dev
```

> Uses `nodemon` for development.

---

## 🧾 License

This project is licensed under the [MIT License](LICENSE).
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

---

## 🙌 Acknowledgments

Special thanks to the contributors and developers involved in the **Mentorium** platform.

---
