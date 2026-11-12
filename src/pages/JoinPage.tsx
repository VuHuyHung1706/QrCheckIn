import React, { useState, useEffect } from 'react';
import { socket } from '../services/socket';
import { SessionState } from '../types';
import { Check, ArrowLeft, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const JoinPage: React.FC = () => {
  const [session, setSession] = useState<SessionState>({
    status: 'idle',
    totalExpected: 50,
    duration: 60,
    timeLeft: 60,
    orgName: 'Tổ chức',
    participants: [],
    joinUrl: ''
  });

  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    socket.on('state:sync', (updatedState: SessionState) => {
      setSession(updatedState);
    });

    socket.on('timer:tick', ({ timeLeft }: { timeLeft: number }) => {
      setSession(prev => ({ ...prev, timeLeft }));
    });

    return () => {
      socket.off('state:sync');
      socket.off('timer:tick');
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage('Vui lòng nhập họ và tên của bạn');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    socket.emit('participant:submit', { name: trimmed });

    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      setSubmittedName(trimmed);
    }, 250);
  };

  const handleReset = () => {
    setName('');
    setSubmitted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-4 relative font-sans">
      {/* Main Apple Card */}
      <div className="relative w-full max-w-md apple-glass-card rounded-[32px] p-8 shadow-2xl">
        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/[0.08] text-zinc-300 text-[11px] font-medium tracking-tight mb-3">
            Điểm danh trực tiếp
          </div>

          <h1 className="text-2xl font-semibold text-white tracking-tight">
            {session.orgName || 'Check-in'}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Nhập tên của bạn để tên xuất hiện trên màn hình
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="mb-6 flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${session.status === 'running' ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
            <span className="font-medium text-zinc-300">
              {session.status === 'running'
                ? 'Đang mở điểm danh'
                : session.status === 'ended'
                ? 'Đã hết giờ'
                : 'Sẵn sàng'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>{formatTime(session.timeLeft)}</span>
          </div>
        </div>

        {/* Body Content */}
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="text-center py-4 space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-white/10 text-white flex items-center justify-center mx-auto border border-white/20">
                <Check className="w-7 h-7 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white">Điểm danh thành công</h3>
                <p className="text-sm text-zinc-400 mt-0.5">
                  Xin chào, {submittedName}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-xs text-zinc-300 leading-relaxed">
                Tên của bạn đang bay lên màn hình livestream. Hãy chú ý theo dõi nhé!
              </div>

              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition pt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Gửi lại với tên khác
              </button>
            </motion.div>
          ) : session.status === 'ended' ? (
            <motion.div
              key="ended"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6 space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-white/[0.06] text-zinc-400 flex items-center justify-center mx-auto border border-white/[0.08]">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Thời gian điểm danh đã kết thúc</h3>
              <p className="text-xs text-zinc-400">
                Hệ thống đã đóng tiếp nhận và chuyển sang tổng kết số liệu trên màn hình livestream.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên của bạn"
                  autoFocus
                  maxLength={40}
                  className="w-full px-4 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-700/60 text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white text-sm transition"
                />
                {errorMessage && (
                  <p className="text-xs text-rose-400 mt-2">
                    {errorMessage}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl apple-btn-primary font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Gửi điểm danh</span>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
