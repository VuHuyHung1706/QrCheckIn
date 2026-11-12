import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '../utils/sound';

export interface FloatingBubble {
  id: string;
  name: string;
  color: string;
  startX: number; // percentage (15% - 85%)
  speed: number;  // duration in seconds (3.8s - 4.8s)
  size: number;   // bubble diameter (115px - 145px)
  sway: number;
  createdAt: number;
}

interface BubbleOverlayProps {
  bubbles: FloatingBubble[];
  onBubbleAbsorbed: (id: string) => void;
}

export const BubbleOverlay: React.FC<BubbleOverlayProps> = ({ bubbles, onBubbleAbsorbed }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      <AnimatePresence>
        {bubbles.map((bubble) => (
          <BubbleItemComponent 
            key={bubble.id} 
            bubble={bubble} 
            onAbsorbed={() => onBubbleAbsorbed(bubble.id)} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface BubbleItemComponentProps {
  bubble: FloatingBubble;
  onAbsorbed: () => void;
}

const BubbleItemComponent: React.FC<BubbleItemComponentProps> = ({ bubble, onAbsorbed }) => {
  const hasAbsorbedRef = React.useRef(false);

  // Center of screen/logo is 50vw, 50vh
  // Generate curved arc towards center (50vw)
  const deltaX = 50 - bubble.startX;
  const p1X = bubble.startX + deltaX * 0.35;
  const p2X = bubble.startX + deltaX * 0.82;

  const handleComplete = () => {
    if (hasAbsorbedRef.current) return;
    hasAbsorbedRef.current = true;
    soundManager.playAbsorptionSound();
    onAbsorbed();
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
      animate={{
        // Smooth graceful curve from bottom into the exact center of the Cat Thai logo
        y: ['105vh', '78vh', '60vh', '50vh'],
        x: [`${bubble.startX}vw`, `${p1X}vw`, `${p2X}vw`, '50vw'],
        scale: [0.8, 1, 1, 0.08],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: bubble.speed,
        ease: [0.25, 0.1, 0.25, 1],
        times: [0, 0.32, 0.78, 1], // Stays fully readable for 80% of travel, then absorbs into center!
      }}
      onAnimationComplete={handleComplete}
      exit={{ opacity: 0, scale: 0.1 }}
      className="fixed top-0 left-0 select-none flex flex-col items-center justify-center pointer-events-none"
      style={{
        width: bubble.size,
        height: bubble.size,
        marginLeft: -bubble.size / 2,
        marginTop: -bubble.size / 2,
      }}
    >
      {/* 🎈 Quả bóng kính mờ chỉ chứa Avatar và Tên người tham gia */}
      <div className="w-full h-full apple-bubble rounded-full relative flex items-center justify-center transition-transform duration-200">
        <div className="flex flex-col items-center justify-center p-3 text-center z-10 max-w-[92%]">
          {/* Avatar tối giản */}
          <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 text-white font-semibold text-xs flex items-center justify-center mb-1.5 shadow-sm">
            {initials || '✓'}
          </div>

          {/* Tên người tham gia duy nhất */}
          <div className="px-3.5 py-1.5 rounded-full bg-zinc-950/80 backdrop-blur-md border border-white/15 shadow-sm max-w-[135px]">
            <p className="text-xs font-semibold text-white tracking-tight truncate">
              {bubble.name}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
