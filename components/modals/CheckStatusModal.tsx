import React, { useState } from 'react';
import { Parish, AppRecord, AppointmentRecord } from '../../types';

interface CheckStatusModalProps {
    parish: Parish;
    allRecords: AppRecord[];
    onClose: () => void;
}

const CheckStatusModal: React.FC<CheckStatusModalProps> = ({ parish, allRecords, onClose }) => {
    const [appointmentId, setAppointmentId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [foundRecord, setFoundRecord] = useState<AppointmentRecord | null>(null);

    const handleCheckStatus = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFoundRecord(null);

        if (!appointmentId) {
            setError('Please enter your Appointment ID.');
            return;
        }

        setIsLoading(true);
        // Simulate a network delay for better UX
        setTimeout(() => {
            const record = allRecords.find(r => 
                r.__backendId === appointmentId && 
                r.parish_name === parish.parish_name
            );

            // FIX: The record was incorrectly cast, causing a type error on the check below.
            // The type guard now correctly validates that the found record is one of the appointment types.
            if (record && (record.record_type === 'registration' || record.record_type === 'baptism' || record.record_type === 'marriage' || record.record_type === 'funeral')) {
                setFoundRecord(record);
            } else {
                setError('Appointment not found. Please check the ID and ensure you are in the correct parish dashboard.');
            }
            setIsLoading(false);
        }, 500);
    };

    const statusMap = {
        pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
        approved: { text: 'Approved', color: 'bg-green-100 text-green-800' },
        rejected: { text: 'Rejected', color: 'bg-red-100 text-red-800' }
    };

    const getRecordTitle = (record: AppointmentRecord) => {
        switch(record.record_type) {
            case 'registration': return record.name;
            case 'baptism': return record.child_name;
            case 'marriage': return `${record.bride_name} & ${record.groom_name}`;
            case 'funeral': return record.deceased_name;
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="modal-content bg-white rounded-2xl p-8 max-w-lg w-full">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">🔍 Check Appointment Status</h3>
                <p className="text-gray-600 mb-6">For parish: <span className="font-semibold">{parish.parish_name}</span></p>

                {!foundRecord ? (
                    <form onSubmit={handleCheckStatus} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment ID *</label>
                            <input 
                                type="text" 
                                value={appointmentId}
                                onChange={e => setAppointmentId(e.target.value)}
                                className="form-input w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-yellow-800 transition" 
                                placeholder="Enter the ID you received upon booking"
                                required
                            />
                        </div>
                        
                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <div className="flex gap-3 pt-4">
                            <button type="submit" disabled={isLoading} className="flex-1 px-6 py-3 rounded-xl text-white font-semibold bg-yellow-800 hover:bg-yellow-900 disabled:bg-gray-400 transition flex items-center justify-center">
                                {isLoading ? <div className="loading-spinner"></div> : 'Check Status'}
                            </button>
                            <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 px-6 py-3 rounded-xl text-white font-semibold bg-gray-500 hover:bg-gray-600 transition">
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Appointment For:</p>
                            <p className="font-semibold text-lg text-gray-800">{getRecordTitle(foundRecord)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status:</p>
                            <p className={`inline-block px-3 py-1 text-md font-bold rounded-full ${statusMap[foundRecord.status].color}`}>{statusMap[foundRecord.status].text}</p>
                        </div>
                        {foundRecord.staff_reply && (
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <p className="text-sm font-semibold text-gray-600 mb-2">Reply from the Parish:</p>
                                <p className="text-gray-800 whitespace-pre-wrap">{foundRecord.staff_reply}</p>
                            </div>
                        )}
                         <div className="pt-4">
                            <button onClick={onClose} className="w-full px-6 py-3 rounded-xl text-white font-semibold bg-gray-500 hover:bg-gray-600 transition">
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckStatusModal;