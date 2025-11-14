export interface BaseRecord {
    __backendId: string;
    parish_name: string;
    parish_region: string;
    parish_province: string;
    parish_municipality: string;
    parish_barangay: string;
}

export interface Parish extends Omit<BaseRecord, 'parish_name' | 'parish_region' | 'parish_province' | 'parish_municipality' | 'parish_barangay'> {
    record_type: 'parish';
    parish_name: string;
    parish_region: string;
    parish_province: string;
    parish_municipality: string;
    parish_barangay: string;
    staff_access_code?: string;
    priest_access_code?: string;
}

export interface Registration extends BaseRecord {
    record_type: 'registration';
    name: string;
    age: number;
    sex: 'Male' | 'Female';
    contact_number: string;
    email?: string;
    address: string;
    birthday: string; // YYYY-MM-DD
    birthplace: string;
    status: 'pending' | 'approved' | 'rejected';
    added_by: string;
    staff_reply?: string;
}

export interface Baptism extends BaseRecord {
    record_type: 'baptism';
    child_name: string;
    father_name: string;
    mother_name: string;
    birthday: string; // YYYY-MM-DD
    birthplace: string;
    scheduled_date: string; // YYYY-MM-DD
    contact_number: string;
    email?: string;
    address: string;
    status: 'pending' | 'approved' | 'rejected';
    officiating_priest?: string;
    added_by: string;
    staff_reply?: string;
}

export interface Marriage extends BaseRecord {
    record_type: 'marriage';
    bride_name: string;
    groom_name: string;
    bride_parents: string;
    groom_parents: string;
    bride_birthday: string;
    groom_birthday: string;
    bride_birthplace: string;
    groom_birthplace: string;
    scheduled_date: string;
    contact_number: string;
    email?: string;
    status: 'pending' | 'approved' | 'rejected';
    officiating_priest?: string;
    added_by: string;
    staff_reply?: string;
}

export interface Funeral extends BaseRecord {
    record_type: 'funeral';
    deceased_name: string;
    age: number;
    sex: 'Male' | 'Female';
    birthday: string;
    date_of_death: string;
    birthplace: string;
    funeral_date: string;
    funeral_time: string;
    funeral_place: string;
    burial_site: string;
    contact_number: string;
    email?: string;
    status: 'pending' | 'approved' | 'rejected';
    officiating_priest?: string;
    added_by: string;
    staff_reply?: string;
}

export interface Donation extends BaseRecord {
    record_type: 'donation';
    donor_name: string;
    donation_date: string;
    donation_amount: number;
    donation_purpose: 'Church Building' | 'Charity' | 'Mass Offering' | 'General Fund' | 'Other';
    added_by: string;
}

export interface Member extends BaseRecord {
    record_type: 'member';
    name: string;
    age: number;
    sex: 'Male' | 'Female';
    contact_number: string;
    email?: string;
    birthday: string;
    address: string;
    civil_status: 'Single' | 'Married' | 'Widowed';
    occupation?: string;
    member_type: 'Regular' | 'Youth' | 'Senior' | 'Choir' | 'Volunteer';
    membership_date: string;
    added_by: string;
}

export interface MassSchedule extends BaseRecord {
    record_type: 'mass';
    mass_day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
    mass_time: string; // HH:MM
    mass_type: 'Regular Mass' | "Children's Mass" | 'Youth Mass' | 'Healing Mass' | 'Special Mass';
    mass_language: 'English' | 'Filipino' | 'Bisaya' | 'Ilocano' | 'Other';
    officiating_priest: string;
    added_by: string;
}

export interface Expense extends BaseRecord {
    record_type: 'expense';
    expense_date: string;
    expense_category: 'Utilities' | 'Maintenance' | 'Supplies' | 'Salaries' | 'Events' | 'Other';
    expense_amount: number;
    expense_description: string;
    added_by: string;
}

// FIX: Define and export UserRole type.
export type UserRole = 'priest' | 'staff' | 'visitor';

export type AppointmentRecord = Registration | Baptism | Marriage | Funeral;

export type AppRecord = Parish | AppointmentRecord | Donation | Member | MassSchedule | Expense;