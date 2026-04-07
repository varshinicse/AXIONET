import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FaBell, FaProjectDiagram, FaUserFriends,
    FaChalkboardTeacher, FaBriefcase, FaInfoCircle,
    FaArrowLeft
} from 'react-icons/fa';

import { useAuth } from '../../contexts/AuthContext';
import { useConnections } from '../../contexts/ConnectionsContext';
import { userProfileService } from '../../services/api/userProfile';
import { mentorshipService } from '../../services/api/mentorship';
import { projectService } from '../../services/api/projects';
import { connectionService } from '../../services/api/connection';
import { jobProfileService } from '../../services/api/jobProfile';
import avatarService from "../../services/api/avatarService";

import ProfileHeader from './ProfileHeader';
import ProfileOverview from './ProfileOverview';
import ProfileProjects from './ProfileProjects';
import ProfileMentorship from './ProfileMentorship';
import ProfileConnections from './ProfileConnections';
import ProfileJobExperience from './ProfileJobExperience';
import ModernCard from '../common/ModernCard';
import ModernButton from '../common/ModernButton';
import LoadingSpinner from '../common/LoadingSpinner';

import {
    EditProfileModal,
    AvatarSelectionModal,
    JobProfileModal,
    JobExperienceModal
} from './modals/ProfileModals';

