import React, { useState } from "react";
import { Modal } from 'react-bootstrap';
import { FaCheck, FaTimes, FaSave, FaUser, FaCamera } from 'react-icons/fa';
import ModernButton from '../../common/ModernButton';

// Reusable Form Group Component
const FormGroup = ({ label, children, className = "" }) => (
    <div className={`mb-5 ${className}`}>
        <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2 opacity-60">
            {label}
        </label>
        {children}
    </div>
);

// Reusable Input Component
const Input = ({ ...props }) => (
    <input
        {...props}
        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-text-primary placeholder:text-text-secondary/40"
    />
);

// Reusable Textarea Component
const Textarea = ({ ...props }) => (
    <textarea
        {...props}
        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-text-primary placeholder:text-text-secondary/40 resize-none"
    />
);

// Edit Profile Modal
export const EditProfileModal = ({
    show,
    onHide,
    editForm,
    setEditForm,
    onSubmit,
    userRole
}) => {
    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            contentClassName="rounded-[2rem] border-none shadow-2xl overflow-hidden bg-surface dark:bg-gray-900"
        >
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">Edit Profile</h2>
                        <p className="text-text-secondary text-sm">Update your personal information and presence.</p>
                    </div>
                    <button
                        onClick={onHide}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-text-secondary"
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <FormGroup label="Full Name">
                            <Input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                required
                            />
                        </FormGroup>
                        <FormGroup label="Department">
                            <Input
                                type="text"
                                value={editForm.dept}
                                onChange={(e) => setEditForm({ ...editForm, dept: e.target.value })}
                                required
                            />
                        </FormGroup>
                    </div>

                    {userRole !== 'staff' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                            <FormGroup label="Register Number">
                                <Input
                                    type="text"
                                    value={editForm.regno}
                                    onChange={(e) => setEditForm({ ...editForm, regno: e.target.value })}
                                />
                            </FormGroup>
                            <FormGroup label="Batch Year">
                                <Input
                                    type="text"
                                    value={editForm.batch}
                                    onChange={(e) => setEditForm({ ...editForm, batch: e.target.value })}
                                />
                            </FormGroup>
                        </div>
                    )}

                    <FormGroup label="Professional Bio">
                        <Textarea
                            rows={4}
                            value={editForm.bio}
                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                            placeholder="Tell the community about your journey, interests, and goals..."
                        />
                    </FormGroup>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <FormGroup label="LinkedIn Profile URL">
                            <Input
                                type="url"
                                value={editForm.linkedin}
                                onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                                placeholder="https://linkedin.com/in/username"
                            />
                        </FormGroup>
                        <FormGroup label="GitHub Profile URL">
                            <Input
                                type="url"
                                value={editForm.github}
                                onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                                placeholder="https://github.com/username"
                            />
                        </FormGroup>
                    </div>

                    <FormGroup label="Skills (Comma Separated)">
                        <Input
                            type="text"
                            value={editForm.skills}
                            onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                            placeholder="e.g. React, Python, UI Design, Marketing"
                        />
                        <p className="mt-2 text-[10px] text-text-secondary opacity-60">Press enter or use commas to separate skills</p>
                    </FormGroup>

                    <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
                        <ModernButton
                            variant="secondary"
                            onClick={onHide}
                            type="button"
                        >
                            Cancel
                        </ModernButton>
                        <ModernButton variant="primary" type="submit">
                            <FaSave className="mr-2" />
                            Save Changes
                        </ModernButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

