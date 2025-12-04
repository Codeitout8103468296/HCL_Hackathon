import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ProviderSidebar = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'bg-emerald-500/20 text-emerald-400 border-r-2 border-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200';
    };

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 min-h-screen flex flex-col">
            <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-emerald-400">Provider Portal</h2>
                <p className="text-xs text-slate-500 mt-1">Dr. Smith</p>
            </div>

            <nav className="flex-1 py-6 space-y-1">
                <Link
                    to="/provider/dashboard"
                    className={`block px-6 py-3 text-sm font-medium transition-colors ${isActive('/provider/dashboard')}`}
                >
                    Dashboard
                </Link>
                <Link
                    to="/provider/patients"
                    className={`block px-6 py-3 text-sm font-medium transition-colors ${isActive('/provider/patients')}`}
                >
                    My Patients
                </Link>
                <Link
                    to="/provider/appointments"
                    className={`block px-6 py-3 text-sm font-medium transition-colors ${isActive('/provider/appointments')}`}
                >
                    Appointments
                </Link>
                <Link
                    to="/provider/messages"
                    className={`block px-6 py-3 text-sm font-medium transition-colors ${isActive('/provider/messages')}`}
                >
                    Messages
                </Link>
                <Link
                    to="/provider/settings"
                    className={`block px-6 py-3 text-sm font-medium transition-colors ${isActive('/provider/settings')}`}
                >
                    Settings
                </Link>
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm transition-colors">
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default ProviderSidebar;
