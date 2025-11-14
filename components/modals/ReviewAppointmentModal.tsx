import React, { useState } from 'react';
import { AppointmentRecord, AppRecord } from '../../types';

interface ReviewAppointmentModalProps {
    record: AppointmentRecord;
    onClose: () => void;
    onUpdateRecord: (record: AppRecord) => Promise<{ isOk: boolean }>;
}

const Detail: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
    <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">{value || 'N/A'}</p>
    </div>
);

const ReviewAppointmentModal: React.FC<ReviewAppointmentModalProps> = ({ record, onClose, onUpdateRecord }) => {
    const [reply, setReply] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleUpdate = async (status: 'approved' | 'rejected') => {
        setIsLoading(true);
        const updatedRecord = { ...record, status, staff_reply: reply };
        const result = await onUpdateRecord(updatedRecord);
        if(result.isOk) {
            setToast({ message: `Appointment ${status} and reply sent!`, type: 'success' });
            setTimeout(() => {
                onClose();
            }, 2000);
        } else {
            setToast({ message: 'Failed to update. Please try again.', type: 'error' });
        }
        setIsLoading(false);
    };

    const renderRecordDetails = () => {
        switch (record.record_type) {
            case 'registration':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <Detail label="Name" value={record.name} />
                        <Detail label="Age" value={record.age} />
                        <Detail label="Contact" value={record.contact_number} />
                        <Detail label="Email" value={record.email} />
                        <Detail label="Birthday" value={record.birthday} />
                        <Detail label="Birthplace" value={record.birthplace} />
                        <Detail label="Address" value={record.address} />
                    </div>
                );
            case 'baptism':
                return (
                     <div className="grid grid-cols-2 gap-4">
                        <Detail label="Child's Name" value={record.child_name} />
                        <Detail label="Father's Name" value={record.father_name} />
                        <Detail label="Mother's Name" value={record.mother_name} />
                         <Detail label="Requested Date" value={new Date(record.scheduled_date).toLocaleDateString()} />
                        <Detail label="Contact" value={record.contact_number} />
                        <Detail label="Email" value={record.email} />
                    </div>
                );
             case 'marriage':
                return (
                     <div className="grid grid-cols-2 gap-4">
                        <Detail label="Bride's Name" value={record.bride_name} />
                        <Detail label="Groom's Name" value={record.groom_name} />
                         <Detail label="Requested Date" value={new Date(record.scheduled_date).toLocaleDateString()} />
                        <Detail label="Contact" value={record.contact_number} />
                        <Detail label="Email" value={record.email} />
                    </div>
                );
            case 'funeral':
                 return (
                     <div className="grid grid-cols-2 gap-4">
                        <Detail label="Deceased's Name" value={record.deceased_name} />
                        <Detail label="Age" value={record.age} />
                         <Detail label="Requested Date" value={new Date(record.funeral_date).toLocaleDateString()} />
                        <Detail label="Contact" value={record.contact_number} />
                        <Detail label="Email" value={record.email} />
                    </div>
                );
            default:
                return <p>No details available.</p>;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="modal-content bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 capitalize">Review {record.record_type} Request</h3>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    {renderRecordDetails()}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Reply Message</label>
                        <textarea
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            rows={4}
                            placeholder={`e.g., "Your appointment is confirmed for [Date] at [Time]. Please bring the required documents."`}
                            className="w-full p-2 border rounded-md"
                            disabled={isLoading}
                        ></textarea>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button onClick={() => handleUpdate('approved')} disabled={isLoading} className="flex-1 px-6 py-3 rounded-xl text-white font-semibold bg-green-600 hover:bg-green-700 disabled:bg-gray-400 transition">
                            Approve
                        </button>
                        <button onClick={() => handleUpdate('rejected')} disabled={isLoading} className="flex-1 px-6 py-3 rounded-xl text-white font-semibold bg-red-600 hover:bg-red-700 disabled:bg-gray-400 transition">
                            Reject
                        </button>
                         <button onClick={onClose} disabled={isLoading} className="flex-1 px-6 py-3 rounded-xl text-white font-semibold bg-gray-500 hover:bg-gray-600 transition">
                            Cancel
                        </button>
                    </div>
                </div>
                 {toast && <div className={`mt-4 p-3 rounded-lg ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{toast.message}</div>}
            </div>
        </div>
    );
};

export default ReviewAppointmentModal;