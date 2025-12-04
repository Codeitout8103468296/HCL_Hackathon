import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patientService';
import PatientSidebar from './PatientSidebar';

export default function Reminders() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'water',
    text: '',
    times: ['09:00']
  });

  useEffect(() => {
    if (user?._id) {
      loadReminders();
    }
  }, [user]);

  const loadReminders = async () => {
    try {
      // First get patient ID from profile
      const profileResponse = await patientService.getProfile(user._id);
      const patientId = profileResponse.data.data._id;
      
      const response = await patientService.getReminders(patientId);
      const remindersData = response.data.data?.reminders || [];
      setReminders(remindersData);
    } catch (error) {
      console.error('Failed to load reminders:', error);
      setReminders([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get patient ID from profile
      const profileResponse = await patientService.getProfile(user._id);
      const patientId = profileResponse.data.data._id;
      
      await patientService.createReminder({
        patientId,
        type: formData.type,
        text: formData.text,
        schedule: { times: formData.times }
      });
      
      await loadReminders();
      setShowForm(false);
      setFormData({ type: 'water', text: '', times: ['09:00'] });
    } catch (error) {
      console.error('Failed to create reminder:', error);
      alert('Failed to create reminder. Please try again.');
    }
  };

  const handleMarkTaken = async (reminderId) => {
    try {
      await patientService.markReminder(reminderId);
      await loadReminders();
    } catch (error) {
      console.error('Failed to mark reminder:', error);
      alert('Failed to mark reminder. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <PatientSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Reminders</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-emerald-500 rounded-lg hover:bg-emerald-400"
            >
              {showForm ? 'Cancel' : '+ New Reminder'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-6">
              <h2 className="text-xl font-semibold mb-4">Create Reminder</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                  >
                    <option value="water">Water</option>
                    <option value="medication">Medication</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Reminder Text</label>
                  <input
                    type="text"
                    value={formData.text}
                    onChange={(e) => setFormData({...formData, text: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                    placeholder="e.g., Drink a glass of water"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Times (HH:MM format)</label>
                  <input
                    type="text"
                    value={formData.times.join(', ')}
                    onChange={(e) => setFormData({
                      ...formData,
                      times: e.target.value.split(',').map(t => t.trim())
                    })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                    placeholder="09:00, 12:00, 15:00"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-500 rounded-lg hover:bg-emerald-400"
                >
                  Create Reminder
                </button>
              </div>
            </form>
          )}

          {/* Today's Reminders */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-6">
            <h2 className="text-xl font-semibold mb-4">Today's Reminders</h2>
            <div className="space-y-3">
              {reminders.filter(r => r.enabled).map((reminder) => (
                <div
                  key={reminder._id || reminder.id}
                  className="bg-slate-800 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xl">
                        {reminder.type === 'water' ? '💧' : reminder.type === 'medication' ? '💊' : '📅'}
                      </span>
                      <span className="font-semibold">{reminder.text}</span>
                    </div>
                    {reminder.schedule?.times?.length > 0 && (
                      <div className="text-sm text-slate-400 ml-11">
                        Times: {reminder.schedule.times.join(', ')}
                      </div>
                    )}
                  </div>
                  {reminder.type !== 'preventive' && (
                    <button
                      onClick={() => handleMarkTaken(reminder._id || reminder.id)}
                      className="px-4 py-2 bg-emerald-500 rounded-lg hover:bg-emerald-400 text-sm"
                    >
                      Mark as Taken
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Calendar View */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h2 className="text-xl font-semibold mb-4">Adherence Calendar</h2>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(30)].map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (29 - i));
                const isToday = i === 29;
                const adherence = Math.random() > 0.3 ? 'taken' : 'missed';
                
                return (
                  <div
                    key={i}
                    className={`p-2 rounded text-center ${
                      isToday
                        ? 'bg-emerald-500/20 border-2 border-emerald-500'
                        : adherence === 'taken'
                        ? 'bg-emerald-500/10'
                        : 'bg-slate-800'
                    }`}
                  >
                    <div className="text-xs text-slate-400 mb-1">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-sm font-semibold ${isToday ? 'text-emerald-400' : ''}`}>
                      {date.getDate()}
                    </div>
                    <div className="text-xs mt-1">
                      {adherence === 'taken' ? '✓' : '✗'}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-500/10 rounded"></div>
                <span className="text-slate-400">Taken</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-800 rounded"></div>
                <span className="text-slate-400">Missed</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

