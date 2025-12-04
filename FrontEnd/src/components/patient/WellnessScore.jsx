import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patientService';
import PatientSidebar from './PatientSidebar';

export default function WellnessScore() {
  const { user } = useAuth();
  const [score, setScore] = useState(72);
  const [breakdown, setBreakdown] = useState({
    activity: 28,
    sleep: 22,
    compliance: 22
  });
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    if (user?._id) {
      loadWellnessData();
    }
  }, [user]);

  const loadWellnessData = async () => {
    try {
      // Get patient ID from profile
      const profileResponse = await patientService.getProfile(user._id);
      const patientId = profileResponse.data.data._id;
      
      const response = await patientService.getWellness(patientId, '7d');
      const wellnessData = response.data.data || {};
      
      // Set current score
      setScore(wellnessData.currentScore || 0);
      
      // Calculate breakdown from averages
      const avgSteps = wellnessData.averages?.steps || 0;
      const avgSleep = wellnessData.averages?.sleepHours || 0;
      const avgCompliance = wellnessData.averages?.preventiveComplianceScore || 0;
      
      // Calculate breakdown scores (40 points for steps, 30 for sleep, 30 for compliance)
      const activityScore = Math.min(Math.round((avgSteps / 10000) * 40), 40);
      const sleepScore = Math.min(Math.round((avgSleep / 8) * 30), 30);
      const complianceScore = Math.min(Math.round((avgCompliance / 100) * 30), 30);
      
      setBreakdown({
        activity: activityScore,
        sleep: sleepScore,
        compliance: complianceScore
      });
      
      // Transform entries to trend data
      const trendData = (wellnessData.entries || []).map(entry => ({
        date: new Date(entry.date).toISOString().split('T')[0],
        score: entry.score || 0
      }));
      
      setTrend(trendData.length > 0 ? trendData : [
        { date: new Date().toISOString().split('T')[0], score: wellnessData.currentScore || 0 }
      ]);
    } catch (error) {
      console.error('Failed to load wellness data:', error);
      setScore(0);
      setBreakdown({ activity: 0, sleep: 0, compliance: 0 });
      setTrend([]);
    }
  };

  const maxScore = Math.max(...trend.map(t => t.score), 100);
  const minScore = Math.min(...trend.map(t => t.score), 0);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <PatientSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Wellness Score</h1>

          {/* Main Score Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Your Wellness Score</h2>
                <p className="text-emerald-100 mb-4">
                  Based on activity, sleep & preventive compliance
                </p>
                <div className="text-6xl font-bold">{score}/100</div>
              </div>
              <div className="text-8xl opacity-50">❤️</div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-semibold mb-4">Activity (Steps)</h3>
              <div className="text-4xl font-bold mb-2 text-emerald-400">
                {breakdown.activity}/40
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div
                  className="bg-emerald-500 h-3 rounded-full"
                  style={{ width: `${(breakdown.activity / 40) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-400 mt-2">
                70% of goal achieved
              </p>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-semibold mb-4">Sleep Hours</h3>
              <div className="text-4xl font-bold mb-2 text-indigo-400">
                {breakdown.sleep}/30
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div
                  className="bg-indigo-500 h-3 rounded-full"
                  style={{ width: `${(breakdown.sleep / 30) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-400 mt-2">
                73% of goal achieved
              </p>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-semibold mb-4">Preventive Compliance</h3>
              <div className="text-4xl font-bold mb-2 text-blue-400">
                {breakdown.compliance}/30
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full"
                  style={{ width: `${(breakdown.compliance / 30) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-400 mt-2">
                73% of goal achieved
              </p>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h2 className="text-xl font-semibold mb-6">7-Day Trend</h2>
            <div className="flex items-end gap-2 h-64">
              {trend.map((point, i) => {
                const height = ((point.score - minScore) / (maxScore - minScore)) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="relative w-full h-full flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t transition-all hover:from-emerald-400 hover:to-emerald-300"
                        style={{ height: `${height}%` }}
                        title={`${new Date(point.date).toLocaleDateString()}: ${point.score}`}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-400 mt-2">
                      {new Date(point.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-4 text-sm text-slate-400">
              <span>{new Date(trend[0]?.date).toLocaleDateString()}</span>
              <span>{new Date(trend[trend.length - 1]?.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

