import React, { useState } from 'react';
import { Parish, AppRecord } from '../../types';

interface AddParishModalProps {
    onClose: () => void;
    onAddRecord: (parish: Omit<Parish, '__backendId'>) => Promise<{ isOk: boolean }>;
}

const AddParishModal: React.FC<AddParishModalProps> = ({ onClose, onAddRecord }) => {
    const [name, setName] = useState('');
    const [region, setRegion] = useState('');
    const [province, setProvince] = useState('');
    const [municipality, setMunicipality] = useState('');
    const [barangay, setBarangay] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !region || !province || !municipality || !barangay) {
            setError('All fields are required.');
            return;
        }
        
        setIsLoading(true);
        setError('');

        const newParish: Omit<Parish, '__backendId'> = {
            record_type: 'parish',
            parish_name: name,
            parish_region: region,
            parish_province: province,
            parish_municipality: municipality,
            parish_barangay: barangay,
            staff_access_code: 'staff123',
            priest_access_code: 'priest456',
        };

        const result = await onAddRecord(newParish);
        setIsLoading(false);

        if (result.isOk) {
            onClose();
        } else {
            setError('Failed to add parish. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="modal-content bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">➕ Add New Parish</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Parish Name *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="form-input w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-yellow-800 transition" required />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Region *</label>
                            <select value={region} onChange={e => setRegion(e.target.value)} className="form-input w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-yellow-800 transition" required>
                                <option value="">Select Region</option>
                                <option value="NCR">NCR</option>
                                <option value="CAR">CAR</option>
                                <option value="Region I">Region I - Ilocos</option>
                                <option value="Region II">Region II - Cagayan Valley</option>
                                <option value="Region III">Region III - Central Luzon</option>
                                <option value="Region IV-A">Region IV-A - CALABARZON</option>
                                <option value="Region IV-B">Region IV-B - MIMAROPA</option>
                                <option value="Region V">Region V - Bicol</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Province *</label>
                            <input type="text" value={province} onChange={e => setProvince(e.target.value)} className="form-input w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-yellow-800 transition" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Municipality/City *</label>
                            <input type="text" value={municipality} onChange={e => setMunicipality(e.target.value)} className="form-input w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-yellow-800 transition" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Barangay *</label>
                            <input type="text" value={barangay} onChange={e => setBarangay(e.target.value)} className="form-input w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-yellow-800 transition" required />
                        </div>
                    </div>
                    
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex gap-3 pt-4">
                        <button type="submit" disabled={isLoading} className="flex-1 px-6 py-3 rounded-xl text-white font-semibold bg-yellow-800 hover:bg-yellow-900 disabled:bg-gray-400 transition flex items-center justify-center">
                            {isLoading ? <div className="loading-spinner"></div> : 'Add Parish'}
                        </button>
                        <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 px-6 py-3 rounded-xl text-white font-semibold bg-gray-500 hover:bg-gray-600 transition">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddParishModal;