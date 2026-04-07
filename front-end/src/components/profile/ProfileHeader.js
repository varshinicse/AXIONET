import React from "react";
import {
    FaEdit, FaEnvelope, FaUserGraduate, FaGraduationCap,
    FaChalkboardTeacher, FaBuilding, FaHandshake, FaCheck,
    FaClock, FaCamera
} from 'react-icons/fa';
import ModernButton from '../common/ModernButton';

const ProfileHeader = ({
    profileData,
    isOwnProfile,
    connectionStatus,
    connectionStats,
    userRole,
    onEditClick,
    onPhotoClick,
    onSendConnectionRequest
}) => {
    // Helper to render the appropriate connection button
    const renderConnectionButton = () => {
        // Admin only sees message button
        if (userRole === 'staff' || userRole === 'admin') {
            return (
                <ModernButton
                    variant="secondary"
                    size="sm"
                    onClick={() => window.location.href = `/messages?to=${profileData.email}`}
                    icon={FaEnvelope}
                >
                    Message
                </ModernButton>
            );
        }

        // Handle different connection states based on asymmetric model
        const status = connectionStatus?.status;

        switch (status) {
            case 'mutual':
                return (
                    <div className="flex gap-2">
                        <ModernButton
                            variant="secondary"
                            size="sm"
                            onClick={() => window.location.href = `/messages?to=${profileData.email}`}
                            icon={FaEnvelope}
                        >
                            Message
                        </ModernButton>
                        <ModernButton
                            variant="outline"
                            size="sm"
                            onClick={() => onSendConnectionRequest(profileData._id, 'unfollow')}
                            icon={FaCheck}
                        >
                            Following
                        </ModernButton>
                    </div>
                );
            case 'following':
                return (
                    <div className="flex gap-2">
                        <ModernButton
                            variant="secondary"
                            size="sm"
                            onClick={() => window.location.href = `/messages?to=${profileData.email}`}
                            icon={FaEnvelope}
                        >
                            Message
                        </ModernButton>
                        <ModernButton
                            variant="outline"
                            size="sm"
                            onClick={() => onSendConnectionRequest(profileData._id, 'unfollow')}
                            icon={FaCheck}
                        >
                            Following
                        </ModernButton>
                    </div>
                );
            case 'follower':
                return (
                    <div className="flex gap-2">
                        <ModernButton
                            variant="primary"
                            size="sm"
                            onClick={() => onSendConnectionRequest(profileData._id)}
                            icon={FaHandshake}
                        >
                            Follow Back
                        </ModernButton>
                        <ModernButton
                            variant="secondary"
                            size="sm"
                            onClick={() => window.location.href = `/messages?to=${profileData.email}`}
                            icon={FaEnvelope}
                        >
                            Message
                        </ModernButton>
                    </div>
                );
            case 'pending_sent':
                return (
                    <ModernButton
                        variant="secondary"
                        size="sm"
                        disabled
                        icon={FaClock}
                    >
                        Requested
                    </ModernButton>
                );
            case 'pending_received':
                return (
                    <div className="flex gap-2">
                        <ModernButton
                            variant="primary"
                            size="sm"
                            onClick={() => onSendConnectionRequest(profileData._id, 'accept')}
                            icon={FaHandshake}
                        >
                            Accept Request
                        </ModernButton>
                        <ModernButton
                            variant="secondary"
                            size="sm"
                            onClick={() => window.location.href = `/messages?to=${profileData.email}`}
                            icon={FaEnvelope}
                        >
                            Message
                        </ModernButton>
                    </div>
                );
            default:
                return (
                    <div className="flex gap-2">
                        <ModernButton
                            variant="primary"
                            size="sm"
                            onClick={() => onSendConnectionRequest(profileData._id)}
                            icon={FaHandshake}
                        >
                            Follow
                        </ModernButton>
                        <ModernButton
                            variant="secondary"
                            size="sm"
                            onClick={() => window.location.href = `/messages?to=${profileData.email}`}
                            icon={FaEnvelope}
                        >
                            Message
                        </ModernButton>
                    </div>
                );
        }
    };

    // Define a default avatar based on role
    const getDefaultAvatar = () => {
        if (profileData.photo_url) {
            return profileData.photo_url;
        }
        return "/img/default.png";
    };

    const getRoleIcon = () => {
        if (profileData.role === 'student') return <FaUserGraduate />;
        if (profileData.role === 'alumni') return <FaGraduationCap />;
        return <FaChalkboardTeacher />;
    };

    return (
        <div className="relative mb-8">
            {/* Cover Image */}
            <div className="h-48 md:h-64 rounded-3xl bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-50"></div>
                {isOwnProfile && (
                    <button className="absolute bottom-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30 transition-all border border-white/30">
                        <FaCamera className="text-sm" />
                    </button>
                )}
            </div>

            {/* Profile Info Section */}
            <div className="px-6 md:px-10 -mt-20 relative">
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                    {/* Avatar */}
                    <div className="relative group shrink-0">
                        <div className="h-32 w-32 md:h-40 md:w-40 rounded-[2rem] border-4 border-surface shadow-xl overflow-hidden bg-surface">
                            <img
                                src={getDefaultAvatar()}
                                alt={profileData.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>
                        {isOwnProfile && (
                            <button
                                onClick={onPhotoClick}
                                className="absolute bottom-2 right-2 p-2.5 bg-primary text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all outline-none border-2 border-surface"
                                title="Change avatar"
                            >
                                <FaEdit size={14} />
                            </button>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 pb-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-2">
                                    {profileData.name}
                                    {profileData.role === 'staff' && <FaCheck className="text-blue-500 text-sm" />}
                                </h1>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                                        {getRoleIcon()}
                                        {profileData.role?.charAt(0).toUpperCase() + profileData.role?.slice(1)}
                                    </span>
                                    {profileData.dept && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-text-secondary text-xs font-semibold">
                                            <FaBuilding size={12} />
                                            {profileData.dept}
                                        </span>
                                    )}
                                </div>

                                {/* Stats Section */}
                                <div className="mt-4 flex flex-wrap gap-6">
                                    <div className="group cursor-pointer">
                                        <span className="text-lg font-black text-text-primary group-hover:text-primary transition-colors">
                                            {connectionStats?.followers_count || 0}
                                        </span>
                                        <span className="ml-1.5 text-[10px] text-text-secondary uppercase tracking-[0.1em] font-bold">Followers</span>
                                    </div>
                                    <div className="group cursor-pointer">
                                        <span className="text-lg font-black text-text-primary group-hover:text-primary transition-colors">
                                            {connectionStats?.following_count || 0}
                                        </span>
                                        <span className="ml-1.5 text-[10px] text-text-secondary uppercase tracking-[0.1em] font-bold">Following</span>
                                    </div>
                                    <div className="group cursor-pointer">
                                        <span className="text-lg font-black text-text-primary group-hover:text-primary transition-colors">
                                            {profileData.skills?.length || 0}
                                        </span>
                                        <span className="ml-1.5 text-[10px] text-text-secondary uppercase tracking-[0.1em] font-bold">Skills</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center">
                                {isOwnProfile ? (
                                    <ModernButton
                                        variant="primary"
                                        size="md"
                                        onClick={onEditClick}
                                        icon={FaEdit}
                                    >
                                        Edit Profile
                                    </ModernButton>
                                ) : (
                                    renderConnectionButton()
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;