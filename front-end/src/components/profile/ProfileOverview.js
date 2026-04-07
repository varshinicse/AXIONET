import React from "react";
import {
    FaEnvelope, FaIdCard, FaCalendarAlt, FaBriefcase,
    FaMapMarkerAlt, FaLinkedin, FaGithub, FaChartLine
} from 'react-icons/fa';
import ModernCard from '../common/ModernCard';
import ModernButton from '../common/ModernButton';

// Personal Information Section
const PersonalInfoCard = ({ profileData }) => (
    <ModernCard className="mb-6" variant="flat">
        <h5 className="text-lg font-bold text-text-primary mb-4 pb-2 border-b border-border">Personal Information</h5>
        <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <FaEnvelope />
                </div>
                <div className="overflow-hidden">
                    <p className="text-[10px] uppercase tracking-wider font-semibold opacity-50">Email Address</p>
                    <p className="font-medium truncate">{profileData.email}</p>
                </div>
            </div>
            {profileData.regno && (
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <FaIdCard />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider font-semibold opacity-50">Registration Number</p>
                        <p className="font-medium">{profileData.regno}</p>
                    </div>
                </div>
            )}
            {profileData.batch && (
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <FaCalendarAlt />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider font-semibold opacity-50">Batch</p>
                        <p className="font-medium">{profileData.batch}</p>
                    </div>
                </div>
            )}
            {profileData.staff_id && (
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <FaIdCard />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider font-semibold opacity-50">Staff ID</p>
                        <p className="font-medium">{profileData.staff_id}</p>
                    </div>
                </div>
            )}
        </div>
    </ModernCard>
);

// Skills Card
const SkillsCard = ({ skills }) => (
    <ModernCard className="mb-6" variant="flat">
        <h5 className="text-lg font-bold text-text-primary mb-4 pb-2 border-b border-border">Skills & Expertise</h5>
        {skills && skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-100 dark:border-blue-800">
                        {skill}
                    </span>
                ))}
            </div>
        ) : (
            <p className="text-sm text-text-secondary italic">No skills added yet</p>
        )}
    </ModernCard>
);

// Social Links Card
const SocialLinksCard = ({ linkedin, github }) => (
    <ModernCard className="mb-6" variant="flat">
        <h5 className="text-lg font-bold text-text-primary mb-4 pb-2 border-b border-border">Social Profiles</h5>
        <div className="space-y-3">
            {linkedin && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-xl border border-border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm text-text-secondary">
                    <FaLinkedin className="text-blue-600 text-lg" />
                    <span className="font-medium">LinkedIn Profile</span>
                </a>
            )}
            {github && (
                <a href={github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-xl border border-border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm text-text-secondary">
                    <FaGithub className="text-gray-900 dark:text-white text-lg" />
                    <span className="font-medium">GitHub Profile</span>
                </a>
            )}
            {!linkedin && !github && (
                <p className="text-sm text-text-secondary italic">No social profiles added</p>
            )}
        </div>
    </ModernCard>
);

// Bio Card
const BioCard = ({ bio }) => (
    <ModernCard className="mb-6" variant="flat">
        <h5 className="text-lg font-bold text-text-primary mb-4 pb-2 border-b border-border">About Me</h5>
        {bio ? (
            <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{bio}</p>
        ) : (
            <p className="text-sm text-text-secondary italic">No bio added yet</p>
        )}
    </ModernCard>
);

