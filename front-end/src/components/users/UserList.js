import React, { useState, useEffect } from 'react';
import {
    FaSearch,
    FaFilter,
    FaUserGraduate,
    FaGraduationCap,
    FaChalkboardTeacher,
    FaBuilding,
    FaHandshake,
    FaCheck,
    FaClock,
    FaEnvelope,
    FaUserCircle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { userService } from '../../services/api/users';
import { useConnections } from '../../contexts/ConnectionsContext';
import ModernCard from '../common/ModernCard';
import ModernButton from '../common/ModernButton';

const UserCard = ({ user, connectionStatus, onConnect, loading }) => {
    const getStatusButton = () => {
        const status = connectionStatus?.status;

        switch (status) {
            case 'mutual':
            case 'following':
                return (
                    <div className="flex flex-col gap-2 w-full">
                        <ModernButton
                            variant="secondary"
                            size="sm"
                            href={`/messages?to=${user.email}`}
                            icon={FaEnvelope}
                            className="w-full"
                        >
                            Message
                        </ModernButton>
                        <ModernButton
                            variant="outline"
                            size="sm"
                            disabled
                            icon={FaCheck}
                            className="w-full"
                        >
                            Following
                        </ModernButton>
                    </div>
                );
            case 'follower':
                return (
                    <div className="flex flex-col gap-2 w-full">
                        <ModernButton
                            variant="primary"
                            size="sm"
                            onClick={() => onConnect(user._id)}
                            loading={loading}
                            icon={FaHandshake}
                            className="w-full"
                        >
                            Follow Back
                        </ModernButton>
                        <ModernButton
                            variant="secondary"
                            size="sm"
                            href={`/messages?to=${user.email}`}
                            icon={FaEnvelope}
                            className="w-full"
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
                        className="w-full"
                    >
                        Requested
                    </ModernButton>
                );
            case 'pending_received':
                return (
                    <ModernButton
                        variant="primary"
                        size="sm"
                        onClick={() => onConnect(user._id, 'accept')}
                        loading={loading}
                        icon={FaHandshake}
                        className="w-full"
                    >
                        Accept Request
                    </ModernButton>
                );
            default:
                return (
                    <ModernButton
                        variant="primary"
                        size="sm"
                        onClick={() => onConnect(user._id)}
                        loading={loading}
                        icon={FaHandshake}
                        className="w-full"
                    >
                        Follow
                    </ModernButton>
                );
        }
    };

    const getRoleIcon = () => {
        if (user.role === 'student') return <FaUserGraduate />;
        if (user.role === 'alumni') return <FaGraduationCap />;
        return <FaChalkboardTeacher />;
    };

    return (
        <ModernCard className="h-full group hover:border-primary/30 transition-all duration-300">
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-2xl overflow-hidden border border-border shadow-sm shrink-0">
                        <img
                            src={user.photo_url || "/img/default.png"}
                            alt={user.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                    <div className="min-w-0">
                        <h5 className="font-bold text-text-primary mb-1 truncate">{user.name}</h5>
                        <div className="flex flex-wrap gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
                                {getRoleIcon()}
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-text-secondary text-[10px] font-bold">
                                <FaBuilding className="text-[8px]" />
                                {user.dept}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-3 mb-6">
                    {user.batch && (
                        <div className="text-xs text-text-secondary flex items-center gap-2">
                            <span className="font-semibold text-text-primary">Batch:</span> {user.batch}
                        </div>
                    )}

                    {user.bio && (
                        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                            {user.bio}
                        </p>
                    )}

                    {user.skills && user.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {user.skills.slice(0, 3).map((skill, index) => (
                                <span key={index} className="px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-800/50 text-[10px] text-text-secondary border border-border">
                                    {skill}
                                </span>
                            ))}
                            {user.skills.length > 3 && (
                                <span className="px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-800/50 text-[10px] text-primary font-bold">
                                    +{user.skills.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-2 mt-auto">
                    <ModernButton
                        variant="secondary"
                        size="sm"
                        href={`/profile/${user._id}`}
                        className="w-full"
                    >
                        View Profile
                    </ModernButton>
                    {getStatusButton()}
                </div>
            </div>
        </ModernCard>
    );
};

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        role: '',
        department: ''
    });
    const [departments, setDepartments] = useState([]);
    const [connectionStatuses, setConnectionStatuses] = useState({});
    const [connectingUser, setConnectingUser] = useState(null);

    const { sendConnectionRequest, respondToConnectionRequest, checkConnectionStatus } = useConnections();

    // Fetch all users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await userService.getUsers();
                const depts = [...new Set(response.users.map(u => u.dept))].filter(Boolean);
                setDepartments(depts);
                setUsers(response.users);
                setFilteredUsers(response.users);
                setError(null);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load users. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Fetch connection status for visible users
    useEffect(() => {
        const fetchConnectionStatuses = async () => {
            const statuses = {};
            for (const user of filteredUsers) {
                try {
                    const status = await checkConnectionStatus(user._id);
                    statuses[user._id] = status;
                } catch (err) {
                    console.error(`Error checking connection status for user ${user._id}:`, err);
                }
            }
            setConnectionStatuses(statuses);
        };

        if (filteredUsers.length > 0) {
            fetchConnectionStatuses();
        }
    }, [filteredUsers, checkConnectionStatus]);

    // Apply filters
    useEffect(() => {
        if (!users.length) return;
        const filtered = users.filter(user => {
            const searchMatch = !filters.search ||
                user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                user.dept?.toLowerCase().includes(filters.search.toLowerCase());
            const roleMatch = !filters.role || user.role === filters.role;
            const deptMatch = !filters.department || user.dept === filters.department;
            return searchMatch && roleMatch && deptMatch;
        });
        setFilteredUsers(filtered);
    }, [users, filters]);

    const handleConnectClick = async (userId, action = 'connect') => {
        setConnectingUser(userId);
        try {
            if (action === 'accept') {
                const request = connectionStatuses[userId];
                if (request?.status === 'pending_received') {
                    await respondToConnectionRequest(request.request_id, 'accepted');
                }
            } else {
                await sendConnectionRequest(userId);
            }
            // Refresh status
            const newStatus = await checkConnectionStatus(userId);
            setConnectionStatuses(prev => ({ ...prev, [userId]: newStatus }));
        } catch (err) {
            console.error('Error handling connection:', err);
        } finally {
            setConnectingUser(null);
        }
    };

    if (loading && !users.length) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl text-red-600 text-center">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Filter Section */}
            <ModernCard className="border-none shadow-sm bg-primary/5">
                <div className="flex flex-col gap-6 p-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-2xl font-bold text-text-primary">Find Connections</h4>
                            <p className="text-sm text-text-secondary mt-1">Discover and grow your professional circle</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-primary bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-border shadow-sm">
                            <FaFilter className="text-xs" />
                            <span className="text-xs font-bold uppercase tracking-wider">Filtered View</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6">
                            <div className="relative group">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by name or department..."
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm shadow-sm"
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-3">
                            <select
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm shadow-sm appearance-none cursor-pointer"
                                value={filters.role}
                                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                            >
                                <option value="">All Roles</option>
                                <option value="student">Student</option>
                                <option value="alumni">Alumni</option>
                                <option value="staff">Staff</option>
                            </select>
                        </div>

                        <div className="md:col-span-3">
                            <select
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm shadow-sm appearance-none cursor-pointer"
                                value={filters.department}
                                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                            >
                                <option value="">All Departments</option>
                                {departments.map((dept, index) => (
                                    <option key={index} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </ModernCard>

            {/* Results Title */}
            <div className="flex items-center justify-between border-l-4 border-primary pl-4">
                <h5 className="text-lg font-bold text-text-primary">
                    {filteredUsers.length} {filteredUsers.length === 1 ? 'Professional' : 'Professionals'} Found
                </h5>
            </div>

            {/* User Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                        <UserCard
                            key={user._id}
                            user={user}
                            connectionStatus={connectionStatuses[user._id]}
                            onConnect={handleConnectClick}
                            loading={connectingUser === user._id}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-20">
                        <ModernCard variant="flat" borderStyle="dashed" className="bg-gray-50/50 dark:bg-gray-800/10 rounded-[2rem] text-center max-w-md mx-auto">
                            <FaUserCircle className="mx-auto mb-4 text-6xl text-text-secondary opacity-20" />
                            <h6 className="text-lg font-bold text-text-primary mb-2">No results found</h6>
                            <p className="text-sm text-text-secondary">Try adjusting your filters or search terms to find more members of the AXIONET community.</p>
                        </ModernCard>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserList;