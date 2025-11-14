import React, { useState } from 'react';
import { Parish, AppRecord, Registration } from '../../types';
import ReviewAppointmentModal from '../modals/ReviewAppointmentModal'; // Using the new review modal

interface SectionProps {
    parish: Parish;
    parishRecords: AppRecord[];
    onAddRecord: (record: Omit<AppRecord, '__backendId'>) => Promise<{ isOk: boolean }>;
    onUpdateRecord: (record: AppRecord) => Promise<{ isOk: boolean }>;
    onDeleteRecord: (record: AppRecord) => Promise<{ isOk: boolean }>;
}

// AddRegistrationModal remains mostly the same, but simplified for clarity in this example.
const AddRegistrationModal: React.FC<{ parish: Parish; onClose: () => void; onAddRecord: SectionProps['onAddRecord']; }> = ({ parish, onClose, onAddRecord }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const newRecord: Omit<Registration, '__backendId'> = {
            record_type: 'registration',
            parish_name: parish.parish_name,
            parish_region: parish.parish_region,
            parish_province: parish.parish_province,
            parish_municipality: parish.parish_municipality,
            parish_barangay: parish.parish_barangay,
            name: data.name as string,
            age: parseInt(data.age as string),
            sex: data.sex as 'Male' | 'Female',
            contact_number: data.contact_number as string,
            email: data.email as string,
            address: data.address as string,
            birthday: data.birthday as string,
            birthplace: data.birthplace as string,
            status: 'approved',
            added_by: 'Staff', // Or get current user
        };
        const result = await onAddRecord(newRecord);
        if (result.isOk) {
            onClose();
        } else {
            alert("Failed to add record");
        }
        setIsLoading(false);
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="modal-content bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                 <h3 className="text-2xl font-bold text-gray-800 mb-6">Add Registration</h3>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" placeholder="Full Name" required className="w-full p-2 border rounded" />
                    <input name="age" type="number" placeholder="Age" required className="w-full p-2 border rounded" />
                    <select name="sex" required className="w-full p-2 border rounded"><option value="Male">Male</option><option value="Female">Female</option></select>
                    <input name="contact_number" placeholder="Contact Number" required className="w-full p-2 border rounded" />
                    <input name="birthday" type="date" required className="w-full p-2 border rounded" />
                    <input name="birthplace" placeholder="Birthplace" required className="w-full p-2 border rounded" />
                    <input name="address" placeholder="Address" required className="w-full p-2 border rounded" />
                    <input name="email" type="email" placeholder="Email" className="w-full p-2 border rounded" />
                    <div className="flex justify-end gap-4 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-yellow-800 text-white rounded disabled:bg-gray-400">{isLoading ? 'Saving...' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const RegistrationSection: React.FC<SectionProps> = ({ parish, parishRecords, onAddRecord, onUpdateRecord, onDeleteRecord }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [reviewRecord, setReviewRecord] = useState<Registration | null>(null);
    const records = parishRecords.filter(r => r.record_type === 'registration') as Registration[];

    const statusMap = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800'
    };

    return (
        <div className="glass-card rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">📋 Registration Records</h3>
                <button onClick={() => setIsAddModalOpen(true)} className="btn-primary px-6 py-3 rounded-xl text-white font-semibold bg-yellow-800 hover:bg-yellow-900 transition">
                    + Add Registration
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Contact</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Added By</th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length > 0 ? records.map(record => (
                            <tr key={record.__backendId} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3">{record.name}</td>
                                <td className="px-4 py-3">{record.contact_number}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusMap[record.status]}`}>{record.status}</span></td>
                                <td className="px-4 py-3">{record.added_by}</td>
                                <td className="px-4 py-3 text-center space-x-2">
                                    {record.status === 'pending' && (
                                        <button onClick={() => setReviewRecord(record)} className="text-blue-600 hover:text-blue-800 font-semibold text-sm">Review</button>
                                    )}
                                    <button onClick={() => onDeleteRecord(record)} className="text-red-600 hover:text-red-800 font-semibold text-sm">Delete</button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="text-center py-12 text-gray-500">No registration records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isAddModalOpen && <AddRegistrationModal parish={parish} onClose={() => setIsAddModalOpen(false)} onAddRecord={onAddRecord} />}
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

export default RegistrationSection;