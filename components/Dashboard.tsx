
import React, { useState, useMemo } from 'react';
import { AppRecord, Parish, AppointmentRecord } from '../types';
import BookAppointmentModal from './modals/BookAppointmentModal';
import CheckStatusModal from './modals/CheckStatusModal';

const Toast: React.FC<{ message: React.ReactNode; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(onClose, 10000); // Increased duration for appointment ID
        return () => clearTimeout(timer);
    }, [onClose]);

    const baseClasses = 'fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white font-semibold z-[100] transition-transform transform-gpu animate-slideIn max-w-sm';
    const typeClasses = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return <div className={`${baseClasses} ${typeClasses}`}>{message}</div>;
};

interface DashboardProps {
    parish: Parish;
    allRecords: AppRecord[];
    parishRecords: AppRecord[];
    onAddRecord: (record: Omit<AppRecord, '__backendId'>) => Promise<{ isOk: boolean; record?: AppRecord }>;
}

const StatCard: React.FC<{ icon: string; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
    <div className="stat-card glass-card rounded-xl p-6 transition-transform duration-300 hover:-translate-y-1">
        <div className="text-3xl mb-2">{icon}</div>
        <div className={`text-3xl font-bold ${color}`}>{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
    </div>
);

const HighlightedText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
    if (!highlight.trim() || !text) {
        return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-yellow-300 px-0 rounded">{part}</mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
};

// Helper to get display info from a record
const getRecordDisplayInfo = (record: AppRecord) => {
    switch (record.record_type) {
        case 'registration': return { icon: '📋', type: 'Registration', title: record.name, subtitle: `Contact: ${record.contact_number}` };
        case 'baptism': return { icon: '💧', type: 'Baptism', title: record.child_name, subtitle: `Parents: ${record.father_name} & ${record.mother_name}` };
        case 'marriage': return { icon: '💒', type: 'Marriage', title: `${record.bride_name} & ${record.groom_name}`, subtitle: `Date: ${new Date(record.scheduled_date).toLocaleDateString()}` };
        case 'funeral': return { icon: '🕊️', type: 'Funeral', title: record.deceased_name, subtitle: `Date: ${new Date(record.funeral_date).toLocaleDateString()}` };
        case 'donation': return { icon: '💝', type: 'Donation', title: `₱${record.donation_amount.toFixed(2)}`, subtitle: `From: ${record.donor_name}` };
        case 'member': return { icon: '👥', type: 'Member', title: record.name, subtitle: `Type: ${record.member_type}` };
        case 'mass': return { icon: '⏰', type: 'Mass Schedule', title: `${record.mass_day} at ${record.mass_time}`, subtitle: `Priest: ${record.officiating_priest}` };
        case 'expense': return { icon: '💰', type: 'Expense', title: `₱${record.expense_amount.toFixed(2)}`, subtitle: record.expense_description };
        default: return { icon: '📄', type: 'Record', title: 'Unknown Record', subtitle: '' };
    }
}


const Dashboard: React.FC<DashboardProps> = ({ parish, allRecords, parishRecords, onAddRecord }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [isCheckStatusModalOpen, setIsCheckStatusModalOpen] = useState(false);
    const [toast, setToast] = useState<{message: React.ReactNode; type: 'success' | 'error'} | null>(null);

    const stats = useMemo(() => {
        return {
            registrations: parishRecords.filter(r => r.record_type === 'registration').length,
            baptisms: parishRecords.filter(r => r.record_type === 'baptism').length,
            marriages: parishRecords.filter(r => r.record_type === 'marriage').length,
            funerals: parishRecords.filter(r => r.record_type === 'funeral').length,
            totalDonations: parishRecords.filter(r => r.record_type === 'donation').reduce((sum, r) => sum + (r as any).donation_amount, 0),
            members: parishRecords.filter(r => r.record_type === 'member').length,
            masses: parishRecords.filter(r => r.record_type === 'mass').length
        };
    }, [parishRecords]);

    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) {
            return [];
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        
        return parishRecords.filter(record => {
            switch (record.record_type) {
                case 'registration':
                case 'member':
                    return record.name.toLowerCase().includes(lowercasedFilter);
                case 'baptism':
                    return record.child_name.toLowerCase().includes(lowercasedFilter) ||
                           record.father_name.toLowerCase().includes(lowercasedFilter) ||
                           record.mother_name.toLowerCase().includes(lowercasedFilter);
                case 'marriage':
                    return record.bride_name.toLowerCase().includes(lowercasedFilter) ||
                           record.groom_name.toLowerCase().includes(lowercasedFilter);
                case 'funeral':
                    return record.deceased_name.toLowerCase().includes(lowercasedFilter);
                case 'donation':
                    return record.donor_name.toLowerCase().includes(lowercasedFilter);
                case 'mass':
                    return record.officiating_priest.toLowerCase().includes(lowercasedFilter);
                case 'expense':
                    return record.expense_description.toLowerCase().includes(lowercasedFilter);
                default:
                    return false;
            }
        });
    }, [searchTerm, parishRecords]);
    
    const handleAppointmentSuccess = (newRecord: AppointmentRecord) => {
        setIsAppointmentModalOpen(false);
        setToast({ 
            message: (
                <div>
                    <p className="font-bold">Appointment booked successfully!</p>
                    <p className="text-sm mt-1">Please save your Appointment ID to check the status later:</p>
                    <p className="text-sm font-mono mt-2 bg-green-700 p-1 rounded">{newRecord.__backendId}</p>
                </div>
            ),
            type: 'success' 
        });
    }

    return (
        <div id="section-dashboard">
             {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="glass-card rounded-2xl p-8 mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">🔎 Global Parish Search</h3>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for any record by name, priest, description, etc..."
                    className="w-full p-4 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-yellow-800 transition text-lg"
                />
                {searchTerm && (
                    <div className="mt-4 max-h-80 overflow-y-auto rounded-lg border">
                        {searchResults.length > 0 ? (
                            searchResults.map(record => {
                                const { icon, type, title, subtitle } = getRecordDisplayInfo(record);
                                return (
                                    <div key={record.__backendId} className="p-4 border-b last:border-b-0 hover:bg-yellow-50 transition cursor-pointer">
                                        <div className="font-semibold text-gray-800 text-md">
                                            {icon} <HighlightedText text={title} highlight={searchTerm} />
                                        </div>
                                        <div className="text-sm text-gray-600 pl-7">
                                            <span className="font-medium">{type}:</span> <HighlightedText text={subtitle} highlight={searchTerm} />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-center text-gray-500 py-6">No records found matching your search.</p>
                        )}
                    </div>
                )}
            </div>
            
            <div className="glass-card rounded-2xl p-8 mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 Parish Overview</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon="📋" label="Registrations" value={stats.registrations} color="text-blue-600" />
                    <StatCard icon="💧" label="Baptisms" value={stats.baptisms} color="text-cyan-600" />
                    <StatCard icon="💒" label="Marriages" value={stats.marriages} color="text-pink-600" />
                    <StatCard icon="🕊️" label="Funerals" value={stats.funerals} color="text-gray-600" />
                </div>
                <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <StatCard icon="💝" label="Total Donations" value={`₱${stats.totalDonations.toFixed(2)}`} color="text-green-600" />
                    <StatCard icon="👥" label="Members" value={stats.members} color="text-purple-600" />
                    <StatCard icon="⏰" label="Mass Schedules" value={stats.masses} color="text-orange-600" />
                </div>
                <div className="mt-8 border-t pt-6 flex flex-wrap gap-4 justify-center">
                    <button 
                        onClick={() => setIsAppointmentModalOpen(true)}
                        className="px-6 py-3 rounded-xl text-white font-semibold text-lg bg-indigo-500 hover:bg-indigo-600 transition transform hover:-translate-y-1 shadow-lg"
                    >
                        📅 Book Appointment
                    </button>
                    <button 
                        onClick={() => setIsCheckStatusModalOpen(true)}
                        className="px-6 py-3 rounded-xl text-white font-semibold text-lg bg-cyan-500 hover:bg-cyan-600 transition transform hover:-translate-y-1 shadow-lg"
                    >
                        🔍 Check Status
                    </button>
                </div>
            </div>

            {isAppointmentModalOpen && (
                <BookAppointmentModal
                    parish={parish}
                    onClose={() => setIsAppointmentModalOpen(false)}
                    onAddRecord={onAddRecord}
                    onSuccess={handleAppointmentSuccess}
                />
            )}

            {isCheckStatusModalOpen && (
                <CheckStatusModal
                    parish={parish}
                    allRecords={allRecords}
                    onClose={() => setIsCheckStatusModalOpen(false)}
                />
            )}
        </div>
    );
};

export default Dashboard;