// Role-Specific Section for Alumni
const AlumniOverviewCard = ({ jobProfile, mentorshipData, onJobProfileClick }) => {
    const menteesCount = Array.isArray(mentorshipData)
        ? mentorshipData.length
        : (mentorshipData?.mentees_count || mentorshipData?.mentees?.length || 0);

    const uniqueProjects = Array.isArray(mentorshipData)
        ? Array.from(new Set(mentorshipData.map(m => m._id))).length
        : (mentorshipData?.project_groups?.length || 0);

    return (
        <ModernCard className="mb-6" variant="flat">
            <h5 className="text-lg font-bold text-text-primary mb-4 pb-2 border-b border-border">Mentorship Activity</h5>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                    <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Mentees</p>
                    <p className="text-2xl font-bold text-text-primary">{menteesCount}</p>
                </div>
                <div className="bg-success/5 p-4 rounded-2xl border border-success/10">
                    <p className="text-xs text-success font-bold uppercase tracking-wider mb-1">Projects</p>
                    <p className="text-2xl font-bold text-text-primary">{uniqueProjects}</p>
                </div>
            </div>

            <h6 className="text-sm font-bold text-text-primary mb-3">Professional Summary</h6>
            {jobProfile ? (
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-border">
                    <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-border">
                            <FaBriefcase className="text-primary" />
                        </div>
                        <div>
                            <p className="font-bold text-text-primary">{jobProfile.job_title}</p>
                            <p className="text-sm text-text-secondary">{jobProfile.company}</p>
                            {jobProfile.location && (
                                <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                                    <FaMapMarkerAlt />
                                    {jobProfile.location}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <ModernButton
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={onJobProfileClick}
                    icon={FaBriefcase}
                >
                    Add Job Profile
                </ModernButton>
            )}
        </ModernCard>
    );
};

// Role-Specific Section for Students
const StudentOverviewCard = ({ projects, mentorshipData }) => (
    <ModernCard className="mb-6" variant="flat">
        <h5 className="text-lg font-bold text-text-primary mb-4 pb-2 border-b border-border">Academic Progress</h5>
        <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1 text-center">Projects</p>
                <p className="text-2xl font-bold text-text-primary text-center">{projects.length}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-800">
                <p className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-wider mb-1 text-center">Active</p>
                <p className="text-2xl font-bold text-text-primary text-center">
                    {mentorshipData.filter(item => item.status === 'accepted').length}
                </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800">
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider mb-1 text-center">Pending</p>
                <p className="text-2xl font-bold text-text-primary text-center">
                    {mentorshipData.filter(item => item.status === 'pending').length}
                </p>
            </div>
        </div>
    </ModernCard>
);

// Role-Specific Section for Staff
const StaffOverviewCard = ({ connections, dept }) => (
    <ModernCard className="mb-6" variant="flat">
        <h5 className="text-lg font-bold text-text-primary mb-4 pb-2 border-b border-border">Department Summary</h5>
        <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <span className="text-sm font-medium text-text-secondary">Department</span>
                <span className="text-sm font-bold text-text-primary">{dept}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-border flex flex-col items-center">
                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-1">Students</span>
                    <span className="text-xl font-bold text-text-primary">{connections.departmentStudents || 0}</span>
                </div>
                <div className="p-4 rounded-2xl border border-border flex flex-col items-center">
                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-1">Alumni</span>
                    <span className="text-xl font-bold text-text-primary">{connections.departmentAlumni || 0}</span>
                </div>
            </div>
            <ModernButton
                variant="primary"
                className="w-full"
                onClick={() => window.location.href = '/analytics'}
                icon={FaChartLine}
            >
                View Analytics
            </ModernButton>
        </div>
    </ModernCard>
);

// Main Overview Component
const ProfileOverview = ({
    profileData,
    connections,
    projects,
    mentorshipData = [],
    jobProfile,
    isOwnProfile,
    onJobProfileClick,
    renderConnectionStats
}) => {
    const userRole = profileData.role?.toLowerCase() || 'student';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-6">
                <PersonalInfoCard profileData={profileData} />
                <SkillsCard skills={profileData.skills || []} />
                <SocialLinksCard
                    linkedin={profileData.linkedin}
                    github={profileData.github}
                />
            </div>
            <div className="lg:col-span-8 space-y-6">
                <BioCard bio={profileData.bio} />
                {renderConnectionStats && renderConnectionStats()}

                {/* Role-specific overview content */}
                {userRole === 'student' && (
                    <StudentOverviewCard
                        projects={projects}
                        mentorshipData={mentorshipData}
                    />
                )}

                {userRole === 'alumni' && (
                    <AlumniOverviewCard
                        jobProfile={jobProfile}
                        mentorshipData={mentorshipData}
                        onJobProfileClick={isOwnProfile ? onJobProfileClick : null}
                    />
                )}

                {(userRole === 'staff' || userRole === 'admin') && (
                    <StaffOverviewCard
                        connections={connections}
                        dept={profileData.dept}
                    />
                )}
            </div>
        </div>
    );
};

export default ProfileOverview;