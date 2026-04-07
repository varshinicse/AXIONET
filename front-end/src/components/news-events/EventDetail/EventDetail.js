// src/components/news-events/EventDetail/EventDetail.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    FaCalendarAlt, FaUser, FaClock, FaArrowLeft, FaEdit,
    FaTrash, FaMapMarkerAlt, FaLink, FaUsers, FaCheckCircle,
    FaTimesCircle, FaCalendarPlus, FaTicketAlt, FaInfoCircle
} from 'react-icons/fa';
import { newsEventsService } from '../../../services/api/news-events';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import LoadingSkeleton from '../../common/LoadingSkeleton';
import ModernCard from '../../common/ModernCard';
import ModernButton from '../../common/ModernButton';
import ModernBadge from '../../common/ModernBadge';
import Footer from '../../layout/Footer/Footer';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rsvpLoading, setRsvpLoading] = useState(false);
    const [attendees, setAttendees] = useState([]);
    const [showAttendees, setShowAttendees] = useState(false);

    const fetchEvent = useCallback(async () => {
        try {
            setLoading(true);
            const response = await newsEventsService.getById(id);
            if (response && response.data) {
                setEvent(response.data);
                document.title = `${response.data.title} | Event Details`;
                if (user && (user.role === 'staff' || user._id === response.data.author_id)) {
                    fetchAttendees();
                }
            }
        } catch (error) {
            console.error('Error fetching event:', error);
            toast.error('Failed to load event details');
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    const fetchAttendees = async () => {
        try {
            const response = await newsEventsService.getAttendees(id);
            if (response && response.data) {
                setAttendees(response.data);
            }
        } catch (error) {
            console.error('Error fetching attendees:', error);
        }
    };

    useEffect(() => {
        fetchEvent();
    }, [fetchEvent]);

    const handleRsvp = async () => {
        if (!user) {
            toast.info('Please sign in to RSVP');
            navigate('/signin');
            return;
        }

        try {
            setRsvpLoading(true);
            if (event.rsvp_status === 'registered') {
                await newsEventsService.cancelRsvp(id);
                toast.success('RSVP cancelled');
            } else {
                await newsEventsService.rsvp(id);
                toast.success('Successfully registered for the event!');
            }
            fetchEvent();
        } catch (error) {
            console.error('RSVP Error:', error);
            toast.error(error.response?.data?.message || 'Failed to update RSVP');
        } finally {
            setRsvpLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await newsEventsService.delete(id);
                toast.success('Event deleted successfully');
                navigate('/events');
            } catch (error) {
                toast.error('Failed to delete event');
            }
        }
    };

    const addToCalendar = () => {
        const eventDate = new Date(event.event_date);
        const startDate = eventDate.toISOString().replace(/-/g, '').split('T')[0];
        let startTime = '000000';
        if (event.event_time) startTime = event.event_time.replace(/:/g, '') + '00';
        let endHour = parseInt(startTime.substring(0, 2)) + 1;
        if (endHour > 23) endHour = 23;
        const endTime = endHour.toString().padStart(2, '0') + startTime.substring(2);

        const icsContent = [
            'BEGIN:VCALENDAR', 'VERSION:2.0',
            'PRODID:-//AXIONET//Alumni Event Scheduler//EN',
            'BEGIN:VEVENT', `SUMMARY:${event.title}`,
            `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
            `LOCATION:${event.location}`, `DTSTART:${startDate}T${startTime}`,
            `DTEND:${startDate}T${endTime}`, 'END:VEVENT', 'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Calendar file (.ics) downloaded!");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-24 pb-12 px-4 md:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <LoadingSkeleton variant="header" height="200px" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-6">
                            <LoadingSkeleton variant="card" height="400px" />
                        </div>
                        <div className="lg:col-span-4 space-y-6">
                            <LoadingSkeleton variant="card" height="300px" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
                <ModernCard variant="glass" className="max-w-md w-full text-center p-12">
                    <h2 className="text-3xl font-black text-text-primary mb-4">Event Not Found</h2>
                    <ModernButton variant="primary" onClick={() => navigate('/events')}>
                        <FaArrowLeft className="mr-2" /> Back to Events
                    </ModernButton>
                </ModernCard>
            </div>
        );
    }

    const isOrganizer = user && (user.role === 'staff' || user._id === event.author_id);
    const isFull = event.capacity > 0 && event.attendees_count >= event.capacity;
    const progress = event.capacity > 0 ? (event.attendees_count / event.capacity) * 100 : 0;

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 animate-in">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header Context */}
                <div className="flex items-center justify-between mb-8">
                    <Link to="/events" className="inline-flex items-center text-sm font-black uppercase tracking-widest text-primary hover:gap-2 transition-all">
                        <FaArrowLeft className="mr-2" /> Events Center
                    </Link>
                    {isOrganizer && (
                        <div className="flex gap-2">
                            <ModernButton variant="ghost" onClick={() => navigate(`/news-events/${id}/edit`)} className="px-4 py-2 bg-white border border-border/50 text-xs font-black uppercase tracking-widest">
                                <FaEdit className="mr-2" /> Edit
                            </ModernButton>
                            <ModernButton variant="ghost" onClick={handleDelete} className="px-4 py-2 bg-white border border-border/50 text-xs font-black uppercase tracking-widest text-error hover:bg-error/5">
                                <FaTrash className="mr-2" /> Delete
                            </ModernButton>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-8">
                        <ModernCard variant="elevated" padding="p-0" className="overflow-hidden border-none shadow-2xl shadow-primary/5">
                            {/* Event Hero */}
                            <div className="relative p-10 md:p-16 bg-white">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[10rem] -mr-20 -mt-20" />
                                <div className="relative z-10">
                                    <div className="flex gap-2 mb-6">
                                        <ModernBadge variant="primary" size="sm" className="font-black">
                                            {event.category}
                                        </ModernBadge>
                                        <ModernBadge variant="secondary" size="sm" className="font-black">
                                            {event.event_type}
                                        </ModernBadge>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-black text-text-primary leading-tight tracking-tighter mb-8">
                                        {event.title}
                                    </h1>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-8 rounded-3xl bg-neutral-50/80 border border-border/40">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-white shadow-xl shadow-black/5 flex items-center justify-center text-primary border border-border/50">
                                                <FaCalendarAlt />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-50 mb-0.5">Date</p>
                                                <p className="text-sm font-bold text-text-primary">{new Date(event.event_date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-white shadow-xl shadow-black/5 flex items-center justify-center text-primary border border-border/50">
                                                <FaClock />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-50 mb-0.5">Time</p>
                                                <p className="text-sm font-bold text-text-primary">{event.event_time || 'Check Description'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 sm:col-span-2">
                                            <div className="h-12 w-12 rounded-2xl bg-white shadow-xl shadow-black/5 flex items-center justify-center text-primary border border-border/50">
                                                <FaMapMarkerAlt />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-50 mb-0.5">Location</p>
                                                <p className="text-sm font-bold text-text-primary">{event.location}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Event Body */}
                            <div className="p-10 md:p-16 border-t border-border/40">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-8 flex items-center gap-3">
                                    <FaInfoCircle /> About This Event
                                </h3>
                                <div className="prose prose-primary max-w-none">
                                    <p className="text-lg font-medium text-text-primary/80 leading-relaxed whitespace-pre-wrap">
                                        {event.description}
                                    </p>
                                </div>
                                {event.register_link && (
                                    <div className="mt-12">
                                        <ModernButton variant="ghost" href={event.register_link} className="inline-flex items-center px-8 py-4 rounded-2xl border-2 border-primary/10 text-primary font-black uppercase tracking-widest">
                                            <FaLink className="mr-3" /> Registration Portal
                                        </ModernButton>
                                    </div>
                                )}
                            </div>
                        </ModernCard>

                        {/* Attendee Section (Admin only) */}
                        {isOrganizer && attendees.length > 0 && (
                            <ModernCard variant="glass" padding="p-0" className="overflow-hidden">
                                <button
                                    onClick={() => setShowAttendees(!showAttendees)}
                                    className="w-full flex items-center justify-between p-8 hover:bg-primary/5 transition-colors"
                                >
                                    <h3 className="text-sm font-black uppercase tracking-widest text-text-primary flex items-center gap-3">
                                        <FaUsers className="text-primary" /> Registered Guests ({attendees.length})
                                    </h3>
                                    <span className={`text-[10px] font-black uppercase tracking-widest transition-transform ${showAttendees ? 'rotate-180' : ''}`}>
                                        {showAttendees ? 'Hide' : 'View All'}
                                    </span>
                                </button>
                                {showAttendees && (
                                    <div className="px-8 pb-8 space-y-4 max-h-[400px] overflow-y-auto">
                                        {attendees.map((rsvp, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-border/40">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
                                                        {rsvp.user?.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-text-primary mb-0.5">{rsvp.user?.name}</p>
                                                        <p className="text-[10px] font-bold text-text-secondary uppercase">{rsvp.user?.role} • {rsvp.user?.dept}</p>
                                                    </div>
                                                </div>
                                                <ModernBadge variant="success" size="sx">Confirmed</ModernBadge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ModernCard>
                        )}
                    </div>

                    {/* Sidebar Action Panel */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-6">
                            <ModernCard variant="elevated" padding="p-8" className="border-none shadow-2xl shadow-primary/10 bg-primary text-white">
                                <div className="flex justify-between items-end mb-8 border-b border-white/20 pb-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Registration</p>
                                        <h2 className="text-4xl font-black italic">{event.price > 0 ? `$${event.price}` : 'FREE'}</h2>
                                    </div>
                                    <FaTicketAlt className="text-4xl opacity-20 mb-2" />
                                </div>

                                <div className="space-y-6 mb-10">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                            <span>Availability</span>
                                            <span>{event.attendees_count} / {event.capacity > 0 ? event.capacity : '∞'}</span>
                                        </div>
                                        {event.capacity > 0 && (
                                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${isFull ? 'bg-secondary' : 'bg-white'}`}
                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <ModernButton
                                        variant="secondary"
                                        onClick={handleRsvp}
                                        disabled={rsvpLoading || (event.rsvp_status !== 'registered' && isFull)}
                                        className="h-16 rounded-2xl text-text-primary bg-white hover:bg-neutral-100 font-black uppercase tracking-widest text-sm w-full py-0 shadow-xl shadow-black/20"
                                    >
                                        {rsvpLoading ? 'Processing...' : (
                                            event.rsvp_status === 'registered' ? (
                                                <><FaTimesCircle className="mr-2" /> Cancel Reservation</>
                                            ) : (
                                                isFull ? 'Sold Out' : <><FaCheckCircle className="mr-2" /> Secure My Spot</>
                                            )
                                        )}
                                    </ModernButton>
                                    <ModernButton
                                        variant="ghost"
                                        onClick={addToCalendar}
                                        className="h-14 rounded-2xl border border-white/20 text-white hover:bg-white/10 font-black uppercase tracking-widest text-xs py-0"
                                    >
                                        <FaCalendarPlus className="mr-2" /> Add to iCal
                                    </ModernButton>
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center font-black">
                                            {event.author?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Host</p>
                                            <p className="text-sm font-bold">{event.author?.name || 'Anonymous'}</p>
                                        </div>
                                    </div>
                                </div>
                            </ModernCard>

                            <ModernCard variant="glass" padding="p-6">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                    <FaInfoCircle /> Travel Advisory
                                </h4>
                                <p className="text-xs font-bold text-text-secondary leading-relaxed">
                                    Please ensure you arrive at least 15 minutes before the scheduled time. For online events, the link will be sent to your registered email.
                                </p>
                            </ModernCard>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default EventDetail;
