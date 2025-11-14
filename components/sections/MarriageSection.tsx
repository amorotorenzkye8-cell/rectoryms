import React, { useState } from 'react';
import { Parish, AppRecord, Marriage } from '../../types';
import ReviewAppointmentModal from '../modals/ReviewAppointmentModal';

interface SectionProps {
    parish: Parish;
    parishRecords: AppRecord[];
    onAddRecord: (record: Omit<AppRecord, '__backendId'>) => Promise<{ isOk: boolean }>;
    onUpdateRecord: (record: AppRecord) => Promise<{ isOk: boolean }>;
    onDeleteRecord: (record: AppRecord) => Promise<{ isOk: boolean }>;
}

const AddMarriageModal: React.FC<{ parish: Parish; onClose: () => void; onAddRecord: SectionProps['onAddRecord']; }> = ({ parish, onClose, onAddRecord }) => {
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const newRecord: Omit<Marriage, '__backendId'> = {
            record_type: 'marriage',
            parish_name: parish.parish_name,
            parish_region: parish.parish_region,
            parish_province: parish.parish_province,
            parish_municipality: parish.parish_municipality,
            parish_barangay: parish.parish_barangay,
            bride_name: data.bride_name as string,
            groom_name: data.groom_name as string,
            bride_parents: data.bride_parents as string,
            groom_parents: data.groom_parents as string,
            bride_birthday: data.bride_birthday as string,
            groom_birthday: data.groom_birthday as string,
            bride_birthplace: data.bride_birthplace as string,
            groom_birthplace: data.groom_birthplace as string,
            scheduled_date: data.scheduled_date as string,
            contact_number: data.contact_number as string,
            status: 'approved',
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
                 <h3 className="text-2xl font-bold text-gray-800 mb-6">Add Marriage Record</h3>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="bride_name" placeholder="Bride's Name" required className="w-full p-2 border rounded" />
                    <input name="groom_name" placeholder="Groom's Name" required className="w-full p-2 border rounded" />
                    <input name="bride_parents" placeholder="Bride's Parents" required className="w-full p-2 border rounded" />
                    <input name="groom_parents" placeholder="Groom's Parents" required className="w-full p-2 border rounded" />
                    <input name="bride_birthday" type="date" placeholder="Bride's Birthday" required className="w-full p-2 border rounded" />
                    <input name="groom_birthday" type="date" placeholder="Groom's Birthday" required className="w-full p-2 border rounded" />
                    <input name="scheduled_date" type="date" placeholder="Wedding Date" required className="w-full p-2 border rounded" />
                    <input name="contact_number" placeholder="Contact Number" required className="w-full p-2 border rounded" />
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

const MarriageSection: React.FC<SectionProps> = ({ parish, parishRecords, onAddRecord, onUpdateRecord, onDeleteRecord }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [reviewRecord, setReviewRecord] = useState<Marriage | null>(null);
    const records = parishRecords.filter(r => r.record_type === 'marriage') as Marriage[];

    const statusMap = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800'
    };

    return (
        <div className="glass-card rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">💒 Marriage Records</h3>
                <button onClick={() => setIsAddModalOpen(true)} className="btn-primary px-6 py-3 rounded-xl text-white font-semibold bg-yellow-800 hover:bg-yellow-900 transition">
                    + Add Marriage
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Couple</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length > 0 ? records.map(record => (
                            <tr key={record.__backendId} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3">{record.bride_name} & {record.groom_name}</td>
                                <td className="px-4 py-3">{new Date(record.scheduled_date).toLocaleDateString()}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusMap[record.status]}`}>{record.status}</span></td>
                                <td className="px-4 py-3 text-center space-x-2">
                                     {record.status === 'pending' && (
                                        <button onClick={() => setReviewRecord(record)} className="text-blue-600 hover:text-blue-800 font-semibold text-sm">Review</button>
                                    )}
                                    <button onClick={() => onDeleteRecord(record)} className="text-red-600 hover:text-red-800 font-semibold text-sm">Delete</button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="text-center py-12 text-gray-500">No marriage records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isAddModalOpen && <AddMarriageModal parish={parish} onClose={() => setIsAddModalOpen(false)} onAddRecord={onAddRecord} />}
            {reviewRecord && (
                <ReviewAppointmentModal 
                    record={reviewRecord}
                    onClose={() => setReviewRecord(null)}
                    onUpdateRecord={onUpdateRecord}
                />
            )}
        </div>
    );
};

export default MarriageSection;