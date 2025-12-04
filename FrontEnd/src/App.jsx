import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import PatientDashboard from "./components/patient/PatientDashboard";
import PatientProfile from "./components/patient/PatientProfile";
import GoalTracker from "./components/patient/GoalTracker";
import WellnessScore from "./components/patient/WellnessScore";
import SymptomChecker from "./components/patient/SymptomChecker";
import Reminders from "./components/patient/Reminders";
import EmergencyCard from "./components/patient/EmergencyCard";
import ProviderDashboard from "./components/provider/ProviderDashboard";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import PublicHealth from "./components/PublicHealth";

function App() {
  return (
    <Router>
      <Routes>
        {/* Patient routes with sidebar */}
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
        <Route path="/patient/goals" element={<GoalTracker />} />
        <Route path="/patient/wellness" element={<WellnessScore />} />
        <Route path="/patient/symptoms" element={<SymptomChecker />} />
        <Route path="/patient/reminders" element={<Reminders />} />
        <Route path="/patient/emergency-card" element={<EmergencyCard />} />
        
        {/* Provider routes */}
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        <Route path="/provider/patients/:patientId" element={<ProviderPatientDetail />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Public routes */}
        <Route path="/" element={<LayoutWithHeader><LandingPage /></LayoutWithHeader>} />
        <Route path="/public-health" element={<LayoutWithHeader><PublicHealth /></LayoutWithHeader>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

/* ---------- Layout Component ---------- */

function LayoutWithHeader({ children }) {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header user={user} logout={logout} />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

function Header({ user, logout }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-emerald-400">
          HCL Health Portal
        </Link>

        <nav className="flex gap-4 text-sm items-center">
          <Link className="hover:text-emerald-300" to="/public-health">
            Public Health
          </Link>
          {user ? (
            <>
              {user.role === 'patient' && (
                <Link className="hover:text-emerald-300" to="/patient/dashboard">
                  Dashboard
                </Link>
              )}
              {user.role === 'provider' && (
                <Link className="hover:text-emerald-300" to="/provider/dashboard">
                  Dashboard
                </Link>
              )}
              <span className="text-slate-400">{user.name}</span>
              <button
                onClick={logout}
                className="hover:text-red-400"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="hover:text-emerald-300" to="/login">
                Login
              </Link>
              <Link className="hover:text-emerald-300" to="/register">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

/* ---------- Landing Page ---------- */

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Healthcare Wellness Portal
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
            Your comprehensive health companion for wellness tracking, preventive care, and better health outcomes
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card
            title="For Patients"
            to="/patient/dashboard"
            description="Track your wellness goals, manage preventive care, and stay on top of your health journey."
            icon="👤"
            gradient="from-emerald-500 to-emerald-700"
            features={[
              "Wellness Goals Tracking",
              "Preventive Care Reminders",
              "Personalized Health Score",
              "Symptom Checker",
              "Emergency Health Card"
            ]}
          />
          <Card
            title="For Healthcare Providers"
            to="/provider/dashboard"
            description="Monitor patient compliance, track wellness scores, and provide better care coordination."
            icon="👨‍⚕️"
            gradient="from-blue-500 to-indigo-700"
            features={[
              "Patient Compliance Overview",
              "Wellness Score Tracking",
              "Preventive Care Insights",
              "Advisory Notes",
              "Patient Management"
            ]}
          />
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link
            to="/public-health"
            className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6 hover:border-emerald-500/50 transition-all group"
          >
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors">
              Health Information
            </h3>
            <p className="text-sm text-slate-400">
              Access health education, vaccination guidelines, and privacy information
            </p>
          </Link>

          <Link
            to="/login"
            className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6 hover:border-emerald-500/50 transition-all group"
          >
            <div className="text-4xl mb-3">🔐</div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors">
              Sign In
            </h3>
            <p className="text-sm text-slate-400">
              Access your account to manage your health and wellness
            </p>
          </Link>

          <Link
            to="/register"
            className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6 hover:border-emerald-500/50 transition-all group"
          >
            <div className="text-4xl mb-3">✨</div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors">
              Get Started
            </h3>
            <p className="text-sm text-slate-400">
              Create your account and begin your wellness journey today
            </p>
          </Link>
        </div>

        {/* Value Proposition */}
        <div className="bg-gradient-to-r from-emerald-900/30 to-blue-900/30 border border-emerald-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Why Choose Our Portal?</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div>
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold mb-1">Goal-Oriented</h3>
              <p className="text-sm text-slate-300">Set and track personalized wellness goals</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🛡️</div>
              <h3 className="font-semibold mb-1">Secure & Private</h3>
              <p className="text-sm text-slate-300">HIPAA-compliant with advanced security</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💡</div>
              <h3 className="font-semibold mb-1">Preventive Focus</h3>
              <p className="text-sm text-slate-300">Stay ahead with proactive health management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Provider Patient Detail ---------- */

function ProviderPatientDetail() {
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

/* ---------- UI Helper ---------- */

function Card({ title, description, to, icon, gradient, features }) {
  return (
    <Link
      to={to}
      className={`block rounded-xl border border-slate-800 bg-gradient-to-br ${gradient} p-8 hover:scale-105 transition-transform text-white relative overflow-hidden group`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
      <div className="relative z-10">
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-white/90 mb-6">{description}</p>
        <ul className="space-y-2">
          {features?.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="text-white/80">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all">
          Get Started <span>→</span>
        </div>
      </div>
    </Link>
  );
}

export default App;
