
# Healthcare Wellness & Preventive Care Portal  
HCLTech Hackathon – Supercharging Progress

A full-stack healthcare solution designed to promote preventive care, daily wellness tracking, and enable patient–provider collaboration to ensure healthier lives through timely action and habit improvement.

---

## Problem Statement

Healthcare is mostly reactive. Patients often take action only when symptoms become serious, leading to delayed diagnosis and increased risk.

### Solution
Shift healthcare from reactive to preventive through:
- Daily wellness tracking
- Automated preventive care reminders
- Compliance monitoring for doctors
- Privacy-first patient data management

---

## Key Features

| Feature | Patient | Provider | Status |
|--------|:------:|:--------:|:-----:|
| Secure Login / Signup (JWT) | Yes | Yes | Completed |
| Wellness Dashboard (Steps, Sleep, Water) | Yes | No | Completed |
| Preventive Care Reminder System | Yes | Yes | In Progress |
| Provider Dashboard | No | Yes | In Progress |
| Health Information Page | Yes | Yes | Completed |
| Profile Management | Yes | No | Completed |

---

## User Roles

| Role | Capabilities |
|------|--------------|
| Patient | Log wellness data, view progress, receive preventive reminders, manage profile |
| Provider | View patient preventive care compliance & wellness status |

---

## System Architecture & User Flow

![System Architecture](assets/architecture.jpeg)

---

## Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React.js, CSS Modules / Sass |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Authentication | JWT, Bcrypt |
| API Style | REST APIs |
| Tools | Git, GitHub |

---

## Security & Privacy Considerations

- JWT-based authentication for secure access control
- Password hashing with bcrypt
- Role-based access (RBAC)
- Consent-based data usage
- No sensitive data exposed in logs
- Aligned with HIPAA security principles

---

## Database Models (MongoDB)

### Patient Model
```js
{
  name,
  email,
  dob,
  sex,
  allergies,
  medications,
  conditions,
  emergencyContact
}
````

### Wellness Entry Model

```js
{
  patientId,
  steps,
  sleepHours,
  waterIntake,
  date
}
```

### Reminders Model

```js
{
  patientId,
  type,
  schedule,
  enabled
}
```

---

## API Endpoints (Summary)

| Method | Endpoint                    | Description                        |
| ------ | --------------------------- | ---------------------------------- |
| POST   | /api/auth/register          | Register a new user                |
| POST   | /api/auth/login             | Authenticate user and return token |
| GET    | /api/patients/:id/dashboard | Fetch dashboard data               |
| POST   | /api/wellness               | Submit wellness logs               |
| GET    | /api/providers/:id/patients | Provider view of patients          |

Protected routes require:

```
Authorization: Bearer <token>
```

---

## Setup Guide

### Clone Repository

```bash
git clone https://github.com/<your_username>/HCL_Hackathon.git
cd HCL_Hackathon
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```
PORT=5000
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret_key>
```

Start backend:

```bash
npm start
```

Backend: [http://localhost:5000](http://localhost:5000)

---

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend: [http://localhost:3000](http://localhost:3000)

---

## Testing

Backend

```bash
cd backend
npm test
```

Frontend

```bash
cd frontend
npm test
```

---

## Future Enhancements

| Feature                  | Benefit                                |
| ------------------------ | -------------------------------------- |
| QR Emergency Health Card | Faster medical response in emergencies |
| Wellness Score Algorithm | Real-time health risk analysis         |
| Symptom Checker          | Basic triage guidance                  |
| Push Notifications       | Better compliance and reminders        |
| Wearable Integration     | Automated wellness data logging        |

---

## Impact

* Encourages healthy lifestyle habits
* Enables proactive and preventive healthcare
* Helps providers prioritize high-risk patients
* Designed to scale across large user groups successfully

---

## Conclusion

The portal is a secure and scalable healthcare platform that drives preventive healthcare by tracking daily wellness, ensuring timely checkups, and providing doctors with insights into patient compliance.

---

## Acknowledgment

Thanks to HCLTech Hackathon and open-source community support.

```

---


