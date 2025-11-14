import React, { useState, useMemo } from 'react';
import { Parish, AppRecord, UserRole } from '../types';
import Dashboard from './Dashboard';
import RegistrationSection from './sections/RegistrationSection';
import BaptismSection from './sections/BaptismSection';
import MarriageSection from './sections/MarriageSection';
import FuneralSection from './sections/FuneralSection';
import DonationsSection from './sections/DonationsSection';
import MembersSection from './sections/MembersSection';
import MassScheduleSection from './sections/MassScheduleSection';
import ExpensesSection from './sections/ExpensesSection';
import CalendarSection from './sections/CalendarSection';
import SettingsSection from './sections/SettingsSection';


type Section = 'dashboard' | 'calendar' | 'registration' | 'baptism' | 'marriage' | 'funeral' | 'donations' | 'members' | 'mass' | 'expenses' | 'settings';

interface MainSystemProps {
    parish: Parish;
    allRecords: AppRecord[];
    onChangeParish: () => void;
    onAddRecord: (record: Omit<AppRecord, '__backendId'>) => Promise<{ isOk: boolean; record?: AppRecord; }>;
    onUpdateRecord: (record: AppRecord) => Promise<{ isOk: boolean }>;
    onDeleteRecord: (record: AppRecord) => Promise<{ isOk: boolean }>;
    userRole: UserRole;
    userHomeParish: Parish | null; // The parish the user is logged into
}

const NavButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; notificationCount?: number }> = ({ active, onClick, children, notificationCount }) => (
    <button
        className={`nav-button relative px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${active ? 'bg-gradient-to-r from-yellow-700 to-yellow-900 text-white shadow-md' : 'text-gray-700 hover:bg-yellow-100'}`}
        onClick={onClick}
    >
        {children}
        {notificationCount && notificationCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {notificationCount}
            </span>
        )}
    </button>
);


const MainSystem: React.FC<MainSystemProps> = ({ parish, allRecords, onChangeParish, onAddRecord, onUpdateRecord, onDeleteRecord, userRole, userHomeParish }) => {
    const [activeSection, setActiveSection] = useState<Section>('dashboard');
    
    const hasElevatedAccess = (userRole === 'staff' || userRole === 'priest') && userHomeParish?.__backendId === parish.__backendId;
    
    const parishRecords = allRecords.filter(r => 
        r.parish_name === parish.parish_name &&
        r.parish_region === parish.parish_region &&
        r.parish_province === parish.parish_province &&
        r.parish_municipality === parish.parish_municipality &&
        r.parish_barangay === parish.parish_barangay
    );

    const pendingCounts = useMemo(() => {
        if (!hasElevatedAccess) return {};
        return {
            registration: parishRecords.filter(r => r.record_type === 'registration' && r.status === 'pending').length,
            baptism: parishRecords.filter(r => r.record_type === 'baptism' && r.status === 'pending').length,
            marriage: parishRecords.filter(r => r.record_type === 'marriage' && r.status === 'pending').length,
            funeral: parishRecords.filter(r => r.record_type === 'funeral' && r.status === 'pending').length,
        };
    }, [parishRecords, hasElevatedAccess]);

    const renderSection = () => {
        const sectionProps = {
            parish,
            onAddRecord,
            onDeleteRecord,
            parishRecords
        };
        const staffSectionProps = { ...sectionProps, onUpdateRecord };

        switch(activeSection) {
            case 'dashboard':
                return <Dashboard parish={parish} allRecords={allRecords} parishRecords={parishRecords} onAddRecord={onAddRecord} />;
            case 'calendar':
                return <CalendarSection parishRecords={parishRecords} />;
            case 'registration':
                return <RegistrationSection {...staffSectionProps} />;
            case 'baptism':
                return <BaptismSection {...staffSectionProps} />;
            case 'marriage':
                return <MarriageSection {...staffSectionProps} />;
            case 'funeral':
                return <FuneralSection {...staffSectionProps} />;
            case 'donations':
                return <DonationsSection {...sectionProps} />;
            case 'members':
                return <MembersSection {...sectionProps} />;
            case 'mass':
                return <MassScheduleSection {...sectionProps} />;
            case 'expenses':
                return <ExpensesSection {...sectionProps} canEdit={hasElevatedAccess} />;
            case 'settings':
                return <SettingsSection parish={parish} onUpdateRecord={onUpdateRecord} userRole={userRole} />;
            default:
                return null;
        }
    };
    
    return (
        <>
            {/* Header */}
            <header className="glass-card sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="text-4xl">⛪</div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{parish.parish_name}</h1>
                                <p className="text-xs sm:text-sm text-gray-600">{`${parish.parish_barangay}, ${parish.parish_municipality}`}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm text-gray-600">Access Level</p>
                                <p className="text-lg font-bold text-yellow-800 capitalize">{userRole}</p>
                            </div>
                            <button onClick={onChangeParish} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-semibold">
                                {userRole !== 'visitor' ? 'Logout' : 'Change Parish'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Navigation */}
                <div className="glass-card rounded-2xl p-2 mb-8">
                    <div className="flex flex-wrap gap-2">
                        <NavButton active={activeSection === 'dashboard'} onClick={() => setActiveSection('dashboard')}>📊 Dashboard</NavButton>
                        <NavButton active={activeSection === 'calendar'} onClick={() => setActiveSection('calendar')}>📅 Calendar</NavButton>
                        
                        {/* Always show expenses tab, but its content will be read-only for visitors */}
                        <NavButton active={activeSection === 'expenses'} onClick={() => setActiveSection('expenses')}>💰 Expenses</NavButton>

                        {/* Conditionally render admin buttons */}
                        {hasElevatedAccess && (
                            <>
                                <NavButton active={activeSection === 'registration'} onClick={() => setActiveSection('registration')} notificationCount={pendingCounts.registration}>📋 Registration</NavButton>
                                <NavButton active={activeSection === 'baptism'} onClick={() => setActiveSection('baptism')} notificationCount={pendingCounts.baptism}>💧 Baptism</NavButton>
                                <NavButton active={activeSection === 'marriage'} onClick={() => setActiveSection('marriage')} notificationCount={pendingCounts.marriage}>💒 Marriage</NavButton>
                                <NavButton active={activeSection === 'funeral'} onClick={() => setActiveSection('funeral')} notificationCount={pendingCounts.funeral}>🕊️ Funeral</NavButton>
                                <NavButton active={activeSection === 'donations'} onClick={() => setActiveSection('donations')}>💝 Donations</NavButton>
                                <NavButton active={activeSection === 'members'} onClick={() => setActiveSection('members')}>👥 Members</NavButton>
                                <NavButton active={activeSection === 'mass'} onClick={() => setActiveSection('mass')}>⏰ Mass Schedule</NavButton>
                                <NavButton active={activeSection === 'settings'} onClick={() => setActiveSection('settings')}>⚙️ Settings</NavButton>
                            </>
                        )}
                    </div>
                </div>
                
                {renderSection()}
            </main>
        </>
    );
};

export default MainSystem;