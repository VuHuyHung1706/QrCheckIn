import React, { useState, useEffect, useRef } from 'react';
import { socket, getRoomId } from '../services/socket';
import { SessionState, Participant } from '../types';
import { QRCodeCard } from '../components/QRCodeCard';
import { BubbleOverlay, FloatingBubble } from '../components/BubbleOverlay';
import { CenterLogo } from '../components/CenterLogo';
import { StatisticsModal } from '../components/StatisticsModal';
import { soundManager } from '../utils/sound';
import { 
  Play, RotateCcw, UserPlus, Volume2, VolumeX, Eye, EyeOff, 
  BarChart3, ChevronRight, Settings 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SAMPLE_NAMES = [
  'Nguyễn Văn An',
  'Trần Thị Bích Ngọc',
  'Lê Hoàng Long',
  'Phạm Minh Tuấn',
  'Hoàng Khánh Linh',
  'Vũ Đình Khang',
  'Đỗ Thu Hà',
  'Ngô Thanh Phong',
  'Bùi Quỳnh Nga',
  'Đinh Quốc Bảo',
  'Trương Mỹ Duyên',
  'Võ Đức Trí'
];

export const OverlayPage: React.FC = () => {
  const [session, setSession] = useState<SessionState>({
    status: 'idle',
    totalExpected: 50,
    duration: 60,
    timeLeft: 60,
    orgName: 'CÁT THÁI',
    participants: [],
    joinUrl: ''
  });

  const [bubbles, setBubbles] = useState<FloatingBubble[]>([]);
  const [showControls, setShowControls] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [pulseTrigger, setPulseTrigger] = useState(0);
  const [absorbedCount, setAbsorbedCount] = useState<number>(0);
  const isFirstSyncRef = useRef(true);

  // Sync state and listen to real-time events
  useEffect(() => {
    socket.on('state:sync', (updatedState: SessionState) => {
      setSession(updatedState);
      if (updatedState.status === 'running') {
        setShowStats(false);
      }
      if (isFirstSyncRef.current) {
        isFirstSyncRef.current = false;
        setAbsorbedCount(updatedState.participants.length);
      } else if (updatedState.participants.length === 0) {
        setAbsorbedCount(0);
        setBubbles([]);
      }
    });

    socket.on('timer:tick', ({ timeLeft }: { timeLeft: number }) => {
      setSession(prev => ({ ...prev, timeLeft }));
    });

    socket.on('participant:joined', (participant: Participant) => {
      spawnBubble(participant);
    });

    return () => {
      socket.off('state:sync');
      socket.off('timer:tick');
      socket.off('participant:joined');
    };
  }, []);

  const spawnBubble = (participant: Participant) => {
    const startX = 15 + Math.random() * 70;
    const speed = 3.8 + Math.random() * 1.0;
    const size = 115 + Math.random() * 25;
    const sway = 0;

    const newBubble: FloatingBubble = {
      id: participant.id || `${Date.now()}-${Math.random()}`,
      name: participant.name,
      color: participant.color,
      startX,
      speed,
      size,
      sway,
      createdAt: Date.now()
    };

    setBubbles(prev => [...prev, newBubble]);
  };

  const removeBubble = (id: string) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
  };

  const handleBubbleAbsorbed = (id: string) => {
    removeBubble(id);
    setPulseTrigger(prev => prev + 1);
    setAbsorbedCount(prev => prev + 1);
  };

  const handleSimulateCheckin = () => {
    const randomName = SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
    socket.emit('participant:submit', { name: randomName });
  };

  const handleStart = () => {
    setShowStats(false);
    socket.emit('session:start');
  };

  const handleReset = () => {
    setShowStats(false);
    setBubbles([]);
    setAbsorbedCount(0);
    socket.emit('session:reset');
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-transparent select-none font-sans">
      {/* 1. Background Center Cat Thai Logo */}
      <CenterLogo 
        pulseTrigger={pulseTrigger} 
        participantCount={absorbedCount}
        totalExpected={session.totalExpected}
        orgName={session.orgName || 'CÁT THÁI'}
      />

      {/* 2. Left side QR Code Card (visible when idle or running) */}
      <QRCodeCard session={session} />

      {/* 3. Floating Bubbles moving into the center of the Cat Thai Logo */}
      <BubbleOverlay bubbles={bubbles} onBubbleAbsorbed={handleBubbleAbsorbed} />

      {/* 4. Button to Open Statistics (Appears on the left when time ends instead of auto-opening modal) */}
      <AnimatePresence>
        {session.status === 'ended' && !showStats && (
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed left-8 top-1/2 -translate-y-1/2 z-20 pointer-events-auto"
          >
            <button
              onClick={() => setShowStats(true)}
              className="apple-glass rounded-full px-5 py-3 shadow-2xl flex items-center gap-3 text-white hover:scale-105 active:scale-95 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold tracking-tight text-white flex items-center gap-1">
                  <span>Xem thống kê</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition" />
                </div>
                <div className="text-[10px] text-zinc-400 font-medium">
                  {session.participants.length} / {session.totalExpected} người đã tham gia
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Statistics Modal Screen (ONLY shown when streamer clicks the button to open) */}
      <AnimatePresence>
        {session.status === 'ended' && showStats && (
          <StatisticsModal 
            session={session} 
            onReset={handleReset} 
            onClose={() => setShowStats(false)} 
          />
        )}
      </AnimatePresence>

      {/* 6. Streamer Quick Control Bar (Bottom-right corner) */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        {showControls ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full apple-glass text-xs text-white">
            {/* Quick Stats Toggle in toolbar when session ended */}
            {session.status === 'ended' && (
              <button
                onClick={() => setShowStats(prev => !prev)}
                title={showStats ? 'Đóng thống kê' : 'Xem thống kê'}
                className="apple-btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition active:scale-95 text-emerald-400 hover:text-emerald-300"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{showStats ? 'Đóng Thống Kê' : 'Xem Thống Kê'}</span>
              </button>
            )}

            {/* Simulate Attendee Button */}
            <button
              onClick={handleSimulateCheckin}
              title="Mô phỏng 1 người quét mã nhập tên"
              className="apple-btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Test</span>
            </button>

            {/* Start Timer */}
            {session.status !== 'running' && (
              <button
                onClick={handleStart}
                title="Bắt đầu đếm ngược"
                className="apple-btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition active:scale-95"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Bắt đầu</span>
              </button>
            )}

            {/* Reset */}
            <button
              onClick={handleReset}
              title="Làm mới phiên"
              className="p-1.5 rounded-full hover:bg-white/10 transition active:scale-95 text-zinc-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="p-1.5 rounded-full hover:bg-white/10 transition active:scale-95 text-zinc-400 hover:text-white"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-white" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
              )}
            </button>

            {/* Admin Dashboard Link for Streamer */}
            <a
              href={`/admin?room=${getRoomId()}`}
              target="_blank"
              rel="noreferrer"
              title="Mở Bảng Điều Khiển Admin (chỉ dành cho Streamer)"
              className="p-1.5 rounded-full hover:bg-white/10 transition active:scale-95 text-zinc-400 hover:text-white"
            >
              <Settings className="w-3.5 h-3.5" />
            </a>

            {/* Hide Bar Button */}
            <button
              onClick={() => setShowControls(false)}
              title="Ẩn thanh công cụ"
              className="p-1.5 rounded-full hover:bg-white/10 transition text-zinc-400 hover:text-white"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowControls(true)}
            title="Hiện thanh điều khiển"
            className="p-2.5 rounded-full apple-glass text-zinc-400 hover:text-white shadow-xl transition"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
