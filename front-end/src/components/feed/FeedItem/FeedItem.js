import React, { useState } from 'react';
import {
    FaRegHeart, FaRegComment, FaShare, FaEllipsisH,
    FaBookmark, FaHeart, FaRegPaperPlane,
    FaTrashAlt, FaEdit, FaCheckCircle, FaClock, FaRegShareSquare
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import ModernCard from '../../common/ModernCard';
import ModernButton from '../../common/ModernButton';
import ModernBadge from '../../common/ModernBadge';

const FeedItem = ({ feed, onDelete, currentUser, onEdit }) => {
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [isLiked, setIsLiked] = useState(feed.isLiked || false);
    const [likesCount, setLikesCount] = useState(feed.likesCount || 0);

    // Safely handle author which could be a string or an object
    const authorName = typeof feed.author === 'object' ? feed.author?.name : feed.author;
    const authorInitial = (authorName || '?').toString().charAt(0).toUpperCase();

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (e) {
            return '';
        }
    };

    const getRoleVariant = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin': return 'error';
            case 'staff': return 'warning';
            case 'alumni': return 'success';
            default: return 'primary';
        }
    };

    return (
        <ModernCard
            variant="flat"
            padding="p-0"
            className="group animate-in border-primary/10 hover:border-primary/30 shadow-lg transition-all duration-slow"
        >
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={`/profile/${feed.user_id}`} className="relative">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xl font-black shadow-md group-hover:scale-105 transition-all">
                                {authorInitial}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-surface p-0.5 rounded-lg border-2 border-surface">
                                <div className="bg-success h-3 w-3 rounded-full border-2 border-surface animate-pulse" title="Online" />
                            </div>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <Link
                                    to={`/profile/${feed.user_id}`}
                                    className="font-black text-lg tracking-tight text-text-primary hover:text-primary transition-colors"
                                >
                                    {authorName}
                                </Link>
                                <ModernBadge variant={getRoleVariant(feed.role)} size="sm" className="ml-1 opacity-90 uppercase tracking-tighter italic">
                                    {feed.role || 'Member'}
                                </ModernBadge>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-text-secondary opacity-60 text-xs font-bold uppercase tracking-widest">
                                <FaClock className="text-[10px]" />
                                {formatDate(feed.created_at)}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {currentUser?._id === feed.user_id && (
                            <ModernButton
                                variant="ghost"
                                size="sm"
                                className="text-error/60 hover:text-error hover:bg-error/5 p-2 rounded-xl"
                                onClick={() => onDelete(feed._id)}
                            >
                                <FaTrashAlt />
                            </ModernButton>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-8 pb-6">
                <p className="text-text-primary text-lg leading-relaxed font-medium whitespace-pre-wrap select-text">
                    {feed.content}
                </p>

                {feed.tags && feed.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6">
                        {feed.tags.map(tag => (
                            <span
                                key={tag}
                                className="text-sm font-black text-primary hover:text-blue-600 cursor-pointer bg-primary/5 px-3 py-1 rounded-lg transition-all hover:scale-105"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="px-8 py-4 border-y border-border/50 bg-gray-50/30 dark:bg-gray-900/10 flex items-center justify-between text-xs font-black uppercase tracking-widest text-text-secondary">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 hover:text-primary cursor-pointer transition-colors">
                        <span className="text-primary">{likesCount}</span> Likes
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-primary cursor-pointer transition-colors">
                        <span className="text-primary">{feed.comments?.length || 0}</span> Comments
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-primary">0</span> Shares
                </div>
            </div>

            {/* Actions */}
            <div className="p-3 bg-surface group-hover:bg-gray-50/50 dark:group-hover:bg-gray-900/50 transition-all">
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={handleLike}
                        className={`
                            flex items-center justify-center gap-3 py-3 rounded-xl font-black text-sm transition-all
                            ${isLiked ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-primary/5 hover:text-primary'}
                        `}
                    >
                        {isLiked ? <FaHeart className="text-lg animate-bounce" /> : <FaRegHeart className="text-lg" />}
                        <span className="uppercase tracking-widest hidden md:inline">Like</span>
                    </button>

                    <button onClick={() => setShowComments(!showComments)} className="flex items-center justify-center gap-3 py-3 rounded-xl text-text-secondary font-black text-sm hover:bg-primary/5 hover:text-primary transition-all">
                        <FaRegComment className="text-lg" />
                        <span className="uppercase tracking-widest hidden md:inline">Comment</span>
                    </button>

                    <button className="flex items-center justify-center gap-3 py-3 rounded-xl text-text-secondary font-black text-sm hover:bg-primary/5 hover:text-primary transition-all">
                        <FaRegShareSquare className="text-lg" />
                        <span className="uppercase tracking-widest hidden md:inline">Share</span>
                    </button>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="p-4 bg-gray-50/50 dark:bg-gray-900/20 border-t border-border/50 mt-2 rounded-xl animate-in">
                        <div className="flex gap-3 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                                {currentUser?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    className="w-full bg-surface border border-border rounded-xl py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                />
                                <button
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:scale-110 transition-transform disabled:opacity-30"
                                    disabled={!commentText.trim()}
                                >
                                    <FaRegPaperPlane size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {feed.comments?.map((comment, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold text-text-secondary shrink-0">
                                        {comment.author?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 bg-surface border border-border rounded-2xl p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <h5 className="text-sm font-bold">{comment.author?.name}</h5>
                                            <span className="text-[10px] text-text-secondary">
                                                {comment.timestamp ? formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true }) : ''}
                                            </span>
                                        </div>
                                        <p className="text-sm text-text-secondary">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ModernCard>
    );
};

export default FeedItem;