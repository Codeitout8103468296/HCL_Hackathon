import React, { useState } from 'react';
import ProviderSidebar from './ProviderSidebar';
import PatientCard from './PatientCard';

const ProviderAppointments = () => {
    // Mock Appointment Requests
    const [requests] = useState([
        {
            id: 'P-1002',
            name: 'Michael Chen',
            age: 62,
            gender: 'Male',
            lastVisit: '2023-11-02',
            condition: 'Type 2 Diabetes',
            status: 'Attention',
            requestReason: 'Blood sugar fluctuations',
            requestedDate: '2023-11-20'
        },
        {
            id: 'P-1004',
            name: 'Robert Wilson',
            age: 71,
            gender: 'Male',
            lastVisit: '2023-11-10',
            condition: 'COPD',
            status: 'Critical',
            requestReason: 'Difficulty breathing at night',
            requestedDate: '2023-11-21'
        }
    ]);

    // Mock Calendar Data (Current Month)
    const daysInMonth = 30; // Simplifying for demo
    const startDayOffset = 2; // Starts on Wednesday (0=Mon, 6=Sun)

    const getDayStatus = (day) => {
        // Mock logic for availability
        if ([5, 6, 12, 13, 19, 20, 26, 27].includes(day)) return 'weekend'; // Weekends
        if ([3, 15, 24].includes(day)) return 'blocked'; // Fully blocked (Red)
        if ([8, 10, 22].includes(day)) return 'partial'; // Partially blocked (Orange)
        return 'available'; // Available (Green)
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'blocked': return 'bg-red-500/20 text-red-400 border-red-500/50';
            case 'partial': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
            case 'available': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
            default: return 'bg-slate-900 text-slate-500 border-slate-800';
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
            <ProviderSidebar />

            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Appointments</h1>
                    <p className="text-slate-400 mt-1">Manage patient requests and view your availability.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Column: Appointment Requests */}
                    <section>
                        <h2 className="text-xl font-semibold text-slate-200 mb-4">Patient Requests ({requests.length})</h2>
                        <div className="space-y-4">
                            {requests.map(patient => (
                                <div key={patient.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                    <div className="mb-4">
                                        <PatientCard patient={patient} />
                                    </div>

                                    {/* Request Info & Actions */}
                                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="text-xs text-slate-400 mb-1">Reason for visit</div>
                                                <div className="text-sm text-slate-200 italic">"{patient.requestReason}"</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-slate-400 mb-1">Requested Date</div>
                                                <div className="text-sm font-semibold text-emerald-400">{patient.requestedDate}</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 justify-end border-t border-slate-800 pt-4">
                                            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm font-medium transition-colors text-slate-300">
                                                Reschedule
                                            </button>
                                            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm font-medium transition-colors text-white">
                                                Approve Request
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {requests.length === 0 && (
                                <div className="text-slate-500 text-center py-8 bg-slate-900/50 rounded-xl border border-slate-800">
                                    No pending appointment requests.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Right Column: Availability Calendar */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-slate-200">Availability Overview</h2>
                            <div className="flex gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500/50 rounded"></div>
                                    <span className="text-slate-400">Available</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-orange-500/20 border border-orange-500/50 rounded"></div>
                                    <span className="text-slate-400">Limited</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-red-500/20 border border-red-500/50 rounded"></div>
                                    <span className="text-slate-400">Full</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-white">November 2023</h3>
                            </div>

                            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm text-slate-500 font-medium">
                                <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
                            </div>

                            <div className="grid grid-cols-7 gap-2">
                                {/* Empty slots for start offset */}
                                {[...Array(startDayOffset)].map((_, i) => (
                                    <div key={`empty-${i}`} className="aspect-square"></div>
                                ))}

                                {/* Days */}
                                {[...Array(daysInMonth)].map((_, i) => {
                                    const day = i + 1;
                                    const status = getDayStatus(day);
                                    const colorClass = getStatusColor(status);

                                    return (
                                        <div
                                            key={day}
                                            className={`aspect-square rounded-lg border flex items-center justify-center text-sm font-medium transition-all hover:scale-105 cursor-pointer ${colorClass}`}
                                            title={status === 'weekend' ? 'Weekend' : status}
                                        >
                                            {day}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
};

export default ProviderAppointments;
