import React, { useState, useEffect, useRef } from 'react';
import {
    FaSearch, FaPaperPlane, FaPlus, FaPaperclip, FaSmile,
    FaEllipsisV, FaVideo, FaPhoneAlt, FaCheckDouble, FaClock,
    FaCommentDots
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import messagingService from '../../services/api/messaging';
import socketService from '../../services/socketService';
import ModernCard from '../common/ModernCard';
import ModernButton from '../common/ModernButton';
import ModernBadge from '../common/ModernBadge';
import ModernInput from '../common/ModernInput';

const MessagingPage = () => {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [userStatuses, setUserStatuses] = useState({});

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user?.email) {
            socketService.connect(user.email);
            socketService.onNewMessage(handleNewMessage);
            socketService.onMessagesRead(handleMessagesRead);
            socketService.onUserStatus(handleUserStatus);
            fetchConversations();

            return () => {
                socketService.offNewMessage();
                socketService.offMessagesRead();
                socketService.offUserStatus();
                if (activeConversation) {
                    socketService.leaveConversation(activeConversation._id);
                }
            };
        }
    }, [user]);

    useEffect(() => {
        if (activeConversation && user?.email) {
            setMessages([]);
            setPage(1);
            setHasMore(true);
            socketService.joinConversation(activeConversation._id, user.email);
            fetchMessages(activeConversation._id, 1);

            setConversations(prev => prev.map(conv =>
                conv._id === activeConversation._id ? { ...conv, unread_count: 0 } : conv
            ));
        }
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

    const fetchMessages = async (conversationId, pageNum = 1) => {
        setLoading(true);
        try {
            const data = await messagingService.getMessages(conversationId, pageNum);
            if (pageNum === 1) {
                setMessages(data.messages);
            } else {
                setMessages(prev => [...data.messages, ...prev]);
            }
            setHasMore(pageNum < data.pages);
            setPage(pageNum);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewMessage = (message) => {
        if (activeConversation && message.conversation_id === activeConversation._id) {
            setMessages(prev => {
                const filtered = prev.filter(m =>
                    !(m.is_temp && m.text === message.text &&
                        m.sender_details?.email === message.sender_details?.email)
                );
                return [...filtered, message];
            });
        }

        setConversations(prev => {
            const updated = [...prev];
            const index = updated.findIndex(conv => conv._id === message.conversation_id);
            if (index !== -1) {
                const isCurrentUser = message.sender_details?.email === user?.email;
                updated[index] = {
                    ...updated[index],
                    last_message: message,
                    unread_count: isCurrentUser || (activeConversation?._id === message.conversation_id)
                        ? 0 : (updated[index].unread_count || 0) + 1
                };
                const conversation = updated.splice(index, 1)[0];
                updated.unshift(conversation);
            }
            return updated;
        });
    };

    const handleMessagesRead = (data) => {
        if (activeConversation && data.conversation_id === activeConversation._id) {
            setMessages(prev => prev.map(msg => ({
                ...msg,
                read_by: [...(msg.read_by || []), data.user_id]
            })));
        }
    };

    const handleUserStatus = (data) => {
        setUserStatuses(prev => ({ ...prev, [data.email]: data.status }));
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || !user?.email) return;
        const tempMessage = socketService.sendMessage(activeConversation._id, user.email, newMessage);
        if (tempMessage) setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');
    };

    return (
        <div className="h-[calc(100vh-100px)] pt-4 flex gap-6 px-6 animate-in">
            {/* Sidebar - Conversations */}
            <ModernCard
                variant="flat"
                padding="p-0"
                className="w-96 flex flex-col border-primary/5 shadow-2xl h-full overflow-hidden"
            >
                <div className="p-6 border-b border-border/50 bg-surface">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black tracking-tight text-text-primary">Inbound</h2>
                        <ModernButton variant="primary" size="sm" className="p-2.5 rounded-xl">
                            <FaPlus />
                        </ModernButton>
                    </div>
                    <ModernInput
                        placeholder="Search threads..."
                        icon={FaSearch}
                        className="bg-gray-50/50 dark:bg-gray-900/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
                    {conversations.filter(c =>
                        c.other_participants?.[0]?.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map(conversation => {
                        const other = conversation.other_participants?.[0];
                        const isActive = activeConversation?._id === conversation._id;
                        const status = userStatuses[other?.email] || 'offline';

                        return (
                            <div
                                key={conversation._id}
                                onClick={() => setActiveConversation(conversation)}
                                className={`
                                    px-6 py-4 cursor-pointer transition-all flex items-center gap-4 group
                                    ${isActive ? 'bg-primary/5 border-r-4 border-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-900/40'}
                                `}
                            >
                                <div className="relative shrink-0">
                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xl font-black shadow-lg group-hover:scale-105 transition-transform">
                                        {other?.name?.charAt(0)}
                                    </div>
                                    <div className={`
                                        absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-4 border-surface
                                        ${status === 'online' ? 'bg-success animate-pulse' : 'bg-gray-400'}
                                    `} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`font-black text-sm truncate ${isActive ? 'text-primary' : 'text-text-primary'}`}>
                                            {other?.name}
                                        </h4>
                                        <span className="text-[10px] font-bold text-text-secondary uppercase opacity-50">
                                            {conversation.last_message ? new Date(conversation.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <p className="text-xs text-text-secondary truncate font-medium opacity-70">
                                        {conversation.last_message?.text || 'New interaction started'}
                                    </p>
                                </div>
                                {conversation.unread_count > 0 && (
                                    <ModernBadge variant="error" size="sm" className="h-5 min-w-[20px] flex items-center justify-center font-black">
                                        {conversation.unread_count}
                                    </ModernBadge>
                                )}
                            </div>
                        );
                    })}
                </div>
            </ModernCard>

            {/* Main Chat Area */}
            <ModernCard
                variant="flat"
                padding="p-0"
                className="flex-1 flex flex-col border-primary/5 shadow-2xl h-full overflow-hidden"
            >
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 border-b border-border/50 bg-surface flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl font-black">
                                        {activeConversation.other_participants?.[0]?.name?.charAt(0)}
                                    </div>
                                    <div className={`
                                        absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-surface
                                        ${userStatuses[activeConversation.other_participants?.[0]?.email] === 'online' ? 'bg-success' : 'bg-gray-400'}
                                    `} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg tracking-tight text-text-primary">
                                        {activeConversation.other_participants?.[0]?.name}
                                    </h3>
                                    <span className="text-xs font-bold text-success uppercase tracking-widest opacity-80">
                                        {userStatuses[activeConversation.other_participants?.[0]?.email] === 'online' ? 'Real-time Active' : 'Last seen recently'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <ModernButton variant="ghost" className="p-3 text-text-secondary hover:text-primary"><FaPhoneAlt /></ModernButton>
                                <ModernButton variant="ghost" className="p-3 text-text-secondary hover:text-primary"><FaVideo /></ModernButton>
                                <ModernButton variant="ghost" className="p-3 text-text-secondary hover:text-primary"><FaEllipsisV /></ModernButton>
                            </div>
                        </div>

                        {/* Messages Body */}
                        <div
                            ref={messagesContainerRef}
                            className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-gray-50/30 dark:bg-gray-900/10"
                        >
                            {messages.map((msg, i) => {
                                const isMe = msg.sender_details?.email === user?.email || msg.is_temp;
                                return (
                                    <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in`}>
                                        <div className={`max-w-[70%] group`}>
                                            <div className={`
                                                p-4 rounded-3xl text-sm font-medium shadow-sm relative
                                                ${isMe
                                                    ? 'bg-primary text-white rounded-tr-none shadow-md'
                                                    : 'bg-surface border border-border/50 text-text-primary rounded-tl-none border-primary/5'
                                                }
                                            `}>
                                                {msg.text}
                                                <div className={`
                                                    mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter
                                                    ${isMe ? 'text-white/60' : 'text-text-secondary opacity-50'}
                                                `}>
                                                    <FaClock className="text-[8px]" />
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {isMe && <FaCheckDouble className={msg.read_by?.length > 0 ? 'text-amber-400' : ''} />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-border/50 bg-surface">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                                <div className="flex gap-2">
                                    <ModernButton type="button" variant="ghost" className="p-3 text-text-secondary hover:text-primary"><FaPaperclip /></ModernButton>
                                    <ModernButton type="button" variant="ghost" className="p-3 text-text-secondary hover:text-primary"><FaSmile /></ModernButton>
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Command transmission..."
                                        className="w-full bg-gray-100 dark:bg-gray-900/50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                </div>
                                <ModernButton
                                    type="submit"
                                    variant="primary"
                                    className="p-4 rounded-2xl shadow-xl hover:scale-105 transition-all"
                                    disabled={!newMessage.trim()}
                                >
                                    <FaPaperPlane />
                                </ModernButton>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
                        <div className="h-32 w-32 rounded-full bg-primary/5 flex items-center justify-center text-primary text-5xl animate-pulse">
                            <FaCommentDots />
                        </div>
                        <div className="max-w-xs">
                            <h3 className="text-2xl font-black tracking-tight text-text-primary mb-2">Secure Channel</h3>
                            <p className="text-sm font-medium text-text-secondary opacity-70 leading-relaxed">
                                End-to-end encrypted protocol active. Select a frequency to begin transmission.
                            </p>
                        </div>
                        <ModernButton variant="primary" className="px-8 py-4 text-xs font-black uppercase tracking-widest">
                            Initiate Thread
                        </ModernButton>
                    </div>
                )}
            </ModernCard>
        </div>
    );
};

export default MessagingPage;