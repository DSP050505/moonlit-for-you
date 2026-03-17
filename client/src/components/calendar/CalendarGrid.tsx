import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, addMonths, subMonths } from 'date-fns';

// Curated love quotes (first 30 for now, deterministic by day)
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

// Event type styles
const eventTypeConfig: Record<string, { color: string; icon: string }> = {
    anniversary: { color: 'var(--accent-pink)', icon: '💕' },
    visit: { color: 'var(--accent-gold)', icon: '✈️' },
    movie: { color: 'var(--accent-lavender)', icon: '🎬' },
    call: { color: 'var(--success)', icon: '📞' },
    custom: { color: 'var(--accent-silver)', icon: '⭐' },
};

interface CalendarEvent {
    id: number;
    title: string;
    date: string;
    type: string;
    note?: string;
}

const CalendarGrid: React.FC = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Demo events
    const [events] = useState<CalendarEvent[]>([
        { id: 1, title: 'Our Anniversary 💕', date: '2026-03-14', type: 'anniversary' },
        { id: 2, title: 'Next Visit!', date: '2026-04-15', type: 'visit' },
        { id: 3, title: 'Movie Night 🎬', date: '2026-03-20', type: 'movie' },
        { id: 4, title: 'Video Call ❤️', date: '2026-03-18', type: 'call' },
    ]);

    // Next visit countdown
    const nextVisit = events.find(e => e.type === 'visit' && new Date(e.date) > new Date());

    // Calendar days
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = getDay(monthStart);

    const getEventsForDay = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return events.filter(e => e.date === dateStr);
    };

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
            {/* Countdown Timer */}
            {nextVisit && <CountdownCard event={nextVisit} />}

            {/* Daily Quote */}
            <motion.div
                initial={{ opacity: 0, y: 10, rotateX: 20 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                style={{
                    textAlign: 'center',
                    padding: 'var(--space-4)',
                    marginBottom: 'var(--space-4)',
                    perspective: '1000px'
                }}
            >
                <p style={{
                    fontFamily: 'var(--font-handwriting)',
                    fontSize: '1.2rem',
                    color: 'var(--accent-pink)',
                    fontStyle: 'italic',
                }}>
                    "{getDailyQuote(new Date())}"
                </p>
            </motion.div>

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
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '4px',
                        marginBottom: 'var(--space-2)',
                    }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} style={{
                                textAlign: 'center',
                                fontSize: '0.7rem',
                                color: 'var(--text-muted)',
                                fontFamily: 'var(--font-heading)',
                                fontWeight: 500,
                                padding: '4px',
                            }}>
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '4px',
                    }}>
                        {/* Empty cells for start of month */}
                        {Array.from({ length: startDay }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}

                        {/* Day cells */}
                        {days.map((day) => {
                            const dayEvents = getEventsForDay(day);
                            const isSelected = selectedDate?.toDateString() === day.toDateString();
                            const today = isToday(day);

                            return (
                                <motion.div
                                    key={day.toISOString()}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedDate(day)}
                                    style={{
                                        textAlign: 'center',
                                        padding: '12px 6px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        background: isSelected
                                            ? 'linear-gradient(135deg, rgba(242, 167, 195, 0.3), rgba(232, 120, 138, 0.15))'
                                            : today
                                                ? 'rgba(245, 211, 128, 0.15)'
                                                : 'rgba(0,0,0,0.2)',
                                        border: isSelected 
                                            ? '1px solid rgba(242, 167, 195, 0.6)' 
                                            : today 
                                                ? '1px solid var(--accent-gold)' 
                                                : '1px solid rgba(255,255,255,0.05)',
                                        boxShadow: isSelected
                                            ? '0 8px 20px rgba(0,0,0,0.3), inset 0 2px 10px rgba(242, 167, 195, 0.2)'
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

                                    {/* Event dots */}
                                    {dayEvents.length > 0 && (
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            gap: '2px',
                                            marginTop: '2px',
                                        }}>
                                            {dayEvents.map(evt => (
                                                <span
                                                    key={evt.id}
                                                    style={{
                                                        display: 'inline-block',
                                                        width: '5px',
                                                        height: '5px',
                                                        borderRadius: '50%',
                                                        background: eventTypeConfig[evt.type]?.color || 'var(--accent-silver)',
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            <AnimatePresence>
                {selectedDate && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={{ marginTop: 'var(--space-6)', perspective: '1000px' }}
                    >
                        <div style={{
                            padding: 'var(--space-5)',
                            background: 'linear-gradient(135deg, rgba(28, 32, 56, 0.6), rgba(11, 14, 26, 0.8))',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            border: '1px solid rgba(242, 167, 195, 0.15)',
                            borderRadius: '20px',
                            boxShadow: '0 15px 35px rgba(0,0,0,0.5), inset 0 2px 10px rgba(242, 167, 195, 0.05)',
                            transformStyle: 'preserve-3d',
                        }}>
                                <h4 style={{
                                    fontFamily: 'var(--font-heading)',
                                    marginBottom: 'var(--space-3)',
                                    color: 'var(--text-primary)',
                                }}>
                                    {format(selectedDate, 'EEEE, MMMM d')}
                                </h4>
                                <p style={{
                                    fontFamily: 'var(--font-handwriting)',
                                    color: 'var(--accent-lavender)',
                                    fontSize: '1rem',
                                    marginBottom: 'var(--space-3)',
                                }}>
                                    "{getDailyQuote(selectedDate)}"
                                </p>
                                {getEventsForDay(selectedDate).length > 0 ? (
                                    getEventsForDay(selectedDate).map(evt => (
                                        <div key={evt.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-2)',
                                            padding: 'var(--space-2)',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: 'var(--radius-sm)',
                                            marginBottom: 'var(--space-2)',
                                        }}>
                                            <span>{eventTypeConfig[evt.type]?.icon || '📌'}</span>
                                            <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{evt.title}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        No events on this day 🌙
                                    </p>
                                )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

/* Countdown Card Component */
const CountdownCard: React.FC<{ event: CalendarEvent }> = ({ event }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const diff = new Date(event.date).getTime() - Date.now();
            if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            return {
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60),
            };
        };

        setTimeLeft(calculateTimeLeft());
        const interval = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(interval);
    }, [event.date]);

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
                fontSize: '1.1rem',
                marginBottom: 'var(--space-6)',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                textShadow: '0 0 10px rgba(242, 167, 195, 0.5)'
            }}>
                ✨ Until I See Rishika ✨
            </h3>

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-4)',
            }}>
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
                            {/* Glass reflection line */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.05), transparent)' }} />
                            
                            <AnimatePresence mode="popLayout">
                                <motion.div
                                    key={value}
                                    initial={{ rotateX: -90, opacity: 0, transformOrigin: 'bottom' }}
                                    animate={{ rotateX: 0, opacity: 1, transformOrigin: 'bottom' }}
                                    exit={{ rotateX: 90, opacity: 0, transformOrigin: 'top' }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
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
                        <span style={{
                            fontSize: '0.7rem',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-heading)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            fontWeight: 600
                        }}>
                            {label}
                        </span>
                    </div>
                ))}
            </div>

            <p style={{
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
                fontStyle: 'italic'
            }}>
                {event.title}
            </p>
        </div>
    );
};

export default CalendarGrid;
