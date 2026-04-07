// src/components/news-events/NewsEventList/NewsEventList.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaChevronRight, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { newsEventsService } from '../../../services/api/news-events';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSkeleton from '../../common/LoadingSkeleton';
import ModernCard from '../../common/ModernCard';
import ModernButton from '../../common/ModernButton';
import ModernBadge from '../../common/ModernBadge';
import { toast } from 'react-toastify';
import Footer from '../../layout/Footer/Footer';

const NewsEventList = ({ type }) => {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const response = await newsEventsService.getAll(page, type);
            if (response && response.data) {
                setItems(response.data.items || []);
                setTotalPages(response.data.pages || 1);
            }
        } catch (error) {
            console.error('Error fetching news/events:', error);
            toast.error("Failed to fetch content");
        } finally {
            setLoading(false);
        }
    }, [page, type]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await newsEventsService.delete(id);
                setItems(prevItems => prevItems.filter(item => item._id !== id));
                toast.success("Item deleted successfully");
            } catch (error) {
                console.error('Error deleting item:', error);
                toast.error('Failed to delete item');
            }
        }
    };

    const canDelete = (item) => {
        if (!user) return false;
        const userRole = user.role.toLowerCase();
        return (userRole === 'staff' || userRole === 'alumni') && user._id === item.author_id;
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
                <LoadingSkeleton variant="header" height="60px" />
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map(i => <LoadingSkeleton key={i} variant="card" height="150px" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 animate-in">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
                    <div>
                        <h2 className="text-3xl font-black text-text-primary tracking-tighter uppercase mb-2">
                            {type === 'news' ? 'Article Management' : 'Event Coordination'}
                        </h2>
                        <p className="text-sm font-bold text-text-secondary opacity-60">Manage your published {type} content</p>
                    </div>
                    {user && ['staff', 'alumni'].includes(user.role?.toLowerCase()) && (
                        <ModernButton
                            variant="primary"
                            onClick={() => navigate(`/news-events/create?type=${type}`)}
                            className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest gap-3"
                        >
                            <FaPlus /> Post {type === 'news' ? 'News' : 'Event'}
                        </ModernButton>
                    )}
                </div>

                {!items || items.length === 0 ? (
                    <ModernCard variant="glass" className="text-center p-20">
                        <div className="mb-6 opacity-10">
                            <FaPlus className="text-8xl mx-auto" />
                        </div>
                        <h4 className="text-2xl font-black text-text-primary mb-2">No {type} Found</h4>
                        <p className="text-sm font-bold text-text-secondary mb-8">You haven't posted any {type} articles yet.</p>
                        {user && ['staff', 'alumni'].includes(user.role?.toLowerCase()) && (
                            <ModernButton variant="primary" onClick={() => navigate(`/news-events/create?type=${type}`)}>
                                Create First {type}
                            </ModernButton>
                        )}
                    </ModernCard>
                ) : (
                    <div className="space-y-4">
                        {items.map((item) => (
                            <ModernCard
                                key={item._id}
                                padding="p-6 md:p-8"
                                className="group hover:border-primary/20 transition-all duration-300"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <ModernBadge
                                                variant={item.type === 'news' ? 'primary' : 'secondary'}
                                                size="sm"
                                                className="font-black uppercase tracking-tighter"
                                            >
                                                {item.type}
                                            </ModernBadge>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-40">
                                                ID: {item._id.substring(0, 8)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-text-primary group-hover:text-primary transition-colors mb-2">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm font-medium text-text-secondary line-clamp-1 max-w-2xl">
                                                {item.description}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-text-secondary">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                                    {item.author?.name?.charAt(0)}
                                                </div>
                                                <span>{item.author?.name || 'Unknown'}</span>
                                            </div>
                                            {item.type === "event" ? (
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center gap-1.5"><FaCalendarAlt className="opacity-40" /> {new Date(item.event_date).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="opacity-40" /> {item.location}</span>
                                                </div>
                                            ) : (
                                                <span className="flex items-center gap-1.5 opacity-60">Posted {new Date(item.created_at).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 border-t md:border-t-0 pt-6 md:pt-0">
                                        <ModernButton
                                            variant="ghost"
                                            onClick={() => navigate(`/${item.type === 'news' ? 'news' : 'events'}/${item._id}`)}
                                            className="px-6 py-3 bg-neutral-100/50 hover:bg-primary/5 text-primary text-xs font-black uppercase tracking-widest gap-2"
                                        >
                                            View <FaChevronRight className="text-[10px]" />
                                        </ModernButton>
                                        {canDelete(item) && (
                                            <ModernButton
                                                variant="ghost"
                                                onClick={() => handleDelete(item._id)}
                                                className="px-4 py-3 bg-error/5 text-error hover:bg-error/10"
                                            >
                                                <FaTrash />
                                            </ModernButton>
                                        )}
                                    </div>
                                </div>
                            </ModernCard>
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-center mt-12 gap-2">
                        {[...Array(totalPages)].map((_, idx) => (
                            <button
                                key={idx + 1}
                                onClick={() => setPage(idx + 1)}
                                className={`h-12 w-12 rounded-xl font-black transition-all ${page === idx + 1
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'bg-white text-text-secondary hover:bg-primary/5 border border-border/50'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default NewsEventList;
