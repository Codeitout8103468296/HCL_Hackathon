import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProviderSidebar from './ProviderSidebar';

// Mock Data Store
const MOCK_PATIENTS_DATA = {
    'P-1001': {
        id: 'P-1001',
        name: 'Sarah Johnson',
        age: 45,
        gender: 'Female',
        email: 'sarah.j@example.com',
        phone: '(555) 123-4567',
        wellnessScore: 82,
        wellnessTrend: 'up',
        compliance: 95,
        lastVisit: '2023-10-15',
        nextAppointment: '2024-01-10',
        conditions: ['Hypertension', 'Seasonal Allergies'],
        goals: {
            steps: { current: 3620, goal: 6000, label: 'Steps', icon: '🚶', unit: 'steps' },
            water: { current: 5, goal: 8, label: 'Water Intake', icon: '💧', unit: 'glasses' },
            sleep: { current: 6.5, goal: 8, label: 'Sleep', icon: '🌙', unit: 'hrs' }
        },
        medications: [
            {
                id: 1,
                name: 'Metformin',
                instruction: 'Take with breakfast',
                schedule: ['08:00', '20:00'],
                adherence: [true, true, false, true, true, true, true]
            },
            {
                id: 2,
                name: 'Lisinopril',
                instruction: 'Take in the morning',
                schedule: ['09:00'],
                adherence: [true, true, true, true, true, true, true]
            }
        ],
        notes: [
            { id: 1, text: 'Patient reported feeling dizzy after morning dose.', date: '2023-10-15', author: 'Dr. Smith', status: 'Acknowledged' },
            { id: 2, text: 'BP slightly elevated, advised to reduce salt intake.', date: '2023-09-10', author: 'Nurse Joy', status: 'Not Seen' }
        ]
    },
    'P-1002': {
        id: 'P-1002',
        name: 'Michael Chen',
        age: 62,
        gender: 'Male',
        email: 'm.chen@example.com',
        phone: '(555) 987-6543',
        wellnessScore: 65,
        wellnessTrend: 'down',
        compliance: 78,
        lastVisit: '2023-11-02',
        nextAppointment: '2023-12-15',
        conditions: ['Type 2 Diabetes', 'Hypertension'],
        goals: {
            steps: { current: 2100, goal: 5000, label: 'Steps', icon: '🚶', unit: 'steps' },
            water: { current: 3, goal: 8, label: 'Water Intake', icon: '💧', unit: 'glasses' },
            sleep: { current: 5.5, goal: 7, label: 'Sleep', icon: '🌙', unit: 'hrs' }
        },
        medications: [
            {
                id: 1,
                name: 'Insulin Glargine',
                instruction: 'Inject at bedtime',
                schedule: ['22:00'],
                adherence: [true, false, true, true, false, true, true]
            },
            {
                id: 2,
                name: 'Metformin',
                instruction: 'Take with dinner',
                schedule: ['19:00'],
                adherence: [true, true, true, true, true, true, true]
            }
        ],
        notes: [
            { id: 1, text: 'Discussed insulin injection technique.', date: '2023-11-02', author: 'Dr. Smith', status: 'Acknowledged' }
        ]
    },
    'P-1003': {
        id: 'P-1003',
        name: 'Emily Davis',
        age: 28,
        gender: 'Female',
        email: 'emily.d@example.com',
        phone: '(555) 456-7890',
        wellnessScore: 94,
        wellnessTrend: 'up',
        compliance: 98,
        lastVisit: '2023-09-20',
        nextAppointment: '2024-03-15',
        conditions: ['Asthma'],
        goals: {
            steps: { current: 8500, goal: 8000, label: 'Steps', icon: '🚶', unit: 'steps' },
            water: { current: 7, goal: 8, label: 'Water Intake', icon: '💧', unit: 'glasses' },
            sleep: { current: 7.5, goal: 8, label: 'Sleep', icon: '🌙', unit: 'hrs' }
        },
        medications: [
            {
                id: 1,
                name: 'Albuterol Inhaler',
                instruction: 'As needed for shortness of breath',
                schedule: ['PRN'],
                adherence: [true, true, true, true, true, true, true]
            }
        ],
        notes: []
    },
    'P-1004': {
        id: 'P-1004',
        name: 'Robert Wilson',
        age: 71,
        gender: 'Male',
        email: 'r.wilson@example.com',
        phone: '(555) 222-3333',
        wellnessScore: 45,
        wellnessTrend: 'down',
        compliance: 60,
        lastVisit: '2023-11-10',
        nextAppointment: '2023-11-25',
        conditions: ['COPD', 'Heart Failure'],
        goals: {
            steps: { current: 500, goal: 2000, label: 'Steps', icon: '🚶', unit: 'steps' },
            water: { current: 2, goal: 6, label: 'Water Intake', icon: '💧', unit: 'glasses' },
            sleep: { current: 4, goal: 8, label: 'Sleep', icon: '🌙', unit: 'hrs' }
        },
        medications: [
            {
                id: 1,
                name: 'Spiriva',
                instruction: 'Inhale once daily',
                schedule: ['09:00'],
                adherence: [false, true, false, true, false, false, true]
            },
            {
                id: 2,
                name: 'Furosemide',
                instruction: 'Take in the morning',
                schedule: ['08:00'],
                adherence: [true, true, true, false, true, true, true]
            }
        ],
        notes: [
            { id: 1, text: 'Missed multiple doses of Spiriva. Needs reminder setup.', date: '2023-11-10', author: 'Dr. Smith', status: 'Clarification Required' }
        ]
    },
    'P-1005': {
        id: 'P-1005',
        name: 'Jessica Martinez',
        age: 35,
        gender: 'Female',
        email: 'jess.m@example.com',
        phone: '(555) 777-8888',
        wellnessScore: 88,
        wellnessTrend: 'stable',
        compliance: 100,
        lastVisit: '2023-10-30',
        nextAppointment: '2023-11-15',
        conditions: ['Pregnancy (3rd Tri)'],
        goals: {
            steps: { current: 4000, goal: 5000, label: 'Steps', icon: '🚶', unit: 'steps' },
            water: { current: 9, goal: 10, label: 'Water Intake', icon: '💧', unit: 'glasses' },
            sleep: { current: 8, goal: 9, label: 'Sleep', icon: '🌙', unit: 'hrs' }
        },
        medications: [
            {
                id: 1,
                name: 'Prenatal Vitamins',
                instruction: 'Take with lunch',
                schedule: ['12:00'],
                adherence: [true, true, true, true, true, true, true]
            }
        ],
        notes: []
    },
    'P-1006': {
        id: 'P-1006',
        name: 'David Thompson',
        age: 55,
        gender: 'Male',
        email: 'd.thompson@example.com',
        phone: '(555) 444-5555',
        wellnessScore: 72,
        wellnessTrend: 'stable',
        compliance: 85,
        lastVisit: '2023-10-05',
        nextAppointment: '2024-04-05',
        conditions: ['High Cholesterol'],
        goals: {
            steps: { current: 6000, goal: 8000, label: 'Steps', icon: '🚶', unit: 'steps' },
            water: { current: 6, goal: 8, label: 'Water Intake', icon: '💧', unit: 'glasses' },
            sleep: { current: 6, goal: 7, label: 'Sleep', icon: '🌙', unit: 'hrs' }
        },
        medications: [
            {
                id: 1,
                name: 'Atorvastatin',
                instruction: 'Take at bedtime',
                schedule: ['22:00'],
                adherence: [true, true, true, true, false, true, true]
            }
        ],
        notes: []
    }
};

