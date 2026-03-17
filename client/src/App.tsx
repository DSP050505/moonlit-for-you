import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import AuthGuard from './components/auth/AuthGuard';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import SoundToggle from './components/shared/SoundToggle';
import WelcomeSequence from './components/welcome/WelcomeSequence';
import SceneProvider, { useScene } from './components/3d/SceneProvider';

// Feature Components
import ChatBox from './components/chat/ChatBox';
import CalendarGrid from './components/calendar/CalendarGrid';
import DistanceMap from './components/map/DistanceMap';
import MusicPlayer from './components/music/MusicPlayer';
import PhotoGallery from './components/gallery/PhotoGallery';
import LetterWriter from './components/letters/LetterWriter';
import GamesHub from './components/games/GamesHub';

/** Syncs current route to the 3D camera controller */
function PageSync() {
  const location = useLocation();
  const { setCurrentPage } = useScene();
  useEffect(() => {
    setCurrentPage(location.pathname);
  }, [location.pathname, setCurrentPage]);
  return null;
}

function AppContent() {
  const [showWelcome, setShowWelcome] = useState(
    () => !localStorage.getItem('hasSeenWelcome')
  );

  return (
    <>
      {/* Welcome Sequence (first load only) */}
      {showWelcome && (
        <WelcomeSequence onComplete={() => setShowWelcome(false)} />
      )}

      <div className="app-layout" style={{ opacity: showWelcome ? 0 : 1, transition: 'opacity 0.5s ease' }}>
        {/* Route → Camera sync */}
        <PageSync />

        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="app-main">
          {/* Top Bar */}
          <TopBar />

          {/* Page Content with Transitions */}
          <main style={{ padding: 'var(--space-4)' }}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Navigate to="/chat" replace />} />
                <Route path="/chat" element={<ChatBox />} />
                <Route path="/calendar" element={<CalendarGrid />} />
                <Route path="/map" element={<DistanceMap />} />
                <Route path="/music" element={<MusicPlayer />} />
                <Route path="/gallery" element={<PhotoGallery />} />
                <Route path="/letters" element={<LetterWriter />} />
                <Route path="/games" element={<GamesHub />} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>

        {/* Floating Sound Toggle */}
        <SoundToggle />
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthGuard>
          <SceneProvider>
            <AppContent />
          </SceneProvider>
        </AuthGuard>
      </AuthProvider>
    </Router>
  );
}

export default App;
