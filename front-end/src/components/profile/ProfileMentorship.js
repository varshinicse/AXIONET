import React from "react";
import { FaChalkboardTeacher, FaRegEnvelope, FaProjectDiagram, FaUserGraduate } from 'react-icons/fa';
import ModernCard from '../common/ModernCard';
import ModernButton from '../common/ModernButton';

// Student Mentorship Section (Requests sent by student)
const StudentMentorshipSection = ({ mentorshipData, isOwnProfile }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <FaChalkboardTeacher />
            </div>
            <h5 className="text-xl font-bold text-text-primary mb-0">
                {isOwnProfile ? 'My Mentorship Requests' : 'Mentorship Requests'}
            </h5>
        </div>

        {mentorshipData.length > 0 ? (
            <div className="space-y-4">
                {mentorshipData.map((request, index) => (
                    <ModernCard key={index} padding="p-5" className="group">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaProjectDiagram className="text-primary text-xs" />
                                    <h6 className="font-bold text-text-primary truncate">
                                        {request.project?.title || 'Project Request'}
                                    </h6>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-text-secondary">
                                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${request.status === 'accepted' ? 'bg-success/10 text-success' :
                                            request.status === 'rejected' ? 'bg-error/10 text-error' : 'bg-amber-500/10 text-amber-600'
                                        }`}>
                                        {request.status}
                                    </span>
                                    <span className="opacity-60">•</span>
                                    <span>Requested on {new Date(request.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {isOwnProfile && request.status === 'accepted' && (
                                <ModernButton
                                    variant="outline"
                                    size="sm"
                                    href={`/messages?to=${request.mentor_id}`}
                                    className="w-full md:w-auto"
                                >
                                    <FaRegEnvelope className="mr-2" />
                                    Message Mentor
                                </ModernButton>
                            )}
                        </div>
                    </ModernCard>
                ))}
            </div>
        ) : (
            <ModernCard variant="flat" borderStyle="dashed" className="py-12 text-center bg-gray-50/50 dark:bg-gray-800/20">
                <FaChalkboardTeacher className="mx-auto mb-4 text-4xl text-text-secondary opacity-30" />
                <h6 className="text-text-primary font-bold text-lg mb-2">No Mentorship Requests</h6>
                <p className="text-text-secondary max-w-sm mx-auto text-sm mb-6">
                    {isOwnProfile
                        ? "You haven't requested mentorship for any projects yet."
                        : "This user hasn't requested any mentorships yet."}
                </p>
                {isOwnProfile && (
                    <ModernButton variant="primary" href="/projects">
                        Explore Projects
                    </ModernButton>
                )}
            </ModernCard>
        )}
    </div>
);

// Alumni Mentorship Section (Students they are mentoring)
const AlumniMentorshipSection = ({ mentorshipData, isOwnProfile }) => {
    const projectGroups = Array.isArray(mentorshipData)
        ? mentorshipData
        : (mentorshipData?.project_groups || []);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-success/10 text-success">
                    <FaUserGraduate />
                </div>
                <h5 className="text-xl font-bold text-text-primary mb-0">
                    {isOwnProfile ? 'My Mentees' : 'Mentees'}
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-text-secondary text-xs rounded-full font-medium">
                        {projectGroups.length} Groups
                    </span>
                </h5>
            </div>

            {projectGroups.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {projectGroups.map((group, index) => (
                        <ModernCard key={index} padding="p-5">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex-1 min-w-0">
                                    <h6 className="font-bold text-text-primary text-lg mb-1 truncate">
                                        {group.project_title || 'Project Group'}
                                    </h6>
                                    <div className="flex flex-wrap gap-2 items-center text-sm text-text-secondary">
                                        <FaUserGraduate className="text-success text-xs" />
                                        <span>{group.student_names?.join(', ') || 'No students'}</span>
                                        <span className="opacity-40">•</span>
                                        <span>{group.dept}</span>
                                    </div>
                                </div>
                                {isOwnProfile && (
                                    <ModernButton
                                        variant="outline"
                                        size="sm"
                                        href={`/projects/${group.project_id}`}
                                        className="w-full md:w-auto"
                                    >
                                        View Project
                                    </ModernButton>
                                )}
                            </div>
                        </ModernCard>
                    ))}
                </div>
            ) : (
                <ModernCard variant="flat" borderStyle="dashed" className="py-12 text-center bg-gray-50/50 dark:bg-gray-800/20">
                    <FaUserGraduate className="mx-auto mb-4 text-4xl text-text-secondary opacity-30" />
                    <h6 className="text-text-primary font-bold text-lg mb-2">No Active Mentees</h6>
                    <p className="text-text-secondary max-w-sm mx-auto text-sm mb-6">
                        {isOwnProfile
                            ? "You aren't mentoring any project groups yet. Check your requests to start guiding students."
                            : "This user isn't mentoring any students yet."}
                    </p>
                    {isOwnProfile && (
                        <ModernButton variant="primary" href="/alumni/requests">
                            View Mentorship Requests
                        </ModernButton>
                    )}
                </ModernCard>
            )}
        </div>
    );
};

// Main Mentorship Component
const ProfileMentorship = ({ mentorshipData, userRole, isOwnProfile }) => {
    return (
        <div className="max-w-4xl mx-auto">
            {userRole === 'student' ? (
                <StudentMentorshipSection
                    mentorshipData={mentorshipData}
                    isOwnProfile={isOwnProfile}
                />
            ) : (
                <AlumniMentorshipSection
                    mentorshipData={mentorshipData}
                    isOwnProfile={isOwnProfile}
                />
            )}
        </div>
    );
};

export default ProfileMentorship;