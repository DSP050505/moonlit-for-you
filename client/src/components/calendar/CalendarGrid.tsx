import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, addMonths, subMonths } from 'date-fns';
import { useSocket } from '../../context/useSocket';
import { useAuth } from '../../context/AuthContext';

// Curated love quotes
const loveQuotes = [
    "Rishika, you are my moon and stars ✨",
    "Every mile between us is proof that love knows no distance 🌙",
    "I found my forever in you, Rishika 💕",
    "You make even the darkest nights feel warm 🌟",
    "My favorite place is next to you 💗",
    "Under this same moon, I'm thinking of you 🌙",
    "You're the reason I believe in magic ✨",
    "Distance means so little when someone means so much 💕",
    "I love you more than all the stars in the sky ⭐",
    "Every sunset brings us one day closer 🌅",
    "You are my today and all of my tomorrows 💗",
    "I carry your heart with me, always 🌙",
    "Loving you is the best thing I've ever done ✨",
    "You're worth every mile between us 💕",
    "Our love story is my favorite 💗",
    "I fall in love with you every single day 🌟",
    "You are the poem I never knew how to write ✨",
    "Being with you is my favorite memory 💕",
    "You make my heart sing from miles away 🎵",
    "I love the way love feels with you 💗",
    "The moon whispers your name every night 🌙",
    "You are my sunshine on cloudy days ☀️",
    "My love for you grows with every sunrise 🌅",
    "Nothing compares to the way you make me feel ✨",
    "I'm so lucky the universe gave me you 💕",
    "You are the best thing that's ever happened to me 💗",
    "Together is my favorite place to be 🌟",
    "You complete my story, Rishika 📖",
    "Every moment with you is a treasure 💎",
    "You make distance feel like nothing 💕",
    "I love you to infinity and beyond 🚀",
];

const getDailyQuote = (date: Date) => {
    const dayIndex = (date.getFullYear() * 366 + date.getMonth() * 31 + date.getDate()) % loveQuotes.length;
    return loveQuotes[dayIndex];
};

interface CountdownEvent {
    id?: number;
    title: string;
    date: string;
    type: string;
}

