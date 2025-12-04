import React from 'react';
import { Link } from 'react-router-dom';

const PatientCard = ({ patient }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 hover:border-emerald-500/50 transition-colors shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-100">{patient.name}</h3>
                    <p className="text-sm text-slate-400">ID: {patient.id}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${patient.status === 'Critical' ? 'bg-red-500/20 text-red-400' :
                        patient.status === 'Attention' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-emerald-500/20 text-emerald-400'
                    }`}>
                    {patient.status}
                </span>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Age/Gender</span>
                    <span className="text-slate-300">{patient.age} / {patient.gender}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Last Visit</span>
                    <span className="text-slate-300">{patient.lastVisit}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Condition</span>
                    <span className="text-slate-300">{patient.condition}</span>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex gap-2">
                <Link
                    to={`/provider/patients/${patient.id}`}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-center py-2 rounded text-sm font-medium transition-colors"
                >
                    View Details
                </Link>
                <button className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm transition-colors">
                    Message
                </button>
            </div>
        </div>
    );
};

export default PatientCard;
