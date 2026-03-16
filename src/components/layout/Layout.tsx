import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { colors } = useTheme();
  const { isLoading } = useAuthStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
      if (window.innerWidth >= 900) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const drawerWidth = 260;

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: colors.text,
          background: colors.pageBg,
        }}
      >
        <div className="loading-spinner" style={{ width: '50px', height: '50px' }} />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        color: colors.text,
        background: colors.pageBg,
      }}
    >
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />

      <div
        style={{
          flexGrow: 1,
          width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
          marginLeft: isMobile ? 0 : `${drawerWidth}px`,
          marginTop: '64px',
          backgroundColor: 'transparent',
        }}
      >
        <main
          style={{
            flexGrow: 1,
            padding: isMobile ? '16px' : '24px',
            minHeight: 'calc(100vh - 64px)',
            backgroundColor: 'transparent',
            color: colors.text,
          }}
        >
          <div style={{ height: '16px' }} />
          <div
            className="vendor-page-content"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: isMobile ? '14px' : '20px',
              minHeight: 'calc(100vh - 128px)',
              overflowX: 'auto',
            }}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
