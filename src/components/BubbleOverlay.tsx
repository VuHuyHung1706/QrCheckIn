import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/sound';
import { Check } from 'lucide-react';

export interface FloatingBubble {
  id: string;
  name: string;
  color: string;
  startX: number; // percentage (25% - 85%)
  speed: number;  // duration in seconds (5s - 7s)
  size: number;   // bubble diameter (115px - 145px)
  sway: number;   // horizontal sway amount in px (-40 to 40)
  createdAt: number;
}

interface BubbleOverlayProps {
  bubbles: FloatingBubble[];
  onBubbleComplete: (id: string) => void;
}

export const BubbleOverlay: React.FC<BubbleOverlayProps> = ({ bubbles, onBubbleComplete }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      <AnimatePresence>
        {bubbles.map((bubble) => (
          <BubbleItemComponent 
            key={bubble.id} 
            bubble={bubble} 
            onPop={() => onBubbleComplete(bubble.id)} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface BubbleItemComponentProps {
  bubble: FloatingBubble;
  onPop: () => void;
}

const BubbleItemComponent: React.FC<BubbleItemComponentProps> = ({ bubble, onPop }) => {
  const [popping, setPopping] = useState(false);

  // Near the top of the screen (7vh - 12vh)
  const targetTopY = useMemo(() => {
    const seed = bubble.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 7 + (seed % 6);
  }, [bubble.id]);

  const handlePop = () => {
    if (!popping) {
      setPopping(true);
      soundManager.playFireworkPopSound();

      // 🎆 HIỆU ỨNG CONFETTI PHÁO HOA TẠI ĐỈNH (TỎA TRÒN 360 ĐỘ)
      try {
        confetti({
          particleCount: 45,
          spread: 360,
          startVelocity: 24,
          origin: {
            x: bubble.startX / 100,
            y: (targetTopY + 2) / 100,
          },
          colors: ['#38bdf8', '#67e8f9', '#ffffff', '#fbbf24', '#f472b6', '#a855f7'],
          ticks: 85,
          gravity: 0.85,
          scalar: 0.85,
          shapes: ['circle'],
          disableForReducedMotion: false,
        });
      } catch {
        // safe fallback
      }

      // Thời gian để pháo hoa bung nở xong trước khi gỡ component
      setTimeout(onPop, 650);
    }
  };

  const initials = bubble.name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map(w => w[0].toUpperCase())
    .join('');

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: '105vh', 
        x: `${bubble.startX}vw`, 
        scale: 0.8 
      }}
      animate={
        popping
          ? {
              // Giữ cố định toạ độ tại đỉnh khi nổ pháo hoa, không bị rụng xuống
              y: `${targetTopY}vh`,
              opacity: 0,
              scale: 1.15,
              transition: { duration: 0.15, ease: 'easeOut' },
            }
          : {
              opacity: [0, 1, 1, 1],
              y: `${targetTopY}vh`,
              x: [
                `${bubble.startX}vw`,
                `${bubble.startX + bubble.sway * 0.03}vw`,
                `${bubble.startX - bubble.sway * 0.03}vw`,
                `${bubble.startX + bubble.sway * 0.015}vw`,
              ],
              scale: [0.85, 1, 1, 1],
              transition: {
                y: { 
                  duration: bubble.speed, 
                  ease: [0.25, 0.1, 0.25, 1] 
                },
                x: { 
                  duration: bubble.speed, 
                  ease: 'easeInOut' 
                },
                scale: { duration: 0.8, ease: 'easeOut' },
                opacity: { duration: 0.4 },
              },
            }
      }
      onAnimationComplete={() => {
        if (!popping) {
          handlePop();
        }
      }}
      exit={{ opacity: 0 }}
      className="fixed top-0 left-0 select-none flex flex-col items-center justify-center cursor-pointer pointer-events-auto"
      onClick={handlePop}
      style={{
        width: bubble.size,
        height: bubble.size,
        marginLeft: -bubble.size / 2,
      }}
    >
      {/* 🎈 BONG BÓNG BAY LÊN (CHỈ HIỂN THỊ KHI CHƯA NỔ) */}
      {!popping && (
        <div className="w-full h-full apple-bubble rounded-full relative flex items-center justify-center transition-transform duration-200 hover:scale-105">
          {/* Nội dung bên trong quả bóng */}
          <div className="flex flex-col items-center justify-center p-3 text-center z-10 max-w-[92%]">
            {/* Avatar tối giản */}
            <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 text-white font-semibold text-xs flex items-center justify-center mb-1.5 shadow-sm">
              {initials || '✓'}
            </div>

            {/* Tên người tham gia */}
            <div className="px-3 py-1 rounded-full bg-zinc-950/70 backdrop-blur-md border border-white/10 shadow-sm max-w-[130px]">
              <p className="text-xs font-semibold text-white tracking-tight truncate">
                {bubble.name}
              </p>
            </div>

            <div className="flex items-center gap-1 mt-1 text-[10px] font-medium text-emerald-400">
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span>Đã điểm danh</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
