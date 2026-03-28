import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useMusic } from '../../hooks/useMusic';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

const loveQuotes = [
    "Juliet, you are my moon and stars ✨",
    "Every mile between us is proof that love knows no distance 🌙",
    "I found my forever in you, Juliet 💕",
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
    "You complete my story, Juliet 📖",
    "Every moment with you is a treasure 💎",
    "You make distance feel like nothing 💕",
    "I love you to infinity and beyond 🚀",
];

const getDailyQuote = (date: Date) => {
    const dayIndex = (date.getFullYear() * 366 + date.getMonth() * 31 + date.getDate()) % loveQuotes.length;
    return loveQuotes[dayIndex];
};

interface CountdownEvent {
    title: string;
    date: string;
    type: string;
}

export default function CalendarScreen() {
    const { session } = useAuth();
    const { socket } = useSocket();
    const { currentTrack } = useMusic();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [activeCountdown, setActiveCountdown] = useState<CountdownEvent | null>(null);
    const [hasReached, setHasReached] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const roomId = session?.room.id;
    const userRole = session?.user?.role;

    // Fetch initial countdown
    useEffect(() => {
        if (!roomId) return;
        setIsLoading(true);
        fetch(`${API_URL}/api/events/countdown?roomId=${roomId}&t=${Date.now()}`)
            .then(res => res.json())
            .then(data => {
                if (data.countdown) {
                    const exactDateStr = data.countdown.note || data.countdown.date;
                    const eventDate = new Date(exactDateStr);
                    if (eventDate.getTime() > Date.now()) {
                        setActiveCountdown({ ...data.countdown, date: exactDateStr });
                        setHasReached(false);
                    } else {
                        setActiveCountdown(null);
                        setHasReached(true);
                    }
                } else {
                    setActiveCountdown(null);
                    setHasReached(false);
                }
            })
            .catch(err => console.error('📱 Calendar: Fetch error', err))
            .finally(() => setIsLoading(false));
    }, [roomId]);

    // Socket listener
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
        return () => { socket.off('countdown:update', handleUpdate); };
    }, [socket]);

    const handleSelectDate = async (day: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (day <= today) return; // Only allow future dates

        const targetDate = new Date(day);
        targetDate.setHours(23, 59, 59, 999);
        const targetDateStr = targetDate.toISOString();

        setActiveCountdown({ title: 'shared_countdown', date: targetDateStr, type: 'custom' });
        setHasReached(false);

        if (socket) socket.emit('countdown:set', { date: targetDateStr });

        if (roomId && userRole) {
            try {
                await fetch(`${API_URL}/api/events/countdown`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roomId, date: targetDateStr, createdBy: userRole }),
                });
            } catch (err) { console.error('📱 Calendar: Failed to set countdown API', err); }
        }
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentMonth(newDate);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#0B0E1A' }}>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: currentTrack ? 120 : 20 }}>
                {/* Header */}
                <Text style={{ fontFamily: 'Quicksand', color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 }}>
                    Getting closer, one day at a time 🌙
                </Text>

                {/* Countdown / Empty State */}
                <View style={{ minHeight: 180, marginBottom: 32 }}>
                    {isLoading ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator color="#F2A7C3" size="large" />
                        </View>
                    ) : activeCountdown ? (
                        <CountdownCard 
                            event={activeCountdown} 
                            onExpire={() => { setActiveCountdown(null); setHasReached(true); }} 
                        />
                    ) : (
                        <View style={{ padding: 32, alignItems: 'center', backgroundColor: 'rgba(28, 32, 56, 0.3)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(245, 211, 128, 0.1)' }}>
                            <Text style={{ color: '#F5D380', fontSize: 16, textAlign: 'center', fontWeight: 'bold' }}>
                                {hasReached ? "That moment was special 💫… pick our next one" : "Pick a date to look forward to ✨"}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Calendar Grid */}
                <View style={{ backgroundColor: 'rgba(28, 32, 56, 0.4)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                    {/* Month Navigation */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <TouchableOpacity onPress={() => changeMonth(-1)} style={{ padding: 10 }}>
                            <Text style={{ color: '#8A8FA8', fontSize: 20, fontWeight: 'bold' }}>←</Text>
                        </TouchableOpacity>
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </Text>
                        <TouchableOpacity onPress={() => changeMonth(1)} style={{ padding: 10 }}>
                            <Text style={{ color: '#8A8FA8', fontSize: 20, fontWeight: 'bold' }}>→</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Day Headers */}
                    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <Text key={day} style={{ flex: 1, textAlign: 'center', color: '#8A8FA8', fontSize: 12, fontWeight: 'bold' }}>{day}</Text>
                        ))}
                    </View>

                    {/* Grid */}
                    <MonthGrid currentMonth={currentMonth} activeCountdown={activeCountdown} onSelectDate={handleSelectDate} />
                </View>

                {/* Daily Quote */}
                <View style={{ marginTop: 32, marginBottom: 40, paddingHorizontal: 20 }}>
                    <Text style={{ fontFamily: 'Caveat', fontSize: 24, color: '#C4B1D4', textAlign: 'center', lineHeight: 32 }}>
                        "{getDailyQuote(new Date())}"
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

