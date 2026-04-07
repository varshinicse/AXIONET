import React from "react";
import { FaGithub, FaExternalLinkAlt, FaProjectDiagram } from 'react-icons/fa';
import ModernCard from '../common/ModernCard';
import ModernButton from '../common/ModernButton';

const ProjectCard = ({ project }) => {
    const progress = project.progress || 0;
    const getProgressColor = (p) => {
        if (p >= 75) return 'bg-success';
        if (p >= 40) return 'bg-primary';
        return 'bg-amber-500';
    };

    return (
        <ModernCard className="h-full flex flex-col group hover:shadow-xl transition-all duration-300" padding="p-5">
            <div className="flex justify-between items-start mb-4">
                <h6 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors truncate pr-2">
                    {project.title}
                </h6>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${progress >= 75 ? 'bg-success/10 text-success' :
                        progress >= 40 ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                    {progress}% Done
                </span>
            </div>

            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mb-5 overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 rounded-full ${getProgressColor(progress)}`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            <p className="text-sm text-text-secondary line-clamp-3 mb-6 flex-grow">
                {project.abstract}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-6">
                {project.tech_stack && project.tech_stack.map((tech, techIndex) => (
                    <span
                        key={techIndex}
                        className="text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-text-secondary px-2 py-0.5 rounded-md border border-border"
                    >
                        {tech}
                    </span>
                ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-border mt-auto">
                <ModernButton
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    href={`/projects/${project._id}`}
                >
                    <FaExternalLinkAlt className="mr-2 text-[10px]" />
                    Details
                </ModernButton>
                {project.github_link && (
                    <ModernButton
                        variant="outline"
                        size="sm"
                        href={project.github_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3"
                    >
                        <FaGithub />
                    </ModernButton>
                )}
            </div>
        </ModernCard>
    );
};

const ProfileProjects = ({ projects, isOwnProfile }) => {
    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <FaProjectDiagram />
                </div>
                <h5 className="text-xl font-bold text-text-primary mb-0">
                    {isOwnProfile ? 'My Projects' : 'Projects'}
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-text-secondary text-xs rounded-full font-medium">
                        {projects.length} Total
                    </span>
                </h5>
            </div>

            {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project, index) => (
                        <ProjectCard key={index} project={project} />
                    ))}
                </div>
            ) : (
                <ModernCard variant="flat" borderStyle="dashed" className="py-16 text-center bg-gray-50/50 dark:bg-gray-800/20">
                    <FaProjectDiagram className="mx-auto mb-4 text-4xl text-text-secondary opacity-30" />
                    <h6 className="text-text-primary font-bold text-lg mb-2">No Projects Found</h6>
                    <p className="text-text-secondary max-w-sm mx-auto text-sm mb-8">
                        {isOwnProfile
                            ? "You haven't showcased any projects yet. Highlight your best work to attract mentors and employers."
                            : "This user hasn't added any projects to their profile yet."}
                    </p>
                    {isOwnProfile && (
                        <ModernButton
                            variant="primary"
                            href="/projects/create"
                        >
                            Build Your First Project
                        </ModernButton>
                    )}
                </ModernCard>
            )}
        </div>
    );
};

export default ProfileProjects;