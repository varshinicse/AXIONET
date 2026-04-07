// src/components/news-events/NewsList/NewsList.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaCalendarAlt, FaUser, FaPlus, FaEdit, FaTrash, FaBookOpen,
    FaArrowRight, FaChartLine, FaStar
} from 'react-icons/fa';
import { newsEventsService } from '../../../services/api/news-events';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSkeleton from '../../common/LoadingSkeleton';
import ModernCard from '../../common/ModernCard';
import ModernButton from '../../common/ModernButton';
import ModernBadge from '../../common/ModernBadge';
import { toast } from 'react-toastify';
import Footer from '../../layout/Footer/Footer';

const NewsList = () => {
    const [allNews, setAllNews] = useState([]);
    const [trendingNews, setTrendingNews] = useState([]);
    const [recommendedNews, setRecommendedNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchNews();
    }, [page, user]);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const response = await newsEventsService.getAll(page, 'news');

            if (response.data && response.data.items) {
                setAllNews(response.data.items);
                setTotalPages(response.data.pages);

                const sorted = [...response.data.items].sort((a, b) =>
                    new Date(b.created_at) - new Date(a.created_at)
                );
                setTrendingNews(sorted.slice(0, 5));

                if (user && user.dept) {
                    const deptNews = response.data.items.filter(
                        item => item.author && item.author.dept === user.dept
                    );
                    setRecommendedNews(deptNews.slice(0, 5));
                } else {
                    const shuffled = [...response.data.items].sort(() => 0.5 - Math.random());
                    setRecommendedNews(shuffled.slice(0, 5));
                }
            }
        } catch (error) {
            console.error('Error fetching news:', error);
            toast.error('Failed to load news');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const canEdit = (newsItem) => {
        if (!user) return false;
        return user._id === newsItem.author_id;
    };

    const canDelete = (newsItem) => {
        if (!user) return false;
        const userRole = user.role.toLowerCase();
        const authorId = newsItem.author_id;
        if (userRole === 'staff') {
            if (user._id === authorId) return true;
            const authorRole = newsItem.author?.role?.toLowerCase();
            return authorRole === 'alumni';
        }
        if (userRole === 'alumni') {
            return user._id === authorId;
        }
        return false;
    };

    const handleEdit = (newsId) => {
        navigate(`/news-events/${newsId}/edit`);
    };

    const handleDelete = async (newsId) => {
        if (window.confirm('Are you sure you want to delete this news item?')) {
            try {
                setLoading(true);
                await newsEventsService.delete(newsId);
                setAllNews(prev => prev.filter(item => item._id !== newsId));
                setTrendingNews(prev => prev.filter(item => item._id !== newsId));
                setRecommendedNews(prev => prev.filter(item => item._id !== newsId));
                toast.success('News deleted successfully');
            } catch (error) {
                console.error('Error deleting news:', error);
                toast.error('Failed to delete news');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleReadFullArticle = (newsId) => {
        navigate(`/news/${newsId}`);
    };

    const getDeptVariant = (dept) => {
        const variants = {
            'CSE': 'primary',
            'IT': 'info',
            'ECE': 'success',
            'EEE': 'warning',
            'MECH': 'danger',
            'CIVIL': 'secondary'
        };
        return variants[dept] || 'neutral';
    };

    const getRoleVariant = (role) => {
        if (!role) return 'neutral';
        switch (role.toLowerCase()) {
            case 'staff': return 'primary';
            case 'alumni': return 'success';
            case 'student': return 'info';
            default: return 'neutral';
        }
    };

    if (loading && allNews.length === 0) {
        return (
            <div className="min-h-screen bg-background pt-24 pb-12 px-4 md:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <LoadingSkeleton variant="card" height="400px" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => <LoadingSkeleton key={i} variant="card" height="300px" />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 animate-in">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-text-primary mb-2">
                            Global <span className="text-primary italic">Intelligence</span>
                        </h1>
                        <p className="text-text-secondary font-medium">Capture the latest pulse of the AXIONET ecosystem.</p>
                    </div>
                    {user && ['staff', 'alumni'].includes(user.role?.toLowerCase()) && (
                        <ModernButton
                            variant="primary"
                            onClick={() => navigate('/news-events/create?type=news')}
                            className="flex items-center gap-2 px-8 py-4 rounded-2xl shadow-xl shadow-primary/20"
                        >
                            <FaPlus /> Create Intel
                        </ModernButton>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Left - Trending */}
                    <aside className="lg:col-span-3 space-y-8 order-2 lg:order-1">
                        <ModernCard padding="p-6" className="border-primary/5 shadow-xl sticky top-24">
                            <h3 className="font-black text-lg mb-6 tracking-tight flex items-center gap-3">
                                <FaChartLine className="text-primary" /> Trending Now
                            </h3>
                            <div className="space-y-6">
                                {trendingNews.map((item, index) => (
                                    <div
                                        key={item._id || index}
                                        className="group cursor-pointer border-b border-border/50 pb-4 last:border-0 last:pb-0"
                                        onClick={() => handleReadFullArticle(item._id)}
                                    >
                                        <div className="flex gap-4">
                                            <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-black text-sm">
                                                {String(index + 1).padStart(2, '0')}
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-black leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                    {item.title}
                                                </h4>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-60">
                                                    <FaCalendarAlt /> {new Date(item.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ModernCard>

                        {/* Recommended News */}
                        <ModernCard variant="glass" padding="p-6" className="border-primary/10 shadow-none bg-primary/5">
                            <h3 className="font-black text-sm text-primary mb-6 tracking-widest uppercase flex items-center gap-2">
                                <FaStar /> Personalized
                            </h3>
                            <div className="space-y-4">
                                {recommendedNews.map((item) => (
                                    <Link
                                        key={item._id}
                                        to={`/news/${item._id}`}
                                        className="block group"
                                    >
                                        <h4 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-1">
                                            {item.title}
                                        </h4>
                                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-tighter opacity-50">
                                            {item.author?.name || 'Unknown Intel'}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </ModernCard>
                    </aside>

                    {/* Main Content Area */}
                    <main className="lg:col-span-9 space-y-8 order-1 lg:order-2">
                        {/* Featured Post */}
                        {allNews.length > 0 && (
                            <ModernCard
                                padding="p-0"
                                className="group border-primary/5 shadow-2xl overflow-hidden hover:border-primary/20 transition-all"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2">
                                    <div className="h-64 md:h-auto bg-gradient-to-br from-primary via-blue-700 to-blue-500 relative overflow-hidden flex items-center justify-center text-white">
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                                        <FaBookOpen className="text-7xl opacity-20 transform group-hover:scale-125 transition-transform duration-700" />
                                        <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
                                            {allNews[0].author?.dept && (
                                                <ModernBadge variant={getDeptVariant(allNews[0].author.dept)} className="backdrop-blur-md bg-white/20 border-white/30 text-white font-black">
                                                    {allNews[0].author.dept}
                                                </ModernBadge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-8 md:p-12 flex flex-col justify-center">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                                                    {allNews[0].author?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-text-primary leading-none mb-1">
                                                        {allNews[0].author?.name || 'Unknown'}
                                                    </p>
                                                    <ModernBadge variant={getRoleVariant(allNews[0].author?.role)} size="sm">
                                                        {allNews[0].author?.role || 'Guest'}
                                                    </ModernBadge>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {canEdit(allNews[0]) && (
                                                    <ModernButton variant="ghost" size="sm" onClick={() => handleEdit(allNews[0]._id)} className="p-2 hover:bg-primary/5 text-primary">
                                                        <FaEdit />
                                                    </ModernButton>
                                                )}
                                                {canDelete(allNews[0]) && (
                                                    <ModernButton variant="ghost" size="sm" onClick={() => handleDelete(allNews[0]._id)} className="p-2 hover:bg-error/5 text-error">
                                                        <FaTrash />
                                                    </ModernButton>
                                                )}
                                            </div>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-text-primary mb-4 leading-tight">
                                            {allNews[0].title}
                                        </h2>
                                        <p className="text-text-secondary font-medium leading-relaxed mb-8 line-clamp-3">
                                            {allNews[0].description}
                                        </p>
                                        <ModernButton
                                            variant="primary"
                                            onClick={() => handleReadFullArticle(allNews[0]._id)}
                                            className="self-start px-8 py-4 flex items-center gap-3 font-black uppercase tracking-widest text-xs"
                                        >
                                            Read Full Intel <FaArrowRight />
                                        </ModernButton>
                                    </div>
                                </div>
                            </ModernCard>
                        )}

                        {/* News Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {allNews.slice(1).map((item) => (
                                <ModernCard
                                    key={item._id}
                                    padding="p-0"
                                    className="group flex flex-col border-primary/5 hover:border-primary/20 shadow-xl overflow-hidden h-full"
                                >
                                    <div className="h-48 bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative flex items-center justify-center overflow-hidden">
                                        <FaBookOpen className="text-4xl text-text-secondary opacity-10 group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute top-4 left-4">
                                            {item.author?.dept && (
                                                <ModernBadge variant={getDeptVariant(item.author.dept)} className="font-black uppercase tracking-widest text-[10px]">
                                                    {item.author.dept}
                                                </ModernBadge>
                                            )}
                                        </div>
                                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {canEdit(item) && (
                                                <button onClick={(e) => { e.stopPropagation(); handleEdit(item._id); }} className="p-2 bg-white/90 dark:bg-black/90 rounded-lg text-primary shadow-lg hover:scale-110 transition-all">
                                                    <FaEdit size={12} />
                                                </button>
                                            )}
                                            {canDelete(item) && (
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }} className="p-2 bg-white/90 dark:bg-black/90 rounded-lg text-error shadow-lg hover:scale-110 transition-all">
                                                    <FaTrash size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-center gap-3 mb-4 text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">
                                            <FaUser className="text-primary" /> {item.author?.name || 'Unknown'}
                                            <span className="h-1 w-1 bg-border rounded-full" />
                                            <FaCalendarAlt className="text-primary" /> {new Date(item.created_at).toLocaleDateString()}
                                        </div>
                                        <h3 className="text-xl font-black text-text-primary mb-3 leading-tight group-hover:text-primary transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm font-medium text-text-secondary line-clamp-2 mb-6 flex-1">
                                            {item.description}
                                        </p>
                                        <ModernButton
                                            variant="ghost"
                                            onClick={() => handleReadFullArticle(item._id)}
                                            className="w-full justify-between items-center px-4 py-3 rounded-xl border-2 border-primary/10 hover:border-primary hover:bg-primary/5 text-primary text-xs font-black uppercase tracking-widest transition-all"
                                        >
                                            Analyze Intel <FaArrowRight />
                                        </ModernButton>
                                    </div>
                                </ModernCard>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 pt-12">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <ModernButton
                                        key={i + 1}
                                        variant={i + 1 === page ? 'primary' : 'ghost'}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={`h-12 w-12 rounded-xl font-black text-sm ${i + 1 === page ? 'shadow-lg shadow-primary/20' : 'hover:bg-primary/5'}`}
                                    >
                                        {i + 1}
                                    </ModernButton>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default NewsList;