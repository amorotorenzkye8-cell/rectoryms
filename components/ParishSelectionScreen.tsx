import React, { useState, useMemo } from 'react';
import { Parish, UserRole, AppRecord } from '../types';
import AddParishModal from './modals/AddParishModal';


// --- Start: In-component Modals and Toast for simplicity ---

const Toast: React.FC<{ message: React.ReactNode; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(onClose, 10000); // Increased duration for appointment ID
        return () => clearTimeout(timer);
    }, [onClose]);

    const baseClasses = 'fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white font-semibold z-[100] transition-transform transform-gpu animate-slideIn max-w-sm';
    const typeClasses = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return <div className={`${baseClasses} ${typeClasses}`}>{message}</div>;
};


interface LoginModalProps {
    parish: Parish;
    onClose: () => void;
    onLogin: (parish: Parish, role: UserRole) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ parish, onClose, onLogin }) => {
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState('');
    
    const handleLogin = () => {
        const staffCode = parish.staff_access_code || 'staff123';
        const priestCode = parish.priest_access_code || 'priest456';
        
        if (accessCode === staffCode) {
            onLogin(parish, 'staff');
        } else if (accessCode === priestCode) {
            onLogin(parish, 'priest');
        } else {
            setError('Invalid access code.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="modal-content bg-white rounded-2xl p-8 max-w-md w-full">
                <h3 className="text-xl font-bold text-gray-800 mb-2">🔐 Staff/Priest Access</h3>
                <p className="text-gray-600 mb-6">Logging into: <span className="font-semibold">{parish.parish_name}</span></p>
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Access Code</label>
                        <input 
                            type="password" 
                            value={accessCode} 
                            onChange={e => { setAccessCode(e.target.value); setError(''); }}
                            className="form-input w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-yellow-800 transition" 
                            placeholder="Enter access code"
                        />
                         {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="flex-1 px-6 py-3 rounded-xl text-white font-semibold bg-yellow-800 hover:bg-yellow-900 transition">
                            Login
                        </button>
                        <button type="button" onClick={onClose} className="flex-1 px-6 py-3 rounded-xl text-white font-semibold bg-gray-500 hover:bg-gray-600 transition">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- End: In-component Modals ---


interface ParishSelectionScreenProps {
    parishes: Parish[];
    onViewDashboard: (parish: Parish) => void;
    onLogin: (parish: Parish, role: UserRole) => void;
    onAddRecord: (record: Omit<AppRecord, '__backendId'>) => Promise<{ isOk: boolean; record?: AppRecord }>;
}

const ParishCard: React.FC<{ parish: Parish; onSelect: () => void; isSelected: boolean }> = ({ parish, onSelect, isSelected }) => (
    <div 
        className={`parish-card glass-card rounded-xl p-6 transition-all duration-300 ease-in-out cursor-pointer hover:transform hover:-translate-y-2 hover:shadow-2xl ${isSelected ? 'ring-2 ring-yellow-800 shadow-xl' : ''}`}
        onClick={onSelect}
    >
        <div className="text-4xl mb-3 text-center">⛪</div>
        <h4 className="font-bold text-gray-800 text-center mb-2 text-lg">{parish.parish_name}</h4>
        <p className="text-sm text-gray-600 text-center mb-1">📍 {parish.parish_barangay}</p>
        <p className="text-sm text-gray-600 text-center mb-1">{parish.parish_municipality}</p>
        <p className="text-xs text-gray-500 text-center">{parish.parish_province}, {parish.parish_region}</p>
    </div>
);


const ParishSelectionScreen: React.FC<ParishSelectionScreenProps> = ({ parishes, onViewDashboard, onLogin, onAddRecord }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedParish, setSelectedParish] = useState<Parish | null>(null);
    const [isAddParishModalOpen, setIsAddParishModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    
    const filteredParishes = useMemo(() => {
        return parishes.filter(p => 
            p.parish_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.parish_barangay.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.parish_municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.parish_province.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.parish_region.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [parishes, searchTerm]);

    return (
        <>
            <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
                <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-6xl w-full">
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">⛪</div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Rectory Management System</h1>
                        <p className="text-lg text-gray-600">Select a parish to continue</p>
                    </div>
                    
                    <div className="mb-6">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-yellow-800 focus:ring-2 focus:ring-yellow-800/20 text-lg transition"
                            placeholder="🔍 Search parishes by name or location..."
                        />
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 min-h-[200px]">
                        {filteredParishes.length > 0 ? (
                            filteredParishes.map(parish => (
                                <ParishCard 
                                    key={parish.__backendId} 
                                    parish={parish} 
                                    onSelect={() => setSelectedParish(parish)} 
                                    isSelected={selectedParish?.__backendId === parish.__backendId}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                <div className="text-6xl mb-4">🔍</div>
                                <p className="text-lg">No parishes found. Click "Add New Parish" to create one!</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="text-center space-y-4 xl:space-y-0 xl:space-x-4 flex flex-wrap justify-center items-center gap-2">
                        <button 
                            onClick={() => setIsAddParishModalOpen(true)} 
                            className="w-full sm:w-auto flex-grow sm:flex-grow-0 px-6 py-3 rounded-xl text-white font-semibold text-lg bg-blue-500 hover:bg-blue-600 transition transform hover:-translate-y-1 shadow-lg"
                        >
                            ➕ Add New Parish
                        </button>
                        <button 
                            onClick={() => selectedParish && onViewDashboard(selectedParish)} 
                            disabled={!selectedParish}
                            className="w-full sm:w-auto flex-grow sm:flex-grow-0 px-6 py-3 rounded-xl text-white font-semibold text-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition transform disabled:transform-none hover:-translate-y-1 shadow-lg"
                        >
                            👁️ View Dashboard
                        </button>
                         <button 
                            onClick={() => setIsLoginModalOpen(true)}
                            disabled={!selectedParish}
                            className="w-full sm:w-auto flex-grow sm:flex-grow-0 px-6 py-3 rounded-xl text-white font-semibold text-lg bg-yellow-800 hover:bg-yellow-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition transform disabled:transform-none hover:-translate-y-1 shadow-lg"
                        >
                            🔐 Staff/Priest Login
                        </button>
                    </div>
                </div>
            </div>

            {isAddParishModalOpen && (
                <AddParishModal
                    onClose={() => setIsAddParishModalOpen(false)}
                    onAddRecord={onAddRecord}
                />
            )}
            
            {isLoginModalOpen && selectedParish && (
                <LoginModal 
                    parish={selectedParish}
                    onClose={() => setIsLoginModalOpen(false)}
                    onLogin={onLogin}
                />
            )}
        </>
    );
};

export default ParishSelectionScreen;