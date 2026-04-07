import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    FaFolder, FaPlus, FaProjectDiagram, FaBriefcase, FaHandshake,
    FaHome, FaNewspaper, FaCalendarAlt, FaChartLine, FaUserGraduate,
    FaUserPlus, FaEnvelope, FaSignOutAlt, FaUser, FaMoon, FaSun, FaChevronDown
} from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';
import logo from '../../../assets/logo.png';
import ModernButton from '../../common/ModernButton';
import ModernBadge from '../../common/ModernBadge';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        }

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/signin');
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/feeds';
        return location.pathname.startsWith(path);
    };

    const NavItem = ({ to, icon: Icon, label, badge }) => (
        <Link
            to={to}
            className={`
                flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-normal group relative
                ${isActive(to)
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-text-secondary hover:text-primary hover:bg-primary/5'
                }
            `}
        >
            <Icon className={`text-lg transition-transform duration-normal group-hover:scale-110 ${isActive(to) ? 'text-white' : ''}`} />
            <span className="font-semibold text-sm">{label}</span>
            {badge && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-[10px] items-center justify-center text-white font-bold">
                        {badge}
                    </span>
                </span>
            )}
            {isActive(to) && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full md:hidden" />
            )}
        </Link>
    );

    const DropdownMenu = ({ title, icon: Icon, id, items }) => {
        const isOpen = activeDropdown === id;
        return (
            <div className="relative" ref={id === 'user' ? dropdownRef : null}>
                <button
                    onClick={() => setActiveDropdown(isOpen ? null : id)}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-normal group
                        ${isActive(title.toLowerCase()) ? 'text-primary' : 'text-text-secondary hover:text-primary hover:bg-primary/5'}
                    `}
                >
                    <Icon className="text-lg" />
                    <span className="font-semibold text-sm">{title}</span>
                    <FaChevronDown className={`text-[10px] transition-transform duration-normal ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 glass-card p-2 z-[110] animate-in origin-top-left">
                        {items.map((item, idx) => (
                            item.divider ? (
                                <div key={idx} className="my-1 border-t border-border/50" />
                            ) : (
                                <Link
                                    key={idx}
                                    to={item.to}
                                    onClick={() => {
                                        if (item.onClick) item.onClick();
                                        setActiveDropdown(null);
                                    }}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-normal
                                        ${item.danger ? 'text-error hover:bg-error/5' : 'text-text-secondary hover:text-primary hover:bg-primary/5'}
                                    `}
                                >
                                    {item.icon && <item.icon className="text-lg" />}
                                    <span className="font-medium text-sm">{item.label}</span>
                                </Link>
                            )
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderRoleMenus = () => {
        if (!user) return null;
        const role = user.role.toLowerCase();

        if (role === 'student') {
            return (
                <>
                    <DropdownMenu
                        title="Projects"
                        icon={FaProjectDiagram}
                        id="projects"
                        items={[
                            { to: '/projects/my-projects', icon: FaFolder, label: 'My Projects' },
                            { to: '/projects/create', icon: FaPlus, label: 'Create Project' },
                            { to: '/projects/mentorship', icon: FaHandshake, label: 'Seek Mentorship' },
                            { to: '/projects/collaborations', icon: FaUserPlus, label: 'Collaborations' },
                        ]}
                    />
                    <NavItem to="/jobs" icon={FaBriefcase} label="Jobs" />
                </>
            );
        }

        if (role === 'alumni') {
            return (
                <>
                    <DropdownMenu
                        title="Mentorship"
                        icon={FaHandshake}
                        id="mentorship"
                        items={[
                            { to: '/alumni/mentorship', icon: FaHandshake, label: 'Requests' },
                            { to: '/alumni/mentees', icon: FaUserGraduate, label: 'My Mentees' },
                        ]}
                    />
                    <DropdownMenu
                        title="Jobs"
                        icon={FaBriefcase}
                        id="jobs"
                        items={[
                            { to: '/jobs', icon: FaBriefcase, label: 'View Jobs' },
                            { to: '/jobs/create', icon: FaPlus, label: 'Post Job' },
                        ]}
                    />
                </>
            );
        }

        if (role === 'staff') {
            return <NavItem to="/analytics" icon={FaChartLine} label="Analytics" />;
        }
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-[1000] px-4 md:px-6 py-4 transition-all duration-500`}>
            <nav className={`
                mx-auto max-w-7xl transition-all duration-500 rounded-2xl
                ${scrolled
                    ? 'glass-card border-white/20 dark:border-white/10 shadow-2xl py-2 px-4 translate-y-2'
                    : 'bg-transparent py-2 px-2'
                }
            `}>
                <div className="flex items-center justify-between">
                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-3 transition-all duration-normal hover:scale-105 group">
                        <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
                            <img src={logo} alt="L" className="h-6 w-auto brightness-0 invert" />
                        </div>
                        <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent italic">
                            AXIONET
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-1">
                        <NavItem to="/" icon={FaHome} label="Home" />
                        <NavItem to="/news" icon={FaNewspaper} label="News" />
                        <NavItem to="/events" icon={FaCalendarAlt} label="Events" />
                        {renderRoleMenus()}
                        <NavItem to="/messages" icon={FaEnvelope} label="Messages" />
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl hover:bg-primary/5 text-text-secondary transition-all hover:scale-110 active:scale-95"
                            aria-label="Toggle Theme"
                        >
                            {isDarkMode ? <FaSun className="text-amber-400" /> : <FaMoon className="text-primary" />}
                        </button>

                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
                                    className="flex items-center gap-2.5 p-1 pl-1 pr-3 rounded-xl hover:bg-primary/5 transition-all group"
                                >
                                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 group-hover:scale-105 transition-all">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="hidden md:flex flex-col items-start leading-none gap-1">
                                        <span className="font-bold text-sm text-text-primary">{user.name}</span>
                                        <ModernBadge variant="primary" size="sm" className="opacity-80">
                                            {user.role}
                                        </ModernBadge>
                                    </div>
                                    <FaChevronDown className={`text-[10px] hidden md:block transition-transform duration-normal ${activeDropdown === 'user' ? 'rotate-180' : ''}`} />
                                </button>

                                {activeDropdown === 'user' && (
                                    <div className="absolute top-full right-0 mt-3 w-56 glass-card p-2 z-[110] animate-in origin-top-right">
                                        <Link to="/profile" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/5 transition-all">
                                            <FaUser className="text-lg" />
                                            <span className="font-semibold text-sm">My Profile</span>
                                        </Link>
                                        <div className="my-1 border-t border-border/50" />
                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-error hover:bg-error/5 transition-all">
                                            <FaSignOutAlt className="text-lg" />
                                            <span className="font-semibold text-sm">Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <ModernButton variant="primary" size="sm" onClick={() => navigate('/signin')}>
                                Sign In
                            </ModernButton>
                        )}

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2.5 rounded-xl hover:bg-primary/5 text-text-primary transition-all active:scale-90"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 top-[88px] z-50 p-4 glass-card border-none rounded-none animate-in">
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-120px)]">
                        <NavItem to="/" icon={FaHome} label="Home" />
                        <NavItem to="/news" icon={FaNewspaper} label="News" />
                        <NavItem to="/events" icon={FaCalendarAlt} label="Events" />
                        <NavItem to="/messages" icon={FaEnvelope} label="Messages" />
                        {/* More role specific mobile links can be added here */}
                        <div className="my-2 border-t border-border/50" />
                        {user ? (
                            <ModernButton variant="danger" size="md" onClick={handleLogout} className="w-full">
                                Logout
                            </ModernButton>
                        ) : (
                            <ModernButton variant="primary" size="md" onClick={() => navigate('/signin')} className="w-full">
                                Sign In
                            </ModernButton>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;