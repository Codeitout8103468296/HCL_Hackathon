import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patientService';
import PatientSidebar from './PatientSidebar';

export default function PatientProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user?._id) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await patientService.getProfile(user._id);
      const patientData = response.data.data; // API returns { success: true, data: patient }
      
      // Merge user data with patient data
      const profileData = {
        name: patientData.userId?.name || user?.name || '',
        email: patientData.userId?.email || user?.email || '',
        dob: patientData.dob ? new Date(patientData.dob).toISOString().split('T')[0] : '',
        sex: patientData.sex || '',
        bloodGroup: patientData.bloodGroup || '',
        allergies: patientData.allergies || [],
        medications: patientData.medications || [],
        conditions: patientData.conditions || [],
        emergencyContact: patientData.emergencyContact || {
          name: '',
          phone: '',
          relationship: ''
        }
      };
      
      setProfile(profileData);
      setFormData(profileData);
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Set default empty profile on error
      const defaultProfile = {
        name: user?.name || '',
        email: user?.email || '',
        dob: '',
        sex: '',
        bloodGroup: '',
        allergies: [],
        medications: [],
        conditions: [],
        emergencyContact: {
          name: '',
          phone: '',
          relationship: ''
        }
      };
      setProfile(defaultProfile);
      setFormData(defaultProfile);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await patientService.updateProfile(user._id, formData);
      setEditing(false);
      await loadProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

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
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-emerald-500 rounded-lg hover:bg-emerald-400"
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={!editing}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    disabled
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob || ''}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    disabled={!editing}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Sex</label>
                  <select
                    value={formData.sex || ''}
                    onChange={(e) => setFormData({...formData, sex: e.target.value})}
                    disabled={!editing}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup || ''}
                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                    disabled={!editing}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-xl font-semibold mb-4">Medical Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Allergies</label>
                  <textarea
                    value={formData.allergies?.join(', ') || ''}
                    onChange={(e) => setFormData({...formData, allergies: e.target.value.split(', ').filter(a => a)})}
                    disabled={!editing}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                    placeholder="Penicillin, Peanuts, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Medical Conditions</label>
                  <textarea
                    value={formData.conditions?.join(', ') || ''}
                    onChange={(e) => setFormData({...formData, conditions: e.target.value.split(', ').filter(c => c)})}
                    disabled={!editing}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                    placeholder="Hypertension, Diabetes, etc."
                  />
                </div>
              </div>
            </section>

            <section className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-xl font-semibold mb-4">Emergency Contact</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.emergencyContact?.name || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: {...formData.emergencyContact, name: e.target.value}
                    })}
                    disabled={!editing}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.emergencyContact?.phone || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: {...formData.emergencyContact, phone: e.target.value}
                    })}
                    disabled={!editing}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Relationship</label>
                  <input
                    type="text"
                    value={formData.emergencyContact?.relationship || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: {...formData.emergencyContact, relationship: e.target.value}
                    })}
                    disabled={!editing}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                  />
                </div>
              </div>
            </section>

            {editing && (
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-2 border border-slate-700 rounded-lg hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-500 rounded-lg hover:bg-emerald-400"
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}

