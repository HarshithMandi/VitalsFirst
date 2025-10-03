VitalsFirst – Healthcare Patient Triage and Scheduling System
📌 Project Overview

VitalsFirst is a role-based healthcare management system designed to streamline patient triaging, scheduling, and hospital administration. The platform allows patients, doctors, nurses, and administrators to log in through a secure portal and access role-specific dashboards. It integrates triage prioritization, appointment scheduling, staff allocation, and report generation into one unified system.

🚀 Features

Role-Based Login Portal

Nurse, Doctor, Administrator, and Patient access.

JWT-based authentication with protected routes.

Dashboards by Role

Nurse: Triage module, staff allocation, alerts & notifications.

Doctor: Triage results, scheduling, report generation, emergency alerts.

Administrator: Staff allocation, workload reports, scheduling management.

Patient: Registration, appointment booking/rescheduling, triage status updates, notifications.

Healthcare-Specific Functions

Rule-based + ML-augmented triage suggestions (future scope).

Real-time notifications for emergencies.

Report generation for compliance and workload management.

🛠️ Tech Stack

Frontend: React + Tailwind CSS

Backend: Node.js + Express.js

Database: MongoDB with Mongoose

Authentication: JWT (JSON Web Tokens)

Deployment: Ready for Cloud (AWS / Vercel / Render)

📂 Project Structure
VitalsFirst/
│
├── client/                 # React frontend
│   ├── public/             # Static assets
│   ├── src/                # Components, pages, styles
│   └── package.json
│
├── server/                 # Express backend
│   ├── models/             # Mongoose models (User, Patient, Appointment)
│   ├── routes/             # API routes (auth, triage, scheduling, reports)
│   ├── controllers/        # Route controllers
│   ├── config/             # DB connection, JWT middleware
│   └── package.json
│
├── .env.example            # Sample environment variables
├── README.md               # Project documentation
└── package.json            # Root config

⚙️ Installation & Setup

Clone the repository

git clone <repo-url>
cd VitalsFirst


Setup Backend

cd server
npm install
cp .env.example .env    # Update MongoDB URI, JWT secret
npm start


Setup Frontend

cd client
npm install
npm run dev


Access the app
Open http://localhost:5173
 for the frontend.
The backend runs on http://localhost:5000.

🔑 Default Roles & Login

Admin: Can manage staff allocation, scheduling, reports.

Doctor: Can access triage results, appointments, reports.

Nurse: Can triage patients and manage alerts.

Patient: Can register, login, and book appointments.

(Add default seeded users here once you configure them in the database.)

📈 Future Enhancements

Integration with Electronic Health Records (EHR).

AI/ML-based triage recommendation engine.

Push notifications & SMS alerts.

Cloud deployment with CI/CD.
