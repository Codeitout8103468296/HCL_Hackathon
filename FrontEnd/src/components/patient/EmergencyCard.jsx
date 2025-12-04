import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patientService';
import PatientSidebar from './PatientSidebar';

export default function EmergencyCard() {
  const { user } = useAuth();
  const [card, setCard] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  const [patientProfile, setPatientProfile] = useState(null);

  useEffect(() => {
    if (user?._id) {
      loadEmergencyCard();
      loadPatientProfile();
    }
  }, [user]);

  const loadPatientProfile = async () => {
    try {
      const response = await patientService.getProfile(user._id);
      setPatientProfile(response.data.data);
    } catch (error) {
      console.error('Failed to load patient profile:', error);
    }
  };

  const loadEmergencyCard = async () => {
    try {
      const response = await patientService.getEmergencyCard(user._id);
      const cardData = response.data.data || {};
      
      setCard(cardData.emergencyCard);
      setIsPublic(cardData.emergencyCard?.isPublic || false);
      setQrCode(cardData.qrCode || null);
    } catch (error) {
      console.error('Failed to load emergency card:', error);
      // If card doesn't exist, create one
      try {
        const createResponse = await patientService.generateEmergencyCard(user._id, {
          fields: {
            name: true,
            bloodGroup: true,
            allergies: true,
            emergencyContact: true
          },
          isPublic: false
        });
        const cardData = createResponse.data.data || {};
        setCard(cardData.emergencyCard);
        setIsPublic(false);
        setQrCode(cardData.qrCode || null);
      } catch (createError) {
        console.error('Failed to create emergency card:', createError);
      }
    }
  };

  const handleTogglePublic = async () => {
    try {
      const response = await patientService.generateEmergencyCard(user._id, {
        isPublic: !isPublic,
        fields: card?.fields || {
          name: true,
          bloodGroup: true,
          allergies: true,
          emergencyContact: true
        }
      });
      const cardData = response.data.data || {};
      setCard(cardData.emergencyCard);
      setIsPublic(cardData.emergencyCard?.isPublic || false);
      setQrCode(cardData.qrCode || null);
    } catch (error) {
      console.error('Failed to update emergency card:', error);
      alert('Failed to update emergency card. Please try again.');
    }
  };

  const handleDownloadQR = () => {
    if (qrCode) {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = 'emergency-card-qr.png';
      link.click();
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <PatientSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">QR Emergency Health Card</h1>

          <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-6">
            <p className="text-yellow-200 text-sm">
              ⚠️ This card contains essential medical information that can be accessed in emergencies. 
              Only enable public sharing if you want this information accessible without login.
            </p>
          </div>

          {/* QR Code Section */}
          <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 mb-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Your Emergency QR Code</h2>
            {qrCode ? (
              <div className="flex flex-col items-center">
                <img
                  src={qrCode}
                  alt="Emergency QR Code"
                  className="w-64 h-64 bg-white p-4 rounded-lg mb-4"
                />
                <button
                  onClick={handleDownloadQR}
                  className="px-6 py-2 bg-emerald-500 rounded-lg hover:bg-emerald-400"
                >
                  Download QR Code
                </button>
              </div>
            ) : (
              <div className="w-64 h-64 bg-slate-800 rounded-lg mx-auto flex items-center justify-center">
                <span className="text-slate-400">Generating QR Code...</span>
              </div>
            )}
          </div>

          {/* Card Settings */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-6">
            <h2 className="text-xl font-semibold mb-4">Card Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Public Sharing</h3>
                  <p className="text-sm text-slate-400">
                    Allow emergency information to be accessed via public URL
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={handleTogglePublic}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {card && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Visible Information</h3>
                  <div className="space-y-2">
                    {Object.entries(card.fields).map(([field, visible]) => (
                      <label key={field} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={visible}
                          disabled
                          className="accent-emerald-500"
                        />
                        <span className="capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Public URL */}
          {isPublic && card && (
            <div className="bg-emerald-900/30 border border-emerald-700 rounded-xl p-6">
              <h3 className="font-semibold mb-2">Public Access URL</h3>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-slate-800 px-3 py-2 rounded text-sm">
                  {window.location.origin}/emergency/{card.publicToken}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/emergency/${card.publicToken}`)}
                  className="px-4 py-2 bg-slate-800 rounded hover:bg-slate-700"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {/* Preview */}
          {patientProfile && (
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mt-6">
              <h2 className="text-xl font-semibold mb-4">Emergency Information Preview</h2>
              <div className="bg-slate-800 rounded-lg p-6 space-y-3">
                {card?.fields?.name && (
                  <div>
                    <span className="text-slate-400">Name:</span> <span className="font-semibold">{patientProfile.userId?.name || user?.name || 'N/A'}</span>
                  </div>
                )}
                {card?.fields?.bloodGroup && (
                  <div>
                    <span className="text-slate-400">Blood Group:</span> <span className="font-semibold">{patientProfile.bloodGroup || 'N/A'}</span>
                  </div>
                )}
                {card?.fields?.allergies && (
                  <div>
                    <span className="text-slate-400">Allergies:</span> <span className="font-semibold">{patientProfile.allergies?.join(', ') || 'None'}</span>
                  </div>
                )}
                {card?.fields?.emergencyContact && patientProfile.emergencyContact && (
                  <div>
                    <span className="text-slate-400">Emergency Contact:</span> <span className="font-semibold">{patientProfile.emergencyContact.name} - {patientProfile.emergencyContact.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

