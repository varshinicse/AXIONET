import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaHome, FaEnvelope, FaRss, FaBriefcase, FaCalendarAlt,
    FaSignOutAlt, FaTimes, FaUser
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import ModernButton from '../common/ModernButton';

const NavDrawer = ({ isOpen, onClose }) => {
    const { logout, user } = useAuth();
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/feeds';
        return location.pathname.startsWith(path);
    };

    if (!isOpen) return null;

    const navItems = [
        { to: '/feeds', icon: FaHome, label: 'Global Feed' },
        { to: '/messages', icon: FaEnvelope, label: 'Direct Messages' },
        { to: '/news', icon: FaRss, label: 'Campus News' },
        { to: '/jobs', icon: FaBriefcase, label: 'Career Hub' },
        { to: '/events', icon: FaCalendarAlt, label: 'Events' },
        { to: '/profile', icon: FaUser, label: 'My Profile' },
    ];

    return (
        <div className="fixed inset-0 z-[2000] animate-in">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="absolute top-0 left-0 bottom-0 w-80 bg-surface shadow-2xl flex flex-col border-r border-border/50 animate-in slide-in-from-left duration-300">
                <div className="p-6 flex items-center justify-between border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-black tracking-tight text-text-primary uppercase text-xs tracking-widest">Navigation</span>
                    </div>
                    <button onClick={onClose} className="p-2 text-text-secondary hover:text-primary transition-colors">
                        <FaTimes />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.to}
                            onClick={onClose}
                            className={`
                                flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-normal group
                                ${isActive(item.to)
                                    ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                                    : 'text-text-secondary hover:bg-primary/5 hover:text-primary'
                                }
                            `}
                        >
                            <item.icon className={`text-xl transition-transform duration-normal group-hover:scale-110 ${isActive(item.to) ? 'text-white' : ''}`} />
                            <span className="font-bold tracking-tight">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-border/50 bg-gray-50/50 dark:bg-gray-900/50">
                    <ModernButton
                        variant="danger"
                        className="w-full justify-start gap-4 px-6 py-4 rounded-2xl shadow-lg border-error/10 hover:border-error/20"
                        onClick={() => {
                            logout();
                            onClose();
                        }}
                    >
                        <FaSignOutAlt className="text-lg" />
                        <span className="font-black uppercase tracking-widest text-xs">Logout Session</span>
                    </ModernButton>
                </div>
            </div>
        </div>
    );
};

export default NavDrawer;