function MonthGrid({ currentMonth, activeCountdown, onSelectDate }: { currentMonth: Date, activeCountdown: CountdownEvent | null, onSelectDate: (d: Date) => void }) {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = activeCountdown ? new Date(activeCountdown.date) : null;

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    const rows = [];
    for (let i = 0; i < days.length; i += 7) {
        rows.push(days.slice(i, i + 7));
    }

    return (
        <View>
            {rows.map((row, rIdx) => (
                <View key={rIdx} style={{ flexDirection: 'row', marginBottom: 6 }}>
                    {row.map((day, dIdx) => {
                        if (!day) return <View key={`empty-${rIdx}-${dIdx}`} style={{ flex: 1 }} />;

                        const isPast = day <= today;
                        const isToday = day.getTime() === today.getTime();
                        const isSelected = targetDate && 
                            day.getFullYear() === targetDate.getFullYear() && 
                            day.getMonth() === targetDate.getMonth() && 
                            day.getDate() === targetDate.getDate();

                        let bgColor = 'rgba(0,0,0,0.2)';
                        let borderColor = 'rgba(255,255,255,0.05)';
                        let textColor = 'white';
                        let opacity = 1;

                        if (isSelected) {
                            bgColor = 'rgba(242, 167, 195, 0.4)';
                            borderColor = 'rgba(242, 167, 195, 0.6)';
                            textColor = 'white';
                        } else if (isToday) {
                            bgColor = 'rgba(245, 211, 128, 0.15)';
                            borderColor = '#F5D380';
                            textColor = '#F5D380';
                        } else if (isPast) {
                            opacity = 0.3;
                            textColor = '#8A8FA8';
                        }

                        return (
                            <TouchableOpacity
                                key={dIdx}
                                onPress={() => onSelectDate(day)}
                                disabled={isPast}
                                style={{
                                    flex: 1, height: 44, marginHorizontal: 2, borderRadius: 12,
                                    backgroundColor: bgColor, borderWidth: 1, borderColor: borderColor,
                                    alignItems: 'center', justifyContent: 'center', opacity
                                }}
                            >
                                <Text style={{ color: textColor, fontWeight: isToday || isSelected ? 'bold' : 'normal', fontSize: 14 }}>
                                    {day.getDate()}
                                </Text>
                                {isSelected && <Text style={{ fontSize: 8, position: 'absolute', bottom: 2 }}>💫</Text>}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}
        </View>
    );
}

function CountdownCard({ event, onExpire }: { event: CountdownEvent, onExpire: () => void }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const expireDate = new Date(event.date);
            const diff = expireDate.getTime() - Date.now();
            if (diff <= 1000) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            return {
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60),
            };
        };

        setTimeLeft(calculateTimeLeft());

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
        { label: 'Mins', value: timeLeft.minutes },
        { label: 'Secs', value: timeLeft.seconds },
    ];

    return (
        <View style={{ backgroundColor: 'rgba(28, 32, 56, 0.5)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(245, 211, 128, 0.15)', alignItems: 'center' }}>
            <Text style={{ color: '#F2A7C3', fontSize: 16, fontWeight: 'bold', letterSpacing: 2, marginBottom: 20 }}>
                ✨ COUNTING DOWN ✨
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
                {timeUnits.map(({ label, value }) => (
                    <View key={label} style={{ alignItems: 'center' }}>
                        <View style={{ backgroundColor: '#14141E', borderRadius: 12, paddingVertical: 12, width: 64, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 8 }}>
                            <Text style={{ color: '#F5D380', fontSize: 32, fontWeight: 'bold' }}>
                                {String(value).padStart(2, '0')}
                            </Text>
                        </View>
                        <Text style={{ color: '#8A8FA8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
                            {label}
                        </Text>
                    </View>
                ))}
            </View>
            <Text style={{ color: '#C4B1D4', fontSize: 14, fontStyle: 'italic', marginTop: 8 }}>
                Every second brings us closer 💫
            </Text>
        </View>
    );
}


