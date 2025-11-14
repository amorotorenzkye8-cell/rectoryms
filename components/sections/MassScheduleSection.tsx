import React, { useState } from 'react';
import { Parish, AppRecord, MassSchedule } from '../../types';

interface SectionProps {
    parish: Parish;
    parishRecords: AppRecord[];
    onAddRecord: (record: Omit<AppRecord, '__backendId'>) => Promise<{ isOk: boolean }>;
    onDeleteRecord: (record: AppRecord) => Promise<{ isOk: boolean }>;
}

const AddMassModal: React.FC<{ parish: Parish; onClose: () => void; onAddRecord: SectionProps['onAddRecord']; }> = ({ parish, onClose, onAddRecord }) => {
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const newRecord: Omit<MassSchedule, '__backendId'> = {
            record_type: 'mass',
            parish_name: parish.parish_name,
            parish_region: parish.parish_region,
            parish_province: parish.parish_province,
            parish_municipality: parish.parish_municipality,
            parish_barangay: parish.parish_barangay,
            mass_day: data.mass_day as any,
            mass_time: data.mass_time as string,
            mass_type: data.mass_type as any,
            mass_language: data.mass_language as any,
            officiating_priest: data.officiating_priest as string,
            added_by: 'Staff',
        };
        const result = await onAddRecord(newRecord);
        if (result.isOk) onClose();
        else alert("Failed to add record");
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="modal-content bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                 <h3 className="text-2xl font-bold text-gray-800 mb-6">Add Mass Schedule</h3>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <select name="mass_day" required className="w-full p-2 border rounded"><option>Sunday</option><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option></select>
                    <input name="mass_time" type="time" required className="w-full p-2 border rounded" />
                    <select name="mass_type" required className="w-full p-2 border rounded"><option>Regular Mass</option><option>Children's Mass</option><option>Youth Mass</option><option>Healing Mass</option><option>Special Mass</option></select>
                    <select name="mass_language" required className="w-full p-2 border rounded"><option>English</option><option>Filipino</option><option>Bisaya</option><option>Ilocano</option><option>Other</option></select>
                    <input name="officiating_priest" placeholder="Officiating Priest" required className="w-full p-2 border rounded" />
                    <div className="flex justify-end gap-4 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-yellow-800 text-white rounded disabled:bg-gray-400">
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const MassScheduleSection: React.FC<SectionProps> = ({ parish, parishRecords, onAddRecord, onDeleteRecord }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const records = parishRecords.filter(r => r.record_type === 'mass') as MassSchedule[];

    return (
        <div className="glass-card rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">⏰ Mass Schedule</h3>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary px-6 py-3 rounded-xl text-white font-semibold bg-yellow-800 hover:bg-yellow-900 transition">
                    + Add Schedule
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Day</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Time</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Language</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Priest</th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length > 0 ? records.map(record => (
                            <tr key={record.__backendId} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3">{record.mass_day}</td>
                                <td className="px-4 py-3">{record.mass_time}</td>
                                <td className="px-4 py-3">{record.mass_type}</td>
                                <td className="px-4 py-3">{record.mass_language}</td>
                                <td className="px-4 py-3">{record.officiating_priest}</td>
                                <td className="px-4 py-3 text-center">
                                    <button onClick={() => onDeleteRecord(record)} className="text-red-600 hover:text-red-800 font-semibold text-sm">Delete</button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={6} className="text-center py-12 text-gray-500">No mass schedules found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && <AddMassModal parish={parish} onClose={() => setIsModalOpen(false)} onAddRecord={onAddRecord} />}
        </div>
    );
};

export default MassScheduleSection;
