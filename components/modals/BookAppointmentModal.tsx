import React, { useState } from 'react';
import { Parish, AppRecord, Registration, Baptism, Marriage, Funeral, AppointmentRecord } from '../../types';

type AppointmentType = 'registration' | 'baptism' | 'marriage' | 'funeral';

// --- Reusable Form Field Components ---
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label} {props.required && '*'}</label>
        <input {...props} className="form-input w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-yellow-800 transition" />
    </div>
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label} {props.required && '*'}</label>
        <select {...props} className="form-input w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-yellow-800 transition">
            {children}
        </select>
    </div>
);

// --- Specific Form Sections ---
const RegistrationFormFields = () => (
    <>
        <FormInput label="Full Name" name="name" required />
        <FormInput label="Age" name="age" type="number" required />
        <FormSelect label="Sex" name="sex" required>
            <option value="">Select Sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
        </FormSelect>
        <FormInput label="Contact Number" name="contact_number" type="tel" required />
        <FormInput label="Email" name="email" type="email" required={false} />
        <FormInput label="Birthday" name="birthday" type="date" required />
        <FormInput label="Birthplace" name="birthplace" required />
        <FormInput label="Address" name="address" required />
    </>
);

const BaptismFormFields = () => (
    <>
        <FormInput label="Child's Name" name="child_name" required />
        <FormInput label="Birthday" name="birthday" type="date" required />
        <FormInput label="Father's Name" name="father_name" required />
        <FormInput label="Mother's Name" name="mother_name" required />
        <FormInput label="Birthplace" name="birthplace" required />
        <FormInput label="Preferred Date" name="scheduled_date" type="date" required />
        <FormInput label="Contact Number" name="contact_number" type="tel" required />
        <FormInput label="Email" name="email" type="email" required={false} />
        <FormInput label="Address" name="address" required />
    </>
);

const MarriageFormFields = () => (
     <>
        <FormInput label="Bride's Name" name="bride_name" required />
        <FormInput label="Groom's Name" name="groom_name" required />
        <FormInput label="Bride's Parents" name="bride_parents" placeholder="Father & Mother" required />
        <FormInput label="Groom's Parents" name="groom_parents" placeholder="Father & Mother" required />
        <FormInput label="Bride's Birthday" name="bride_birthday" type="date" required />
        <FormInput label="Groom's Birthday" name="groom_birthday" type="date" required />
        <FormInput label="Bride's Birthplace" name="bride_birthplace" required />
        <FormInput label="Groom's Birthplace" name="groom_birthplace" required />
        <FormInput label="Preferred Wedding Date" name="scheduled_date" type="date" required />
        <FormInput label="Contact Number" name="contact_number" type="tel" required />
        <FormInput label="Email" name="email" type="email" required={false} />
    </>
);

const FuneralFormFields = () => (
    <>
        <FormInput label="Name of Deceased" name="deceased_name" required />
        <FormInput label="Age" name="age" type="number" required />
         <FormSelect label="Sex" name="sex" required>
            <option value="">Select Sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
        </FormSelect>
        <FormInput label="Birthday" name="birthday" type="date" required />
        <FormInput label="Date of Death" name="date_of_death" type="date" required />
        <FormInput label="Birthplace" name="birthplace" required />
        <FormInput label="Preferred Funeral Date" name="funeral_date" type="date" required />
        <FormInput label="Preferred Time" name="funeral_time" type="time" required />
        <FormInput label="Place of Funeral" name="funeral_place" required />
        <FormInput label="Burial Site" name="burial_site" required />
        <FormInput label="Contact Number" name="contact_number" type="tel" required />
        <FormInput label="Email" name="email" type="email" required={false} />
    </>
);

// --- Main Modal Component ---
interface BookAppointmentModalProps {
    parish: Parish;
    onClose: () => void;
    onAddRecord: (record: Omit<AppRecord, '__backendId'>) => Promise<{ isOk: boolean; record?: AppRecord }>;
    onSuccess: (newRecord: AppointmentRecord) => void;
}

