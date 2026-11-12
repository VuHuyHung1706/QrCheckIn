import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CenterLogoProps {
  pulseTrigger?: number; // timestamp or counter of absorption
  orgName?: string;
}

export const CenterLogo: React.FC<CenterLogoProps> = ({ 
  pulseTrigger = 0, 
  orgName = 'CÁT THÁI' 
}) => {
  const [ripples, setRipples] = useState<number[]>([]);

  // Trigger ripple ring whenever a bubble absorbs into the center
  useEffect(() => {
    if (pulseTrigger > 0) {
      setRipples(prev => [...prev.slice(-3), pulseTrigger]);
    }
  }, [pulseTrigger]);

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
              transition={{ duration: 0.8, ease: 'easeOut' }}
              onAnimationComplete={() => removeRipple(id)}
              className="absolute inset-0 rounded-full border-2 border-blue-400/60 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            />
          ))}
        </AnimatePresence>

        {/* Ambient subtle glow behind logo */}
        <div className="absolute w-72 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* The Cat Thai Logo */}
        <motion.div
          key={pulseTrigger}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center"
        >
          <img
            src="/catthai-logo.png"
            alt={orgName || "Cát Thái Logo"}
            className="w-80 md:w-96 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.25)]"
          />
        </motion.div>
      </div>
    </div>
  );
};