const Profile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // State management
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [connections, setConnections] = useState({});
    const [projects, setProjects] = useState([]);
    const [mentorshipData, setMentorshipData] = useState([]);
    const [jobProfile, setJobProfile] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isOwnProfile, setIsOwnProfile] = useState(true);
    const [showRequestsDropdown, setShowRequestsDropdown] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [connectionStats, setConnectionStats] = useState({ followers_count: 0, following_count: 0 });

    const {
        connections: connectionsList,
        connectionRequests,
        respondToConnectionRequest,
        sendConnectionRequest,
        checkConnectionStatus: checkStatus
    } = useConnections();

    // Avatar states
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState('default');
    const [userGender, setUserGender] = useState('male');

    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showJobProfileModal, setShowJobProfileModal] = useState(false);
    const [showJobExperienceModal, setShowJobExperienceModal] = useState(false);

    // Form states
    const [editForm, setEditForm] = useState({
        name: '',
        dept: '',
        regno: '',
        batch: '',
        bio: '',
        linkedin: '',
        github: '',
        skills: ''
    });

    const [jobProfileForm, setJobProfileForm] = useState({
        company: '',
        job_title: '',
        location: '',
        start_date: '',
        end_date: '',
        current: false,
        description: '',
        industry: '',
        skills: []
    });

    const [jobExperienceForm, setJobExperienceForm] = useState({
        company: '',
        job_title: '',
        location: '',
        start_date: '',
        end_date: '',
        current: false,
        description: '',
        skills: []
    });

    const [selectedExperienceId, setSelectedExperienceId] = useState(null);

    // Fetch handlers


    const fetchConnectionsStats = useCallback(async (targetUserId = null) => {
        try {
            const response = await userProfileService.getConnections(targetUserId);
            setConnections(response || {});
            setConnectionStats({
                followers_count: response.followers_count || 0,
                following_count: response.following_count || 0
            });
        } catch (error) {
            console.error('Error fetching connections:', error);
        }
    }, []);

    const fetchConnectionStatus = useCallback(async (targetUserId) => {
        if (!user || !targetUserId || user._id === targetUserId) return;
        try {
            const status = await checkStatus(targetUserId);
            setConnectionStatus(status);
        } catch (error) {
            console.error('Error fetching connection status:', error);
        }
    }, [user, checkStatus]);

    const fetchProjects = useCallback(async (targetUserId = null) => {
        try {
            const response = await projectService.getProjects();
            setProjects(response || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }, []);

    const fetchMentorshipData = useCallback(async (targetUser = null) => {
        if (!targetUser) return;
        try {
            if (targetUser.role === 'alumni') {
                if (isOwnProfile) {
                    const response = await mentorshipService.getMentees();
                    setMentorshipData(response || {});
                }
            } else if (targetUser.role === 'student') {
                const response = await mentorshipService.getRequests();
                setMentorshipData(response || []);
            }
        } catch (error) {
            console.error('Error fetching mentorship data:', error);
        }
    }, [isOwnProfile]);

    const fetchJobProfile = useCallback(async (targetUserId = null) => {
        if (!targetUserId) return;
        try {
            const profile = await jobProfileService.getJobProfile(targetUserId);
            setJobProfile(profile);
        } catch (error) {
            console.error('Error fetching job profile:', error);
        }
    }, []);

    const updateProfileAvatar = useCallback((avatarUrl) => {
        setProfileData(prevData => ({ ...prevData, photo_url: avatarUrl }));
    }, []);

    const handleAvatarSelect = (avatarId) => {
        if (!isOwnProfile || !user) return;
        const avatarUrl = avatarService.getAvatarUrl(avatarId, profileData.role, userGender);
        updateProfileAvatar(avatarUrl);
        avatarService.saveAvatarSelection(user.email, avatarId);
        setShowAvatarModal(false);
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                let userData;
                if (!userId || userId === user._id) {
                    setIsOwnProfile(true);
                    userData = await userProfileService.getMyProfile();
                } else {
                    setIsOwnProfile(false);
                    userData = await userProfileService.getUserProfile(userId);
                    fetchConnectionStatus(userId);
                }
                setProfileData(userData);

                const promises = [
                    fetchConnectionsStats(userId),
                    fetchProjects(userId)
                ];

                if (userData.role === 'student' || userData.role === 'alumni') {
                    promises.push(fetchMentorshipData(userData));
                }
                if (userData.role === 'alumni') {
                    promises.push(fetchJobProfile(userId));
                }

                await Promise.all(promises.filter(p => p !== null));
            } catch (err) {
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [user, userId, fetchConnectionsStats, fetchProjects, fetchMentorshipData, fetchJobProfile, isOwnProfile, fetchConnectionStatus]);

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            ...editForm,
            skills: editForm.skills ? editForm.skills.split(',').map(skill => skill.trim()) : []
        };
        try {
            await userProfileService.updateProfile(formData);
            setShowEditModal(false);
            const updatedData = await userProfileService.getMyProfile();
            updatedData.photo_url = profileData.photo_url;
            setProfileData(updatedData);
        } catch (error) {
            setError('Failed to update profile. Please try again.');
        }
    };

    const handleConnectionResponse = async (requestId, status) => {
        try {
            await respondToConnectionRequest(requestId, status);
        } catch (error) {
            setError('Failed to process connection request. Please try again.');
        }
    };

    const handleSendConnectionRequestLocally = async (toUserId, action = 'connect') => {
        try {
            if (action === 'accept') {
                const request = connectionRequests.find(req => req.from_user._id === toUserId);
                if (request) {
                    await respondToConnectionRequest(request._id, 'accepted');
                }
            } else {
                await sendConnectionRequest(toUserId);
                setConnectionStatus({ status: 'pending_sent' });
            }
        } catch (error) {
            setError('Failed to send connection request. Please try again.');
        }
    };

    const handleJobProfileSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            ...jobProfileForm,
            skills: typeof jobProfileForm.skills === 'string'
                ? jobProfileForm.skills.split(',').map(skill => skill.trim())
                : jobProfileForm.skills
        };
        try {
            if (jobProfile) await jobProfileService.updateJobProfile(formData);
            else await jobProfileService.createJobProfile(formData);
            setShowJobProfileModal(false);
            const updatedProfile = await jobProfileService.getJobProfile();
            setJobProfile(updatedProfile);
        } catch (error) {
            setError('Failed to update job profile. Please try again.');
        }
    };

    const handleJobExperienceSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            ...jobExperienceForm,
            skills: typeof jobExperienceForm.skills === 'string'
                ? jobExperienceForm.skills.split(',').map(skill => skill.trim())
                : jobExperienceForm.skills
        };
        try {
            if (selectedExperienceId) await jobProfileService.updateJobExperience(selectedExperienceId, formData);
            else await jobProfileService.addJobExperience(formData);
            setShowJobExperienceModal(false);
            setJobExperienceForm({
                company: '', job_title: '', location: '', start_date: '',
                end_date: '', current: false, description: '', skills: []
            });
            setSelectedExperienceId(null);
            const updatedProfile = await jobProfileService.getJobProfile();
            setJobProfile(updatedProfile);
        } catch (error) {
            setError('Failed to update job experience. Please try again.');
        }
    };

    const handleDeleteJobExperience = async (experienceId) => {
        if (window.confirm('Are you sure you want to delete this experience?')) {
            try {
                await jobProfileService.deleteJobExperience(experienceId);
                const updatedProfile = await jobProfileService.getJobProfile();
                setJobProfile(updatedProfile);
            } catch (error) {
                setError('Failed to delete job experience. Please try again.');
            }
        }
    };

    const handleEditJobExperience = (experience) => {
        setJobExperienceForm({
            company: experience.company || '',
            job_title: experience.job_title || '',
            location: experience.location || '',
            start_date: experience.start_date || '',
            end_date: experience.end_date || '',
            current: experience.current || false,
            description: experience.description || '',
            skills: Array.isArray(experience.skills) ? experience.skills.join(', ') : ''
        });
        setSelectedExperienceId(experience._id);
        setShowJobExperienceModal(true);
    };

    const renderConnectionStats = () => {
        const userRole = profileData.role?.toLowerCase() || 'student';
        return (
            <ModernCard className="mb-6 overflow-hidden" padding="p-0">
                <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <h5 className="font-bold text-text-primary mb-0">Connections Overview</h5>
                    {isOwnProfile && connectionRequests.length > 0 && (
                        <div className="relative">
                            <button
                                className="relative p-2 text-text-secondary hover:text-primary transition-colors"
                                onClick={() => setShowRequestsDropdown(!showRequestsDropdown)}
                            >
                                <FaBell />
                                <span className="absolute top-0 right-0 h-4 w-4 bg-error text-white text-[10px] flex items-center justify-center rounded-full border border-surface">
                                    {connectionRequests.length}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center mb-6">
                        {userRole === 'student' && (
                            <>
                                <div>
                                    <p className="text-3xl font-bold text-primary">{connections.students || 0}</p>
                                    <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Students</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-success">{connections.alumni || 0}</p>
                                    <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Alumni</p>
                                </div>
                            </>
                        )}
                        {userRole === 'alumni' && (
                            <>
                                <div>
                                    <p className="text-3xl font-bold text-primary">{connections.total || 0}</p>
                                    <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Total</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-success">{connections.students || 0}</p>
                                    <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Students</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-amber-500">{mentorshipData.length || 0}</p>
                                    <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Mentees</p>
                                </div>
                            </>
                        )}
                        {(userRole === 'staff' || userRole === 'admin') && (
                            <>
                                <div>
                                    <p className="text-3xl font-bold text-primary">{connections.departmentStudents || 0}</p>
                                    <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Dept Students</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-success">{connections.departmentAlumni || 0}</p>
                                    <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Dept Alumni</p>
                                </div>
                            </>
                        )}
                    </div>

                    {connectionsList.length > 0 && (
                        <div className="pt-6 border-t border-border">
                            <h6 className="text-sm font-bold text-text-primary mb-4">Recent Connections</h6>
                            <div className="space-y-4">
                                {connectionsList.slice(0, 3).map((connection, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl overflow-hidden border border-border bg-gray-100">
                                            <img
                                                src={connection.user.photo_url || "/img/default.png"}
                                                alt={connection.user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-text-primary truncate">{connection.user.name}</p>
                                            <p className="text-xs text-text-secondary truncate">
                                                {connection.user.role} • {connection.user.dept}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-center">
                                <button
                                    className="text-primary text-sm font-bold hover:underline"
                                    onClick={() => setActiveTab('connections')}
                                >
                                    View All Connections
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </ModernCard>
        );
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <LoadingSpinner size="lg" />
        </div>
    );

    if (error) return (
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <div className="bg-error/10 text-error p-6 rounded-3xl border border-error/20 inline-block">
                <p className="font-bold text-lg mb-2">Error Loading Profile</p>
                <p>{error}</p>
                <ModernButton variant="primary" className="mt-4" onClick={() => window.location.reload()}>Retry</ModernButton>
            </div>
        </div>
    );

    if (!profileData) return (
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <div className="bg-amber-50 dark:bg-amber-900/10 text-amber-600 p-8 rounded-3xl border border-amber-200 dark:border-amber-800 inline-block">
                <FaArrowLeft className="mx-auto mb-4 text-2xl" />
                <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
                <p className="mb-6">The user profile you are looking for doesn't exist or has been removed.</p>
                <ModernButton variant="primary" onClick={() => navigate('/feed')}>Back to Feed</ModernButton>
            </div>
        </div>
    );

    const userRole = profileData.role?.toLowerCase() || 'student';

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FaInfoCircle },
        ...(userRole === 'student' ? [{ id: 'projects', label: 'Projects', icon: FaProjectDiagram }] : []),
        ...(userRole === 'alumni' ? [{ id: 'job-profile', label: 'Job Profile', icon: FaBriefcase }] : []),
        ...(userRole === 'student' || userRole === 'alumni' ? [{ id: 'mentorship', label: 'Mentorship', icon: FaChalkboardTeacher }] : []),
        { id: 'connections', label: 'Connections', icon: FaUserFriends }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ModernCard className="mb-0 overflow-hidden" padding="p-0" variant="flat">
                {/* Profile Header */}
                <ProfileHeader
                    profileData={profileData}
                    isOwnProfile={isOwnProfile}
                    connectionStatus={connectionStatus}
                    connectionStats={connectionStats}
                    userRole={user?.role}
                    onEditClick={() => setShowEditModal(true)}
                    onPhotoClick={() => setShowAvatarModal(true)}
                    onSendConnectionRequest={handleSendConnectionRequestLocally}
                />

                {/* Tab Navigation */}
                <div className="px-6 md:px-10 border-b border-border bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex overflow-x-auto no-scrollbar gap-8">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 border-b-2 transition-all font-bold text-sm whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                <tab.icon className="text-lg" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-6 md:p-10 bg-surface">
                    {activeTab === 'overview' && (
                        <ProfileOverview
                            profileData={profileData}
                            connections={connections}
                            projects={projects}
                            mentorshipData={mentorshipData}
                            jobProfile={jobProfile}
                            isOwnProfile={isOwnProfile}
                            onJobProfileClick={() => setShowJobProfileModal(true)}
                            renderConnectionStats={renderConnectionStats}
                        />
                    )}

                    {activeTab === 'projects' && userRole === 'student' && (
                        <ProfileProjects
                            projects={projects}
                            isOwnProfile={isOwnProfile}
                        />
                    )}

                    {activeTab === 'job-profile' && userRole === 'alumni' && (
                        <ProfileJobExperience
                            jobProfile={jobProfile}
                            isOwnProfile={isOwnProfile}
                            onEditJobProfile={() => {
                                setJobProfileForm({
                                    company: jobProfile.company || '',
                                    job_title: jobProfile.job_title || '',
                                    location: jobProfile.location || '',
                                    start_date: jobProfile.start_date || '',
                                    end_date: jobProfile.end_date || '',
                                    current: jobProfile.current || false,
                                    description: jobProfile.description || '',
                                    industry: jobProfile.industry || '',
                                    skills: Array.isArray(jobProfile.skills) ? jobProfile.skills.join(', ') : ''
                                });
                                setShowJobProfileModal(true);
                            }}
                            onAddJobProfile={() => setShowJobProfileModal(true)}
                            onAddJobExperience={() => {
                                setJobExperienceForm({
                                    company: '', job_title: '', location: '', start_date: '',
                                    end_date: '', current: false, description: '', skills: []
                                });
                                setSelectedExperienceId(null);
                                setShowJobExperienceModal(true);
                            }}
                            onEditJobExperience={handleEditJobExperience}
                            onDeleteJobExperience={handleDeleteJobExperience}
                        />
                    )}

                    {(activeTab === 'mentorship') && (userRole === 'student' || userRole === 'alumni') && (
                        <ProfileMentorship
                            mentorshipData={mentorshipData}
                            userRole={userRole}
                            isOwnProfile={isOwnProfile}
                        />
                    )}

                    {activeTab === 'connections' && (
                        <ProfileConnections
                            userData={profileData}
                            isOwnProfile={isOwnProfile}
                        />
                    )}
                </div>
            </ModernCard>

            {/* Modals */}
            {isOwnProfile && (
                <>
                    <EditProfileModal
                        show={showEditModal}
                        onHide={() => setShowEditModal(false)}
                        editForm={editForm}
                        setEditForm={setEditForm}
                        onSubmit={handleEditSubmit}
                        userRole={userRole}
                    />

                    <AvatarSelectionModal
                        show={showAvatarModal}
                        onHide={() => setShowAvatarModal(false)}
                        selectedAvatar={selectedAvatar}
                        setSelectedAvatar={setSelectedAvatar}
                        userRole={userRole}
                        userGender={userGender}
                        onAvatarSelect={handleAvatarSelect}
                    />

                    {userRole === 'alumni' && (
                        <>
                            <JobProfileModal
                                show={showJobProfileModal}
                                onHide={() => setShowJobProfileModal(false)}
                                jobProfileForm={jobProfileForm}
                                setJobProfileForm={setJobProfileForm}
                                onSubmit={handleJobProfileSubmit}
                                isEditing={!!jobProfile}
                            />
                            <JobExperienceModal
                                show={showJobExperienceModal}
                                onHide={() => setShowJobExperienceModal(false)}
                                jobExperienceForm={jobExperienceForm}
                                setJobExperienceForm={setJobExperienceForm}
                                onSubmit={handleJobExperienceSubmit}
                                isEditing={!!selectedExperienceId}
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default Profile;