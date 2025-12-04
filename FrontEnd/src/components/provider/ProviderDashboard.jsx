import React, { useState } from 'react';
import ProviderSidebar from './ProviderSidebar';
import PatientCard from './PatientCard';

const ProviderDashboard = () => {
    // Mock data for patients
    const [patients] = useState([
        {
            id: 'P-1001',
            name: 'Sarah Johnson',
            age: 45,
            gender: 'Female',
            lastVisit: '2023-10-15',
            condition: 'Hypertension',
            status: 'Stable'
        },
        {
            id: 'P-1002',
            name: 'Michael Chen',
            age: 62,
            gender: 'Male',
            lastVisit: '2023-11-02',
            condition: 'Type 2 Diabetes',
            status: 'Attention'
        },
        {
            id: 'P-1003',
            name: 'Emily Davis',
            age: 28,
            gender: 'Female',
            lastVisit: '2023-09-20',
            condition: 'Asthma',
            status: 'Stable'
        },
        {
            id: 'P-1004',
            name: 'Robert Wilson',
            age: 71,
            gender: 'Male',
            lastVisit: '2023-11-10',
            condition: 'COPD',
            status: 'Critical'
        },
        {
            id: 'P-1005',
            name: 'Jessica Martinez',
            age: 35,
            gender: 'Female',
            lastVisit: '2023-10-30',
            condition: 'Pregnancy (3rd Tri)',
            status: 'Stable'
        },
        {
            id: 'P-1006',
            name: 'David Thompson',
            age: 55,
            gender: 'Male',
            lastVisit: '2023-10-05',
            condition: 'High Cholesterol',
            status: 'Attention'
        }
    ]);

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
            <ProviderSidebar />

            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                        <p className="text-slate-400 mt-1">Welcome back, Dr. Smith. You have 2 critical alerts today.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-center">
                            <span className="block text-2xl font-bold text-emerald-400">24</span>
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Total Patients</span>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-center">
                            <span className="block text-2xl font-bold text-amber-400">5</span>
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Appointments</span>
                        </div>
                    </div>
                </header>

                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-slate-200">Patient Overview</h2>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Search patients..."
                                className="bg-slate-900 border border-slate-800 rounded px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 w-64"
                            />
                            <select className="bg-slate-900 border border-slate-800 rounded px-4 py-2 text-sm focus:outline-none focus:border-emerald-500">
                                <option>All Statuses</option>
                                <option>Stable</option>
                                <option>Attention</option>
                                <option>Critical</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {patients.map(patient => (
                            <PatientCard key={patient.id} patient={patient} />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ProviderDashboard;
