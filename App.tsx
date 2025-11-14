import React, { useState, useEffect, useCallback } from 'react';
import { Parish, AppRecord, UserRole } from './types';
import ParishSelectionScreen from './components/ParishSelectionScreen';
import MainSystem from './components/MainSystem';

// Mocking the dataSdk for a realistic development experience.
// In a real environment, this would be provided by the platform.
const mockDataSdk = {
    records: [] as AppRecord[],
    handler: null as any,
    init: async function (handler: any) {
        this.handler = handler;
        // Pre-populate with some data for demonstration
        if (this.records.length === 0) {
            const sampleParish: Omit<Parish, '__backendId'> = {
                record_type: 'parish',
                parish_name: 'St. Michael the Archangel Parish',
                parish_region: 'NCR',
                parish_province: 'Metro Manila',
                parish_municipality: 'Taguig City',
                parish_barangay: 'Bonifacio Global City',
            };
            this.create(sampleParish);
        }
        return { isOk: true };
    },
    create: async function (record: Omit<AppRecord, '__backendId'>) {
        const newRecord = { ...record, __backendId: `mock_${Date.now()}_${Math.random()}` };
        this.records.push(newRecord as AppRecord);
        this.handler.onDataChanged(this.records);
        // Return the full record so the UI can get the ID
        return { isOk: true, record: newRecord };
    },
    update: async function(updatedRecord: AppRecord) {
        const index = this.records.findIndex(r => r.__backendId === updatedRecord.__backendId);
        if (index !== -1) {
            this.records[index] = updatedRecord;
            this.handler.onDataChanged(this.records);
            return { isOk: true };
        }
        return { isOk: false };
    },
    delete: async function (recordToDelete: AppRecord) {
        this.records = this.records.filter(r => r.__backendId !== recordToDelete.__backendId);
        this.handler.onDataChanged(this.records);
        return { isOk: true };
    },
};

// Use the mock SDK if the global one isn't available
const dataSdk = (window as any).dataSdk || mockDataSdk;

const App: React.FC = () => {
    const [allRecords, setAllRecords] = useState<AppRecord[]>([]);
    const [selectedParish, setSelectedParish] = useState<Parish | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<UserRole>('visitor');
    const [userHomeParish, setUserHomeParish] = useState<Parish | null>(null);

    const handleDataChanged = useCallback((data: AppRecord[]) => {
        setAllRecords([...data]);
    }, []);

    useEffect(() => {
        const initialize = async () => {
            const result = await dataSdk.init({ onDataChanged: handleDataChanged });
            if (!result.isOk) {
                console.error("Failed to initialize data SDK");
            }
            // Initial data load might happen here if sdk provides it
            if(mockDataSdk.records.length > 0) {
                handleDataChanged(mockDataSdk.records);
            }
            setIsLoading(false);
        };
        initialize();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleDataChanged]);
    
    // This function now handles the actual navigation to the main system
    const handleViewDashboard = (parish: Parish) => {
        setSelectedParish(parish);
    };

    // This function handles a successful login
    const handleLogin = (parish: Parish, role: UserRole) => {
        setUserRole(role);
        setUserHomeParish(parish);
        setSelectedParish(parish); // Navigate to the parish dashboard after login
    };

    // This function resets the app to the parish selection screen
    const handleChangeParish = () => {
        setSelectedParish(null);
        setUserRole('visitor'); // Reset role on logout/change parish
        setUserHomeParish(null);
    };

    const handleAddRecord = async (record: Omit<AppRecord, '__backendId'>) => {
        return await dataSdk.create(record);
    };

    const handleUpdateRecord = async (record: AppRecord) => {
        return await dataSdk.update(record);
    };

    const handleDeleteRecord = async (record: AppRecord) => {
        return await dataSdk.delete(record);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loading-spinner"></div>
                <p className="ml-4 text-lg text-gray-700">Initializing System...</p>
            </div>
        );
    }
    
    return (
        <div className="h-screen w-screen overflow-auto">
            {!selectedParish ? (
                <ParishSelectionScreen 
                    parishes={allRecords.filter(r => r.record_type === 'parish') as Parish[]}
                    onViewDashboard={handleViewDashboard}
                    onLogin={handleLogin}
                    onAddRecord={handleAddRecord}
                />
            ) : (
                <MainSystem 
                    parish={selectedParish}
                    allRecords={allRecords}
                    onChangeParish={handleChangeParish}
                    onAddRecord={handleAddRecord}
                    onUpdateRecord={handleUpdateRecord}
                    onDeleteRecord={handleDeleteRecord}
                    userRole={userRole}
                    userHomeParish={userHomeParish}
                />
            )}
        </div>
    );
};

export default App;