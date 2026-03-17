import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameMonth, addMonths, subMonths } from 'date-fns';
import Card from '../shared/Card';

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
        >
            {/* Countdown Timer */}
            {nextVisit && <CountdownCard event={nextVisit} />}

            {/* Daily Quote */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                    textAlign: 'center',
                    padding: 'var(--space-4)',
                    marginBottom: 'var(--space-4)',
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

            {/* Calendar Card */}
            <Card hover3D={false}>
                <div style={{ padding: 'var(--space-6)' }}>
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
                                        padding: '8px 4px',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer',
                                        background: isSelected
                                            ? 'rgba(242, 167, 195, 0.15)'
                                            : today
                                                ? 'rgba(245, 211, 128, 0.1)'
                                                : 'transparent',
                                        border: today ? '1px solid var(--accent-gold)' : '1px solid transparent',
                                        transition: 'background 0.15s ease',
                                    }}
                                >
                                    <span style={{
                                        fontSize: '0.85rem',
                                        color: today ? 'var(--accent-gold)' : 'var(--text-primary)',
                                        fontWeight: today ? 600 : 400,
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
            </Card>

            {/* Selected Day Events */}
            <AnimatePresence>
                {selectedDate && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={{ marginTop: 'var(--space-4)' }}
                    >
                        <Card hover3D={false}>
                            <div style={{ padding: 'var(--space-4)' }}>
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
                        </Card>
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
        <Card glow hover3D={false}>
            <div style={{
                padding: 'var(--space-6)',
                textAlign: 'center',
            }}>
                <h3 style={{
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--accent-pink)',
                    fontSize: '1rem',
                    marginBottom: 'var(--space-4)',
                }}>
                    ✨ Until I See Rishika ✨
                </h3>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 'var(--space-4)',
                    marginBottom: 'var(--space-3)',
                }}>
                    {timeUnits.map(({ label, value }) => (
                        <div key={label} style={{ textAlign: 'center' }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={value}
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 10, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '2rem',
                                        fontWeight: 600,
                                        color: 'var(--accent-gold)',
                                        textShadow: '0 0 10px rgba(245, 211, 128, 0.3)',
                                        minWidth: '50px',
                                    }}
                                >
                                    {String(value).padStart(2, '0')}
                                </motion.div>
                            </AnimatePresence>
                            <span style={{
                                fontSize: '0.65rem',
                                color: 'var(--text-muted)',
                                fontFamily: 'var(--font-heading)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                            }}>
                                {label}
                            </span>
                        </div>
                    ))}
                </div>

                <p style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                }}>
                    {event.title}
                </p>
            </div>
        </Card>
    );
};

export default CalendarGrid;
