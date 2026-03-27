import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import api from '../../api/client';
import { StatsWidget } from './widgets/StatsWidget';
import { RecentOrdersWidget } from './widgets/RecentOrdersWidget';
import { LowStockWidget } from './widgets/LowStockWidget';
import { EarningsWidget } from './widgets/EarningsWidget';

export const Dashboard: React.FC = () => {
  const { vendor } = useAuthStore();
  const { colors } = useTheme();
  const { t } = useI18n();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    lowStockCount: 0,
    walletBalance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, productsRes, lowStockRes, walletRes] = await Promise.all([
          api.get('/vendor-orders/me?limit=1'),
          api.get('/products/me?limit=1'),
          api.get('/vendor/inventory/low-stock'),
          api.get('/wallet/me'),
        ]);

        setStats({
          totalOrders: ordersRes.data.total || 0,
          pendingOrders: ordersRes.data.items?.filter((o: any) => o.status === 'placed').length || 0,
          totalProducts: productsRes.data.total || 0,
          lowStockCount: lowStockRes.data.total || lowStockRes.data.items?.length || 0,
          walletBalance: walletRes.data.wallet?.balance || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '3rem',
          color: colors.text,
          backgroundColor: colors.primary,
          minHeight: '100vh',
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: colors.primary,
        minHeight: '100vh',
        padding: '2rem',
        border: `1px solid ${colors.border}`,
        borderRadius: '10px',
      }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            color: colors.text,
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
          }}
        >
          {t('welcomeBack')}, {vendor?.storeName}!
        </h1>

        <p style={{ color: colors.textMuted }}>{t('dashboardSubtitle')}</p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <StatsWidget title={t('totalOrders')} value={stats.totalOrders} icon="📦" color="#4dabf7" />
        <StatsWidget title={t('pendingOrders')} value={stats.pendingOrders} icon="⏳" color="#ffa94d" />
        <StatsWidget title={t('productCount')} value={stats.totalProducts} icon="🛍️" color="#b197fc" />
        <StatsWidget title={t('lowStock')} value={stats.lowStockCount} icon="⚠️" color={stats.lowStockCount > 0 ? '#ff6b6b' : '#51cf66'} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1.5rem',
        }}
      >
        <div style={{ gridColumn: 'span 2' }}>
          <RecentOrdersWidget />
        </div>

        <div>
          <EarningsWidget balance={stats.walletBalance} />
        </div>

        <div>
          <LowStockWidget />
        </div>
      </div>
    </div>
  );
};
