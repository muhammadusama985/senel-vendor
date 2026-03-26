import React, { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  ChevronDownIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

type NavItem = {
  key?: string;
  label?: string;
  path: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: NavItem[];
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
  {
    key: 'support',
    path: '/support',
    icon: LifebuoyIcon,
    children: [
      { label: 'Support Tickets', path: '/support', icon: TicketIcon },
      { label: 'Disputes', path: '/support/disputes', icon: ExclamationTriangleIcon },
    ],
  },
  { key: 'settings', path: '/settings', icon: Cog6ToothIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isMobile }) => {
  const drawerWidth = 260;
  const { colors } = useTheme();
  const { t } = useI18n();
  const location = useLocation();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    support: true,
  });

  const supportOpen = useMemo(
    () => location.pathname.startsWith('/support'),
    [location.pathname]
  );

  const getItemLabel = (item: NavItem) => {
    if (item.label) return item.label;
    return item.key ? t(item.key as any) : item.path;
  };

  const isItemActive = (item: NavItem, exact = false) => {
    if (exact) return location.pathname === item.path;
    return item.path !== '/' && location.pathname.startsWith(item.path);
  };

  const renderLink = (item: NavItem, level = 0) => {
    const Icon = item.icon;
    const exact = level > 0 || !item.children;
    const active = item.children ? supportOpen : isItemActive(item, exact);

    return (
      <NavLink
        to={item.path}
        end={exact}
        onClick={() => {
          if (isMobile) onClose();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: level === 0 ? '0.85rem 1rem' : '0.7rem 1rem 0.7rem 3rem',
          marginBottom: '0.35rem',
          marginRight: '16px',
          borderRadius: '0 20px 20px 0',
          textDecoration: 'none',
          color: active ? '#ffffff' : colors.text,
          background: active ? colors.buttonGradient : 'transparent',
          borderLeft: active ? '4px solid #5B2EFF' : '4px solid transparent',
          boxShadow: active ? '0 10px 24px rgba(91,46,255,0.22)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        {Icon ? (
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
        ) : (
          <span style={{ width: '24px' }} />
        )}

        <span style={{ fontSize: level === 0 ? '1rem' : '0.95rem', color: 'inherit' }}>{getItemLabel(item)}</span>
      </NavLink>
    );
  };

  const navContent = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', padding: '16px 0' }}>
        <div>
          {navigation.map((item) => {
            const Icon = item.icon;

            if (!item.children) {
              return (
                <div key={item.path} style={{ paddingLeft: 0 }}>
                  {renderLink(item)}
                </div>
              );
            }

            const isGroupOpen = (openGroups[item.key || item.path] ?? false) || supportOpen;
            const isGroupActive = supportOpen;

            return (
              <div key={item.path} style={{ paddingLeft: 0 }}>
                <button
                  type="button"
                  onClick={() =>
                    setOpenGroups((prev) => ({
                      ...prev,
                      [item.key || item.path]: !(prev[item.key || item.path] ?? false),
                    }))
                  }
                  style={{
                    width: 'calc(100% - 16px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.85rem 1rem',
                    marginBottom: '0.35rem',
                    marginRight: '16px',
                    borderRadius: '0 20px 20px 0',
                    color: isGroupActive ? '#ffffff' : colors.text,
                    background: isGroupActive ? colors.buttonGradient : 'transparent',
                    borderLeft: isGroupActive ? '4px solid #5B2EFF' : '4px solid transparent',
                    boxShadow: isGroupActive ? '0 10px 24px rgba(91,46,255,0.22)' : 'none',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderTop: 'none',
                    borderRight: 'none',
                    borderBottom: 'none',
                  }}
                >
                  {Icon ? (
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
                  ) : null}

                  <span style={{ flex: 1, fontSize: '1rem', color: 'inherit' }}>{getItemLabel(item)}</span>
                  {isGroupOpen ? (
                    <ChevronDownIcon width={18} height={18} />
                  ) : (
                    <ChevronRightIcon width={18} height={18} />
                  )}
                </button>

                {isGroupOpen && (
                  <div style={{ marginTop: '0.2rem' }}>
                    {item.children.map((child) => (
                      <div key={child.path}>{renderLink(child, 1)}</div>
                    ))}
                  </div>
                )}
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
