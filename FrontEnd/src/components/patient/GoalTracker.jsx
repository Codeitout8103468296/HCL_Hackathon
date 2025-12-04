import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patientService';
import PatientSidebar from './PatientSidebar';

export default function GoalTracker() {
  const { user } = useAuth();
  const [goals, setGoals] = useState({
    steps: { current: 0, goal: 6000 },
    water: { current: 0, goal: 8 },
    sleep: { current: 0, goal: 8 }
  });
  const [streak, setStreak] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ steps: '', water: '', sleep: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    try {
      // Get today's wellness entry
      const dashboardResponse = await patientService.getDashboard(user._id);
      const dashboardData = dashboardResponse.data.data;
      const todayEntry = dashboardData.todayEntry || {};
      
      setGoals({
        steps: { current: todayEntry.steps || 0, goal: 6000 },
        water: { current: todayEntry.waterIntake || 0, goal: 8 },
        sleep: { current: todayEntry.sleepHours || 0, goal: 8 }
      });
      
      // Calculate streak from recent entries
      const recentEntries = dashboardData.recentEntries || [];
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < recentEntries.length; i++) {
        const entryDate = new Date(recentEntries[i].date);
        entryDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === i) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      setStreak(currentStreak);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get patient ID from profile
      const profileResponse = await patientService.getProfile(user._id);
      const patientId = profileResponse.data.data._id;
      
      // Submit wellness entry
      await patientService.submitWellness({
        patientId,
        steps: parseInt(formData.steps) || 0,
        waterIntake: parseInt(formData.water) || 0,
        sleepHours: parseFloat(formData.sleep) || 0
      });
      
      await loadGoals();
      setShowForm(false);
      setFormData({ steps: '', water: '', sleep: '' });
    } catch (error) {
      console.error('Failed to log goal:', error);
      alert('Failed to log goal. Please try again.');
    }
  };

  const stepsPercentage = Math.round((goals.steps.current / goals.steps.goal) * 100);
  const waterPercentage = Math.round((goals.water.current / goals.water.goal) * 100);
  const sleepPercentage = Math.round((goals.sleep.current / goals.sleep.goal) * 100);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <PatientSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <PatientSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Wellness Goals</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-emerald-500 rounded-lg hover:bg-emerald-400"
            >
              {showForm ? 'Cancel' : 'Log Today\'s Goals'}
            </button>
          </div>

          {/* Streak Badge */}
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">🔥 {streak} Day Streak!</h2>
                <p className="text-yellow-100">Keep logging your daily goals to maintain your streak</p>
              </div>
              <div className="text-4xl">🏆</div>
            </div>
          </div>

          {/* Log Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-6">
              <h2 className="text-xl font-semibold mb-4">Log Today's Progress</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Steps</label>
                  <input
                    type="number"
                    value={formData.steps}
                    onChange={(e) => setFormData({...formData, steps: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                    placeholder="3620"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Water (glasses)</label>
                  <input
                    type="number"
                    value={formData.water}
                    onChange={(e) => setFormData({...formData, water: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Sleep (hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.sleep}
                    onChange={(e) => setFormData({...formData, sleep: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                    placeholder="6.5"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 px-6 py-2 bg-emerald-500 rounded-lg hover:bg-emerald-400"
              >
                Save Progress
              </button>
            </form>
          )}

          {/* Goals Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Steps Card */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">🚶</div>
                <h2 className="text-xl font-semibold">Steps</h2>
              </div>
              <div className="text-4xl font-bold mb-2">
                {goals.steps.current.toLocaleString()}
              </div>
              <div className="text-slate-400 mb-4">
                Goal: {goals.steps.goal.toLocaleString()} steps
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(stepsPercentage, 100)}%` }}
                ></div>
              </div>
              <div className="text-sm text-emerald-400 font-semibold">
                {stepsPercentage}% Complete
              </div>
            </div>

            {/* Water Card */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">💧</div>
                <h2 className="text-xl font-semibold">Water Intake</h2>
              </div>
              <div className="text-4xl font-bold mb-2">
                {goals.water.current}
              </div>
              <div className="text-slate-400 mb-4">
                Goal: {goals.water.goal} glasses
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(waterPercentage, 100)}%` }}
                ></div>
              </div>
              <div className="text-sm text-blue-400 font-semibold">
                {waterPercentage}% Complete
              </div>
            </div>

            {/* Sleep Card */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">🌙</div>
                <h2 className="text-xl font-semibold">Sleep</h2>
              </div>
              <div className="text-4xl font-bold mb-2">
                {goals.sleep.current} hrs
              </div>
              <div className="text-slate-400 mb-4">
                Goal: {goals.sleep.goal} hours
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
                <div
                  className="bg-indigo-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(sleepPercentage, 100)}%` }}
                ></div>
              </div>
              <div className="text-sm text-indigo-400 font-semibold">
                {sleepPercentage}% Complete
              </div>
            </div>
          </div>

          {/* Weekly Progress Chart */}
          <div className="mt-8 bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h2 className="text-xl font-semibold mb-4">Weekly Progress</h2>
            <div className="flex items-end gap-2 h-48">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                const height = Math.random() * 60 + 40;
                return (
                  <div key={day} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-emerald-500 rounded-t transition-all hover:bg-emerald-400"
                      style={{ height: `${height}%` }}
                      title={`${day}: ${Math.round(height)}%`}
                    ></div>
                    <span className="text-xs text-slate-400 mt-2">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

