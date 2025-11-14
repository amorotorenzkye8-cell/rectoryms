import React, { useState, useMemo } from 'react';
import { Parish, AppRecord, Donation } from '../../types';

interface SectionProps {
    parish: Parish;
    parishRecords: AppRecord[];
    onAddRecord: (record: Omit<AppRecord, '__backendId'>) => Promise<{ isOk: boolean }>;
    onDeleteRecord: (record: AppRecord) => Promise<{ isOk: boolean }>;
}

const AddDonationModal: React.FC<{ parish: Parish; onClose: () => void; onAddRecord: SectionProps['onAddRecord']; }> = ({ parish, onClose, onAddRecord }) => {
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const newRecord: Omit<Donation, '__backendId'> = {
            record_type: 'donation',
            parish_name: parish.parish_name,
            parish_region: parish.parish_region,
            parish_province: parish.parish_province,
            parish_municipality: parish.parish_municipality,
            parish_barangay: parish.parish_barangay,
            donor_name: data.donor_name as string,
            donation_date: data.donation_date as string,
            donation_amount: parseFloat(data.donation_amount as string),
            donation_purpose: data.donation_purpose as any,
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
                 <h3 className="text-2xl font-bold text-gray-800 mb-6">Add Donation</h3>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="donor_name" placeholder="Donor Name" required className="w-full p-2 border rounded" />
                    <input name="donation_date" type="date" required className="w-full p-2 border rounded" />
                    <input name="donation_amount" type="number" step="0.01" placeholder="Amount" required className="w-full p-2 border rounded" />
                    <select name="donation_purpose" required className="w-full p-2 border rounded">
                        <option value="Church Building">Church Building</option>
                        <option value="Charity">Charity</option>
                        <option value="Mass Offering">Mass Offering</option>
                        <option value="General Fund">General Fund</option>
                        <option value="Other">Other</option>
                    </select>
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

const DonationsSection: React.FC<SectionProps> = ({ parish, parishRecords, onAddRecord, onDeleteRecord }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const records = parishRecords.filter(r => r.record_type === 'donation') as Donation[];
    
    const totalDonations = useMemo(() => records.reduce((sum, r) => sum + r.donation_amount, 0), [records]);

    return (
        <div className="glass-card rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">💝 Donations</h3>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary px-6 py-3 rounded-xl text-white font-semibold bg-yellow-800 hover:bg-yellow-900 transition">
                    + Add Donation
                </button>
            </div>

            <div className="mb-6 bg-green-50 p-4 rounded-lg">
                <span className="font-semibold text-green-800">Total Donations:</span>
                <span className="text-2xl font-bold text-green-600 ml-2">₱{totalDonations.toFixed(2)}</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Donor</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Purpose</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">Amount</th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length > 0 ? records.map(record => (
                            <tr key={record.__backendId} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3">{record.donor_name}</td>
                                <td className="px-4 py-3">{new Date(record.donation_date).toLocaleDateString()}</td>
                                <td className="px-4 py-3">{record.donation_purpose}</td>
                                <td className="px-4 py-3 text-right">₱{record.donation_amount.toFixed(2)}</td>
                                <td className="px-4 py-3 text-center">
                                    <button onClick={() => onDeleteRecord(record)} className="text-red-600 hover:text-red-800 font-semibold text-sm">Delete</button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="text-center py-12 text-gray-500">No donation records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && <AddDonationModal parish={parish} onClose={() => setIsModalOpen(false)} onAddRecord={onAddRecord} />}
        </div>
    );
};

export default DonationsSection;
