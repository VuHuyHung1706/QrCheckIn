import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Users, CheckCircle2, UserX, RotateCcw, Download, X } from 'lucide-react';
import { SessionState } from '../types';
import { soundManager } from '../utils/sound';

interface StatisticsModalProps {
  session: SessionState;
  onReset?: () => void;
  onClose?: () => void;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({ session, onReset, onClose }) => {
  const { participants, totalExpected, orgName } = session;
  const count = participants.length;
  const target = totalExpected > 0 ? totalExpected : 1;
  const rawPercentage = Math.round((count / target) * 100);
  const displayPercentage = Math.min(100, Math.max(0, rawPercentage));

  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    soundManager.playSuccessSound();

    try {
      // Subtle Apple-style celebratory particles
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ffffff', '#a1a1aa', '#38bdf8']
      });
    } catch {
      // safe fallback
    }

    // Number counting animation
    let startTimestamp: number | null = null;
    const duration = 1500;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setAnimatedPercent(Math.round(easedProgress * displayPercentage));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [displayPercentage]);

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "STT,Ho va Ten,Thoi gian diem danh\n"
      + participants.map((p, idx) => `${idx + 1},"${p.name}","${new Date(p.timestamp).toLocaleTimeString('vi-VN')}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `diem_danh_${orgName || 'to_chuc'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const absentCount = Math.max(0, totalExpected - count);

  // SVG circular gauge
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercent / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
      {/* Subtle vignette backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
      />

      {/* Main Apple-style Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="relative w-full max-w-lg apple-glass-card rounded-[32px] p-8 shadow-2xl text-white z-50 overflow-hidden"
      >
        {/* Close Button Top Right */}
        {onClose && (
          <button
            onClick={onClose}
            title="Đóng bảng thống kê"
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.08] text-zinc-300 text-[11px] font-medium tracking-tight mb-3">
            Kết quả điểm danh
          </div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            {orgName || 'Tổ chức'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Tổng kết số lượng và tỷ lệ người tham gia
          </p>
        </div>

        {/* Circular Gauge & Stats Section */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-6 py-5 px-6 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
          {/* Apple Watch Style Activity Ring */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-zinc-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-white transition-all duration-300 ease-out"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold tracking-tight text-white font-mono">
                {animatedPercent}%
              </span>
              <span className="text-[10px] font-medium text-zinc-400 tracking-tight">
                Hoàn thành
              </span>
            </div>
          </div>

          {/* Quick Metrics Breakdown */}
          <div className="flex-1 space-y-2.5 w-full">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-zinc-300 font-medium">Đã điểm danh</span>
              </div>
              <span className="text-xs font-semibold text-white font-mono">
                {count} người ({rawPercentage}%)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-300 font-medium">Tổng thành viên</span>
              </div>
              <span className="text-xs font-semibold text-white font-mono">
                {totalExpected} người
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <div className="flex items-center gap-2.5">
                <UserX className="w-4 h-4 text-zinc-500" />
                <span className="text-xs text-zinc-400 font-medium">Chưa tham gia</span>
              </div>
              <span className="text-xs font-semibold text-zinc-400 font-mono">
                {absentCount} người
              </span>
            </div>
          </div>
        </div>

        {/* Recent Participants Chip List */}
        {participants.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-2">
              <span>Danh sách tham gia ({participants.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              {participants.slice(-20).map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/[0.08] text-zinc-200 border border-white/[0.06]"
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Apple Style Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
          <button
            onClick={handleExportCSV}
            className="apple-btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5 text-zinc-300" />
            <span>Xuất file Excel</span>
          </button>

          <div className="flex items-center gap-2">
            {onReset && (
              <button
                onClick={onReset}
                className="apple-btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                <span>Làm mới</span>
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="apple-btn-primary px-5 py-2.5 rounded-full text-xs font-semibold"
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
