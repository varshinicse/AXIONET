import React, { useState } from 'react';
import {
    FaUserGraduate, FaHandshake, FaSearch, FaFilter,
    FaChalkboardTeacher, FaCalendarCheck, FaCommentDots, FaClock
} from 'react-icons/fa';
import ModernCard from '../common/ModernCard';
import ModernButton from '../common/ModernButton';
import ModernBadge from '../common/ModernBadge';
import ModernInput from '../common/ModernInput';

const MentorshipRequest = () => {
    const [activeTab, setActiveTab] = useState('mentors');
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data for demonstration
    const mentors = [
        { id: 1, name: 'Dr. Sarah Wilson', role: 'Senior AI Researcher at Google', expertise: ['Machine Learning', 'Computer Vision'], availability: 'Mon, Wed', rating: 4.9, students: 24 },
        { id: 2, name: 'James Chen', role: 'Full Stack Engineer at Meta', expertise: ['React', 'System Design'], availability: 'Weekends', rating: 4.8, students: 15 },
        { id: 3, name: 'Elena Rodriguez', role: 'Product Manager at Apple', expertise: ['Product Strategy', 'UX/UI'], availability: 'Tue, Thu', rating: 5.0, students: 32 },
    ];

    const requests = [
        { id: 1, student: 'Alex Johnson', project: 'Portfolio Redesign', type: 'UI/UX Design', status: 'pending', date: '2024-03-24' },
        { id: 2, student: 'Emma Watson', project: 'E-commerce API', type: 'Backend Dev', status: 'accepted', date: '2024-03-22' },
    ];

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-4 md:px-6 lg:px-8 animate-in">
            <div className="max-w-7xl mx-auto">
                {/* Hero section */}
                <div className="mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-blue-700 to-blue-500 p-8 md:p-12 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
                    <div className="relative z-10 max-w-2xl">
                        <ModernBadge variant="error" className="bg-white/20 border-white/30 text-white mb-6 backdrop-blur-md uppercase tracking-widest font-black">
                            Network Growth
                        </ModernBadge>
                        <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight">
                            Elevate your potential with <span className="italic underline decoration-amber-400">Mentorship</span>
                        </h1>
                        <p className="text-lg text-white/80 font-medium leading-relaxed mb-8">
                            Connect with industry leaders, alumni, and peers to bridge the gap between academia and your dream career.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <ModernButton variant="glass" className="bg-white/10 text-white border-white/20 px-8 py-3 font-black uppercase tracking-widest text-xs">
                                Find a Mentor
                            </ModernButton>
                            <ModernButton variant="secondary" className="bg-transparent border-white text-white hover:bg-white hover:text-primary px-8 py-3 font-black uppercase tracking-widest text-xs">
                                Become a Mentor
                            </ModernButton>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column - Filters & Stats */}
                    <aside className="lg:col-span-3 space-y-8">
                        <ModernCard padding="p-6" className="border-primary/5 shadow-xl">
                            <h3 className="font-black text-lg mb-6 tracking-tight flex items-center gap-3">
                                <FaFilter className="text-primary" /> Refine Search
                            </h3>
                            <div className="space-y-6">
                                <ModernInput
                                    label="Expertise"
                                    placeholder="e.g. React, UX..."
                                    icon={FaSearch}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-text-secondary uppercase tracking-widest">Availability</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Weekday', 'Weekend', 'Morning', 'Evening'].map(time => (
                                            <button
                                                key={time}
                                                className="px-3 py-2 rounded-xl text-xs font-black border-2 border-border/50 hover:border-primary hover:text-primary transition-all uppercase tracking-tighter"
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <ModernButton variant="primary" className="w-full py-4 text-xs font-black uppercase tracking-widest">Apply filters</ModernButton>
                            </div>
                        </ModernCard>

                        <ModernCard variant="glass" className="bg-primary/5 border-primary/20 shadow-none">
                            <h4 className="font-black text-sm text-primary uppercase tracking-widest mb-4">Your Impact</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-2xl font-black text-text-primary">08</p>
                                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-tighter">Sessions</p>
                                    </div>
                                    <div className="h-2 w-24 bg-border rounded-full overflow-hidden mb-2">
                                        <div className="h-full w-2/3 bg-primary rounded-full transition-all duration-1000" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-2xl font-black text-text-primary">12</p>
                                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-tighter">Connections</p>
                                    </div>
                                    <div className="h-2 w-24 bg-border rounded-full overflow-hidden mb-2">
                                        <div className="h-full w-1/2 bg-success rounded-full transition-all duration-1000" />
                                    </div>
                                </div>
                            </div>
                        </ModernCard>
                    </aside>

                    {/* Main Content - Tabs & List */}
                    <main className="lg:col-span-9 space-y-8">
                        <div className="flex bg-surface p-1.5 rounded-2xl border-2 border-border/50 shadow-sm self-start inline-flex">
                            <button
                                onClick={() => setActiveTab('mentors')}
                                className={`
                                    flex items-center gap-3 px-8 py-3 rounded-xl text-sm font-black transition-all uppercase tracking-widest
                                    ${activeTab === 'mentors'
                                        ? 'bg-primary text-white shadow-xl scale-105'
                                        : 'text-text-secondary hover:text-text-primary'
                                    }
                                `}
                            >
                                <FaChalkboardTeacher /> Elite Mentors
                            </button>
                            <button
                                onClick={() => setActiveTab('requests')}
                                className={`
                                    flex items-center gap-3 px-8 py-3 rounded-xl text-sm font-black transition-all uppercase tracking-widest
                                    ${activeTab === 'requests'
                                        ? 'bg-primary text-white shadow-xl scale-105'
                                        : 'text-text-secondary hover:text-text-primary'
                                    }
                                `}
                            >
                                <FaHandshake /> Active Requests
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {activeTab === 'mentors' ? (
                                mentors.map(mentor => (
                                    <ModernCard
                                        key={mentor.id}
                                        padding="p-0"
                                        className="group border-primary/5 hover:border-primary/30 shadow-xl overflow-hidden"
                                    >
                                        <div className="p-8">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-lg group-hover:scale-110 transition-transform">
                                                    {mentor.name.charAt(0)}
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1 text-amber-400 font-black text-lg">
                                                        ★ {mentor.rating}
                                                    </div>
                                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">
                                                        {mentor.students} Scholars
                                                    </p>
                                                </div>
                                            </div>
                                            <h4 className="text-xl font-black tracking-tight text-text-primary group-hover:text-primary transition-colors">{mentor.name}</h4>
                                            <p className="text-sm font-semibold text-text-secondary mt-2 leading-relaxed italic">{mentor.role}</p>

                                            <div className="flex flex-wrap gap-2 mt-6">
                                                {mentor.expertise.map(skill => (
                                                    <ModernBadge key={skill} variant="primary" size="sm" className="bg-primary/5 border-primary/10">
                                                        {skill}
                                                    </ModernBadge>
                                                ))}
                                            </div>

                                            <div className="mt-8 flex items-center gap-3 text-xs font-bold text-text-secondary uppercase tracking-widest">
                                                <FaCalendarCheck className="text-primary" />
                                                <span>Available {mentor.availability}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gray-50/50 dark:bg-gray-900/40 border-t border-border/50">
                                            <ModernButton variant="primary" className="w-full py-3.5 text-xs font-black uppercase tracking-widest shadow-none hover:shadow-lg">
                                                Request Interaction
                                            </ModernButton>
                                        </div>
                                    </ModernCard>
                                ))
                            ) : (
                                requests.map(req => (
                                    <ModernCard
                                        key={req.id}
                                        className="border-primary/5 shadow-xl"
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <ModernBadge
                                                variant={req.status === 'accepted' ? 'success' : 'warning'}
                                                size="sm"
                                                className="uppercase font-black tracking-widest italic"
                                                dot
                                            >
                                                {req.status}
                                            </ModernBadge>
                                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{req.date}</span>
                                        </div>
                                        <h4 className="text-xl font-black tracking-tight text-text-primary">{req.project}</h4>
                                        <p className="text-sm font-semibold text-text-secondary mt-2 mb-6 italic">Student: {req.student}</p>

                                        <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                                            <ModernButton variant="glass" size="sm" className="flex-1 text-[10px] font-black uppercase tracking-widest">Details</ModernButton>
                                            <ModernButton variant="ghost" size="sm" className="p-3">
                                                <FaCommentDots className="text-primary text-xl" />
                                            </ModernButton>
                                        </div>
                                    </ModernCard>
                                ))
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default MentorshipRequest;