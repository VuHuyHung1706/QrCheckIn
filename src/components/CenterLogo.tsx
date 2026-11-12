import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';

interface CenterLogoProps {
  pulseTrigger?: number; // counter of absorption
  participantCount?: number;
  totalExpected?: number;
  orgName?: string;
}

export const CenterLogo: React.FC<CenterLogoProps> = ({ 
  pulseTrigger = 0, 
  participantCount = 0,
  totalExpected = 50,
  orgName = 'CÁT THÁI' 
}) => {
  const [ripples, setRipples] = useState<number[]>([]);
  const controls = useAnimationControls();

  // Calculate color reveal progress (0 -> 1)
  const target = totalExpected > 0 ? totalExpected : 50;
  const progress = Math.min(1, Math.max(0, participantCount / target));

  // Dynamic filter values:
  // 0 participants = 100% Grayscale (Black & White)
  // 100% participants = 0% Grayscale, 100% Full Vibrant Color
  const grayscalePercent = Math.round((1 - progress) * 100);
  const saturatePercent = Math.round(progress * 100);
  const brightnessPercent = Math.round(88 + progress * 12);

  // Trigger pulse animation EXACTLY ONCE per absorption
  useEffect(() => {
    if (pulseTrigger > 0) {
      controls.start({
        scale: [1, 1.055, 1],
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
      });
      setRipples(prev => [...prev.slice(-2), pulseTrigger]);
    }
  }, [pulseTrigger, controls]);

  const removeRipple = (id: number) => {
    setRipples(prev => prev.filter(r => r !== id));
  };

  return (
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex items-center justify-center select-none">
      <div className="relative flex items-center justify-center">
        {/* Expanding Ripple waves on absorption */}
        <AnimatePresence>
          {ripples.map((id) => (
            <motion.div
              key={id}
              initial={{ scale: 0.6, opacity: 0.8 }}
              animate={{ scale: 1.6, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
              onAnimationComplete={() => removeRipple(id)}
              className="absolute inset-0 rounded-full border-2 border-blue-400/60 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            />
          ))}
        </AnimatePresence>

        {/* Ambient glow behind logo (progressively glows blue as colors return) */}
        <div 
          className="absolute w-80 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-1000"
          style={{
            backgroundColor: progress > 0.05 ? `rgba(37, 99, 235, ${0.08 + progress * 0.22})` : 'rgba(255, 255, 255, 0.05)',
          }}
        />

        {/* The Cat Thai Logo: Animates cleanly ONCE without re-mounting */}
        <motion.div
          animate={controls}
          className="relative flex items-center justify-center"
        >
          <img
            src="/catthai-logo.png"
            alt={orgName || "Cát Thái Logo"}
            className="w-80 md:w-96 object-contain"
            style={{
              filter: `grayscale(${grayscalePercent}%) saturate(${saturatePercent}%) brightness(${brightnessPercent}%) drop-shadow(0 10px 25px rgba(0,0,0,0.25))`,
              transition: 'filter 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};
