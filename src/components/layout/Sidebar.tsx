import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import {
  ChartBarIcon,
  BuildingStorefrontIcon,
  CubeIcon,
  ShoppingCartIcon,
  TruckIcon,
  WalletIcon,
  TicketIcon,
  MegaphoneIcon,
  BellIcon,
  PresentationChartLineIcon,
  UsersIcon,
  LifebuoyIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

type NavItem = {
  key: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const navigation: NavItem[] = [
  { key: 'dashboard', path: '/dashboard', icon: ChartBarIcon },
  { key: 'store', path: '/store', icon: BuildingStorefrontIcon },
  { key: 'products', path: '/products', icon: CubeIcon },
  { key: 'orders', path: '/orders', icon: ShoppingCartIcon },
  { key: 'shipping', path: '/shipping', icon: TruckIcon },
  { key: 'wallet', path: '/wallet', icon: WalletIcon },
  { key: 'promotions', path: '/promotions', icon: TicketIcon },
  { key: 'announcements', path: '/announcements', icon: MegaphoneIcon },
  { key: 'notifications', path: '/notifications', icon: BellIcon },
  { key: 'analytics', path: '/analytics', icon: PresentationChartLineIcon },
  { key: 'staff', path: '/staff', icon: UsersIcon },
  { key: 'support', path: '/support', icon: LifebuoyIcon },
  { key: 'settings', path: '/settings', icon: Cog6ToothIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isMobile }) => {
  const drawerWidth = 260;
  const { colors } = useTheme();
  const { t } = useI18n();

  const navContent = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', padding: '16px 0' }}>
        <div>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.path} style={{ paddingLeft: 0 }}>
                <NavLink
                  to={item.path}
                  onClick={() => {
                    if (isMobile) onClose();
                  }}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.85rem 1rem',
                    marginBottom: '0.35rem',
                    marginRight: '16px',
                    borderRadius: '0 20px 20px 0',
                    textDecoration: 'none',
                    color: isActive ? '#ffffff' : colors.text,
                    background: isActive ? colors.buttonGradient : 'transparent',
                    borderLeft: isActive ? '4px solid #5B2EFF' : '4px solid transparent',
                    boxShadow: isActive ? '0 10px 24px rgba(91,46,255,0.22)' : 'none',
                    transition: 'all 0.2s ease',
                  })}
                  onMouseEnter={(e) => {
                    const active = e.currentTarget.getAttribute('aria-current') === 'page';
                    if (!active) e.currentTarget.style.backgroundColor = colors.sidebarHover;
                  }}
                  onMouseLeave={(e) => {
                    const active = e.currentTarget.getAttribute('aria-current') === 'page';
                    if (!active) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span
                    style={{
                      minWidth: '24px',
                      color: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon width={20} height={20} strokeWidth={2} />
                  </span>

                  <span style={{ fontSize: '1rem', color: 'inherit' }}>{t(item.key as any)}</span>
                </NavLink>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          flexShrink: 0,
          padding: '16px',
          borderTop: `1px solid ${colors.border}`,
          textAlign: 'center',
        }}
      >
        <span style={{ color: colors.text, fontSize: '0.75rem', opacity: 0.85 }}>Version 1.0.0</span>
      </div>
    </div>
  );

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1099,
            display: isMobile ? 'block' : 'none',
          }}
        />
      )}

      {isOpen && (
        <aside
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            bottom: 0,
            width: `${drawerWidth}px`,
            height: 'calc(100% - 64px)',
            background: colors.headerBg,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
            color: colors.text,
            zIndex: 1100,
            overflow: 'hidden',
            display: isMobile ? 'block' : 'none',
          }}
        >
          {navContent}
        </aside>
      )}

      <aside
        style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          bottom: 0,
          width: `${drawerWidth}px`,
          background: colors.headerBg,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
          color: colors.text,
          borderRight: `1px solid ${colors.border}`,
          overflow: 'hidden',
          display: isMobile ? 'none' : 'block',
          zIndex: 1000,
        }}
      >
        {navContent}
      </aside>
    </>
  );
};
