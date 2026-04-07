import React from "react";
import {
    FaEdit, FaPlus, FaPen, FaTrash,
    FaMapMarkerAlt, FaCalendarAlt, FaBriefcase,
    FaBuilding
} from 'react-icons/fa';
import ModernCard from '../common/ModernCard';
import ModernButton from '../common/ModernButton';

// Current Job Position Card
const CurrentPositionCard = ({ jobProfile, isOwnProfile, onEditJobProfile, onAddJobProfile }) => (
    <ModernCard className="mb-6 overflow-hidden" padding="p-0">
        <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <FaBriefcase className="text-sm" />
                </div>
                <h5 className="font-bold text-text-primary mb-0">Current Position</h5>
            </div>
            {isOwnProfile && jobProfile && (
                <ModernButton
                    variant="outline"
                    size="sm"
                    onClick={onEditJobProfile}
                >
                    <FaEdit className="mr-2" /> Edit
                </ModernButton>
            )}
        </div>
        <div className="p-6">
            {jobProfile ? (
                <div className="relative">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                        <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary text-2xl border border-primary/10">
                            <FaBuilding />
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold text-text-primary mb-1">
                                {jobProfile.job_title || 'Position not specified'}
                            </h4>
                            <h5 className="text-lg font-medium text-primary">
                                {jobProfile.company}
                            </h5>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {jobProfile.location && (
                            <div className="flex items-center gap-3 text-text-secondary text-sm">
                                <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                                    <FaMapMarkerAlt className="text-xs" />
                                </div>
                                {jobProfile.location}
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-text-secondary text-sm">
                            <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                                <FaCalendarAlt className="text-xs" />
                            </div>
                            {jobProfile.start_date ? new Date(jobProfile.start_date).toLocaleDateString() : 'N/A'}
                            {jobProfile.current ? ' - Present' : jobProfile.end_date ? ` - ${new Date(jobProfile.end_date).toLocaleDateString()}` : ''}
                        </div>
                    </div>

                    {jobProfile.description && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-border">
                            <h6 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2 opacity-60">Description</h6>
                            <p className="text-sm text-text-secondary leading-relaxed">{jobProfile.description}</p>
                        </div>
                    )}

                    {jobProfile.skills && jobProfile.skills.length > 0 && (
                        <div>
                            <h6 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3 opacity-60">Key Skills</h6>
                            <div className="flex flex-wrap gap-2">
                                {jobProfile.skills.map((skill, index) => (
                                    <span key={index} className="px-3 py-1 bg-primary/5 text-primary text-xs font-bold rounded-full border border-primary/10">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-10">
                    <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 mx-auto mb-4">
                        <FaBriefcase className="text-3xl" />
                    </div>
                    <p className="text-text-secondary mb-6 max-w-sm mx-auto">
                        {isOwnProfile
                            ? "Highlight your current role to help your network understand your professional focus."
                            : "This user hasn't added their current position yet."}
                    </p>
                    {isOwnProfile && (
                        <ModernButton
                            variant="primary"
                            onClick={onAddJobProfile}
                        >
                            <FaPlus className="mr-2" />
                            Add Current Position
                        </ModernButton>
                    )}
                </div>
            )}
        </div>
    </ModernCard>
);

// Job Experience Item
const ExperienceItem = ({
    experience,
    isOwnProfile,
    onEditJobExperience,
    onDeleteJobExperience
}) => (
    <div className="relative pl-8 pb-10 last:pb-0 group">
        {/* Timeline Line */}
        <div className="absolute left-[11px] top-2 bottom-0 w-[2px] bg-border group-last:hidden" />
        {/* Timeline Dot */}
        <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full bg-surface border-4 border-primary shadow-sm z-10" />

        <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
                <h5 className="text-lg font-bold text-text-primary mb-1">{experience.job_title}</h5>
                <h6 className="text-md font-medium text-primary mb-3 flex items-center gap-2">
                    <FaBuilding className="text-xs opacity-50" />
                    {experience.company}
                </h6>

                <div className="flex flex-wrap gap-4 mb-4 text-xs text-text-secondary font-medium">
                    {experience.location && (
                        <span className="flex items-center gap-1.5">
                            <FaMapMarkerAlt className="opacity-70" />
                            {experience.location}
                        </span>
                    )}
                    <span className="flex items-center gap-1.5">
                        <FaCalendarAlt className="opacity-70" />
                        {experience.start_date ? new Date(experience.start_date).toLocaleDateString() : 'N/A'}
                        {experience.current ? ' - Present' : experience.end_date ? ` - ${new Date(experience.end_date).toLocaleDateString()}` : ''}
                    </span>
                </div>

                {experience.description && (
                    <p className="text-sm text-text-secondary leading-relaxed mb-4 max-w-2xl">{experience.description}</p>
                )}

                {experience.skills && experience.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {experience.skills.map((skill, skillIndex) => (
                            <span key={skillIndex} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-text-secondary text-[10px] font-bold rounded uppercase tracking-wider border border-border">
                                {skill}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {isOwnProfile && (
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        className="p-2 rounded-lg bg-gray-100 hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors border border-border"
                        onClick={() => onEditJobExperience(experience)}
                        title="Edit"
                    >
                        <FaPen className="text-xs" />
                    </button>
                    <button
                        className="p-2 rounded-lg bg-gray-100 hover:bg-error/10 text-text-secondary hover:text-error transition-colors border border-border"
                        onClick={() => onDeleteJobExperience(experience._id)}
                        title="Delete"
                    >
                        <FaTrash className="text-xs" />
                    </button>
                </div>
            )}
        </div>
    </div>
);

// Work Experience Card
const WorkExperienceCard = ({
    jobProfile,
    isOwnProfile,
    onAddJobExperience,
    onEditJobExperience,
    onDeleteJobExperience
}) => (
    <ModernCard className="overflow-hidden" padding="p-0">
        <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <FaCalendarAlt className="text-sm" />
                </div>
                <h5 className="font-bold text-text-primary mb-0">Experience History</h5>
            </div>
            {isOwnProfile && (
                <ModernButton
                    variant="outline"
                    size="sm"
                    onClick={onAddJobExperience}
                >
                    <FaPlus className="mr-2" /> Add History
                </ModernButton>
            )}
        </div>
        <div className="p-8">
            {jobProfile && jobProfile.experiences && jobProfile.experiences.length > 0 ? (
                <div className="mt-2">
                    {jobProfile.experiences.map((experience, index) => (
                        <ExperienceItem
                            key={index}
                            experience={experience}
                            isOwnProfile={isOwnProfile}
                            onEditJobExperience={onEditJobExperience}
                            onDeleteJobExperience={onDeleteJobExperience}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-12 text-center border-2 border-dashed border-border rounded-3xl bg-gray-50/30 dark:bg-gray-800/10">
                    <p className="text-text-secondary mb-0">
                        {isOwnProfile
                            ? "Scale your professional journey by adding previous work history."
                            : "No previous experience recorded."}
                    </p>
                </div>
            )}
        </div>
    </ModernCard>
);

// Main Job Experience Component
const ProfileJobExperience = ({
    jobProfile,
    isOwnProfile,
    onEditJobProfile,
    onAddJobProfile,
    onAddJobExperience,
    onEditJobExperience,
    onDeleteJobExperience
}) => {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <CurrentPositionCard
                jobProfile={jobProfile}
                isOwnProfile={isOwnProfile}
                onEditJobProfile={onEditJobProfile}
                onAddJobProfile={onAddJobProfile}
            />

            <WorkExperienceCard
                jobProfile={jobProfile}
                isOwnProfile={isOwnProfile}
                onAddJobExperience={onAddJobExperience}
                onEditJobExperience={onEditJobExperience}
                onDeleteJobExperience={onDeleteJobExperience}
            />
        </div>
    );
};

export default ProfileJobExperience;