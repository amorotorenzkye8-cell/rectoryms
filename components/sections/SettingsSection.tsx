import React, { useState } from 'react';
import { Parish, AppRecord, UserRole } from '../../types';

interface SettingsSectionProps {
    parish: Parish;
    onUpdateRecord: (record: AppRecord) => Promise<{ isOk: boolean }>;
    userRole: UserRole;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ parish, onUpdateRecord, userRole }) => {
    const [staffCode, setStaffCode] = useState(parish.staff_access_code || '');
    const [priestCode, setPriestCode] = useState(parish.priest_access_code || '');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const isPriest = userRole === 'priest';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const updatedParish = {
            ...parish,
            staff_access_code: staffCode,
            priest_access_code: isPriest ? priestCode : parish.priest_access_code,
        };

        const result = await onUpdateRecord(updatedParish);
        setIsLoading(false);

        if (result.isOk) {
            setMessage({ text: 'Access codes updated successfully!', type: 'success' });
        } else {
            setMessage({ text: 'Failed to update access codes.', type: 'error' });
        }
    };

    return (
        <div className="glass-card rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">⚙️ System Settings</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Staff Access Code</label>
                    <input
                        type="password"
                        value={staffCode}
                        onChange={(e) => setStaffCode(e.target.value)}
                        className="form-input w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-yellow-800 transition"
                        placeholder="Enter new staff code"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Priest Access Code</label>
                    <input
                        type="password"
                        value={priestCode}
                        onChange={(e) => setPriestCode(e.target.value)}
                        disabled={!isPriest}
                        className="form-input w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-yellow-800 transition disabled:bg-gray-200"
                        placeholder={isPriest ? "Enter new priest code" : "Only priests can change this"}
                    />
                </div>
                
                {message && (
                    <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message.text}
                    </div>
                )}
                
                <div className="pt-2">
                    <button type="submit" disabled={isLoading} className="w-full px-6 py-3 rounded-xl text-white font-semibold bg-yellow-800 hover:bg-yellow-900 disabled:bg-gray-400 transition flex items-center justify-center">
                        {isLoading ? <div className="loading-spinner"></div> : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsSection;
