import React, { useState } from "react";
import {
    FaEnvelope,
    FaCheckCircle,
    FaTimesCircle,
    FaUserFriends,
    FaUserPlus,
    FaClock,
    FaUserCircle
} from 'react-icons/fa';
import ModernCard from '../common/ModernCard';
import ModernButton from '../common/ModernButton';
import { useConnections } from '../../contexts/ConnectionsContext';

// Connection List Item Component (Reusable for Followers/Following)
const NetworkUserItem = ({ userDetails, variant = 'follower', onAction }) => (
    <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/20 rounded-2xl border border-border group hover:border-primary/30 transition-all duration-300">
        <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl overflow-hidden border border-border shadow-sm flex-shrink-0">
                <img
                    src={userDetails.photo_url || "/img/default.png"}
                    alt={userDetails.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="min-w-0">
                <h6 className="font-bold text-text-primary mb-0.5 truncate">{userDetails.name}</h6>
                <p className="text-xs text-text-secondary leading-tight truncate">
                    {userDetails.role} • {userDetails.dept}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${variant === 'follower'
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                        : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30'
                        }`}>
                        {variant === 'follower' ? 'Follower' : 'Following'}
                    </span>
                </div>
            </div>
        </div>
        <div className="flex gap-2">
            <ModernButton
                variant="outline"
                size="sm"
                href={`/profile/${userDetails._id}`}
                className="rounded-xl px-3 hidden sm:flex"
            >
                View
            </ModernButton>
            <ModernButton
                variant="primary"
                size="sm"
                href={`/messages?to=${userDetails.email}`}
                className="rounded-xl px-3"
            >
                <FaEnvelope />
            </ModernButton>
        </div>
    </div>
);

// Connection Request Item Component
const ConnectionRequestItem = ({ request, onResponseClick }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20 gap-4 mb-4">
        <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl overflow-hidden border border-primary/20 shadow-sm flex-shrink-0">
                <img
                    src={request.from_user.photo_url || "/img/default.png"}
                    alt={request.from_user.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div>
                <h6 className="font-bold text-text-primary mb-0.5">{request.from_user.name}</h6>
                <p className="text-xs text-text-secondary leading-tight">
                    {request.from_user.role} • {request.from_user.dept}
                </p>
                <p className="text-[10px] text-primary mt-1 font-medium italic">
                    Wants to connect with you
                </p>
            </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <ModernButton
                variant="primary"
                size="sm"
                className="flex-1 sm:flex-none shadow-sm"
                onClick={() => onResponseClick(request._id, 'accepted')}
            >
                <FaCheckCircle className="mr-2" />
                Accept
            </ModernButton>
            <ModernButton
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none border-red-200 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                onClick={() => onResponseClick(request._id, 'rejected')}
            >
                <FaTimesCircle className="mr-2" />
                Ignore
            </ModernButton>
        </div>
    </div>
);

// Main Connections Component
const ProfileConnections = ({ isOwnProfile }) => {
    const {
        followers,
        following,
        connectionRequests,
        respondToConnectionRequest
    } = useConnections();

    const [activeTab, setActiveTab] = useState('followers');

    const tabs = [
        { id: 'followers', label: 'Followers', count: followers.length, icon: FaUserFriends },
        { id: 'following', label: 'Following', count: following.length, icon: FaUserPlus },
        ...(isOwnProfile ? [{ id: 'pending', label: 'Requests', count: connectionRequests.length, icon: FaClock, highlight: connectionRequests.length > 0 }] : [])
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'pending':
                return (
                    <div className="space-y-4">
                        {connectionRequests.length > 0 ? (
                            connectionRequests.map((request, index) => (
                                <ConnectionRequestItem
                                    key={request._id || index}
                                    request={request}
                                    onResponseClick={respondToConnectionRequest}
                                />
                            ))
                        ) : (
                            <EmptyState message="No pending requests at the moment." />
                        )}
                    </div>
                );
            case 'following':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {following.length > 0 ? (
                            following.map((conn, index) => (
                                <NetworkUserItem
                                    key={conn.connection_id || index}
                                    userDetails={conn.user}
                                    variant="following"
                                />
                            ))
                        ) : (
                            <div className="col-span-full">
                                <EmptyState message={isOwnProfile ? "You aren't following anyone yet." : "This user isn't following anyone yet."} />
                            </div>
                        )}
                    </div>
                );
            case 'followers':
            default:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {followers.length > 0 ? (
                            followers.map((conn, index) => (
                                <NetworkUserItem
                                    key={conn.connection_id || index}
                                    userDetails={conn.user}
                                    variant="follower"
                                />
                            ))
                        ) : (
                            <div className="col-span-full">
                                <EmptyState message={isOwnProfile ? "You don't have any followers yet." : "This user doesn't have any followers yet."} />
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                        <FaUserFriends className="text-xl" />
                    </div>
                    <div>
                        <h5 className="text-xl font-bold text-text-primary mb-0">Professional Network</h5>
                        <p className="text-xs text-text-secondary">
                            {isOwnProfile ? "Manage your connections" : "Explore their professional circle"}
                        </p>
                    </div>
                </div>

                <div className="flex p-1 bg-gray-100 dark:bg-gray-800/50 rounded-2xl overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            <tab.icon className={tab.highlight ? 'text-primary animate-pulse' : ''} />
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-600 text-text-secondary'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px] animate-in fade-in slide-in-from-bottom-2 duration-500">
                {renderTabContent()}
            </div>
        </div>
    );
};

const EmptyState = ({ message }) => (
    <ModernCard variant="flat" borderStyle="dashed" className="py-20 text-center bg-gray-50/50 dark:bg-gray-800/20 rounded-3xl">
        <FaUserCircle className="mx-auto mb-4 text-5xl text-text-secondary opacity-20" />
        <p className="text-text-secondary text-sm font-medium">{message}</p>
    </ModernCard>
);

export default ProfileConnections;