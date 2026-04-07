// src/components/layout/Footer/Footer.js
import React, { useState } from 'react';
import { FaGithub, FaLinkedin, FaBug, FaEnvelope, FaHeart, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import ModernButton from '../../common/ModernButton';

const Footer = () => {
    const [bugReport, setBugReport] = useState({
        name: '',
        email: '',
        description: '',
    });
    const [submitStatus, setSubmitStatus] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBugReport(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await axios.post('http://127.0.0.1:5001/submit-bug-report', bugReport);
            if (response.status === 201) {
                setSubmitStatus({ type: 'success', message: 'Report received. Thank you!' });
                setBugReport({ name: '', email: '', description: '' });
            }
        } catch (error) {
            setSubmitStatus({ type: 'error', message: 'Mission failed. Try again?' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setSubmitStatus(null), 5000);
        }
    };

    return (
        <footer className="relative bg-neutral-900 pt-24 pb-12 overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-20">
                    {/* Brand Section */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tighter uppercase mb-4">AXIONET</h3>
                            <p className="text-neutral-400 text-sm font-medium leading-relaxed max-w-sm">
                                A next-generation networking ecosystem for collaborative learning and professional evolution.
                                Bridging the gap between academia and industry.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {[
                                { icon: <FaGithub />, link: "https://github.com" },
                                { icon: <FaLinkedin />, link: "https://linkedin.com" },
                                { icon: <FaEnvelope />, link: "mailto:moganram10@gmail.com" }
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-primary hover:bg-white/10 hover:border-primary/30 transition-all duration-300"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Section */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-8">Navigation</h4>
                            <ul className="space-y-4">
                                {['Home', 'News', 'Events', 'Projects', 'Jobs', 'Messages'].map((link) => (
                                    <li key={link}>
                                        <a
                                            href={link === 'Home' ? '/' : `/${link.toLowerCase()}`}
                                            className="text-sm font-bold text-neutral-400 hover:text-white transition-colors"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-8">Community</h4>
                            <ul className="space-y-4">
                                {['Alumni Hub', 'Student Portal', 'Research', 'Mentorship'].map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-sm font-bold text-neutral-400 hover:text-white transition-colors">{link}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bug Report Section */}
                    <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-8 rounded-lg bg-error/20 flex items-center justify-center text-error text-xs">
                                <FaBug />
                            </div>
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Found a glitch?</h4>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    name="name"
                                    value={bugReport.name}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white placeholder:text-white/20 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    name="email"
                                    value={bugReport.email}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white placeholder:text-white/20 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                    required
                                />
                            </div>
                            <textarea
                                rows={2}
                                placeholder="Describe what went wrong..."
                                name="description"
                                value={bugReport.description}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white placeholder:text-white/20 focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none"
                                required
                            />
                            <ModernButton
                                variant="primary"
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest gap-2"
                            >
                                {isSubmitting ? 'Sending...' : <><FaPaperPlane /> Log Bug</>}
                            </ModernButton>

                            {submitStatus && (
                                <div className={`text-[10px] font-black uppercase tracking-widest text-center mt-4 ${submitStatus.type === 'success' ? 'text-success' : 'text-error'}`}>
                                    {submitStatus.message}
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                        &copy; {new Date().getFullYear()} AXIONET CORE SYSTEM
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 flex items-center gap-2">
                        ENGINEERED WITH <FaHeart className="text-error animate-pulse" /> BY
                        <a href="mailto:moganram10@gmail.com" className="text-white/40 hover:text-primary transition-colors">MOGAN RAM</a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;