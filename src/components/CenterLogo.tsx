import React, { useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

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
  const controls = useAnimationControls();

  // Calculate color reveal progress (reaches 100% normal color at ~20% of target)
  const target = totalExpected > 0 ? totalExpected : 50;
  const rawRatio = participantCount / target;
  // Reaches full normal color when reaching around 20% (0.20) of attendees
  const COLOR_TARGET_RATIO = 0.20;
  const colorProgress = Math.min(1, Math.max(0, rawRatio / COLOR_TARGET_RATIO));

  // Dynamic filter values:
  // 0% check-in = 100% Grayscale (Black & White) with clean silver brightness
  // ~20% check-in = 0% Grayscale, 100% Normal Vibrant Color
  const grayscalePercent = Math.round((1 - colorProgress) * 100);
  const saturatePercent = Math.round(colorProgress * 100);
  const brightnessPercent = Math.round(112 - colorProgress * 12);

  // Trigger pulse animation EXACTLY ONCE per absorption
  useEffect(() => {
    if (pulseTrigger > 0) {
      controls.start({
        scale: [1, 1.06, 1],
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
      });
    }
  }, [pulseTrigger, controls]);

  return (
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex items-center justify-center select-none">
      <motion.div
        animate={controls}
        className="relative flex items-center justify-center"
      >
        <img
          src="/catthai-logo.png"
          alt={orgName || "Cát Thái Logo"}
          className="w-80 md:w-96 object-contain"
          style={{
            filter: colorProgress >= 1 ? 'none' : `grayscale(${grayscalePercent}%) saturate(${saturatePercent}%) brightness(${brightnessPercent}%)`,
            transition: 'filter 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </motion.div>
    </div>
  );
};
