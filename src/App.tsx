import React, { useState, useEffect } from 'react';
import { OverlayPage } from './pages/OverlayPage';
import { JoinPage } from './pages/JoinPage';
import { AdminPage } from './pages/AdminPage';
import { Tv, Smartphone, SlidersHorizontal, EyeOff } from 'lucide-react';

export const App: React.FC = () => {
  // Determine current page based on pathname
  const getInitialPage = (): 'overlay' | 'join' | 'admin' => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('join')) return 'join';
    if (path.includes('admin')) return 'admin';
    return 'overlay';
  };

  const [currentPage, setCurrentPage] = useState<'overlay' | 'join' | 'admin'>(getInitialPage);
  const [showNav, setShowNav] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return !params.has('obs');
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getInitialPage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page: 'overlay' | 'join' | 'admin') => {
    setCurrentPage(page);
    const targetPath = page === 'overlay' ? '/' : `/${page}`;
    window.history.pushState({}, '', targetPath);
  };

  return (
    <div className="relative min-h-screen">
      {/* Top Floating Navigation Switcher for easy testing & previewing */}
      {showNav && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/15 shadow-2xl text-xs">
          <button
            onClick={() => navigateTo('overlay')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
              currentPage === 'overlay'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Màn Hình OBS</span>
          </button>

          <button
            onClick={() => navigateTo('join')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
              currentPage === 'join'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Điểm Danh (Mobile)</span>
          </button>

          <button
            onClick={() => navigateTo('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
              currentPage === 'admin'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Bảng Điều Khiển</span>
          </button>

          <button
            onClick={() => setShowNav(false)}
            title="Ẩn thanh chuyển trang khi chèn vào OBS"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition ml-1"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Pages */}
      {currentPage === 'overlay' && <OverlayPage />}
      {currentPage === 'join' && <JoinPage />}
      {currentPage === 'admin' && <AdminPage />}
    </div>
  );
};

export default App;
