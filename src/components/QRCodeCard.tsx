import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, QrCode } from 'lucide-react';
import { SessionState } from '../types';

interface QRCodeCardProps {
  session: SessionState;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({ session }) => {
  const { timeLeft, duration, status, participants, orgName, joinUrl, totalExpected } = session;

  const isVisible = status === 'running' || status === 'idle';
  const progressPercent = duration > 0 ? (timeLeft / duration) * 100 : 0;

  // Format time MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -60, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ 
            opacity: 0, 
            x: -80, 
            scale: 0.94,
            transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } 
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed left-8 top-1/2 -translate-y-1/2 z-20 w-80 select-none pointer-events-auto"
        >
          {/* Apple-style Frosted Glass Card */}
          <div className="relative apple-glass-card rounded-[28px] p-6 shadow-2xl">
            {/* Header Status */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status === 'running' ? 'bg-emerald-400' : 'bg-zinc-400'}`}></span>
                </span>
                <span className="text-[11px] font-semibold tracking-tight text-zinc-300">
                  {status === 'running' ? 'Đang điểm danh' : 'Sẵn sàng'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.08] text-[11px] font-medium text-zinc-300 border border-white/[0.06]">
                <Users className="w-3 h-3 text-zinc-400" />
                <span>{participants.length} / {totalExpected}</span>
              </div>
            </div>

            {/* Title / Org Name */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-white tracking-tight">
                {orgName || 'Check-in'}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Quét mã để điểm danh trực tiếp
              </p>
            </div>

            {/* QR Code Container */}
            <div className="relative mx-auto my-3 p-3.5 bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center">
              <QRCodeSVG
                value={joinUrl || window.location.href}
                size={176}
                level="M"
                includeMargin={false}
              />
              <div className="mt-2 text-[10px] font-mono text-zinc-500 truncate max-w-[200px]">
                {joinUrl}
              </div>
            </div>

            {/* Countdown Timer Section */}
            <div className="mt-4 pt-3 border-t border-white/[0.08]">
              <div className="flex items-center justify-between text-xs font-medium text-zinc-300 mb-2">
                <span className="text-zinc-400">Thời gian còn lại</span>
                <span className="font-mono font-semibold text-sm text-white">
                  {formattedTime}
                </span>
              </div>

              {/* Minimal Progress Bar */}
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${timeLeft <= 10 ? 'bg-amber-400' : 'bg-white'}`}
                  initial={false}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ ease: "linear", duration: 1 }}
                />
              </div>
            </div>

            {/* Footer Prompt */}
            <div className="mt-4 text-center">
              <p className="text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-zinc-500" />
                Dùng camera điện thoại để quét mã
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
