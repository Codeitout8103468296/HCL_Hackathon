import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { providerService } from '../../services/providerService';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [providers, setProviders] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalProviders: 0,
    totalUsers: 0,
    avgWellnessScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'patients', 'providers'

  useEffect(() => {
    if (user?._id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [patientsRes, providersRes, statsRes] = await Promise.all([
        adminService.getAllPatients(),
        adminService.getAllProviders(),
        adminService.getStats()
      ]);
      
      setPatients(patientsRes.data.data || []);
      setProviders(providersRes.data.data || []);
      setStats(statsRes.data.data || stats);
    } catch (error) {
      console.error('Failed to load admin data:', error);
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
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-slate-400">Manage all providers, patients, and system data</p>
          </div>
          <Link
            to="/"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
          >
            <span>🏠</span>
            <span>Home</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-800">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('patients')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'patients'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              All Patients ({patients.length})
            </button>
            <button
              onClick={() => setActiveTab('providers')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'providers'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              All Providers ({providers.length})
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="text-3xl font-bold text-emerald-400">{stats.totalPatients}</div>
                <div className="text-slate-400 text-sm mt-1">Total Patients</div>
              </div>
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="text-3xl font-bold text-blue-400">{stats.totalProviders}</div>
                <div className="text-slate-400 text-sm mt-1">Total Providers</div>
              </div>
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="text-3xl font-bold text-indigo-400">{stats.totalUsers}</div>
                <div className="text-slate-400 text-sm mt-1">Total Users</div>
              </div>
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="text-3xl font-bold text-purple-400">{stats.avgWellnessScore}</div>
                <div className="text-slate-400 text-sm mt-1">Avg Wellness Score</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-semibold mb-4">Patient Compliance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Excellent</span>
                    <span className="text-green-400 font-semibold">
                      {patients.filter(p => p.complianceStatus === 'Excellent').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Good</span>
                    <span className="text-emerald-400 font-semibold">
                      {patients.filter(p => p.complianceStatus === 'Good').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Needs Attention</span>
                    <span className="text-yellow-400 font-semibold">
                      {patients.filter(p => p.complianceStatus === 'Needs Attention').length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-semibold mb-4">Provider Statistics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Providers</span>
                    <span className="text-blue-400 font-semibold">{providers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Assigned Patients</span>
                    <span className="text-indigo-400 font-semibold">
                      {providers.reduce((sum, p) => sum + (p.patientCount || 0), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Patients per Provider</span>
                    <span className="text-purple-400 font-semibold">
                      {providers.length > 0
                        ? Math.round(providers.reduce((sum, p) => sum + (p.patientCount || 0), 0) / providers.length)
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-semibold">All Patients</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Wellness Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Compliance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {patients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold">{patient.userId?.name || 'Unknown'}</div>
                          <div className="text-sm text-slate-400">{patient.userId?.email || ''}</div>
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
                        {patient.assignedProvider?.userId?.name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            // Admin can view any patient's dashboard directly
                            const patientUserId = patient.userId?._id || patient.userId?.id;
                            if (patientUserId) {
                              navigate(`/patient/dashboard/${patientUserId}`);
                            }
                          }}
                          className="px-4 py-2 bg-emerald-500 rounded-lg hover:bg-emerald-400 text-sm"
                        >
                          View Dashboard
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Providers Tab */}
        {activeTab === 'providers' && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-semibold">All Providers</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Specialization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Patients</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Avg Wellness Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {providers.map((provider) => (
                    <tr key={provider._id} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold">{provider.userId?.name || 'Unknown'}</div>
                          <div className="text-sm text-slate-400">{provider.userId?.email || ''}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {provider.specialization || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-blue-400 font-semibold">{provider.patientCount || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-bold">{provider.avgWellnessScore}/100</div>
                          <div className="w-24 bg-slate-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                provider.avgWellnessScore >= 80 ? 'bg-green-500' :
                                provider.avgWellnessScore >= 60 ? 'bg-emerald-500' :
                                provider.avgWellnessScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${provider.avgWellnessScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            // Admin can view patients through provider endpoint using provider's user ID
                            if (provider.userId?._id) {
                              navigate(`/provider/dashboard`);
                              // The ProviderDashboard will load all patients for admin
                            }
                          }}
                          className="px-4 py-2 bg-emerald-500 rounded-lg hover:bg-emerald-400 text-sm"
                        >
                          View Patients
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

