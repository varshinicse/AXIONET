import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Link, useNavigate } from 'react-router-dom';
import FeedCreate from '../FeedCreate/FeedCreate';
import FeedItem from '../FeedItem/FeedItem';
import axios from '../../../services/axios';
import { toast } from 'react-toastify';
import {
    FaHome, FaUser, FaEnvelope, FaBriefcase,
    FaCalendarAlt, FaGraduationCap, FaSearch,
    FaRss, FaChartBar, FaCode, FaLightbulb, FaFire, FaUsers
} from 'react-icons/fa';
import ModernCard from '../../common/ModernCard';
import ModernButton from '../../common/ModernButton';
import ModernBadge from '../../common/ModernBadge';
import LoadingSkeleton, { CardSkeleton } from '../../common/LoadingSkeleton';

const fetchTrendingTopics = async (userDept) => {
    return [
        { id: 1, name: `${userDept} Internships`, count: "250+ posts" },
        { id: 2, name: `${userDept} Events`, count: "120+ posts" },
        { id: 3, name: `${userDept} Workshop`, count: "85+ posts" },
        { id: 4, name: `${userDept} Career Guidance`, count: "65+ posts" },
    ];
};

const fetchSuggestedConnections = async (userDept) => {
    return [
        { id: 1, name: "Dr. Aruna Singh", role: "AI Research Lead", avatar: null, type: 'person' },
        { id: 2, name: "Prateek Khanna", role: "Senior SDE @ Microsoft", avatar: null, type: 'person' },
        { id: 3, name: "Tech Innovation Club", role: `${userDept} Group`, avatar: null, type: 'group' },
    ];
};

const fetchUpcomingEvents = async (userDept) => {
    return [
        { id: 1, title: `${userDept} Recruitment Drive`, date: "May 15, 2025", attendees: 42, icon: FaBriefcase },
        { id: 2, title: `${userDept} Workshop: Latest Trends`, date: "May 22, 2025", attendees: 28, icon: FaCode }
    ];
};

