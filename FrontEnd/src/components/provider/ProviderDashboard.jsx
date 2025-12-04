import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { providerService } from '../../services/providerService';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      loadPatients();
    }
  }, [user]);

  const loadPatients = async () => {
    try {
      // Admin can use admin service to get all patients, or use provider service with their ID
      let response;
      if (user.role === 'admin') {
        const adminService = (await import('../../services/adminService')).adminService;
        response = await adminService.getAllPatients();
      } else {
        response = await providerService.getPatients(user._id);
      }
      const patientsData = response.data.data || [];
      
      // Transform data to include additional fields
      const transformedPatients = patientsData.map(patient => ({
        _id: patient._id,
        name: patient.userId?.name || 'Unknown',
        email: patient.userId?.email || '',
        wellnessScore: patient.wellnessScore || 0,
        complianceStatus: patient.complianceStatus || 'Good',
        lastCheckup: patient.lastTests?.[0]?.date || new Date().toISOString(),
        upcomingTests: [] // TODO: Get from recommendations API
      }));
      
      setPatients(transformedPatients);
    } catch (error) {
      console.error('Failed to load patients:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceColor = (status) => {
    switch (status) {
      case 'Excellent': return 'text-green-400';
      case 'Good': return 'text-emerald-400';
      case 'Needs Attention': return 'text-yellow-400';
      case 'Poor': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
            <p className="text-slate-400">Monitor patient compliance and wellness scores</p>
          </div>
          <Link
            to="/"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
          >
            <span>🏠</span>
            <span>Home</span>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="text-3xl font-bold text-emerald-400">{patients.length}</div>
            <div className="text-slate-400 text-sm mt-1">Total Patients</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="text-3xl font-bold text-blue-400">
              {patients.filter(p => p.complianceStatus === 'Excellent' || p.complianceStatus === 'Good').length}
            </div>
            <div className="text-slate-400 text-sm mt-1">Good Compliance</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="text-3xl font-bold text-yellow-400">
              {patients.filter(p => p.complianceStatus === 'Needs Attention').length}
            </div>
            <div className="text-slate-400 text-sm mt-1">Needs Attention</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="text-3xl font-bold text-indigo-400">
              {Math.round(patients.reduce((sum, p) => sum + p.wellnessScore, 0) / patients.length)}
            </div>
            <div className="text-slate-400 text-sm mt-1">Avg Wellness Score</div>
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-semibold">Assigned Patients</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Wellness Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Compliance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Last Checkup</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Upcoming Tests</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {patients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold">{patient.name}</div>
                        <div className="text-sm text-slate-400">{patient.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold">{patient.wellnessScore}/100</div>
                        <div className="w-24 bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              patient.wellnessScore >= 80 ? 'bg-green-500' :
                              patient.wellnessScore >= 60 ? 'bg-emerald-500' :
                              patient.wellnessScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${patient.wellnessScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getComplianceColor(patient.complianceStatus)}>
                        {patient.complianceStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(patient.lastCheckup).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {patient.upcomingTests.length > 0 ? (
                        <div className="space-y-1">
                          {patient.upcomingTests.map((test, i) => (
                            <div key={i} className="text-sm text-yellow-400">{test}</div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/provider/patients/${patient._id}`)}
                        className="px-4 py-2 bg-emerald-500 rounded-lg hover:bg-emerald-400 text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

