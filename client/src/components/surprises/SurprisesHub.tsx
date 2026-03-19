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
            style={{ 
                padding: 'var(--space-6)', 
                maxWidth: '1000px', 
                margin: '0 auto',
                minHeight: '80vh',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <div style={{ 
                textAlign: 'center', 
                marginBottom: 'var(--space-12)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
            }}>
                <h1 style={{ 
                    fontFamily: 'var(--font-heading)', 
                    fontSize: '3rem', 
                    color: 'var(--text-primary)', 
                    margin: 0,
                    textShadow: '0 0 20px rgba(242, 167, 195, 0.4)'
                }}>
                    Surprises
                </h1>
                <p style={{ color: 'var(--accent-pink)', opacity: 0.8, fontSize: '1.1rem' }}>
                    Secret moments waiting for the right time... ✨
                </p>
                
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 12px 24px rgba(242, 167, 195, 0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        marginTop: '24px',
                        padding: '14px 32px',
                        borderRadius: '50px',
                        background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-lavender))',
                        color: 'white',
                        border: 'none',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 8px 16px rgba(242, 167, 195, 0.3)',
                        letterSpacing: '1px'
                    }}
                >
                    + HIDE A SURPRISE
                </motion.button>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Moonlight is loading your secrets...</div>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '32px',
                    width: '100%'
                }}>
                    <AnimatePresence>
                        {surprises.length > 0 ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 11fr))',
                                gap: '32px',
                                width: '100%',
                                justifyContent: 'center'
                            }}>
                                {surprises.map((surprise) => (
                                    <SurpriseCard 
                                        key={surprise.id} 
                                        surprise={surprise} 
                                        onDelete={() => deleteSurprise(surprise.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ 
                                    maxWidth: '500px',
                                    textAlign: 'center', 
                                    padding: '60px 40px', 
                                    background: 'rgba(255,255,255,0.02)', 
                                    borderRadius: '32px', 
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    backdropFilter: 'blur(10px)',
                                    boxShadow: 'inset 0 0 20px rgba(242, 167, 195, 0.05)'
                                }}
                            >
                                <div style={{ fontSize: '4rem', marginBottom: '24px', filter: 'grayscale(0.5) opacity(0.5)' }}>🎁</div>
                                <h3 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>No surprises yet</h3>
                                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                    The box is quiet... for now. Why not hide a little something special for later?
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.7)',
                            backdropFilter: 'blur(12px)',
                            zIndex: 9999, // Ensure it's above everything
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px'
                        }}
                    >
                        {/* Backdrop Click-to-close */}
                        <div 
                            style={{ position: 'absolute', inset: 0 }} 
                            onClick={() => setIsModalOpen(false)} 
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            style={{
                                position: 'relative', // Relative to the flex container
                                width: '100%',
                                maxWidth: '480px',
                                background: 'rgba(23, 27, 48, 0.98)',
                                padding: '40px',
                                borderRadius: '32px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.02)',
                                zIndex: 10000
                            }}
                        >
                            <h2 style={{ 
                                fontFamily: 'var(--font-heading)', 
                                color: 'white', 
                                marginBottom: '32px',
                                fontSize: '1.8rem',
                                textAlign: 'center'
                            }}>
                                Hide a New Surprise
                            </h2>
                            
                            <form onSubmit={handleAddSurprise} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', marginBottom: '10px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Title</label>
                                    <input 
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="E.g., A Little Something Special"
                                        style={{ 
                                            width: '100%', 
                                            padding: '16px', 
                                            borderRadius: '16px', 
                                            background: 'rgba(0,0,0,0.3)', 
                                            border: '1px solid rgba(255,255,255,0.1)', 
                                            color: 'white',
                                            fontSize: '1rem',
                                            transition: 'border-color 0.3s'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', marginBottom: '10px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>The Secret Content</label>
                                    <textarea 
                                        required
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="What should be revealed?"
                                        rows={4}
                                        style={{ 
                                            width: '100%', 
                                            padding: '16px', 
                                            borderRadius: '16px', 
                                            background: 'rgba(0,0,0,0.3)', 
                                            border: '1px solid rgba(255,255,255,0.1)', 
                                            color: 'white',
                                            fontSize: '1rem',
                                            resize: 'none'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '8px' }}>
                                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', marginBottom: '10px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Reveal Date</label>
                                    <input 
                                        required
                                        type="date"
                                        value={revealDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setRevealDate(e.target.value)}
                                        style={{ 
                                            width: '100%', 
                                            padding: '16px', 
                                            borderRadius: '16px', 
                                            background: 'rgba(0,0,0,0.3)', 
                                            border: '1px solid rgba(255,255,255,0.1)', 
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        style={{ 
                                            flex: 1, 
                                            padding: '16px', 
                                            borderRadius: '16px', 
                                            background: 'rgba(255,255,255,0.05)', 
                                            border: '1px solid rgba(255,255,255,0.1)', 
                                            color: 'white', 
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            letterSpacing: '0.5px'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        style={{ 
                                            flex: 1, 
                                            padding: '16px', 
                                            borderRadius: '16px', 
                                            background: 'var(--accent-pink)', 
                                            border: 'none', 
                                            color: 'white', 
                                            cursor: 'pointer', 
                                            fontWeight: 'bold',
                                            boxShadow: '0 8px 24px rgba(242, 167, 195, 0.4)',
                                            letterSpacing: '0.5px'
                                        }}
                                    >
                                        Hide It! ✨
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
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
                    padding: '32px',
                    minHeight: '260px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    background: 'rgba(255,255,255,0.01)',
                    borderRadius: '24px'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <span style={{ 
                        fontSize: '0.75rem', 
                        color: isRevealed ? 'var(--accent-pink)' : 'var(--text-muted)', 
                        background: isRevealed ? 'rgba(242, 167, 195, 0.1)' : 'rgba(255,255,255,0.05)', 
                        padding: '6px 12px', 
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.03)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: 'bold'
                    }}>
                        {isRevealed ? '✨ REVEALED' : '🕒 REVEALS ' + day}
                    </span>
                    <button 
                        onClick={onDelete} 
                        style={{ 
                            background: 'rgba(255,255,255,0.05)', 
                            border: 'none', 
                            color: 'rgba(255,255,255,0.4)', 
                            cursor: 'pointer', 
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            transition: 'all 0.3s'
                        }} 
                        className="delete-btn"
                        title="Delete"
                    >
                        ✕
                    </button>
                </div>

                <h3 style={{ 
                    margin: '0 0 20px 0', 
                    color: 'white', 
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.4rem',
                    textAlign: 'center'
                }}>
                    {surprise.title}
                </h3>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isRevealed ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ 
                                background: 'rgba(255,255,255,0.03)', 
                                padding: '24px', 
                                borderRadius: '20px', 
                                width: '100%',
                                textAlign: 'center',
                                border: '1px solid rgba(242, 167, 195, 0.15)',
                                boxShadow: 'inset 0 0 30px rgba(242, 167, 195, 0.05)'
                            }}
                        >
                            <p style={{ 
                                color: 'var(--text-primary)', 
                                fontSize: '1.1rem', 
                                fontStyle: 'italic', 
                                margin: 0,
                                lineHeight: '1.5'
                            }}>
                                "{surprise.content}"
                            </p>
                            <div style={{ 
                                marginTop: '16px', 
                                fontSize: '0.75rem', 
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                FROM {surprise.createdBy === 'DSP' ? 'DEVI SRI PRASAD' : 'RISHIKA'}
                            </div>
                        </motion.div>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <motion.img 
                                src={giftIcon} 
                                alt="Gift"
                                animate={{ 
                                    y: [0, -12, 0],
                                    scale: [1, 1.05, 1],
                                    rotate: [0, -3, 3, 0]
                                }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                style={{ width: '100px', height: '100px', marginBottom: '20px', filter: 'drop-shadow(0 0 20px rgba(242, 167, 195, 0.3))' }}
                            />
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                                A secret is hiding here...
                            </p>
                        </div>
                    )}
                </div>

                {!isRevealed && (
                    <div style={{ 
                        marginTop: '24px',
                        height: '4px', 
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '2px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <motion.div 
                            style={{ 
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(90deg, var(--accent-pink), var(--accent-lavender))',
                                width: '40%',
                                borderRadius: '2px'
                            }}
                            animate={{ x: ['-100%', '300%'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                )}
            </motion.div>
        </Card>
    );
};

export default SurprisesHub;