const ProviderPatientDetail = () => {
    const { patientId } = useParams();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    // Notes State
    const [notes, setNotes] = useState([]);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [newNote, setNewNote] = useState({ text: '', status: 'Not Seen' });

    useEffect(() => {
        const fetchPatientData = () => {
            // Simulate API fetch delay
            setTimeout(() => {
                const data = MOCK_PATIENTS_DATA[patientId];
                if (data) {
                    setPatient(data);
                    setNotes(data.notes || []);
                } else {
                    setPatient(null);
                }
                setLoading(false);
            }, 300);
        };

        fetchPatientData();
    }, [patientId]);

    const handleAddNote = (e) => {
        e.preventDefault();
        if (!newNote.text.trim()) return;

        const note = {
            id: Date.now(),
            text: newNote.text,
            date: new Date().toISOString().split('T')[0],
            author: 'Dr. Smith', // Hardcoded for now
            status: newNote.status
        };

        setNotes([note, ...notes]);
        setNewNote({ text: '', status: 'Not Seen' });
        setShowNoteModal(false);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-950 text-slate-100">
                <ProviderSidebar />
                <main className="flex-1 p-8 flex items-center justify-center">
                    <div className="text-emerald-500 text-xl animate-pulse">Loading patient data...</div>
                </main>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="flex min-h-screen bg-slate-950 text-slate-100">
                <ProviderSidebar />
                <main className="flex-1 p-8">
                    <div className="text-red-400">Patient not found.</div>
                    <Link to="/provider/dashboard" className="text-emerald-400 hover:underline mt-4 inline-block">
                        Return to Dashboard
                    </Link>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100 relative">
            <ProviderSidebar />

            <main className="flex-1 p-8 overflow-y-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link to="/provider/dashboard" className="text-slate-400 hover:text-emerald-400 text-sm mb-2 inline-block">
                        &larr; Back to Dashboard
                    </Link>
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold text-white">{patient.name}</h1>
                            <p className="text-slate-400 mt-1">
                                ID: {patient.id} • {patient.age} yrs • {patient.gender}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowNoteModal(true)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm font-medium transition-colors"
                            >
                                Add Note
                            </button>
                            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm font-medium transition-colors">
                                Message
                            </button>
                        </div>
                    </div>
                </div>

                {/* Top Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">Wellness Score</h3>
                        <div className="flex items-end gap-2">
                            <span className={`text-4xl font-bold ${patient.wellnessScore >= 80 ? 'text-emerald-400' :
                                patient.wellnessScore >= 60 ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                {patient.wellnessScore}
                            </span>
                            <span className="text-sm text-slate-500 mb-1">
                                {patient.wellnessTrend === 'up' ? '↑' : patient.wellnessTrend === 'down' ? '↓' : '→'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">Compliance</h3>
                        <div className="flex items-end gap-2">
                            <span className={`text-4xl font-bold ${patient.compliance >= 90 ? 'text-blue-400' :
                                patient.compliance >= 70 ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                {patient.compliance}%
                            </span>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">Next Appointment</h3>
                        <div className="text-xl font-semibold text-slate-200">{patient.nextAppointment}</div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">Conditions</h3>
                        <div className="flex flex-wrap gap-2">
                            {patient.conditions.map((cond, i) => (
                                <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs">
                                    {cond}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - Goals & Vitals */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Goals Section */}
                        <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-xl font-semibold mb-4 text-slate-200">Wellness Goals Progress</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                {Object.entries(patient.goals).map(([key, goal]) => {
                                    const percentage = Math.round((goal.current / goal.goal) * 100);
                                    const isHittingGoal = percentage >= 100;

                                    return (
                                        <div key={key} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-2xl">{goal.icon}</span>
                                                <span className="font-medium text-slate-200">{goal.label}</span>
                                            </div>
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-2xl font-bold text-slate-100">{goal.current}</span>
                                                <span className="text-xs text-slate-500 mb-1">/ {goal.goal} {goal.unit}</span>
                                            </div>
                                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${isHittingGoal ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                                ></div>
                                            </div>
                                            <div className={`text-xs font-medium mt-2 ${isHittingGoal ? 'text-emerald-400' : 'text-blue-400'}`}>
                                                {isHittingGoal ? 'Goal Met! 🎉' : `${percentage}% Completed`}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Vitals Placeholder */}
                        <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-xl font-semibold mb-4 text-slate-200">Recent Vitals</h3>
                            <div className="h-48 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-lg text-slate-500">
                                [Vitals Chart Placeholder]
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Medications, Notes & Contact */}
                    <div className="space-y-8">

                        {/* Medications & Adherence */}
                        <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-xl font-semibold mb-4 text-slate-200">Medication Adherence</h3>
                            <div className="space-y-4">
                                {patient.medications.map((med) => (
                                    <div key={med.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-medium text-slate-200">{med.name}</div>
                                                <div className="text-xs text-slate-500">{med.instruction}</div>
                                            </div>
                                            <div className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                                                {med.schedule.join(', ')}
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <div className="text-xs text-slate-500 mb-1">Last 7 Days Adherence</div>
                                            <div className="flex gap-1">
                                                {med.adherence.map((taken, i) => (
                                                    <div
                                                        key={i}
                                                        className={`flex-1 h-2 rounded-full ${taken ? 'bg-emerald-500' : 'bg-red-500/50'}`}
                                                        title={taken ? 'Taken' : 'Missed'}
                                                    ></div>
                                                ))}
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-[10px] text-slate-600">7 days ago</span>
                                                <span className="text-[10px] text-slate-600">Today</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {patient.medications.length === 0 && (
                                    <div className="text-slate-500 text-sm text-center py-4">No active medications</div>
                                )}
                            </div>
                        </section>

                        {/* Notes Section */}
                        <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-slate-200">Notes</h3>
                                <span className="text-xs text-slate-500">{notes.length} notes</span>
                            </div>
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                {notes.length === 0 ? (
                                    <div className="text-slate-500 text-sm text-center py-4">No notes available</div>
                                ) : (
                                    notes.map((note) => (
                                        <div key={note.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                                            <p className="text-sm text-slate-300 mb-2">{note.text}</p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-slate-500">{note.date} • {note.author}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${note.status === 'Acknowledged' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        note.status === 'Clarification Required' ? 'bg-red-500/20 text-red-400' :
                                                            'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                    {note.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Contact Info */}
                        <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-xl font-semibold mb-4 text-slate-200">Contact Info</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <label className="block text-slate-500 text-xs uppercase">Email</label>
                                    <div className="text-slate-300">{patient.email}</div>
                                </div>
                                <div>
                                    <label className="block text-slate-500 text-xs uppercase">Phone</label>
                                    <div className="text-slate-300">{patient.phone}</div>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </main>

            {/* Add Note Modal */}
            {showNoteModal && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">Add Patient Note</h2>
                        <form onSubmit={handleAddNote}>
                            <div className="mb-4">
                                <label className="block text-sm text-slate-400 mb-1">Note Text</label>
                                <textarea
                                    value={newNote.text}
                                    onChange={(e) => setNewNote({ ...newNote, text: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 h-32 resize-none"
                                    placeholder="Enter clinical notes..."
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm text-slate-400 mb-1">Status</label>
                                <select
                                    value={newNote.status}
                                    onChange={(e) => setNewNote({ ...newNote, status: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                                >
                                    <option value="Not Seen">Not Seen</option>
                                    <option value="Acknowledged">Acknowledged</option>
                                    <option value="Clarification Required">Clarification Required</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowNoteModal(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Save Note
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderPatientDetail;
