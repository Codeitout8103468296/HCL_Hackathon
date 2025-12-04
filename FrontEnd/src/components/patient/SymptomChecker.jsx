import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patientService';
import PatientSidebar from './PatientSidebar';

const SYMPTOMS = [
  'Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea', 'Dizziness',
  'Chest Pain', 'Shortness of Breath', 'Joint Pain', 'Muscle Aches',
  'Sore Throat', 'Runny Nose', 'Abdominal Pain', 'Back Pain', 'Insomnia'
];

export default function SymptomChecker() {
  const { user } = useAuth();
  const [selectedSymptoms, setSelectedSymptoms] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSymptomChange = (symptom, severity) => {
    setSelectedSymptoms({
      ...selectedSymptoms,
      [symptom]: severity
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const symptoms = Object.entries(selectedSymptoms)
      .filter(([_, severity]) => severity > 0)
      .map(([name, severity]) => ({ name, severity }));

    if (symptoms.length === 0) {
      alert('Please select at least one symptom');
      setSubmitting(false);
      return;
    }

    try {
      // Determine recommendation based on severity
      const maxSeverity = Math.max(...symptoms.map(s => s.severity));
      let recommendation, urgencyLevel;
      
      if (maxSeverity >= 8) {
        recommendation = 'emergency';
        urgencyLevel = 'critical';
      } else if (maxSeverity >= 6) {
        recommendation = 'see-gp';
        urgencyLevel = 'high';
      } else if (maxSeverity >= 4) {
        recommendation = 'see-gp';
        urgencyLevel = 'medium';
      } else {
        recommendation = 'self-care';
        urgencyLevel = 'low';
      }

      // await patientService.submitSymptomReport({
      //   patientId: user._id,
      //   symptoms,
      //   recommendation,
      //   urgencyLevel
      // });

      setResult({ recommendation, urgencyLevel, symptoms });
    } catch (error) {
      console.error('Failed to submit symptom report:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-slate-600';
    }
  };

  const getRecommendationText = (rec) => {
    switch (rec) {
      case 'emergency': return 'Seek Emergency Care Immediately';
      case 'see-gp': return 'Schedule Appointment with GP';
      case 'self-care': return 'Self-Care Recommended';
      default: return '';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <PatientSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Symptom Checker</h1>

          {/* Disclaimer */}
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-6">
            <p className="text-yellow-200 text-sm">
              ⚠️ <strong>Disclaimer:</strong> This tool is for informational purposes only and does not provide medical diagnosis. 
              Always consult with a healthcare professional for proper medical advice. In case of emergency, call 911 immediately.
            </p>
          </div>

          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h2 className="text-xl font-semibold mb-4">Select Your Symptoms</h2>
                <p className="text-slate-400 text-sm mb-6">
                  Select symptoms you're experiencing and rate their severity (1-10)
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {SYMPTOMS.map((symptom) => (
                    <div key={symptom} className="bg-slate-800 rounded-lg p-4">
                      <label className="block text-sm font-medium mb-2">{symptom}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={selectedSymptoms[symptom] || 0}
                          onChange={(e) => handleSymptomChange(symptom, parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-sm font-semibold w-8 text-center">
                          {selectedSymptoms[symptom] || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-emerald-500 rounded-lg hover:bg-emerald-400 font-semibold disabled:opacity-50"
              >
                {submitting ? 'Analyzing...' : 'Check Symptoms'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className={`${getUrgencyColor(result.urgencyLevel)} rounded-xl p-8 text-white text-center`}>
                <h2 className="text-3xl font-bold mb-4">
                  {getRecommendationText(result.recommendation)}
                </h2>
                <p className="text-lg opacity-90">
                  Urgency Level: <strong>{result.urgencyLevel.toUpperCase()}</strong>
                </p>
              </div>

              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-semibold mb-4">Reported Symptoms</h3>
                <ul className="space-y-2">
                  {result.symptoms.map((s, i) => (
                    <li key={i} className="flex justify-between items-center bg-slate-800 rounded p-3">
                      <span>{s.name}</span>
                      <span className="text-emerald-400 font-semibold">Severity: {s.severity}/10</span>
                    </li>
                  ))}
                </ul>
              </div>

              {result.recommendation === 'emergency' && (
                <div className="bg-red-900/30 border border-red-700 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-2 text-red-400">Emergency Contact</h3>
                  <p className="text-red-200 mb-4">Call 911 or go to your nearest emergency room immediately.</p>
                  <button className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-500">
                    Call Emergency Services
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setResult(null);
                  setSelectedSymptoms({});
                }}
                className="w-full px-6 py-3 border border-slate-700 rounded-lg hover:bg-slate-800"
              >
                Check Again
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

