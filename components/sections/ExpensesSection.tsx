import React, { useState, useMemo } from 'react';
import { Parish, AppRecord, Expense } from '../../types';

interface SectionProps {
    parish: Parish;
    parishRecords: AppRecord[];
    onAddRecord: (record: Omit<AppRecord, '__backendId'>) => Promise<{ isOk: boolean }>;
    onDeleteRecord: (record: AppRecord) => Promise<{ isOk: boolean }>;
    canEdit: boolean; // New prop to control editability
}

const AddExpenseModal: React.FC<{ parish: Parish; onClose: () => void; onAddRecord: SectionProps['onAddRecord']; }> = ({ parish, onClose, onAddRecord }) => {
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const newRecord: Omit<Expense, '__backendId'> = {
            record_type: 'expense',
            parish_name: parish.parish_name,
            parish_region: parish.parish_region,
            parish_province: parish.parish_province,
            parish_municipality: parish.parish_municipality,
            parish_barangay: parish.parish_barangay,
            expense_date: data.expense_date as string,
            expense_category: data.expense_category as any,
            expense_amount: parseFloat(data.expense_amount as string),
            expense_description: data.expense_description as string,
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
                 <h3 className="text-2xl font-bold text-gray-800 mb-6">Add Expense</h3>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="expense_date" type="date" required className="w-full p-2 border rounded" />
                    <select name="expense_category" required className="w-full p-2 border rounded">
                        <option>Utilities</option><option>Maintenance</option><option>Supplies</option><option>Salaries</option><option>Events</option><option>Other</option>
                    </select>
                    <input name="expense_amount" type="number" step="0.01" placeholder="Amount" required className="w-full p-2 border rounded" />
                    <textarea name="expense_description" placeholder="Description" required className="w-full p-2 border rounded"></textarea>
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

const ExpensesSection: React.FC<SectionProps> = ({ parish, parishRecords, onAddRecord, onDeleteRecord, canEdit }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const records = parishRecords.filter(r => r.record_type === 'expense') as Expense[];
    
    const totalExpenses = useMemo(() => records.reduce((sum, r) => sum + r.expense_amount, 0), [records]);

    return (
        <div className="glass-card rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">💰 Parish Expenses</h3>
                {canEdit && (
                    <button onClick={() => setIsModalOpen(true)} className="btn-primary px-6 py-3 rounded-xl text-white font-semibold bg-yellow-800 hover:bg-yellow-900 transition">
                        + Add Expense
                    </button>
                )}
            </div>
            
            <div className="mb-6 bg-red-50 p-4 rounded-lg">
                <span className="font-semibold text-red-800">Total Expenses:</span>
                <span className="text-2xl font-bold text-red-600 ml-2">₱{totalExpenses.toFixed(2)}</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">Amount</th>
                            {canEdit && <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {records.length > 0 ? records.map(record => (
                            <tr key={record.__backendId} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3">{new Date(record.expense_date).toLocaleDateString()}</td>
                                <td className="px-4 py-3">{record.expense_category}</td>
                                <td className="px-4 py-3">{record.expense_description}</td>
                                <td className="px-4 py-3 text-right">₱{record.expense_amount.toFixed(2)}</td>
                                {canEdit && (
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => onDeleteRecord(record)} className="text-red-600 hover:text-red-800 font-semibold text-sm">Delete</button>
                                    </td>
                                )}
                            </tr>
                        )) : (
                            <tr><td colSpan={canEdit ? 5 : 4} className="text-center py-12 text-gray-500">No expense records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && canEdit && <AddExpenseModal parish={parish} onClose={() => setIsModalOpen(false)} onAddRecord={onAddRecord} />}
        </div>
    );
};

export default ExpensesSection;