import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Card from '../shared/Card';
import giftIcon from '../../assets/surprises-icon.png';

interface Surprise {
    id: number;
    title: string;
    content: string;
    revealDate: string;
    createdBy: string;
    isRevealed: boolean;
}

const SurprisesHub: React.FC = () => {
    const { session } = useAuth();
    const [surprises, setSurprises] = useState<Surprise[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [revealDate, setRevealDate] = useState('');

    useEffect(() => {
        fetchSurprises();
    }, [session?.room.id]);

    const fetchSurprises = async () => {
        if (!session?.room.id) return;
        try {
            const res = await fetch(`/api/surprises?roomId=${session.room.id}`);
            const data = await res.json();
            setSurprises(data.surprises || []);
        } catch (err) {
            console.error('Failed to fetch surprises:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSurprise = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.room.id || !session?.user.role) return;

        try {
            const res = await fetch('/api/surprises', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: session.room.id,
                    title,
                    content,
                    revealDate,
                    createdBy: session.user.role
                })
            });

            if (res.ok) {
                setTitle('');
                setContent('');
                setRevealDate('');
                setIsModalOpen(false);
                fetchSurprises();
            }
        } catch (err) {
            console.error('Failed to add surprise:', err);
        }
    };

    const deleteSurprise = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this surprise?')) return;
        try {
            await fetch(`/api/surprises/${id}`, { method: 'DELETE' });
            setSurprises(surprises.filter(s => s.id !== id));
        } catch (err) {
            console.error('Failed to delete surprise:', err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="surprises-container"
            style={{ padding: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-10)' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: 'var(--text-primary)', margin: 0 }}>
                        Surprises
                    </h1>
                    <p style={{ color: 'var(--accent-pink)', opacity: 0.8 }}>Secret moments waiting for the right time...</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-lavender))',
                        color: 'white',
                        border: 'none',
                        fontFamily: 'var(--font-heading)',
                        cursor: 'pointer',
                        boxShadow: '0 8px 16px rgba(242, 167, 195, 0.3)'
                    }}
                >
                    + Add Surprise
                </motion.button>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Moonlight is loading your secrets...</div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '24px'
                }}>
                    <AnimatePresence>
                        {surprises.map((surprise) => (
                            <SurpriseCard 
                                key={surprise.id} 
                                surprise={surprise} 
                                onDelete={() => deleteSurprise(surprise.id)}
                            />
                        ))}
                    </AnimatePresence>
                    
                    {surprises.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No surprises hidden yet. Be the first to hide a secret! 🌙</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(0,0,0,0.6)',
                                backdropFilter: 'blur(5px)',
                                zIndex: 1000
                            }}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            style={{
                                position: 'fixed',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '90%',
                                maxWidth: '500px',
                                background: 'rgba(20, 24, 45, 0.95)',
                                backdropFilter: 'blur(20px)',
                                padding: '32px',
                                borderRadius: '24px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                zIndex: 1001,
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                            }}
                        >
                            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'white', marginBottom: '24px' }}>Hide a New Surprise</h2>
                            <form onSubmit={handleAddSurprise} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem' }}>Title</label>
                                    <input 
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="E.g., A Little Something Special"
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem' }}>The Secret Content</label>
                                    <textarea 
                                        required
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="What should be revealed?"
                                        rows={4}
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem' }}>Reveal Date</label>
                                    <input 
                                        required
                                        type="date"
                                        value={revealDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setRevealDate(e.target.value)}
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--accent-pink)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Hide It! 🌙
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const SurpriseCard = ({ surprise, onDelete }: { surprise: Surprise, onDelete: () => void }) => {
    const isRevealed = surprise.isRevealed;
    const revealDate = new Date(surprise.revealDate);
    const day = revealDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <Card glow={isRevealed}>
            <motion.div
                layout
                style={{
                    padding: '24px',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.8rem', color: isRevealed ? 'var(--accent-pink)' : 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '4px 10px', borderRadius: '20px' }}>
                        {isRevealed ? '✨ Revealed' : '🕒 Reveals ' + day}
                    </span>
                    <button onClick={onDelete} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: '4px' }} title="Delete">✕</button>
                </div>

                <h3 style={{ margin: '0 0 12px 0', color: 'white', fontFamily: 'var(--font-heading)' }}>{surprise.title}</h3>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isRevealed ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ 
                                background: 'rgba(255,255,255,0.05)', 
                                padding: '16px', 
                                borderRadius: '16px', 
                                width: '100%',
                                textAlign: 'center',
                                border: '1px solid rgba(242, 167, 195, 0.2)'
                            }}
                        >
                            <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontStyle: 'italic', margin: 0 }}>
                                "{surprise.content}"
                            </p>
                            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                From {surprise.createdBy === 'DSP' ? 'Devi Sri Prasad' : 'Rishika'}
                            </div>
                        </motion.div>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <motion.img 
                                src={giftIcon} 
                                alt="Gift"
                                animate={{ 
                                    y: [0, -10, 0],
                                    rotate: [0, -2, 2, 0]
                                }}
                                transition={{ duration: 4, repeat: Infinity }}
                                style={{ width: '80px', height: '80px', marginBottom: '16px', filter: 'drop-shadow(0 0 15px rgba(242, 167, 195, 0.4))' }}
                            />
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Patience is a virtue...
                            </p>
                        </div>
                    )}
                </div>

                {!isRevealed && (
                    <div style={{ 
                        marginTop: '16px',
                        height: '2px', 
                        background: 'rgba(255,255,255,0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <motion.div 
                            style={{ 
                                position: 'absolute',
                                inset: 0,
                                background: 'var(--accent-pink)',
                                width: '30%' // Placeholder for real progress
                            }}
                            animate={{ x: ['-100%', '350%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                )}
            </motion.div>
        </Card>
    );
};

export default SurprisesHub;