const FeedList = () => {
    const [feeds, setFeeds] = useState([]);
    const [trendingTopics, setTrendingTopics] = useState([]);
    const [suggestedConnections, setSuggestedConnections] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchFeeds = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('/feeds');
            setFeeds(response.data);
            setError("");
        } catch (error) {
            setError("Error fetching feeds. Please try again later.");
            console.error("Error fetching feeds", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadSidebarData = useCallback(async () => {
        const userDept = user?.dept || 'General';
        const [topics, connections, events] = await Promise.all([
            fetchTrendingTopics(userDept),
            fetchSuggestedConnections(userDept),
            fetchUpcomingEvents(userDept)
        ]);
        setTrendingTopics(topics);
        setSuggestedConnections(connections);
        setUpcomingEvents(events);
    }, [user?.dept]);

    useEffect(() => {
        fetchFeeds();
        loadSidebarData();
    }, [fetchFeeds, loadSidebarData]);

    const handleNewFeed = (newFeed) => {
        const enrichedFeed = {
            ...newFeed,
            author: {
                name: user?.name || 'Unknown',
                email: user?.email || 'unknown@example.com',
                photo_url: user?.photo_url || null,
                role: user?.role
            },
            timestamp: new Date().toISOString()
        };
        setFeeds([enrichedFeed, ...feeds]);
        toast.success("Post published!");
    };

    const handleDelete = async (feedId) => {
        if (window.confirm('Delete this post?')) {
            try {
                await axios.delete(`/feeds/${feedId}`);
                setFeeds(prev => prev.filter(f => f._id !== feedId));
                toast.success("Post deleted");
            } catch (error) {
                toast.error('Failed to delete');
            }
        }
    };

    const filteredFeeds = feeds.filter(feed =>
    (feed.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feed.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-4 md:px-6 lg:px-8 animate-in">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Main Content - Feed (Expanded to fill left space) */}
                <main className="lg:col-span-9 space-y-8">
                    {/* Search & Tabs */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="relative flex-1 group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">
                                <FaSearch size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search community..."
                                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-surface border-2 border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium shadow-sm hover:shadow-md"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex bg-surface p-1.5 rounded-2xl border-2 border-border/50 shadow-sm self-start">
                            {['all', 'trending', 'following'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`
                                        px-6 py-2.5 rounded-xl text-sm font-black transition-all uppercase tracking-widest
                                        ${activeTab === tab
                                            ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105'
                                            : 'text-text-secondary hover:text-text-primary'
                                        }
                                    `}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Create Post */}
                    <FeedCreate onFeedCreated={handleNewFeed} />

                    {/* Posts List */}
                    <div className="space-y-8">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)
                        ) : error ? (
                            <ModernCard variant="flat" className="text-center text-error border-error/20 bg-error/5 py-8">
                                <p className="font-bold">{error}</p>
                                <ModernButton variant="danger" size="sm" className="mt-4" onClick={fetchFeeds}>Retry Fetching</ModernButton>
                            </ModernCard>
                        ) : filteredFeeds.length === 0 ? (
                            <ModernCard className="text-center py-24 glass-card border-none">
                                <div className="bg-primary/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FaRss size={40} className="text-primary opacity-50" />
                                </div>
                                <h3 className="text-2xl font-black tracking-tight">Quiet day in the community</h3>
                                <p className="text-text-secondary font-medium mt-2">Be the innovator and start the first conversation!</p>
                                <ModernButton variant="primary" className="mt-8" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                                    Create a Post
                                </ModernButton>
                            </ModernCard>
                        ) : (
                            filteredFeeds.map(feed => (
                                <FeedItem
                                    key={feed._id}
                                    feed={feed}
                                    onDelete={handleDelete}
                                    currentUser={user}
                                />
                            ))
                        )}
                    </div>
                </main>

                {/* Right Sidebar - Trends & Suggestions */}
                <aside className="lg:col-span-3 space-y-8">
                    {/* Trending */}
                    <ModernCard padding="p-8" className="border-primary/5 shadow-xl shadow-primary/5">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-orange-500/10 rounded-xl">
                                <FaFire className="text-orange-600 text-xl" />
                            </div>
                            <h3 className="font-black text-lg tracking-tight">Viral Trends</h3>
                        </div>
                        <div className="space-y-6">
                            {trendingTopics.map(topic => (
                                <Link
                                    key={topic.id}
                                    to={`/search?q=${topic.name}`}
                                    className="block group"
                                >
                                    <p className="font-black text-base group-hover:text-primary transition-colors flex items-center gap-2">
                                        <span className="text-primary opacity-50">#</span>
                                        {topic.name}
                                    </p>
                                    <p className="text-xs font-bold text-text-secondary mt-1 ml-5 uppercase tracking-widest">{topic.count}</p>
                                </Link>
                            ))}
                        </div>
                    </ModernCard>

                    {/* Suggested Connections */}
                    <ModernCard padding="p-8" className="border-primary/5 shadow-xl shadow-primary/5">
                        <div className="mb-8">
                            <h3 className="font-black text-lg tracking-tight">Suggestions</h3>
                        </div>
                        <div className="space-y-6">
                            {suggestedConnections.map(conn => (
                                <div key={conn.id} className="flex items-center gap-4 group">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center font-black text-primary shadow-sm group-hover:scale-110 transition-transform">
                                        {conn.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black truncate text-text-primary">{conn.name}</p>
                                        <p className="text-[10px] font-bold text-text-secondary truncate uppercase tracking-widest mt-1">{conn.role}</p>
                                    </div>
                                    <ModernButton
                                        variant="ghost"
                                        size="xs"
                                        className="px-3 py-1 font-black text-[10px] uppercase whitespace-nowrap"
                                        onClick={() => conn.type === 'person' ? navigate(`/profile`) : null}
                                    >
                                        {conn.type === 'person' ? 'View Profile' : 'Join'}
                                    </ModernButton>
                                </div>
                            ))}
                        </div>
                    </ModernCard>

                </aside>
            </div>
        </div >
    );
};

export default FeedList;