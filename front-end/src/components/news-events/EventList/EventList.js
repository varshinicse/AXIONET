// src/components/news-events/EventList/EventList.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaMapMarkerAlt, FaClock, FaPlus, FaUser, FaEdit, FaTrash,
    FaExternalLinkAlt, FaCheckCircle, FaCalendarDay, FaArrowRight
} from 'react-icons/fa';
import { newsEventsService } from '../../../services/api/news-events';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSkeleton from '../../common/LoadingSkeleton';
import ModernCard from '../../common/ModernCard';
import ModernButton from '../../common/ModernButton';
import ModernBadge from '../../common/ModernBadge';
import { toast } from 'react-toastify';
import Footer from '../../layout/Footer/Footer';

const EventList = ({ simulatedRole }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const { user: contextUser } = useAuth();

    const user = simulatedRole ? { ...contextUser, role: simulatedRole } : contextUser;
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const extraParams = simulatedRole ? { role: simulatedRole } : {};
            const response = await newsEventsService.getAll(1, 'event', extraParams);

            if (response.data && response.data.items) {
                setEvents(response.data.items);
            }
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Failed to load events');
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const getGroupedEvents = () => {
        const sortedEvents = [...events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
        const grouped = {};
        sortedEvents.forEach(event => {
            const dateStr = new Date(event.event_date).toISOString().split('T')[0];
            if (!grouped[dateStr]) grouped[dateStr] = [];
            grouped[dateStr].push(event);
        });

        return Object.keys(grouped).map(date => ({
            date,
            displayDate: new Date(date).toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
            }),
            events: grouped[date]
        }));
    };

    const handleEdit = (eventId) => navigate(`/news-events/${eventId}/edit`);

    const handleDelete = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                setLoading(true);
                await newsEventsService.delete(eventId);
                setEvents(prev => prev.filter(event => event._id !== eventId));
                toast.success('Event deleted successfully');
            } catch (error) {
                console.error('Error deleting event:', error);
                toast.error('Failed to delete event');
            } finally {
                setLoading(false);
            }
        }
    };

    const canEdit = (event) => user && user._id === event.author_id;

    const canDelete = (event) => {
        if (!user) return false;
        const userRole = user.role.toLowerCase();
        if (userRole === 'staff') {
            if (user._id === event.author_id) return true;
            return event.author?.role?.toLowerCase() === 'alumni';
        }
        return userRole === 'alumni' && user._id === event.author_id;
    };

    if (loading && events.length === 0) {
        return (
            <div className="min-h-screen bg-background pt-24 pb-12 px-4 md:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <LoadingSkeleton variant="header" height="100px" />
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => <LoadingSkeleton key={i} variant="card" height="200px" />)}
                    </div>
                </div>
            </div>
        );
    }

    if (error) return <div className="min-h-screen pt-24 text-center text-error font-black">{error}</div>;

    const groupedEvents = getGroupedEvents();

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 animate-in">
            <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
                {/* Header Section */}
                <div className="relative mb-16 p-12 rounded-[2.5rem] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-indigo-600 opacity-90" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 text-white">
                        <div>
                            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">
                                Experience <span className="text-secondary italic">AXIONET</span>
                            </h1>
                            <p className="text-white/80 text-lg font-medium max-w-xl">
                                Join our network of innovators, alumni, and staff in curated events designed for professional expansion.
                            </p>
                        </div>
                        {user && ['staff', 'alumni'].includes(user.role?.toLowerCase()) && (
                            <ModernButton
                                variant="secondary"
                                onClick={() => navigate('/news-events/create?type=event')}
                                className="px-10 py-5 rounded-2xl shadow-2xl shadow-black/20 text-text-primary bg-white hover:bg-neutral-100 font-black uppercase tracking-widest text-sm"
                            >
                                <FaPlus className="mr-2" /> Host Event
                            </ModernButton>
                        )}
                    </div>
                </div>

                {groupedEvents.length === 0 ? (
                    <ModernCard variant="glass" padding="p-20" className="text-center">
                        <div className="inline-flex h-24 w-24 bg-primary/5 rounded-full items-center justify-center mb-6">
                            <FaCalendarDay className="text-4xl text-primary opacity-20" />
                        </div>
                        <h2 className="text-2xl font-black text-text-primary mb-2">The Calendar is Quiet</h2>
                        <p className="text-text-secondary font-medium mb-8">But you can change that. Be the pioneer of our next gathering.</p>
                        {user && ['staff', 'alumni'].includes(user.role?.toLowerCase()) && (
                            <ModernButton variant="primary" onClick={() => navigate('/news-events/create?type=event')}>
                                Create First Event
                            </ModernButton>
                        )}
                    </ModernCard>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Sidebar - Date Selection */}
                        <aside className="lg:col-span-3">
                            <div className="sticky top-24 space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                                    <span className="h-2 w-2 bg-primary rounded-full" /> Timeline
                                </h3>
                                <div className="space-y-2">
                                    {groupedEvents.map((group, index) => (
                                        <button
                                            key={group.date}
                                            onClick={() => setActiveTab(index)}
                                            className={`w-full text-left px-6 py-4 rounded-2xl transition-all duration-300 flex items-center justify-between group ${activeTab === index
                                                    ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                                                    : 'bg-white hover:bg-primary/5 text-text-secondary'
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className={`text-xs font-black uppercase tracking-wider ${activeTab === index ? 'text-white/70' : 'text-primary'}`}>
                                                    {new Date(group.date).toLocaleDateString('en-US', { month: 'short' })}
                                                </span>
                                                <span className="text-xl font-black italic">
                                                    {new Date(group.date).getDate()}
                                                </span>
                                            </div>
                                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${activeTab === index ? 'bg-white/20' : 'bg-primary/5 group-hover:bg-primary/10'}`}>
                                                <span className="text-xs font-black">{group.events.length}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </aside>

                        {/* Main Content - Event List */}
                        <main className="lg:col-span-9 space-y-10">
                            <div className="flex items-center gap-4 mb-4">
                                <h2 className="text-3xl font-black tracking-tight text-text-primary">
                                    {groupedEvents[activeTab].displayDate}
                                </h2>
                                <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                            </div>

                            <div className="space-y-8 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-px before:bg-gradient-to-b before:from-primary/20 before:via-primary/5 before:to-transparent">
                                {groupedEvents[activeTab].events.map((event, index) => {
                                    const authorRole = event.author?.role?.toLowerCase() || '';
                                    const formattedTime = event.event_time || (event.event_date ? new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD');

                                    return (
                                        <div key={event._id || index} className="relative pl-24 group">
                                            {/* Time Marker */}
                                            <div className="absolute left-0 top-6 flex items-center gap-4">
                                                <div className="text-right w-16">
                                                    <span className="block text-[10px] font-black uppercase tracking-tighter text-primary">At</span>
                                                    <span className="text-sm font-black text-text-primary whitespace-nowrap">{formattedTime}</span>
                                                </div>
                                                <div className="h-4 w-4 rounded-full border-4 border-background bg-primary ring-4 ring-primary/10 relative z-10 group-hover:scale-125 transition-transform" />
                                            </div>

                                            <ModernCard
                                                padding="p-8"
                                                className="border-primary/5 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

                                                <div className="relative z-10">
                                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                                        <div className="flex gap-2">
                                                            <ModernBadge variant={authorRole === 'staff' ? 'primary' : authorRole === 'alumni' ? 'success' : 'neutral'} size="sm">
                                                                {authorRole || 'Guest'}
                                                            </ModernBadge>
                                                            {event.category && (
                                                                <ModernBadge variant="info" size="sm" className="font-black">
                                                                    {event.category}
                                                                </ModernBadge>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {canEdit(event) && (
                                                                <ModernButton variant="ghost" size="sm" onClick={() => handleEdit(event._id)} className="p-2 hover:bg-primary/5 text-primary">
                                                                    <FaEdit />
                                                                </ModernButton>
                                                            )}
                                                            {canDelete(event) && (
                                                                <ModernButton variant="ghost" size="sm" onClick={() => handleDelete(event._id)} className="p-2 hover:bg-error/5 text-error">
                                                                    <FaTrash />
                                                                </ModernButton>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <h4
                                                        className="text-2xl font-black text-text-primary mb-4 leading-tight group-hover:text-primary transition-colors cursor-pointer inline-block"
                                                        onClick={() => navigate(`/events/${event._id}`)}
                                                    >
                                                        {event.title}
                                                    </h4>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                                        <div className="flex items-center gap-3 text-text-secondary">
                                                            <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary border border-border/50">
                                                                <FaMapMarkerAlt />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">Location</p>
                                                                <p className="text-xs font-bold">{event.location || 'Online'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-text-secondary">
                                                            <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary border border-border/50">
                                                                <FaUser />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">Host</p>
                                                                <p className="text-xs font-bold">{event.author?.name || 'Anonymous'}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className="text-text-secondary font-medium text-sm leading-relaxed mb-8 line-clamp-2">
                                                        {event.description}
                                                    </p>

                                                    <div className="flex items-center justify-between gap-4 pt-6 border-t border-border/40">
                                                        {event.rsvp_status === 'registered' ? (
                                                            <div className="flex items-center gap-2 text-success font-black text-xs uppercase tracking-widest">
                                                                <FaCheckCircle /> You're Going
                                                            </div>
                                                        ) : (
                                                            <div className="flex -space-x-2">
                                                                {[1, 2, 3].map(i => (
                                                                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                                                        {i}
                                                                    </div>
                                                                ))}
                                                                <div className="h-8 w-8 rounded-full border-2 border-background bg-primary flex items-center justify-center text-[10px] font-black text-white">
                                                                    +
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="flex gap-2">
                                                            <ModernButton
                                                                variant="ghost"
                                                                onClick={() => navigate(`/events/${event._id}`)}
                                                                className="px-6 py-2.5 rounded-xl border border-primary/10 hover:border-primary text-xs font-black uppercase tracking-widest"
                                                            >
                                                                Details
                                                            </ModernButton>
                                                            {event.register_link && (
                                                                <ModernButton
                                                                    variant="primary"
                                                                    href={event.register_link}
                                                                    className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
                                                                >
                                                                    Join <FaExternalLinkAlt size={10} />
                                                                </ModernButton>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </ModernCard>
                                        </div>
                                    );
                                })}
                            </div>
                        </main>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default EventList;