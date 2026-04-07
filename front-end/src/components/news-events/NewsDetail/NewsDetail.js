// src/components/news-events/NewsDetail/NewsDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    FaCalendarAlt, FaUser, FaClock, FaArrowLeft, FaEdit,
    FaTrash, FaShareAlt, FaBookOpen, FaQuoteLeft, FaQuoteRight,
    FaArrowRight, FaChevronRight
} from 'react-icons/fa';
import { newsEventsService } from '../../../services/api/news-events';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import LoadingSkeleton from '../../common/LoadingSkeleton';
import ModernCard from '../../common/ModernCard';
import ModernButton from '../../common/ModernButton';
import ModernBadge from '../../common/ModernBadge';
import Footer from '../../layout/Footer/Footer';

const NewsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [relatedArticles, setRelatedArticles] = useState([]);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);
                const response = await newsEventsService.getById(id);

                if (response && response.data) {
                    setArticle(response.data);
                    document.title = `${response.data.title} | AXIONET`;
                    fetchRelatedArticles(response.data);
                } else {
                    setError('Article not found');
                }
            } catch (error) {
                console.error('Error fetching article:', error);
                setError('Failed to load article');
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
        return () => { document.title = 'AXIONET'; };
    }, [id]);

    const fetchRelatedArticles = async (currentArticle) => {
        try {
            const response = await newsEventsService.getAll(1, 'news');
            if (response.data && response.data.items) {
                const filtered = response.data.items.filter(item => item._id !== currentArticle._id);
                let related = [];
                if (currentArticle.author?.dept) {
                    related = filtered.filter(item => item.author?.dept === currentArticle.author.dept);
                }
                if (related.length < 3 && currentArticle.author?._id) {
                    const authorArticles = filtered.filter(
                        item => item.author?._id === currentArticle.author._id && !related.find(r => r._id === item._id)
                    );
                    related = [...related, ...authorArticles];
                }
                if (related.length < 3) {
                    const recent = filtered
                        .filter(item => !related.find(r => r._id === item._id))
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    related = [...related, ...recent];
                }
                setRelatedArticles(related.slice(0, 3));
            }
        } catch (error) {
            console.error('Error fetching related articles:', error);
        }
    };

    const canEdit = () => user && article && user._id === article.author_id;

    const canDelete = () => {
        if (!user || !article) return false;
        const userRole = user.role.toLowerCase();
        if (userRole === 'staff') {
            if (user._id === article.author_id) return true;
            return article.author?.role?.toLowerCase() === 'alumni';
        }
        return userRole === 'alumni' && user._id === article.author_id;
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this article?')) {
            try {
                setDeleteLoading(true);
                await newsEventsService.delete(id);
                toast.success('Article deleted successfully');
                navigate('/news');
            } catch (error) {
                console.error('Error deleting article:', error);
                toast.error('Failed to delete article');
            } finally {
                setDeleteLoading(false);
            }
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.description.substring(0, 100) + '...',
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('URL copied to clipboard');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-24 pb-12 px-4 md:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <LoadingSkeleton variant="header" height="200px" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <LoadingSkeleton variant="card" height="400px" />
                        </div>
                        <div className="space-y-6">
                            <LoadingSkeleton variant="card" height="300px" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
                <ModernCard variant="glass" className="max-w-md w-full text-center p-12">
                    <h2 className="text-3xl font-black text-text-primary mb-4">Article Not Found</h2>
                    <p className="text-text-secondary mb-8">{error || 'Unable to load the requested article.'}</p>
                    <ModernButton variant="primary" onClick={() => navigate('/news')}>
                        <FaArrowLeft className="mr-2" /> Back to News
                    </ModernButton>
                </ModernCard>
            </div>
        );
    }

    const readingTime = Math.ceil(article.description.split(/\s+/).length / 200);

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 animate-in">
            {/* Context Navigation */}
            <div className="max-w-7xl mx-auto px-4 mb-8">
                <Link to="/news" className="inline-flex items-center text-sm font-black uppercase tracking-widest text-primary hover:gap-2 transition-all">
                    <FaArrowLeft className="mr-2" /> News Hub
                </Link>
            </div>

            {/* Hero Header */}
            <div className="max-w-7xl mx-auto px-4 mb-16">
                <div className="relative p-12 md:p-20 rounded-[3rem] overflow-hidden bg-white shadow-2xl shadow-primary/5 border border-primary/5">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent" />

                    <div className="relative z-10 max-w-4xl">
                        <div className="flex flex-wrap items-center gap-3 mb-8">
                            {article.author?.dept && (
                                <ModernBadge variant="primary" size="sm" className="font-black uppercase tracking-tighter">
                                    {article.author.dept}
                                </ModernBadge>
                            )}
                            <ModernBadge variant="neutral" size="sm" className="font-black opacity-60">
                                {article.author?.role || 'Contributor'}
                            </ModernBadge>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-text-primary leading-[1.1] tracking-tighter mb-10">
                            {article.title}
                        </h1>

                        <div className="flex flex-wrap items-center justify-between gap-8 pt-10 border-t border-border/40">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-xl font-black text-primary border border-primary/10 shadow-inner">
                                    {article.author?.name ? article.author.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-text-primary mb-1">
                                        {article.author?.name || 'Unknown Author'}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs font-bold text-text-secondary">
                                        <span className="flex items-center gap-1.5"><FaCalendarAlt className="opacity-40" /> {new Date(article.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        <span className="flex items-center gap-1.5"><FaClock className="opacity-40" /> {readingTime} min read</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <ModernButton variant="ghost" onClick={handleShare} className="h-12 w-12 rounded-xl flex items-center justify-center bg-background border border-border/50 hover:bg-primary/5 text-primary">
                                    <FaShareAlt />
                                </ModernButton>
                                {canEdit() && (
                                    <ModernButton variant="ghost" onClick={() => navigate(`/news-events/${id}/edit`)} className="h-12 w-12 rounded-xl flex items-center justify-center bg-background border border-border/50 hover:bg-primary/5 text-primary">
                                        <FaEdit />
                                    </ModernButton>
                                )}
                                {canDelete() && (
                                    <ModernButton
                                        variant="ghost"
                                        onClick={handleDelete}
                                        disabled={deleteLoading}
                                        className="h-12 w-12 rounded-xl flex items-center justify-center bg-background border border-border/50 hover:bg-error/5 text-error"
                                    >
                                        <FaTrash />
                                    </ModernButton>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Article Body */}
                    <article className="lg:col-span-8">
                        <div className="prose prose-lg prose-primary max-w-none">
                            {/* Decorative Feature Placeholder */}
                            <div className="aspect-video rounded-[2.5rem] bg-gradient-to-br from-neutral-100 to-neutral-50 flex items-center justify-center mb-16 relative overflow-hidden border border-border/50 shadow-inner">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                                <FaBookOpen className="text-8xl text-primary opacity-5 relative z-10" />
                            </div>

                            <div className="space-y-8 text-text-primary/90 font-medium leading-relaxed">
                                {article.description.split('\n\n').map((paragraph, index) => {
                                    if (index === 0) {
                                        return (
                                            <div key={index} className="relative pl-12 mb-12">
                                                <FaQuoteLeft className="absolute left-0 top-0 text-primary opacity-20 text-4xl" />
                                                <p className="text-2xl font-black text-text-primary leading-snug tracking-tight">
                                                    {paragraph}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return <p key={index}>{paragraph}</p>;
                                })}
                            </div>
                        </div>

                        {/* Author Footer Card */}
                        <div className="mt-20 pt-12 border-t border-border/40">
                            <ModernCard variant="elevated" padding="p-8" className="bg-neutral-50/50 border-none shadow-none">
                                <div className="flex items-center gap-6">
                                    <div className="h-20 w-20 rounded-3xl bg-white shadow-xl shadow-black/5 flex items-center justify-center text-3xl font-black text-primary">
                                        {article.author?.name ? article.author.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Author Spotlight</p>
                                        <h3 className="text-xl font-black text-text-primary">{article.author?.name || 'Anonymous'}</h3>
                                        <p className="text-sm font-bold text-text-secondary">
                                            {article.author?.dept} Department • {article.author?.role}
                                        </p>
                                    </div>
                                </div>
                            </ModernCard>
                        </div>
                    </article>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 space-y-12">
                        {relatedArticles.length > 0 && (
                            <div className="sticky top-24 space-y-8">
                                <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <span className="h-2 w-2 bg-primary rounded-full animate-pulse" /> Keep Reading
                                </h4>
                                <div className="space-y-6">
                                    {relatedArticles.map((related) => (
                                        <Link key={related._id} to={`/news/${related._id}`} className="group block">
                                            <ModernCard
                                                padding="p-6"
                                                className="border-transparent hover:border-primary/10 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                                            >
                                                <div className="flex flex-col gap-4">
                                                    <div className="aspect-[4/3] rounded-2xl bg-neutral-100 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-20">Preview</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h5 className="font-black text-text-primary group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                                            {related.title}
                                                        </h5>
                                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter text-text-secondary">
                                                            <span>By {related.author?.name}</span>
                                                            <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </ModernCard>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default NewsDetail;