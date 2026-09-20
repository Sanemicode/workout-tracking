Workout Tracker

A full-stack web application designed to help users track, analyze, and share their fitness activities, workouts, and personal statistics. Developed as part of an advanced web technologies coursework.

---

Key Features

Secure Authentication**: JWT-based authentication with secure password hashing on the backend.
Interactive Dashboard**: Real-time workout logging, editing, and visual analytics using dynamic charts (`ng2-charts`).
Advanced History & Filtering**: Comprehensive workout history with sorting by date and filtering by activity type.
Public Profiles & Custom Links**: Each user gets a unique shareable profile link (e.g., `/u/username`) to showcase their public workout statistics.
Internationalization (i18n)**: Full interface localization supporting **Ukrainian (UA)** and **English (EN)** via `@ngx-translate/core`.
Responsive UI**: Clean, modern design optimized for both desktop and mobile devices.

---

Tech Stack

Frontend:
Framework: Angular 18 (Standalone Components)
Internationalization: `@ngx-translate/core`
Charts: `ng2-charts` / Chart.js
Routing & State: Angular Router, LocalStorage

Backend:
Framework: Python (FastAPI / Flask - *залежно від того, що використовуєш*)
Database: SQLite / PostgreSQL
Security: PyJWT, Passlib (Password Hashing)


---

Getting Started & Installation

1. Clone the repository
bash
git clone [https://github.com/Sanemicode/workout-tracking](https://github.com/Sanemicode/workout-tracking)

---

Run a backend
Example for Python/FastAPI
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\Activate
pip install -r requirements.txt
uvicorn main:app --reload

Open your browser and navigate to http://localhost:8000/docs

---

Run the Frontend
cd frontend/tracker-app
npm install
ng serve

Open your browser and navigate to http://localhost:4200.


---

Author:
Me
