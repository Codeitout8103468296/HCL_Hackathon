import { useEffect, useState } from "react";
import PatientSidebar from "./PatientSidebar";

export default function PatientDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [healthTip, setHealthTip] = useState("");

  useEffect(() => {
    // Mock data matching the design
    setDashboard({
      patientName: "David",
      steps: {
        current: 3620,
        goal: 6000,
        percentage: 60,
      },
      activeTime: {
        current: 56,
        goal: 60,
        calories: 1712,
        distance: 1.23,
      },
      sleep: {
        hours: 6,
        minutes: 30,
        schedule: "11:30 pm - 06:00 am",
      },
      reminders: [
        {
          id: 1,
          text: "Screening: Annual health check on 23rd Jan 2020",
          type: "preventive",
        },
      ],
    });

    setHealthTip(
      "Stay hydrated: aim to drink at least 8 glasses of water per day."
    );

    // TODO: Replace with actual API calls
    // fetchPatientDashboard(patientId).then(res => setDashboard(res.data));
  }, []);

  if (!dashboard) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <PatientSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-400">Loading...</div>
        </div>
      </div>
    );
  }

  const stepsPercentage = Math.round(
    (dashboard.steps.current / dashboard.steps.goal) * 100
  );
  const activeTimePercentage = Math.round(
    (dashboard.activeTime.current / dashboard.activeTime.goal) * 100
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <PatientSidebar />

      <main className="flex-1 p-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, {dashboard.patientName}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Wellness Goals & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wellness Goals Section */}
            <section className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Wellness Goals
              </h2>

              <div className="space-y-4">
                {/* Steps Card */}
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-medium">Steps</span>
                    <span className="text-emerald-400 font-semibold">
                      {stepsPercentage}%
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {dashboard.steps.current.toLocaleString()}
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div
                      className="bg-emerald-500 h-2.5 rounded-full transition-all"
                      style={{ width: `${stepsPercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    Goal: {dashboard.steps.goal.toLocaleString()} steps
                  </div>
                </div>

                {/* Active Time Card */}
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-medium">
                      Active Time
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {dashboard.activeTime.current} / {dashboard.activeTime.goal}{" "}
                    mins
                  </div>
                  <div className="text-sm text-slate-400">
                    {dashboard.activeTime.calories} Kcal |{" "}
                    {dashboard.activeTime.distance} km
                  </div>
                </div>

                {/* Sleep Card */}
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-medium">Sleep</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {dashboard.sleep.hours} hrs {dashboard.sleep.minutes} mins
                  </div>
                  <div className="text-sm text-slate-400">
                    {dashboard.sleep.schedule}
                  </div>
                  {/* Sleep quality indicators */}
                  <div className="flex gap-1 mt-2">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < 6 ? "bg-emerald-400" : "bg-slate-600"
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Preventive Care Reminders */}
            <section className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Preventive Care Reminders
              </h2>
              <ul className="space-y-2">
                {dashboard.reminders.map((reminder) => (
                  <li
                    key={reminder.id}
                    className="text-slate-300 flex items-start gap-2"
                  >
                    <span className="text-emerald-400 mt-1">•</span>
                    <span>{reminder.text}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Health Tip of the Day */}
            <section className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 rounded-xl p-6 border border-blue-800/30">
              <h2 className="text-xl font-semibold mb-3 text-white">
                Health Tip of the Day
              </h2>
              <p className="text-slate-200 leading-relaxed">{healthTip}</p>
            </section>
          </div>

          {/* Right Column - Activity Metrics Cards */}
          <div className="space-y-6">
            {/* Steps Card */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">🚶</div>
                <h3 className="text-lg font-semibold text-white">Steps</h3>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-white mb-1">
                  {dashboard.steps.current.toLocaleString()} /{" "}
                  {dashboard.steps.goal.toLocaleString()} steps
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
                  <div
                    className="bg-emerald-500 h-3 rounded-full transition-all"
                    style={{ width: `${stepsPercentage}%` }}
                  ></div>
                </div>
                <div className="text-sm text-emerald-400 font-semibold">
                  {stepsPercentage}%
                </div>
              </div>
              {/* Mini bar chart */}
              <div className="flex items-end gap-1 h-12 mt-4">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-emerald-500/30 rounded-t"
                    style={{
                      height: `${Math.random() * 60 + 40}%`,
                    }}
                  ></div>
                ))}
                <div className="text-xs text-slate-400 mt-1">Now</div>
              </div>
            </div>

            {/* Active Time Card */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">⏱️</div>
                <h3 className="text-lg font-semibold text-white">Active Time</h3>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-white mb-2">
                  {dashboard.activeTime.current} / {dashboard.activeTime.goal}{" "}
                  mins
                </div>
                <div className="text-slate-300 text-sm">
                  {dashboard.activeTime.calories} Kcal |{" "}
                  {dashboard.activeTime.distance} km
                </div>
              </div>
            </div>

            {/* Sleep Card */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">🌙</div>
                <h3 className="text-lg font-semibold text-white">Sleep</h3>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-white mb-2">
                  {dashboard.sleep.hours} hrs {dashboard.sleep.minutes} mins
                </div>
                <div className="text-slate-300 text-sm">
                  {dashboard.sleep.schedule}
                </div>
              </div>
              {/* Sleep quality indicators */}
              <div className="flex gap-1.5">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < 6 ? "bg-emerald-400" : "bg-slate-600"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}