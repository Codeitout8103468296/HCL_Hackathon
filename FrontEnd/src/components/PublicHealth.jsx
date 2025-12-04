export default function PublicHealth() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Public Health Information</h1>

        <div className="space-y-8">
          {/* Health Education */}
          <section className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h2 className="text-2xl font-semibold mb-4">Health Education</h2>
            <div className="space-y-4 text-slate-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Preventive Care Guidelines</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Annual physical examinations for adults</li>
                  <li>Regular blood pressure and cholesterol screenings</li>
                  <li>Age-appropriate cancer screenings (mammograms, colonoscopies)</li>
                  <li>Vaccination schedules for flu, COVID-19, and other preventable diseases</li>
                  <li>Dental checkups every 6 months</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Lifestyle & Wellness Tips</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Maintain a balanced diet with fruits, vegetables, and whole grains</li>
                  <li>Engage in at least 150 minutes of moderate exercise per week</li>
                  <li>Get 7-9 hours of quality sleep each night</li>
                  <li>Stay hydrated - drink at least 8 glasses of water daily</li>
                  <li>Manage stress through meditation, yoga, or hobbies</li>
                  <li>Avoid smoking and limit alcohol consumption</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Mental Health Awareness</h3>
                <p className="mb-2">
                  Mental health is as important as physical health. Seek help if you experience:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Persistent feelings of sadness or anxiety</li>
                  <li>Changes in sleep or appetite patterns</li>
                  <li>Difficulty concentrating or making decisions</li>
                  <li>Thoughts of self-harm</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Vaccination Guidelines */}
          <section className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h2 className="text-2xl font-semibold mb-4">Vaccination Guidelines</h2>
            <div className="space-y-4 text-slate-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Annual Vaccinations</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Flu Vaccine:</strong> Recommended annually for everyone 6 months and older</li>
                  <li><strong>COVID-19:</strong> Follow current CDC guidelines for boosters</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Age-Specific Vaccines</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Children:</strong> Follow pediatric vaccination schedule</li>
                  <li><strong>Adults 50+:</strong> Shingles vaccine recommended</li>
                  <li><strong>Adults 65+:</strong> Pneumococcal vaccine recommended</li>
                  <li><strong>All Ages:</strong> Tetanus booster every 10 years</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Privacy Policy */}
          <section className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h2 className="text-2xl font-semibold mb-4">Privacy & Security Policy</h2>
            <div className="space-y-4 text-slate-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Data Protection</h3>
                <p>
                  Your health information is protected under HIPAA regulations. We use industry-standard 
                  encryption to secure your data both in transit and at rest.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Data Usage</h3>
                <p>
                  Your health data is used solely for:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Providing healthcare services and wellness tracking</li>
                  <li>Generating preventive care recommendations</li>
                  <li>Enabling provider-patient communication</li>
                  <li>Improving service quality (anonymized data only)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Your Rights</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Access your health records at any time</li>
                  <li>Request corrections to inaccurate information</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt-out of non-essential data processing</li>
                  <li>File a complaint if you believe your privacy rights have been violated</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Security Measures</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Role-based access control (RBAC) - only authorized personnel can access your data</li>
                  <li>Audit logging of all data access and modifications</li>
                  <li>Regular security assessments and updates</li>
                  <li>Secure authentication with JWT tokens</li>
                  <li>No sensitive data in logs or error messages</li>
                </ul>
              </div>

              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mt-4">
                <p className="text-blue-200 text-sm">
                  <strong>Contact:</strong> For privacy concerns or questions, please contact our 
                  privacy officer at privacy@hclhealthportal.com
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

