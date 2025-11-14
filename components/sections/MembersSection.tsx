import React, { useState } from 'react';
import { Parish, AppRecord, Member } from '../../types';

interface SectionProps {
    parish: Parish;
    parishRecords: AppRecord[];
    onAddRecord: (record: Omit<AppRecord, '__backendId'>) => Promise<{ isOk: boolean }>;
    onDeleteRecord: (record: AppRecord) => Promise<{ isOk: boolean }>;
}

const AddMemberModal: React.FC<{ parish: Parish; onClose: () => void; onAddRecord: SectionProps['onAddRecord']; }> = ({ parish, onClose, onAddRecord }) => {
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const newRecord: Omit<Member, '__backendId'> = {
            record_type: 'member',
            parish_name: parish.parish_name,
            parish_region: parish.parish_region,
            parish_province: parish.parish_province,
            parish_municipality: parish.parish_municipality,
            parish_barangay: parish.parish_barangay,
            name: data.name as string,
            age: parseInt(data.age as string),
            sex: data.sex as 'Male' | 'Female',
            contact_number: data.contact_number as string,
            birthday: data.birthday as string,
            address: data.address as string,
            civil_status: data.civil_status as any,
            member_type: data.member_type as any,
            membership_date: data.membership_date as string,
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
                 <h3 className="text-2xl font-bold text-gray-800 mb-6">Add Parish Member</h3>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" placeholder="Full Name" required className="w-full p-2 border rounded" />
                    <input name="age" type="number" placeholder="Age" required className="w-full p-2 border rounded" />
                    <select name="sex" required className="w-full p-2 border rounded"><option value="Male">Male</option><option value="Female">Female</option></select>
                    <input name="contact_number" placeholder="Contact" required className="w-full p-2 border rounded" />
                    <input name="birthday" type="date" placeholder="Birthday" required className="w-full p-2 border rounded" />
                    <input name="address" placeholder="Address" required className="w-full p-2 border rounded" />
                    <select name="civil_status" required className="w-full p-2 border rounded"><option>Single</option><option>Married</option><option>Widowed</option></select>
                    <select name="member_type" required className="w-full p-2 border rounded"><option>Regular</option><option>Youth</option><option>Senior</option><option>Choir</option><option>Volunteer</option></select>
                    <input name="membership_date" type="date" placeholder="Member Since" required className="w-full p-2 border rounded" />
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


const MembersSection: React.FC<SectionProps> = ({ parish, parishRecords, onAddRecord, onDeleteRecord }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const records = parishRecords.filter(r => r.record_type === 'member') as Member[];

    return (
        <div className="glass-card rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">👥 Parish Members</h3>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary px-6 py-3 rounded-xl text-white font-semibold bg-yellow-800 hover:bg-yellow-900 transition">
                    + Add Member
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Age</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Contact</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Since</th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length > 0 ? records.map(record => (
                            <tr key={record.__backendId} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3">{record.name}</td>
                                <td className="px-4 py-3">{record.age}</td>
                                <td className="px-4 py-3">{record.contact_number}</td>
                                <td className="px-4 py-3">{record.member_type}</td>
                                <td className="px-4 py-3">{new Date(record.membership_date).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-center">
                                    <button onClick={() => onDeleteRecord(record)} className="text-red-600 hover:text-red-800 font-semibold text-sm">Delete</button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={6} className="text-center py-12 text-gray-500">No member records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && <AddMemberModal parish={parish} onClose={() => setIsModalOpen(false)} onAddRecord={onAddRecord} />}
        </div>
    );
};

export default MembersSection;
