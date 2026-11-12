import React, { useState, useEffect } from 'react';
import { OverlayPage } from './pages/OverlayPage';
import { JoinPage } from './pages/JoinPage';
import { AdminPage } from './pages/AdminPage';

export const App: React.FC = () => {
  // Determine current page based on pathname
  const getInitialPage = (): 'overlay' | 'join' | 'admin' => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('join')) return 'join';
    if (path.includes('admin')) return 'admin';
    return 'overlay';
  };

  const [currentPage, setCurrentPage] = useState<'overlay' | 'join' | 'admin'>(getInitialPage);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getInitialPage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* 
        TUYỆT ĐỐI KHÔNG HIỂN THỊ THANH ĐIỀU HƯỚNG TRÊN GIAO DIỆN ĐIỂM DANH:
        Khán giả quét mã QR vào /join chỉ thấy duy nhất giao diện điểm danh của họ,
        không thể thấy hay can thiệp vào Màn hình OBS hoặc Bảng điều khiển Admin.
      */}

      {/* Pages Router */}
      {currentPage === 'overlay' && <OverlayPage />}
      {currentPage === 'join' && <JoinPage />}
      {currentPage === 'admin' && <AdminPage />}
    </div>
  );
};

export default App;
