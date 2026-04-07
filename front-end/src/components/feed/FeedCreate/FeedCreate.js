import React, { useState, useRef } from 'react';
import { feedService } from '../../../services/api/feed';
import { useAuth } from '../../../contexts/AuthContext';
import { FaSmile, FaImage, FaVideo, FaPollH, FaTimes } from 'react-icons/fa';
import ModernCard from '../../common/ModernCard';
import ModernButton from '../../common/ModernButton';

const FeedCreate = ({ onFeedCreated }) => {
    const [content, setContent] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const { user } = useAuth();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!content.trim() && !image) return;

        setLoading(true);
        try {
            // In a real app with image upload, we'd use FormData
            const postData = { content };
            // Simulate image upload if needed
            const response = await feedService.createFeed(postData);

            const enrichedFeed = {
                ...response.data,
                author: {
                    name: user?.name,
                    email: user?.email,
                    photo_url: user?.photo_url
                },
                timestamp: new Date().toISOString(),
                image_url: imagePreview // Mock for demo
            };

            onFeedCreated(enrichedFeed);
            setContent("");
            removeImage();
            setError("");
        } catch (error) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModernCard variant="flat" padding="p-5">
            <form onSubmit={handleSubmit}>
                <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <textarea
                            className="w-full bg-transparent border-none text-text-primary text-lg focus:ring-0 placeholder:text-text-secondary/50 resize-none min-h-[80px]"
                            placeholder="What's on your mind?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />

                        {imagePreview && (
                            <div className="relative mt-4 rounded-2xl overflow-hidden border border-border group">
                                <img src={imagePreview} alt="Preview" className="w-full object-cover max-h-[300px]" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                >
                                    <FaTimes size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <input
                            type="file"
                            hidden
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                        />
                        <ModernButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-text-secondary hover:text-primary"
                            onClick={() => fileInputRef.current.click()}
                        >
                            <FaImage />
                            <span className="hidden sm:inline">Photo</span>
                        </ModernButton>
                        <ModernButton variant="ghost" size="sm" className="gap-2 text-text-secondary hover:text-blue-500">
                            <FaVideo />
                            <span className="hidden sm:inline">Video</span>
                        </ModernButton>
                        <ModernButton variant="ghost" size="sm" className="gap-2 text-text-secondary hover:text-orange-500">
                            <FaPollH />
                            <span className="hidden sm:inline">Poll</span>
                        </ModernButton>
                    </div>

                    <ModernButton
                        type="submit"
                        disabled={(!content.trim() && !image) || loading}
                    >
                        {loading ? 'Posting...' : 'Post'}
                    </ModernButton>
                </div>

                {error && <p className="mt-3 text-xs text-error">{error}</p>}
            </form>
        </ModernCard>
    );
};

export default FeedCreate;