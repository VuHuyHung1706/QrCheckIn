import React, { useState, useEffect } from 'react';
import { socket } from '../services/socket';
import { SessionState } from '../types';
import { 
  Play, Pause, RotateCcw, Save, Users, Clock, Building2, 
  UserPlus, Download, CheckCircle2, Copy, Check, ExternalLink, HelpCircle 
} from 'lucide-react';

const RANDOM_NAMES = [
  'Nguyễn Văn An', 'Trần Thị Mai', 'Lê Minh Tuấn', 'Phạm Quỳnh Chi',
  'Hoàng Đức Thắng', 'Vũ Khánh Huyền', 'Đỗ Minh Đức', 'Ngô Bảo Châu',
  'Bùi Gia Huy', 'Đinh Thảo Linh', 'Trương Tuấn Anh', 'Võ Hoài Nam',
  'Nguyễn Thùy Dương', 'Lý Hải Đăng', 'Phan Thanh Tùng', 'Hồ Ngọc Mai'
];

export const AdminPage: React.FC = () => {
  const [session, setSession] = useState<SessionState>({
    status: 'idle',
    totalExpected: 50,
    duration: 60,
    timeLeft: 60,
    orgName: 'Tổ chức',
    participants: [],
    joinUrl: ''
  });

  const [orgNameInput, setOrgNameInput] = useState('');
  const [totalExpectedInput, setTotalExpectedInput] = useState(50);
  const [durationInput, setDurationInput] = useState(60);
  const [copiedLink, setCopiedLink] = useState<'obs' | 'join' | null>(null);

  useEffect(() => {
    socket.on('state:sync', (updatedState: SessionState) => {
      setSession(updatedState);
      setOrgNameInput(updatedState.orgName);
      setTotalExpectedInput(updatedState.totalExpected);
      setDurationInput(updatedState.duration);
    });

    socket.on('timer:tick', ({ timeLeft }: { timeLeft: number }) => {
      setSession(prev => ({ ...prev, timeLeft }));
    });

    return () => {
      socket.off('state:sync');
      socket.off('timer:tick');
    };
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    socket.emit('session:config', {
      orgName: orgNameInput,
      totalExpected: Number(totalExpectedInput),
      duration: Number(durationInput)
    });
    alert('Đã lưu cấu hình!');
  };

  const handleStart = () => socket.emit('session:start');
  const handlePause = () => socket.emit('session:pause');
  const handleReset = () => socket.emit('session:reset');

  const handleSimulateOne = () => {
    const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    socket.emit('participant:submit', { name: randomName });
  };

  const handleSimulateBatch = (count: number = 5) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
        socket.emit('participant:submit', { name: `${randomName} (${i + 1})` });
      }, i * 350);
    }
  };

  const copyToClipboard = (text: string, type: 'obs' | 'join') => {
    navigator.clipboard.writeText(text);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "STT,Ho va Ten,Thoi gian diem danh\n"
      + session.participants.map((p, idx) => `${idx + 1},"${p.name}","${new Date(p.timestamp).toLocaleTimeString('vi-VN')}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `danh_sach_${session.orgName || 'diem_danh'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const obsUrl = `${window.location.origin}/`;
  const joinUrl = session.joinUrl || `${window.location.origin}/join`;
  const percentage = session.totalExpected > 0 ? Math.round((session.participants.length / session.totalExpected) * 100) : 0;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-2.5">
              <span>Bảng điều khiển điểm danh</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Quản lý thời gian quét mã QR, cấu hình thành viên tổ chức và dữ liệu trực tiếp.
            </p>
          </div>

          {/* Quick Status Pill */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 bg-white/[0.08] text-zinc-300 border border-white/[0.06]">
              <span className={`w-2 h-2 rounded-full ${session.status === 'running' ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
              {session.status === 'running' ? 'Đang chạy' : session.status === 'ended' ? 'Đã kết thúc' : 'Sẵn sàng'}
            </span>

            <div className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs font-mono text-zinc-300">
              Còn lại: {session.timeLeft}s
            </div>
          </div>
        </div>

        {/* Real-time Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-[22px] apple-glass-card">
            <div className="text-xs font-medium text-zinc-400 mb-2 flex items-center justify-between">
              <span>Đã điểm danh</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-semibold text-white font-mono tracking-tight">
              {session.participants.length} <span className="text-xs font-normal text-zinc-400">người</span>
            </div>
          </div>

          <div className="p-5 rounded-[22px] apple-glass-card">
            <div className="text-xs font-medium text-zinc-400 mb-2 flex items-center justify-between">
              <span>Tổng thành viên</span>
              <Building2 className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-3xl font-semibold text-white font-mono tracking-tight">
              {session.totalExpected} <span className="text-xs font-normal text-zinc-400">người</span>
            </div>
          </div>

          <div className="p-5 rounded-[22px] apple-glass-card">
            <div className="text-xs font-medium text-zinc-400 mb-2 flex items-center justify-between">
              <span>Tỷ lệ tham gia</span>
              <span className="text-xs text-zinc-500 font-mono">%</span>
            </div>
            <div className="text-3xl font-semibold text-white font-mono tracking-tight">
              {percentage}%
            </div>
          </div>

          <div className="p-5 rounded-[22px] apple-glass-card">
            <div className="text-xs font-medium text-zinc-400 mb-2 flex items-center justify-between">
              <span>Thời gian cài đặt</span>
              <Clock className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-3xl font-semibold text-white font-mono tracking-tight">
              {session.duration} <span className="text-xs font-normal text-zinc-400">giây</span>
            </div>
          </div>
        </div>

        {/* URLs & OBS Link Helper */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* OBS Browser Source URL */}
          <div className="p-5 rounded-[24px] apple-glass-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                Link Browser Source cho OBS
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Nền trong suốt</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={obsUrl}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700/60 text-xs font-mono text-zinc-200 select-all"
              />
              <button
                onClick={() => copyToClipboard(obsUrl, 'obs')}
                className="apple-btn-secondary px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1 shrink-0"
              >
                {copiedLink === 'obs' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink === 'obs' ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">
              Thêm nguồn <strong>Browser</strong> trong OBS, dán link trên, chỉnh kích thước <strong>1920 x 1080</strong>.
            </p>
          </div>

          {/* Attendee QR Code Target URL */}
          <div className="p-5 rounded-[24px] apple-glass-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                Link nhập tên (Mã QR sẽ mở link này)
              </span>
              <a
                href={joinUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-zinc-400 hover:text-white hover:underline flex items-center gap-1"
              >
                Mở thử <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={joinUrl}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700/60 text-xs font-mono text-zinc-200 select-all"
              />
              <button
                onClick={() => copyToClipboard(joinUrl, 'join')}
                className="apple-btn-secondary px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1 shrink-0"
              >
                {copiedLink === 'join' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink === 'join' ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">
              Điện thoại kết nối chung Wi-Fi có thể quét mã QR trên màn hình livestream để truy cập ngay.
            </p>
          </div>
        </div>

        {/* Control and Configuration Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section 1: Session Controls & Simulations */}
          <div className="p-6 rounded-[28px] apple-glass-card space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Play className="w-3.5 h-3.5 text-zinc-400" />
              Thao tác phiên
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {session.status !== 'running' ? (
                <button
                  onClick={handleStart}
                  className="col-span-2 py-3 rounded-full apple-btn-primary font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Bắt đầu đếm ngược
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="col-span-2 py-3 rounded-full apple-btn-secondary font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  Tạm dừng
                </button>
              )}

              <button
                onClick={handleReset}
                className="col-span-2 py-2.5 rounded-full apple-btn-secondary font-medium text-xs flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Làm mới toàn bộ
              </button>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <div className="text-xs font-medium text-zinc-400 mb-2">
                Mô phỏng thử nghiệm nhanh
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleSimulateOne}
                  className="w-full py-2 px-3 rounded-full apple-btn-secondary text-xs font-medium flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-3.5 h-3.5 text-zinc-400" />
                  + Giả lập 1 người nhập tên
                </button>
                <button
                  onClick={() => handleSimulateBatch(5)}
                  className="w-full py-2 px-3 rounded-full apple-btn-secondary text-xs font-medium flex items-center justify-center gap-2"
                >
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  + Giả lập 5 người cùng bay bóng
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Configuration Form */}
          <div className="p-6 rounded-[28px] apple-glass-card space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Save className="w-3.5 h-3.5 text-zinc-400" />
              Cài đặt thông số
            </h3>

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Tên tổ chức / Chương trình
                </label>
                <input
                  type="text"
                  value={orgNameInput}
                  onChange={(e) => setOrgNameInput(e.target.value)}
                  placeholder="Ví dụ: Công ty / Team"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/60 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Tổng số thành viên của tổ chức
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalExpectedInput}
                  onChange={(e) => setTotalExpectedInput(Number(e.target.value))}
                  placeholder="50"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/60 text-xs text-white focus:outline-none focus:border-white font-mono"
                />
                <span className="text-[10px] text-zinc-500">
                  Dùng để tính % số người đã nhập trên tổng số khi kết thúc
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Thời gian quét mã QR (giây)
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={durationInput}
                  onChange={(e) => setDurationInput(Number(e.target.value))}
                  placeholder="60"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/60 text-xs text-white focus:outline-none focus:border-white font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-full apple-btn-primary text-xs font-semibold mt-2"
              >
                Lưu thay đổi
              </button>
            </form>
          </div>

          {/* Section 3: OBS Instructions */}
          <div className="p-6 rounded-[28px] apple-glass-card space-y-3">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
              Hướng dẫn OBS
            </h3>
            <ol className="text-xs text-zinc-400 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Mở <strong>OBS Studio</strong>.</li>
              <li>Trong ô <strong>Sources</strong>, chọn <strong>Browser</strong>.</li>
              <li>Đặt tên (ví dụ: <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">QR Check-in</code>).</li>
              <li>Dán đường link: <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">{obsUrl}</code>.</li>
              <li>Cài đặt Width: <strong>1920</strong>, Height: <strong>1080</strong>.</li>
              <li>Tích chọn <em>"Shutdown source when not visible"</em>.</li>
              <li>Nhấn <strong>OK</strong>. Toàn bộ nền sẽ trong suốt tự nhiên!</li>
            </ol>
          </div>
        </div>

        {/* Real-time Attendees List Table */}
        <div className="p-6 rounded-[28px] apple-glass-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Danh sách đã điểm danh ({session.participants.length} người)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Cập nhật tức thì khi có người gửi tên
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={session.participants.length === 0}
              className="apple-btn-secondary flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium disabled:opacity-30"
            >
              <Download className="w-3.5 h-3.5" />
              Xuất file Excel/CSV
            </button>
          </div>

          {session.participants.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
              Chưa có ai điểm danh trong phiên hiện tại.
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/90 text-zinc-400 font-medium sticky top-0">
                  <tr>
                    <th className="p-3 w-16">STT</th>
                    <th className="p-3">Họ và Tên</th>
                    <th className="p-3 text-right">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {session.participants.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-white/[0.03] transition">
                      <td className="p-3 font-mono text-zinc-500">{idx + 1}</td>
                      <td className="p-3 font-medium text-white">
                        {p.name}
                      </td>
                      <td className="p-3 text-right font-mono text-zinc-500">
                        {new Date(p.timestamp).toLocaleTimeString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