const CalendarGrid: React.FC = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [activeCountdown, setActiveCountdown] = useState<CountdownEvent | null>(null);
    const [hasReached, setHasReached] = useState(false);
    
    const { socket } = useSocket();
    const { session } = useAuth();

    // Fetch initial countdown
    useEffect(() => {
        if (!session) return;
        fetch(`/api/events/countdown?roomId=${session.room.id}&t=${Date.now()}`)
            .then(res => res.json())
            .then(data => {
                if (data.countdown) {
                    const exactDateStr = data.countdown.note || data.countdown.date;
                    const eventDate = new Date(exactDateStr);
                    // Standardize purely on the date portion directly against today at midnight
                    if (eventDate.getTime() > Date.now()) {
                        setActiveCountdown({ ...data.countdown, date: exactDateStr });
                        setHasReached(false);
                    } else {
                        setActiveCountdown(null);
                        setHasReached(true);
                    }
                }
            })
            .catch(console.error);
    }, [session]);

    // Setup socket listener
    useEffect(() => {
        if (!socket) return;
        
        const handleUpdate = (data: { date: string, title?: string }) => {
            const newDate = new Date(data.date);
            if (newDate.getTime() > Date.now()) {
                setActiveCountdown({ title: data.title || 'shared_countdown', date: data.date, type: 'custom' });
                setHasReached(false);
            }
        };

        socket.on('countdown:update', handleUpdate);

        return () => {
             socket.off('countdown:update', handleUpdate);
        };
    }, [socket]);

    const handleSelectDate = async (day: Date) => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const dayStr = format(day, 'yyyy-MM-dd');
        
        // Only allow picking future dates
        if (dayStr <= todayStr) return;

        // We want the countdown to hit exactly at midnight of the selected day
        const targetDateStr = day.toISOString();

        // Optimistically set UI
        const newCountdown = { title: 'shared_countdown', date: targetDateStr, type: 'custom' };
        setActiveCountdown(newCountdown);
        setHasReached(false);

        // Notify others
        if (socket) {
            socket.emit('countdown:set', { date: targetDateStr });
        }

        // Save to DB
        if (session) {
            try {
                await fetch('/api/events/countdown', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        roomId: session.room.id,
                        date: targetDateStr,
                        createdBy: session.user.role
                    })
                });
            } catch (err) {
                console.error('Failed to set countdown API', err);
            }
        }
    };

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = getDay(monthStart);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{
                maxWidth: '900px',
                margin: '0 auto',
                padding: 'var(--space-4)',
            }}
            className="calendar-container"
        >
            {/* Title */}
            <h2 style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-primary)',
                textAlign: 'center',
                marginBottom: 'var(--space-6)',
                fontSize: '1.8rem',
                textShadow: '0 0 15px rgba(242, 167, 195, 0.4)'
            }}>
                Getting closer, one day at a time 🌙
            </h2>

            {/* Countdown Timer or Empty State Message */}
            {activeCountdown ? (
                <CountdownCard 
                    event={activeCountdown} 
                    onExpire={() => {
                        setActiveCountdown(null);
                        setHasReached(true);
                    }} 
                />
            ) : (
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                        padding: 'var(--space-5)',
                        textAlign: 'center',
                        background: 'rgba(28, 32, 56, 0.3)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(245, 211, 128, 0.1)',
                        borderRadius: '24px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        marginBottom: 'var(--space-8)',
                    }}
                >
                    <p style={{
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--accent-gold)',
                        fontSize: '1.2rem',
                        letterSpacing: '1px',
                    }}>
                        {hasReached 
                            ? "That moment was special 💫… pick our next one" 
                            : "Pick a date to look forward to ✨"}
                    </p>
                </motion.div>
            )}

            <div style={{
                position: 'relative',
                background: 'rgba(28, 32, 56, 0.4)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 0 15px rgba(255,255,255,0.02)',
                borderRadius: '24px',
                padding: 'var(--space-6)',
                transformStyle: 'preserve-3d',
                perspective: '1500px'
            }}>
                {/* Month Navigation */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-6)',
                }}>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        style={{
                            background: 'none', border: 'none', color: 'var(--text-muted)',
                            fontSize: '1.2rem', cursor: 'pointer',
                        }}
                    >
                        ←
                    </motion.button>
                    <h3 style={{
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--text-primary)',
                        fontSize: '1.2rem',
                    }}>
                        {format(currentMonth, 'MMMM yyyy')}
                    </h3>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        style={{
                            background: 'none', border: 'none', color: 'var(--text-muted)',
                            fontSize: '1.2rem', cursor: 'pointer',
                        }}
                    >
                        →
                    </motion.button>
                </div>

                {/* Day Headers */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: 'var(--space-2)',
                }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} style={{
                            textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)',
                            fontFamily: 'var(--font-heading)', fontWeight: 500, padding: '4px',
                        }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                    {/* Empty cells for start of month */}
                    {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}

                    {/* Day cells */}
                    {days.map((day) => {
                        const targetDate = activeCountdown ? new Date(activeCountdown.date) : null;
                        const isSelected = targetDate ? day.toDateString() === targetDate.toDateString() : false;
                        const today = isToday(day);
                        
                        const dayStr = format(day, 'yyyy-MM-dd');
                        const todayStr = format(new Date(), 'yyyy-MM-dd');
                        const isPastDay = dayStr <= todayStr;

                        return (
                            <motion.div
                                key={day.toISOString()}
                                whileHover={!isPastDay ? { scale: 1.05 } : {}}
                                whileTap={!isPastDay ? { scale: 0.95 } : {}}
                                onClick={() => handleSelectDate(day)}
                                style={{
                                    textAlign: 'center',
                                    padding: '12px 6px',
                                    borderRadius: '12px',
                                    cursor: isPastDay ? 'default' : 'pointer',
                                    opacity: isPastDay && !today ? 0.3 : 1,
                                    background: isSelected
                                        ? 'linear-gradient(135deg, rgba(242, 167, 195, 0.4), rgba(232, 120, 138, 0.2))'
                                        : today
                                            ? 'rgba(245, 211, 128, 0.15)'
                                            : 'rgba(0,0,0,0.2)',
                                    border: isSelected 
                                        ? '1px solid rgba(242, 167, 195, 0.6)' 
                                        : today 
                                            ? '1px solid var(--accent-gold)' 
                                            : '1px solid rgba(255,255,255,0.05)',
                                    boxShadow: isSelected
                                        ? '0 8px 20px rgba(0,0,0,0.4), inset 0 2px 10px rgba(242, 167, 195, 0.3)'
                                        : today
                                            ? '0 4px 12px rgba(0,0,0,0.2), inset 0 2px 5px rgba(245, 211, 128, 0.1)'
                                            : 'inset 0 2px 5px rgba(255,255,255,0.02)',
                                    transition: 'all 0.3s ease',
                                    transformStyle: 'preserve-3d',
                                }}
                            >
                                <span style={{
                                    fontSize: '0.9rem',
                                    color: isSelected 
                                        ? '#fff' 
                                        : today ? 'var(--accent-gold)' : 'var(--text-primary)',
                                    fontWeight: today || isSelected ? 600 : 400,
                                    textShadow: isSelected ? '0 0 10px rgba(242, 167, 195, 0.8)' : 'none',
                                    display: 'block',
                                    transform: isSelected ? 'translateZ(10px)' : 'none'
                                }}>
                                    {format(day, 'd')}
                                </span>
                                
                                {isSelected && (
                                     <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                                         <span style={{ fontSize: '10px' }}>💫</span>
                                     </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
            
            {/* Daily Quote below the calendar */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                    textAlign: 'center',
                    padding: 'var(--space-6)',
                    marginTop: 'var(--space-4)',
                }}
            >
                <p style={{
                    fontFamily: 'var(--font-handwriting)',
                    fontSize: '1.4rem',
                    color: 'var(--accent-lavender)',
                    fontStyle: 'italic',
                    textShadow: '0 2px 5px rgba(0,0,0,0.3)'
                }}>
                    " {getDailyQuote(new Date())} "
                </p>
            </motion.div>
        </motion.div>
    );
};

/* Countdown Card Component */
const CountdownCard: React.FC<{ event: CountdownEvent, onExpire: () => void }> = ({ event, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const expireDate = new Date(event.date);
            const diff = expireDate.getTime() - Date.now();
            if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            return {
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60),
            };
        };

        const initialTime = calculateTimeLeft();
        setTimeLeft(initialTime);
        
        if (initialTime.days === 0 && initialTime.hours === 0 && initialTime.minutes === 0 && initialTime.seconds === 0) {
            onExpire();
            return;
        }

        const interval = setInterval(() => {
            const newTime = calculateTimeLeft();
            setTimeLeft(newTime);
            if (newTime.days === 0 && newTime.hours === 0 && newTime.minutes === 0 && newTime.seconds === 0) {
                clearInterval(interval);
                onExpire();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [event.date, onExpire]);

    const timeUnits = [
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds },
    ];

    return (
        <div style={{
            padding: 'var(--space-6)',
            textAlign: 'center',
            background: 'rgba(28, 32, 56, 0.5)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(245, 211, 128, 0.15)',
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 0 20px rgba(245, 211, 128, 0.05)',
            marginBottom: 'var(--space-8)',
            perspective: '1000px',
            transformStyle: 'preserve-3d',
        }}>
            <h3 style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--accent-pink)',
                fontSize: '1.2rem',
                marginBottom: 'var(--space-6)',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                textShadow: '0 0 10px rgba(242, 167, 195, 0.5)'
            }}>
                ✨ Counting Down ✨
            </h3>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                {timeUnits.map(({ label, value }) => (
                    <div key={label} style={{ textAlign: 'center', perspective: '800px' }}>
                        <div style={{
                            background: 'linear-gradient(180deg, rgba(20,20,30,0.8), rgba(0,0,0,0.8))',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            marginBottom: '8px',
                            minWidth: '70px',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.1)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.05), transparent)' }} />
                            
                            <AnimatePresence mode="popLayout">
                                <motion.div
                                    key={value}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '2.5rem',
                                        fontWeight: 700,
                                        color: 'var(--accent-gold)',
                                        textShadow: '0 0 15px rgba(245, 211, 128, 0.6), 0 0 30px rgba(245, 211, 128, 0.3)',
                                    }}
                                >
                                    {String(value).padStart(2, '0')}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>
                            {label}
                        </span>
                    </div>
                ))}
            </div>
            
            <p style={{
                fontSize: '0.95rem',
                color: 'var(--accent-lavender)',
                fontFamily: 'var(--font-handwriting)',
                marginTop: 'var(--space-4)',
                opacity: 0.8
            }}>
                {"Every second brings us closer 💫"}
            </p>
        </div>
    );
};

export default CalendarGrid;
