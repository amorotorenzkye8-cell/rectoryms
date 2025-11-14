import React, { useState } from 'react';
import { AppRecord, Baptism, Marriage, Funeral, MassSchedule } from '../../types';

interface CalendarSectionProps {
    parishRecords: AppRecord[];
}

const CalendarSection: React.FC<CalendarSectionProps> = ({ parishRecords }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const events = parishRecords.filter(r => 
        r.record_type === 'baptism' || 
        r.record_type === 'marriage' || 
        r.record_type === 'funeral' || 
        r.record_type === 'mass'
    );

    const renderDays = () => {
        const days = [];
        // Empty cells for days before the 1st of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day bg-gray-50 min-h-[120px]"></div>);
        }

        // Cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const today = new Date();
            const cellDate = new Date(year, month, day);
            const isToday = today.toDateString() === cellDate.toDateString();
            const dateStr = cellDate.toISOString().split('T')[0];

            const dayEvents = events.filter(e => {
                switch(e.record_type) {
                    case 'baptism':
                    case 'marriage':
                        return (e as Baptism | Marriage).scheduled_date === dateStr;
                    case 'funeral':
                        return (e as Funeral).funeral_date === dateStr;
                    case 'mass':
                        const dayName = cellDate.toLocaleDateString('en-US', { weekday: 'long' });
                        return (e as MassSchedule).mass_day === dayName;
                    default:
                        return false;
                }
            });

            days.push(
                <div key={day} className={`calendar-day relative border p-2 ${isToday ? 'bg-yellow-100 border-yellow-400' : 'border-gray-200'} min-h-[120px]`}>
                    <div className={`font-bold ${isToday ? 'text-yellow-900' : 'text-gray-700'}`}>{day}</div>
                    <div className="mt-1 space-y-1">
                        {dayEvents.map(event => {
                             let primaryText = '';
                             let secondaryText = '';
                             let tertiaryText = '';
                             let eventClass = '';
                             let title = '';
 
                             switch(event.record_type) {
                                 case 'baptism':
                                     const baptism = event as Baptism;
                                     eventClass = 'bg-cyan-100 text-cyan-800';
                                     primaryText = `💧 ${baptism.child_name}`;
                                     if (baptism.officiating_priest) {
                                         secondaryText = `👤 ${baptism.officiating_priest}`;
                                     }
                                     title = `Baptism: ${baptism.child_name}${secondaryText ? ` by ${baptism.officiating_priest}` : ''}`;
                                     break;
                                 case 'marriage':
                                     const marriage = event as Marriage;
                                     eventClass = 'bg-pink-100 text-pink-800';
                                     primaryText = `💒 ${marriage.groom_name}`;
                                     if (marriage.officiating_priest) {
                                         secondaryText = `👤 ${marriage.officiating_priest}`;
                                     }
                                     title = `Marriage: ${marriage.bride_name} & ${marriage.groom_name}${secondaryText ? ` by ${marriage.officiating_priest}` : ''}`;
                                     break;
                                 case 'funeral':
                                     const funeral = event as Funeral;
                                     eventClass = 'bg-gray-200 text-gray-800';
                                     primaryText = `⏰ ${funeral.funeral_time}`;
                                     secondaryText = `🕊️ ${funeral.deceased_name}`;
                                     title = `Funeral for ${funeral.deceased_name} at ${funeral.funeral_time}`;
                                     if(funeral.officiating_priest) {
                                        title += ` by ${funeral.officiating_priest}`
                                     }
                                     break;
                                 case 'mass':
                                     const mass = event as MassSchedule;
                                     eventClass = 'bg-amber-100 text-amber-800';
                                     primaryText = `⏰ ${mass.mass_time}`;
                                     secondaryText = `${mass.mass_type} (${mass.mass_language})`;
                                     tertiaryText = `👤 ${mass.officiating_priest}`;
                                     title = `${mass.mass_type} (${mass.mass_language}) at ${mass.mass_time} by ${mass.officiating_priest}`;
                                     break;
                             }
                            return (
                                <div key={event.__backendId} className={`text-xs p-1 rounded-md ${eventClass}`} title={title}>
                                    <p className="overflow-hidden truncate font-semibold">{primaryText}</p>
                                    {secondaryText && <p className="overflow-hidden truncate">{secondaryText}</p>}
                                    {tertiaryText && <p className="overflow-hidden truncate">{tertiaryText}</p>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }
        return days;
    };

    const previousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    return (
        <div className="glass-card rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">📅 Event Calendar</h3>
                <div className="flex gap-2">
                    <button onClick={previousMonth} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">←</button>
                    <button onClick={nextMonth} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">→</button>
                </div>
            </div>
            <div className="mb-4">
                <h4 id="calendar-month-year" className="text-xl font-bold text-center text-gray-700">{monthNames[month]} {year}</h4>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-gray-600 mb-2">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-1">
                {renderDays()}
            </div>
        </div>
    );
};

export default CalendarSection;