// src/components/news-events/NewsEventForm/NewsEventForm.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
    FaCalendarAlt, FaClock, FaMapMarkerAlt, FaLink,
    FaPlus, FaEdit, FaChevronLeft, FaTag, FaUsers, FaDollarSign
} from 'react-icons/fa';
import { newsEventsService } from '../../../services/api/news-events';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import LoadingSkeleton from '../../common/LoadingSkeleton';
import ModernCard from '../../common/ModernCard';
import ModernButton from '../../common/ModernButton';
import Footer from '../../layout/Footer/Footer';

const NewsEventForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "news",
        eventDate: "",
        eventTime: "",
        location: "",
        registerLink: "",
        category: "Social",
        eventType: "In-person",
        capacity: 0,
        price: 0,
    });

    const fetchNewsEvent = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await newsEventsService.getById(id);
            if (response && response.data) {
                const eventData = response.data;
                setFormData({
                    title: eventData.title || "",
                    description: eventData.description || "",
                    type: eventData.type || "news",
                    eventDate: eventData.event_date ? eventData.event_date.split('T')[0] : "",
                    eventTime: eventData.event_time || "",
                    location: eventData.location || "",
                    registerLink: eventData.register_link || "",
                    category: eventData.category || "Social",
                    eventType: eventData.event_type || "In-person",
                    capacity: eventData.capacity || 0,
                    price: eventData.price || 0,
                });
            }
        } catch (error) {
            console.error("Error fetching news/event:", error);
            toast.error("Failed to load content for editing");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const urlType = searchParams.get('type');
        if (urlType) {
            setFormData(prev => ({ ...prev, type: urlType }));
        }

        if (id) {
            setIsEditing(true);
            fetchNewsEvent();
        }
    }, [location.search, id, fetchNewsEvent]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description) {
            toast.error("Title and description are required");
            return;
        }

        if (formData.type === "event" && (!formData.eventDate || !formData.location)) {
            toast.error("Date and location are required for events");
            return;
        }

        try {
            setIsLoading(true);
            const data = {
                title: formData.title,
                description: formData.description,
                type: formData.type,
                ...(formData.type === "event" && {
                    event_date: formData.eventDate,
                    event_time: formData.eventTime,
                    location: formData.location,
                    register_link: formData.registerLink,
                    category: formData.category,
                    event_type: formData.eventType,
                    capacity: formData.capacity,
                    price: formData.price,
                })
            };

            const response = isEditing
                ? await newsEventsService.update(id, data)
                : await newsEventsService.createNewsEvent(data);

            if (response) {
                toast.success(`${formData.type} ${isEditing ? 'updated' : 'published'} successfully!`);
                navigate(`/${formData.type === 'news' ? 'news' : 'events'}`);
            }
        } catch (error) {
            console.error("Error saving news/event:", error);
            toast.error(error.response?.data?.message || "Failed to save content");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user || !['staff', 'alumni'].includes(user.role?.toLowerCase())) {
        return (
            <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
                <ModernCard variant="glass" className="max-w-md w-full text-center p-12">
                    <h2 className="text-3xl font-black text-text-primary mb-4">Access Denied</h2>
                    <p className="text-text-secondary mb-8">You don't have the required permissions to manage news or events.</p>
                    <ModernButton variant="primary" onClick={() => navigate(-1)}>Go Back</ModernButton>
                </ModernCard>
            </div>
        );
    }

    if (isLoading && isEditing) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-32">
                <LoadingSkeleton variant="card" height="400px" />
            </div>
        );
    }

    const fieldClass = "w-full bg-neutral-50/50 border border-border/40 rounded-2xl p-4 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-secondary/30";
    const labelClass = "text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2 flex items-center gap-2";

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 animate-in">
            <div className="max-w-3xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => navigate(-1)} className="inline-flex items-center text-xs font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors">
                        <FaChevronLeft className="mr-2" /> Cancel & Return
                    </button>
                </div>

                <ModernCard variant="elevated" padding="p-8 md:p-12" className="border-none shadow-2xl shadow-primary/5">
                    <div className="flex items-center gap-6 mb-12">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-2xl text-primary">
                            {isEditing ? <FaEdit /> : <FaPlus />}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-text-primary tracking-tighter uppercase leading-none mb-2">
                                {isEditing ? 'Edit Existing' : 'Create New'} {formData.type}
                            </h1>
                            <p className="text-sm font-bold text-text-secondary opacity-60">Complete the details below to publish</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 gap-8">
                            <div className="space-y-4">
                                <label className={labelClass}>Content Title <span className="text-error">*</span></label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className={fieldClass}
                                    placeholder="Enter a catchy headline..."
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <label className={labelClass}>Description / Content <span className="text-error">*</span></label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className={`${fieldClass} min-h-[200px] resize-none`}
                                    placeholder="Tell the story or provide event details here..."
                                    required
                                />
                            </div>
                        </div>

                        {/* Event Specific Fields */}
                        <div className={`space-y-8 pt-8 border-t border-border/40 transition-all duration-500 origin-top ${formData.type === 'event' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 h-0 overflow-hidden pointer-events-none'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className={labelClass}><FaCalendarAlt className="text-primary text-xs" /> Event Date <span className="text-error">*</span></label>
                                    <input
                                        type="date"
                                        name="eventDate"
                                        value={formData.eventDate}
                                        onChange={handleInputChange}
                                        className={fieldClass}
                                        required={formData.type === 'event'}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className={labelClass}><FaClock className="text-primary text-xs" /> Commencement Time</label>
                                    <input
                                        type="time"
                                        name="eventTime"
                                        value={formData.eventTime}
                                        onChange={handleInputChange}
                                        className={fieldClass}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className={labelClass}><FaMapMarkerAlt className="text-primary text-xs" /> Venue / Location <span className="text-error">*</span></label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className={fieldClass}
                                    placeholder="Physical address or virtual room link..."
                                    required={formData.type === 'event'}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className={labelClass}><FaLink className="text-primary text-xs" /> External Registration Portal</label>
                                <input
                                    type="url"
                                    name="registerLink"
                                    value={formData.registerLink}
                                    onChange={handleInputChange}
                                    className={fieldClass}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className={labelClass}><FaTag className="text-primary text-xs" /> Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className={fieldClass}
                                    >
                                        <option value="Networking">Networking</option>
                                        <option value="Career">Career Development</option>
                                        <option value="Social">Social / Mixer</option>
                                        <option value="Academic">Academic Seminar</option>
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className={labelClass}><FaUsers className="text-primary text-xs" /> Attendance Type</label>
                                    <select
                                        name="eventType"
                                        value={formData.eventType}
                                        onChange={handleInputChange}
                                        className={fieldClass}
                                    >
                                        <option value="In-person">In-person Only</option>
                                        <option value="Virtual">Virtual Only</option>
                                        <option value="Hybrid">Hybrid (Both)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className={labelClass}>Max Capacity</label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleInputChange}
                                        className={fieldClass}
                                        placeholder="0 for unlimited"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className={labelClass}><FaDollarSign className="text-primary text-xs" /> Admission Price</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className={fieldClass}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="pt-12 flex flex-col md:flex-row gap-4">
                            <ModernButton
                                variant="primary"
                                type="submit"
                                disabled={isLoading}
                                className="h-16 flex-1 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </div>
                                ) : (
                                    isEditing ? 'Save Changes' : `Publish ${formData.type}`
                                )}
                            </ModernButton>
                        </div>
                    </form>
                </ModernCard>
            </div>
            <Footer />
        </div>
    );
};

export default NewsEventForm;