import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import PatientDashboard from "./components/patient/PatientDashboard";
import ProviderDashboard from "./components/provider/ProviderDashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Patient Dashboard - Full page layout with sidebar */}
        <Route path="/patient/dashboard" element={<PatientDashboard />} />

        {/* All other routes with Header */}
        <Route path="*" element={<LayoutWithHeader />} />
      </Routes>
    </Router>
  );
}

/* ---------- Layout Component ---------- */

function LayoutWithHeader() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          {/* Public / Landing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/public-health" element={<PublicHealthPage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Other Patient routes */}
          <Route path="/patient/profile" element={<PatientProfile />} />
          <Route path="/patient/goals" element={<GoalTracker />} />
          <Route path="/patient/wellness" element={<WellnessScorePage />} />
          <Route path="/patient/symptoms" element={<SymptomChecker />} />
          <Route path="/patient/reminders" element={<RemindersPage />} />
          <Route path="/patient/emergency-card" element={<EmergencyCardPage />} />

          {/* Provider area */}
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          <Route
            path="/provider/patients/:patientId"
            element={<ProviderPatientDetail />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

/* ---------- Layout Components ---------- */

function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-emerald-400">
          HCL Health Portal
        </Link>

        <nav className="flex gap-4 text-sm">
          <Link className="hover:text-emerald-300" to="/public-health">
            Public Health
          </Link>
          <Link className="hover:text-emerald-300" to="/patient/dashboard">
            Patient
          </Link>
          <Link className="hover:text-emerald-300" to="/provider/dashboard">
            Provider
          </Link>
          <Link className="hover:text-emerald-300" to="/login">
            Login
          </Link>
          <Link className="hover:text-emerald-300" to="/register">
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* ---------- Page Components (MVP skeleton) ---------- */

// Landing + Business use case
function LandingPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">
        HCLTech Hackathon — Healthcare Wellness & Preventive Care Portal
      </h1>
      <p className="text-slate-300">
        A comprehensive portal to help patients achieve wellness goals, stay
        compliant with preventive checkups, and give providers visibility into
        patient health and adherence.
      </p>

      <div className="grid gap-4 md:grid-cols-3 mt-6">
        <Card title="Patients" to="/patient/dashboard" description="Track goals, reminders, and wellness score." />
        <Card title="Providers" to="/provider/dashboard" description="Monitor patient compliance and wellness." />
        <Card
          title="Public Health Info"
          to="/public-health"
          description="View general health education and privacy policy."
        />
      </div>
    </section>
  );
}

function PublicHealthPage() {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">Public Health Information</h2>
      <p className="text-slate-300">
        General health education, preventive care guidance, and privacy policy
        for all users.
      </p>
      <ul className="list-disc list-inside space-y-1 text-slate-300">
        <li>Basic lifestyle and wellness tips</li>
        <li>Vaccination and screening guidelines</li>
        <li>Portal privacy & security policy</li>
      </ul>
    </section>
  );
}

/* ---------- Auth Pages ---------- */

function LoginPage() {
  return (
    <section className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-semibold">Login</h2>
      <p className="text-sm text-slate-400">
        Secure authentication with JWT-based sessions and role-based access
        control.
      </p>
      {/* TODO: Hook this to backend /api/auth/login */}
      <form className="space-y-3">
        <input
          className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Email"
        />
        <input
          type="password"
          className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Password"
        />
        <button className="w-full rounded bg-emerald-500 py-2 font-medium hover:bg-emerald-400">
          Login
        </button>
      </form>
    </section>
  );
}

function RegisterPage() {
  return (
    <section className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-semibold">Register</h2>
      <p className="text-sm text-slate-400">
        Create an account as a Patient or Healthcare Provider. Includes consent
        for data usage.
      </p>
      {/* TODO: Hook this to /api/auth/register */}
      <form className="space-y-3">
        <input
          className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Name"
        />
        <input
          className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Email"
        />
        <select className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2">
          <option>Patient</option>
          <option>Healthcare Provider</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" className="accent-emerald-500" />
          I consent to processing of my health data for wellness & preventive
          care.
        </label>
        <button className="w-full rounded bg-emerald-500 py-2 font-medium hover:bg-emerald-400">
          Register
        </button>
      </form>
    </section>
  );
}

/* ---------- Patient Area ---------- */

// PatientDashboard is now imported from components/patient/PatientDashboard.jsx

function PatientProfile() {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">Profile Management</h2>
      <p className="text-slate-300">
        Manage personal info, allergies, medications, and emergency contact.
      </p>
      {/* TODO: Bind to /api/patients/:id/profile */}
    </section>
  );
}

function GoalTracker() {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">Goal Tracker</h2>
      <p className="text-slate-300">
        Log daily goals (steps, water intake, sleep) and visualize progress.
      </p>
      {/* TODO: Bind to /api/patients/:id/goals & /api/wellness */}
    </section>
  );
}

function WellnessScorePage() {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">Wellness Score</h2>
      <p className="text-slate-300">
        Personalized health index combining activity, sleep, and preventive
        compliance (0–100).
      </p>
      {/* TODO: Chart of score over time from /api/patients/:id/wellness */}
    </section>
  );
}

function SymptomChecker() {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">Symptom Checker</h2>
      <p className="text-slate-300">
        Rule-based triage outcomes (self-care, see GP, emergency) with safety
        disclaimers.
      </p>
      {/* TODO: Bind to /api/symptoms/report & /api/symptoms/history/:patientId */}
    </section>
  );
}

function RemindersPage() {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">Reminders</h2>
      <p className="text-slate-300">
        Water and medication reminder schedules, adherence tracking, and
        calendar view.
      </p>
      {/* TODO: Bind to /api/reminders endpoints */}
    </section>
  );
}

function EmergencyCardPage() {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">QR Emergency Health Card</h2>
      <p className="text-slate-300">
        Configure your emergency card and QR code with minimal yet critical
        medical info.
      </p>
      {/* TODO: Bind to /api/patients/:id/emergency-card & /emergency/:publicToken */}
    </section>
  );
}

/* ---------- Provider Area ---------- */



function ProviderPatientDetail() {
  // You can read :patientId via useParams() when you hook it up
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">Patient Detail</h2>
      <p className="text-slate-300">
        Compliance overview, wellness score, and doctor advisory notes for a
        specific patient.
      </p>
      {/* TODO: Bind to /api/providers/:id/patients/:patientId/compliance & /api/advisories */}
    </section>
  );
}

/* ---------- Small UI helper ---------- */

function Card({ title, description, to }) {
  return (
    <Link
      to={to}
      className="block rounded-lg border border-slate-800 bg-slate-900/70 p-4 hover:border-emerald-400 hover:bg-slate-900 transition"
    >
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </Link>
  );
}

export default App;