const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({ parish, onClose, onAddRecord, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [appointmentType, setAppointmentType] = useState<AppointmentType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTypeSelect = (type: AppointmentType) => {
        setAppointmentType(type);
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const form = e.currentTarget;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const baseRecordData = {
            parish_name: parish.parish_name,
            parish_region: parish.parish_region,
            parish_province: parish.parish_province,
            parish_municipality: parish.parish_municipality,
            parish_barangay: parish.parish_barangay,
            status: 'pending' as const,
            added_by: 'Visitor',
        };
        
        let record: Omit<AppRecord, '__backendId'> | null = null;

        try {
            switch (appointmentType) {
                case 'registration':
                    record = { ...baseRecordData, record_type: 'registration', ...data, age: parseInt(data.age as string) } as Omit<Registration, '__backendId'>;
                    break;
                case 'baptism':
                    record = { ...baseRecordData, record_type: 'baptism', ...data } as Omit<Baptism, '__backendId'>;
                    break;
                case 'marriage':
                     record = { ...baseRecordData, record_type: 'marriage', ...data } as Omit<Marriage, '__backendId'>;
                    break;
                case 'funeral':
                     record = { ...baseRecordData, record_type: 'funeral', ...data, age: parseInt(data.age as string) } as Omit<Funeral, '__backendId'>;
                    break;
            }

            if(record) {
                const result = await onAddRecord(record);
                if (result.isOk && result.record) {
                    onSuccess(result.record as AppointmentRecord);
                } else {
                    setError('Failed to book appointment. Please try again.');
                }
            }
        } catch (err) {
            setError('An error occurred. Please check your inputs.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const APPOINTMENT_TYPES = {
        registration: { icon: '📋', label: 'Registration', component: <RegistrationFormFields /> },
        baptism: { icon: '💧', label: 'Baptism', component: <BaptismFormFields /> },
        marriage: { icon: '💒', label: 'Marriage', component: <MarriageFormFields /> },
        funeral: { icon: '🕊️', label: 'Funeral', component: <FuneralFormFields /> },
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="modal-content bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {step === 1 && (
                    <>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">📅 Book an Appointment</h3>
                        <p className="text-gray-600 mb-6">For: <span className="font-semibold">{parish.parish_name}</span></p>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(APPOINTMENT_TYPES).map(([key, { icon, label }]) => (
                                <button key={key} onClick={() => handleTypeSelect(key as AppointmentType)} className="p-6 border-2 rounded-xl text-center hover:bg-yellow-50 hover:border-yellow-800 transition">
                                    <div className="text-4xl mb-2">{icon}</div>
                                    <div className="font-semibold text-gray-700">{label}</div>
                                </button>
                            ))}
                        </div>
                        <div className="mt-6">
                            <button onClick={onClose} className="w-full px-6 py-3 rounded-xl text-white font-semibold bg-gray-500 hover:bg-gray-600 transition">
                                Cancel
                            </button>
                        </div>
                    </>
                )}
                {step === 2 && appointmentType && (
                     <form onSubmit={handleSubmit}>
                        <div className="flex items-center mb-6">
                            <button type="button" onClick={() => setStep(1)} className="mr-4 text-gray-500 hover:text-gray-800">&larr; Back</button>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {APPOINTMENT_TYPES[appointmentType].icon} {APPOINTMENT_TYPES[appointmentType].label} Appointment
                            </h3>
                        </div>
                        <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {APPOINTMENT_TYPES[appointmentType].component}
                        </div>
                         {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                        <div className="flex gap-3 pt-6">
                            <button type="submit" disabled={isLoading} className="flex-1 px-6 py-3 rounded-xl text-white font-semibold bg-yellow-800 hover:bg-yellow-900 disabled:bg-gray-400 transition flex items-center justify-center">
                                {isLoading ? <div className="loading-spinner"></div> : 'Submit Appointment'}
                            </button>
                            <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 px-6 py-3 rounded-xl text-white font-semibold bg-gray-500 hover:bg-gray-600 transition">
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default BookAppointmentModal;