// Avatar Selection Modal
export const AvatarSelectionModal = ({
    show,
    onHide,
    selectedAvatar,
    setSelectedAvatar,
    userRole,
    userGender,
    onAvatarSelect
}) => {
    const [gender, setGender] = useState(userGender || 'male');

    const getAvatarOptions = () => {
        if (userRole === 'student') {
            return gender === 'female'
                ? [
                    { id: 'girl_stu_1', src: '/img/girl_stu_1.jpg', alt: 'Female Student 1' },
                    { id: 'girl_stu_2', src: '/img/girl_stu_2.jpg', alt: 'Female Student 2' },
                    { id: 'girl_stu_3', src: '/img/girl_stu_3.jpg', alt: 'Female Student 3' },
                    { id: 'girl_stu_4', src: '/img/girl_stu_4.jpg', alt: 'Female Student 4' }
                ]
                : [
                    { id: 'stu_1', src: '/img/stu_1.jpg', alt: 'Male Student 1' },
                    { id: 'stu_2', src: '/img/stu_2.jpg', alt: 'Male Student 2' },
                    { id: 'stu_3', src: '/img/stu_3.jpg', alt: 'Male Student 3' },
                    { id: 'stu_4', src: '/img/stu_4.jpg', alt: 'Male Student 4' }
                ];
        } else if (userRole === 'alumni') {
            return gender === 'female'
                ? [
                    { id: 'alum_fem_1', src: '/img/alum_fem_1.jpg', alt: 'Female Alumni 1' },
                    { id: 'alum_fem_2', src: '/img/alum_fem_2.jpg', alt: 'Female Alumni 2' },
                    { id: 'alum_fem_3', src: '/img/alum_fem_3.jpg', alt: 'Female Alumni 3' }
                ]
                : [
                    { id: 'alum_1', src: '/img/alum_1.jpg', alt: 'Male Alumni 1' },
                    { id: 'alum_2', src: '/img/alum_2.jpg', alt: 'Male Alumni 2' },
                    { id: 'alum_3', src: '/img/alum_3.jpg', alt: 'Male Alumni 3' }
                ];
        } else {
            return [
                { id: 'admin', src: '/img/admin.jpg', alt: 'Admin' }
            ];
        }
    };

    const avatarOptions = [
        { id: 'default', src: '/img/default.png', alt: 'Default Avatar' },
        ...getAvatarOptions()
    ];

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
            contentClassName="rounded-[2rem] border-none shadow-2xl overflow-hidden bg-surface dark:bg-gray-900"
        >
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">Choose Your Avatar</h2>
                        <p className="text-text-secondary text-sm">Select an persona that represents you best.</p>
                    </div>
                    <button
                        onClick={onHide}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-text-secondary"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="mb-8 flex flex-col md:flex-row items-center gap-6 justify-center">
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-full md:w-auto">
                        <button
                            className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all ${gender === 'male' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-text-secondary'}`}
                            onClick={() => { setGender('male'); setSelectedAvatar('default'); }}
                        >
                            Male
                        </button>
                        <button
                            className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all ${gender === 'female' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-text-secondary'}`}
                            onClick={() => { setGender('female'); setSelectedAvatar('default'); }}
                        >
                            Female
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[50vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                    {avatarOptions.map((avatar) => (
                        <div
                            key={avatar.id}
                            className={`group cursor-pointer relative rounded-2xl overflow-hidden border-4 transition-all duration-300 ${selectedAvatar === avatar.id ? 'border-primary shadow-lg scale-105' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'}`}
                            onClick={() => setSelectedAvatar(avatar.id)}
                        >
                            <img
                                src={avatar.src}
                                alt={avatar.alt}
                                className="w-full h-32 object-cover"
                            />
                            <div className={`absolute inset-0 bg-primary/20 flex items-center justify-center transition-opacity ${selectedAvatar === avatar.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                {selectedAvatar === avatar.id ? (
                                    <div className="bg-white text-primary p-1.5 rounded-full shadow-lg">
                                        <FaCheck className="text-sm" />
                                    </div>
                                ) : (
                                    <span className="bg-white/90 text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase">Select</span>
                                )}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                <p className="text-[10px] text-white font-medium truncate">{avatar.alt}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-3 pt-8 border-t border-border mt-8">
                    <ModernButton
                        variant="secondary"
                        onClick={onHide}
                    >
                        Cancel
                    </ModernButton>
                    <ModernButton
                        variant="primary"
                        onClick={() => onAvatarSelect(selectedAvatar)}
                    >
                        Apply Avatar
                    </ModernButton>
                </div>
            </div>
        </Modal>
    );
};

// Job Profile Modal
export const JobProfileModal = ({
    show,
    onHide,
    jobProfileForm,
    setJobProfileForm,
    onSubmit,
    isEditing
}) => {
    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            contentClassName="rounded-[2rem] border-none shadow-2xl overflow-hidden bg-surface dark:bg-gray-900"
        >
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">{isEditing ? 'Edit Professional Profile' : 'Professional Profile'}</h2>
                        <p className="text-text-secondary text-sm">Tell us about your current role and industry.</p>
                    </div>
                    <button
                        onClick={onHide}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-text-secondary"
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <FormGroup label="Company Name">
                            <Input
                                type="text"
                                value={jobProfileForm.company}
                                onChange={(e) => setJobProfileForm({ ...jobProfileForm, company: e.target.value })}
                                required
                                placeholder="Where do you work?"
                            />
                        </FormGroup>
                        <FormGroup label="Professional Title">
                            <Input
                                type="text"
                                value={jobProfileForm.job_title}
                                onChange={(e) => setJobProfileForm({ ...jobProfileForm, job_title: e.target.value })}
                                required
                                placeholder="What is your role?"
                            />
                        </FormGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <FormGroup label="Location">
                            <Input
                                type="text"
                                value={jobProfileForm.location}
                                onChange={(e) => setJobProfileForm({ ...jobProfileForm, location: e.target.value })}
                                placeholder="City, Remote, etc."
                            />
                        </FormGroup>
                        <FormGroup label="Industry">
                            <Input
                                type="text"
                                value={jobProfileForm.industry}
                                onChange={(e) => setJobProfileForm({ ...jobProfileForm, industry: e.target.value })}
                                placeholder="e.g. Fintech, EdTech, SaaS"
                            />
                        </FormGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6">
                        <div className="md:col-span-5">
                            <FormGroup label="Start Date">
                                <Input
                                    type="date"
                                    value={jobProfileForm.start_date}
                                    onChange={(e) => setJobProfileForm({ ...jobProfileForm, start_date: e.target.value })}
                                    required
                                />
                            </FormGroup>
                        </div>
                        <div className="md:col-span-2">
                            <div className="mb-5 md:mt-8 flex items-center justify-center">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={jobProfileForm.current}
                                            onChange={(e) => setJobProfileForm({
                                                ...jobProfileForm,
                                                current: e.target.checked,
                                                end_date: e.target.checked ? '' : jobProfileForm.end_date
                                            })}
                                        />
                                        <div className={`w-10 h-6 rounded-full border-2 transition-colors ${jobProfileForm.current ? 'bg-primary border-primary' : 'bg-transparent border-gray-300 dark:border-gray-600'}`}>
                                            <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${jobProfileForm.current ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-text-secondary group-hover:text-text-primary transition-colors">Current</span>
                                </label>
                            </div>
                        </div>
                        <div className="md:col-span-5">
                            <FormGroup label="End Date">
                                <Input
                                    type="date"
                                    value={jobProfileForm.end_date}
                                    onChange={(e) => setJobProfileForm({ ...jobProfileForm, end_date: e.target.value })}
                                    disabled={jobProfileForm.current}
                                    className={jobProfileForm.current ? 'opacity-40 cursor-not-allowed' : ''}
                                />
                            </FormGroup>
                        </div>
                    </div>

                    <FormGroup label="Career Description">
                        <Textarea
                            rows={3}
                            value={jobProfileForm.description}
                            onChange={(e) => setJobProfileForm({ ...jobProfileForm, description: e.target.value })}
                            placeholder="Briefly describe your career focus or key achievements..."
                        />
                    </FormGroup>

                    <FormGroup label="Core Skills">
                        <Input
                            type="text"
                            value={jobProfileForm.skills}
                            onChange={(e) => setJobProfileForm({ ...jobProfileForm, skills: e.target.value })}
                            placeholder="Management, Leadership, Strategy..."
                        />
                    </FormGroup>

                    <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
                        <ModernButton
                            variant="secondary"
                            onClick={onHide}
                            type="button"
                        >
                            Cancel
                        </ModernButton>
                        <ModernButton variant="primary" type="submit">
                            {isEditing ? 'Update Profile' : 'Create Profile'}
                        </ModernButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

// Job Experience Modal
export const JobExperienceModal = ({
    show,
    onHide,
    jobExperienceForm,
    setJobExperienceForm,
    onSubmit,
    isEditing
}) => {
    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            contentClassName="rounded-[2rem] border-none shadow-2xl overflow-hidden bg-surface dark:bg-gray-900"
        >
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">{isEditing ? 'Edit Experience' : 'Add Experience'}</h2>
                        <p className="text-text-secondary text-sm">Add a previous role to your professional timeline.</p>
                    </div>
                    <button
                        onClick={onHide}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-text-secondary"
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <FormGroup label="Company">
                            <Input
                                type="text"
                                value={jobExperienceForm.company}
                                onChange={(e) => setJobExperienceForm({ ...jobExperienceForm, company: e.target.value })}
                                required
                                placeholder="Company name"
                            />
                        </FormGroup>
                        <FormGroup label="Job Title">
                            <Input
                                type="text"
                                value={jobExperienceForm.job_title}
                                onChange={(e) => setJobExperienceForm({ ...jobExperienceForm, job_title: e.target.value })}
                                required
                                placeholder="Position held"
                            />
                        </FormGroup>
                    </div>

                    <FormGroup label="Location">
                        <Input
                            type="text"
                            value={jobExperienceForm.location}
                            onChange={(e) => setJobExperienceForm({ ...jobExperienceForm, location: e.target.value })}
                            placeholder="e.g. London (Remote), New York"
                        />
                    </FormGroup>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6">
                        <div className="md:col-span-5">
                            <FormGroup label="Start Date">
                                <Input
                                    type="date"
                                    value={jobExperienceForm.start_date}
                                    onChange={(e) => setJobExperienceForm({ ...jobExperienceForm, start_date: e.target.value })}
                                    required
                                />
                            </FormGroup>
                        </div>
                        <div className="md:col-span-2">
                            <div className="mb-5 md:mt-8 flex items-center justify-center">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={jobExperienceForm.current}
                                            onChange={(e) => setJobExperienceForm({
                                                ...jobExperienceForm,
                                                current: e.target.checked,
                                                end_date: e.target.checked ? '' : jobExperienceForm.end_date
                                            })}
                                        />
                                        <div className={`w-10 h-6 rounded-full border-2 transition-colors ${jobExperienceForm.current ? 'bg-primary border-primary' : 'bg-transparent border-gray-300 dark:border-gray-600'}`}>
                                            <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${jobExperienceForm.current ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-text-secondary group-hover:text-text-primary transition-colors">Current</span>
                                </label>
                            </div>
                        </div>
                        <div className="md:col-span-5">
                            <FormGroup label="End Date">
                                <Input
                                    type="date"
                                    value={jobExperienceForm.end_date}
                                    onChange={(e) => setJobExperienceForm({ ...jobExperienceForm, end_date: e.target.value })}
                                    disabled={jobExperienceForm.current}
                                    className={jobExperienceForm.current ? 'opacity-40 cursor-not-allowed' : ''}
                                />
                            </FormGroup>
                        </div>
                    </div>

                    <FormGroup label="Experience Summary">
                        <Textarea
                            rows={4}
                            value={jobExperienceForm.description}
                            onChange={(e) => setJobExperienceForm({ ...jobExperienceForm, description: e.target.value })}
                            placeholder="Describe your key responsibilities and impact..."
                        />
                    </FormGroup>

                    <FormGroup label="Skills Used">
                        <Input
                            type="text"
                            value={jobExperienceForm.skills}
                            onChange={(e) => setJobExperienceForm({ ...jobExperienceForm, skills: e.target.value })}
                            placeholder="List main skills developed in this role"
                        />
                    </FormGroup>

                    <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
                        <ModernButton
                            variant="secondary"
                            onClick={onHide}
                            type="button"
                        >
                            Cancel
                        </ModernButton>
                        <ModernButton variant="primary" type="submit">
                            {isEditing ? 'Update History' : 'Add History'}
                        </ModernButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
};