import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import EmojiReactor from './EmojiReactor';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/useSocket';

export interface Message {
    id: number;
    sender: 'you' | 'her';
    content: string;
    type: 'text' | 'voice' | 'image';
    mediaUrl?: string;
    reactions: Array<{ emoji: string; sender: string }>;
    readAt?: string | null;
    createdAt: string;
    confetti?: boolean;
    milestone?: number | null;
}

const ChatBox: React.FC = () => {
    const { session } = useAuth();
    const { socket } = useSocket();

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isPartnerTyping, setIsPartnerTyping] = useState(false);
    const [reactionTarget, setReactionTarget] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [onlineRoles, setOnlineRoles] = useState<string[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isJuliet = session?.user.role === 'Juliet';
    const partnerRole = isJuliet ? 'Romeo' : 'Juliet';
    const partnerName = isJuliet ? 'Romeo' : 'Juliet';
    const partnerOnline = onlineRoles.includes(partnerRole);

    // Listen for presence updates
    useEffect(() => {
        if (!socket) return;
        socket.on('presence:update', (data: { online: string[] }) => {
            setOnlineRoles(data.online);
        });
        return () => { socket.off('presence:update'); };
    }, [socket]);

    // Auto-prompt location on room entry
    useEffect(() => {
        if (!session || !socket) return;
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    socket.emit('location:update', {
                        roomId: session.room.id,
                        userId: session.user.id,
                        role: session.user.role,
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    });
                },
                () => { /* User denied - that's ok, handled in DistanceMap */ },
                { enableHighAccuracy: true }
            );
        }
    }, [session, socket]);

    // Fetch initial chat history
    useEffect(() => {
        if (!session) return;

        const apiUrl = import.meta.env.VITE_API_URL || 
            (window.location.hostname === 'localhost' ? 'http://localhost:3001' : `http://${window.location.hostname}:3001`);
        fetch(`${apiUrl}/api/messages?roomId=${session.room.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.messages) {
                    // Map generic Sender ('you' | 'her') to the local user's perspective
                    // The backend stores sender as 'you' or 'her' based on whoever sent it initially (which is flawed for shared rooms).
                    // Actually, the backend was updated to save 'sender' as whatever the client sends.
                    // Let's ensure the frontend maps it correctly. If the DB sender == my role, it's 'you'.
                    // Wait, DB has Enums: 'you' and 'her'. We should just pass role strings. 
                    // Let's just trust what the server sends for now, but handle it cleanly.
                    setMessages(data.messages);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch messages', err);
                setIsLoading(false);
            });
    }, [session]);

    // Socket listeners
    useEffect(() => {
        if (!socket || !session) return;

        socket.on('chat:message', (msg: any) => {
            setMessages(prev => [...prev, msg]);

            // If the message is from the partner, send read receipt
            if (msg.sender !== (isJuliet ? 'her' : 'you')) { // This logic needs to match what's sent
                // Simplification: if it wasn't sent by me, it's from partner. For real mapping, since DB uses 'you'/'her', 
                // we assume the sender string matches whoever sent it locally.
                socket.emit('chat:read', { roomId: session.room.id, messageId: msg.id });
                setIsPartnerTyping(false);
            }
        });

        socket.on('chat:typing', (data: any) => {
            if (data.sender !== session.user.role) {
                setIsPartnerTyping(data.isTyping);
            }
        });

        socket.on('chat:reaction', (data: any) => {
            setMessages(prev => prev.map(m =>
                m.id === data.messageId
                    ? { ...m, reactions: [...(m.reactions || []), { emoji: data.emoji, sender: data.sender }] }
                    : m
            ));
        });

        socket.on('chat:read', (data: any) => {
            setMessages(prev => prev.map(m =>
                m.id === data.messageId ? { ...m, readAt: new Date().toISOString() } : m
            ));
        });

        return () => {
            socket.off('chat:message');
            socket.off('chat:typing');
            socket.off('chat:reaction');
            socket.off('chat:read');
        };
    }, [socket, session, isJuliet]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isPartnerTyping]);

    const handleSend = () => {
        if (!inputText.trim() || !socket || !session) return;

        const isLoveMessage = inputText.toLowerCase().includes('i love you');

        // Note: the backend Prisma schema enum for Sender is "you" | "her". 
        // We will just use 'you' when Romeo sends and 'her' when Juliet sends for simplicity to respect the schema.
        const senderEnum = isJuliet ? 'her' : 'you';

        socket.emit('chat:message', {
            roomId: session.room.id,
            sender: senderEnum,
            content: inputText,
            type: 'text'
        });

        // Trigger confetti locally for immediate feedback
        if (isLoveMessage) {
            import('../shared/ConfettiTrigger').then(({ fireConfetti }) => {
                fireConfetti('hearts');
            });
        }

        setInputText('');
        inputRef.current?.focus();

        // Stop typing indicator when sent
        socket.emit('chat:typing', { roomId: session.room.id, sender: session.user.role, isTyping: false });
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);

        if (!socket || !session) return;

        socket.emit('chat:typing', { roomId: session.room.id, sender: session.user.role, isTyping: true });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('chat:typing', { roomId: session.room.id, sender: session.user.role, isTyping: false });
        }, 2000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleReaction = (messageId: number, emoji: string) => {
        if (!socket || !session) return;

        socket.emit('chat:reaction', {
            roomId: session.room.id,
            messageId,
            emoji,
            sender: session.user.role
        });

        setReactionTarget(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100vh - var(--topbar-height) - 32px)',
                maxWidth: '800px',
                margin: '0 auto',
            }}
            className="chat-container"
        >
            {/* Chat Header */}
            <div className="chat-header" style={{
                padding: 'var(--space-4)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
            }}>
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ fontSize: '1.3rem' }}
                >
                    💬
                </motion.div>
                <div>
                    <h3 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.1rem',
                        color: 'var(--text-primary)',
                        margin: 0,
                    }}>
                        Whisper Room: {session?.room.name}
                    </h3>
                    <span style={{
                        fontSize: '0.75rem',
                        color: partnerOnline ? 'var(--accent-pink)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}>
                        <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: partnerOnline ? '#4CAF50' : '#666',
                            boxShadow: partnerOnline ? '0 0 6px #4CAF50' : 'none',
                            display: 'inline-block',
                        }} />
                        {partnerOnline ? `${partnerName} is online` : `${partnerName} is offline`}
                    </span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="chat-messages" style={{
                flex: 1,
                overflowY: 'auto',
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
            }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading history...</div>
                ) : (
                    <AnimatePresence>
                        {messages.map((msg) => {
                            // Map 'you'/'her' to actual left/right logic based on the session
                            const amIJuliet = session?.user.role === 'Juliet';
                            // If I am Juliet, and sender is 'her', then I am the sender locally. So change localSender to 'you'.
                            // If I am Romeo, and sender is 'you', then I am the sender locally. So change localSender to 'you'.

                            let localSender: 'you' | 'her' = 'her';
                            if (amIJuliet && msg.sender === 'her') localSender = 'you';
                            if (!amIJuliet && msg.sender === 'you') localSender = 'you';

                            const mappedMsg = { ...msg, sender: localSender };

                            return (
                                <MessageBubble
                                    key={mappedMsg.id}
                                    message={mappedMsg}
                                    onLongPress={() => setReactionTarget(mappedMsg.id)}
                                />
                            );
                        })}
                    </AnimatePresence>
                )}

                {/* Typing Indicator */}
                {isPartnerTyping && <TypingIndicator name={partnerName} />}

                {/* Emoji Reactor Popup */}
                {reactionTarget !== null && (
                    <EmojiReactor
                        onSelect={(emoji) => handleReaction(reactionTarget, emoji)}
                        onClose={() => setReactionTarget(null)}
                    />
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chat-input-area" style={{
                padding: 'var(--space-4)',
                borderTop: '0.5px solid rgba(255,255,255,0.04)',
                display: 'flex',
                gap: 'var(--space-3)',
                alignItems: 'center',
            }}>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={handleTyping}
                    onKeyDown={handleKeyPress}
                    placeholder={`Whisper to ${partnerName}...`}
                    style={{
                        flex: 1,
                        background: 'rgba(28, 32, 56, 0.6)',
                        backdropFilter: 'blur(20px)',
                        border: '0.5px solid rgba(255,255,255,0.08)',
                        borderRadius: 'var(--radius-pill)',
                        padding: '12px 20px',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9rem',
                        boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.2), 0 4px 15px rgba(0,0,0,0.1)',
                    }}
                />
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSend}
                    disabled={!inputText.trim() || !socket}
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: inputText.trim()
                            ? 'linear-gradient(135deg, rgba(232, 120, 138, 0.9), rgba(242, 167, 195, 0.9))'
                            : 'rgba(28, 32, 56, 0.6)',
                        border: '0.5px solid rgba(255,255,255,0.08)',
                        cursor: inputText.trim() ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        transition: 'background 0.2s ease, box-shadow 0.2s ease',
                        boxShadow: inputText.trim() ? '0 0 15px rgba(242, 167, 195, 0.3)' : 'none',
                    }}
                >
                    <motion.span
                        animate={inputText.trim() ? { rotate: [0, -45], x: [0, 3], y: [0, -3] } : {}}
                        transition={{ duration: 0.2 }}
                    >
                        ✈️
                    </motion.span>
                </motion.button>
            </div>
        </motion.div>
    );
};

export default ChatBox;
