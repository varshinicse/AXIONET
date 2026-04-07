import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    FaChevronDown, FaChevronUp, FaPaperPlane, FaExpand,
    FaCommentAlt, FaCircle, FaClock
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import messagingService from '../../services/api/messaging';
import socketService from '../../services/socketService';
import ModernCard from '../common/ModernCard';
import ModernButton from '../common/ModernButton';
import ModernBadge from '../common/ModernBadge';

const CollapsibleChat = () => {
    const [expanded, setExpanded] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user?.email) {
            socketService.connect(user.email);
            socketService.onNewMessage(handleNewMessage);
            socketService.onMessagesRead(handleMessagesRead);
            return () => {
                socketService.offNewMessage();
                socketService.offMessagesRead();
            };
        }
    }, [user]);

    useEffect(() => {
        if (user?.email && expanded) {
            fetchConversations();
        }
    }, [user, expanded]);

    useEffect(() => {
        if (activeConversation && user?.email) {
            socketService.joinConversation(activeConversation._id, user.email);
            fetchMessages(activeConversation._id);
        }
        return () => {
            if (activeConversation) {
                socketService.leaveConversation(activeConversation._id);
            }
        };
    }, [activeConversation, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const data = await messagingService.getConversations();
            setConversations(data);
            if (data.length > 0 && !activeConversation) {
                setActiveConversation(data[0]);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId) => {
        setLoading(true);
        try {
            const data = await messagingService.getMessages(conversationId);
            setMessages(data.messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewMessage = (message) => {
        if (activeConversation && message.conversation_id === activeConversation._id) {
            setMessages(prev => [...prev, message]);
        }
        setConversations(prev => prev.map(conv => {
            if (conv._id === message.conversation_id) {
                const unreadCount = conv._id === activeConversation?._id ? 0 : (conv.unread_count || 0) + 1;
                return { ...conv, last_message: message, unread_count: unreadCount };
            }
            return conv;
        }));
    };

    const handleMessagesRead = (data) => {
        if (activeConversation && data.conversation_id === activeConversation._id) {
            setMessages(prev => prev.map(msg => ({
                ...msg,
                read_by: [...(msg.read_by || []), data.user_id]
            })));
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || !user?.email) return;
        socketService.sendMessage(activeConversation._id, user.email, newMessage);
        setNewMessage('');
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-0 right-8 z-[100] w-96 transition-all duration-500 transform translate-y-0 translate-x-0">
            {/* Header / Toggle */}
            <button
                onClick={() => setExpanded(!expanded)}
                className={`
                    w-full flex items-center justify-between px-6 py-4 rounded-t-3xl font-black text-sm uppercase tracking-widest transition-all
                    ${expanded ? 'bg-primary text-white shadow-2xl' : 'bg-surface border-2 border-border/50 text-text-primary hover:border-primary/30'}
                `}
            >
                <div className="flex items-center gap-3">
                    <FaCommentAlt className={expanded ? 'text-white' : 'text-primary'} />
                    <span>Communication</span>
                </div>
                <div className="flex items-center gap-2">
                    {conversations.some(c => (c.unread_count || 0) > 0) && (
                        <div className="h-2 w-2 rounded-full bg-error animate-pulse" />
                    )}
                    {expanded ? <FaChevronDown /> : <FaChevronUp />}
                </div>
            </button>

            {/* Chat Content */}
            <div className={`
                transition-all duration-500 overflow-hidden bg-surface border-x-2 border-border/50 shadow-2xl
                ${expanded ? 'h-[500px] opacity-100' : 'h-0 opacity-0 pointer-events-none'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Inner Header */}
                    <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase">
                                    {activeConversation?.other_participants?.[0]?.name?.charAt(0)}
                                </div>
                                <FaCircle className="absolute -bottom-0.5 -right-0.5 text-[8px] text-success border border-surface rounded-full" />
                            </div>
                            <span className="font-black text-xs tracking-tight text-text-primary uppercase truncate max-w-[120px]">
                                {activeConversation?.other_participants?.[0]?.name || 'Encrypted Channel'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link to="/messages" className="p-2 text-text-secondary hover:text-primary transition-colors">
                                <FaExpand className="text-xs" />
                            </Link>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide bg-gray-50/30 dark:bg-gray-900/10">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                                <FaCommentAlt className="text-3xl mb-3" />
                                <p className="text-[10px] font-black uppercase tracking-widest leading-loose">
                                    Awaiting transmission<br />Secure link ready
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, i) => {
                                const isMe = msg.sender === user?._id || msg.sender_details?.email === user?.email;
                                return (
                                    <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in`}>
                                        <div className={`
                                            max-w-[85%] p-3 rounded-2xl text-xs font-semibold shadow-sm relative
                                            ${isMe
                                                ? 'bg-primary text-white rounded-tr-none'
                                                : 'bg-surface border border-border/50 text-text-primary rounded-tl-none'
                                            }
                                        `}>
                                            {msg.text}
                                            <div className={`
                                                mt-1.5 text-[8px] font-black opacity-50 uppercase flex items-center gap-1
                                                ${isMe ? 'text-white' : 'text-text-secondary'}
                                            `}>
                                                <FaClock className="text-[7px]" />
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer / Input */}
                    <div className="p-4 border-t border-border/50 bg-surface">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Transmit message..."
                                className="flex-1 bg-gray-100 dark:bg-gray-900/50 border-none rounded-xl py-2 px-4 text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <ModernButton
                                type="submit"
                                variant="primary"
                                className="p-2.5 rounded-xl shadow-lg"
                                disabled={!newMessage.trim()}
                            >
                                <FaPaperPlane className="text-xs" />
                            </ModernButton>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollapsibleChat;