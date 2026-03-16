import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './context/I18nContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { PendingApproval } from './pages/PendingApproval';
import { CompleteProfile } from './pages/Store/CompleteProfile';


// Store Pages
import { StoreProfile, StoreDocuments } from './pages/Store';

// Product Pages
import { ProductList } from './pages/Products/ProductList';
import { ProductCreate } from './pages/Products/ProductCreate';
import { ProductEdit } from './pages/Products/ProductEdit';
import { ProductDetail } from './pages/Products/ProductDetail';

// Order Pages
import { OrderList } from './pages/Orders/OrderList';
import { OrderDetail } from './pages/Orders/OrderDetail';
import { OrderAccept } from './pages/Orders/OrderAccept';
import { PackingSlip } from './pages/Orders/PackingSlip';
import { PrintLabel } from './pages/Orders/PrintLabel';

// Shipping Pages
import { HandoverList } from './pages/Shipping/HandoverList';
import { ReadyForPickup } from './pages/Shipping/ReadyForPickup';
import { PackageDetails } from './pages/Shipping/PackageDetails';
import { TrackingInfo } from './pages/Shipping/TrackingInfo';
import { PickupSchedule } from './pages/Shipping/PickupSchedule';

// Wallet Pages
import { WalletOverview } from './pages/Wallet/WalletOverview';
import { Transactions } from './pages/Wallet/Transactions';
import { PayoutRequests } from './pages/Wallet/PayoutRequests';
import { RequestPayout } from './pages/Wallet/RequestPayout';
import { PayoutDetail } from './pages/Wallet/PayoutDetail';

// Staff Pages
import { StaffList } from './pages/Staff/StaffList';
import { InviteStaff } from './pages/Staff/InviteStaff';
import { ActivityLog } from './pages/Staff/ActivityLog';
import { StaffDetail } from './pages/Staff/StaffDetail';
import { EditStaff } from './pages/Staff/EditStaff';

// Support Pages
import { TicketList } from './pages/Support/TicketList';
import { TicketDetail } from './pages/Support/TicketDetail';
import { CreateTicket } from './pages/Support/CreateTicket';
import { Disputes } from './pages/Support/Disputes';
import { DisputeDetail } from './pages/Support/DisputeDetail';

// Analytics Pages
import { AnalyticsDashboard } from './pages/Analytics/AnalyticsDashboard';
import { SalesReport } from './pages/Analytics/SalesReport';
import { TopProducts } from './pages/Analytics/TopProducts';
import { Performance } from './pages/Analytics/Performance';

import { Settings } from './pages/Settings/Settings';
import { Announcements } from './pages/Announcements';
import { Notifications } from './pages/Notifications';
import { Promotions } from './pages/Promotions';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { vendor, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'var(--primary-bg)'
      }}>
        <div className="loading-spinner" style={{ width: '50px', height: '50px' }} />
      </div>
    );
  }

  // Allow access to complete profile even without vendor
  if (window.location.pathname === '/store/complete-profile') {
    return <>{children}</>;
  }

  return vendor ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ThemeProvider>
      <I18nProvider>
        <BrowserRouter>
          <Toaster 
            position="top-right"
            toastOptions={{
              success: {
                style: {
                  background: 'var(--accent-green)',
                  color: 'white',
                },
              },
              error: {
                style: {
                  background: 'var(--accent-red)',
                  color: 'white',
                },
              },
            }}
          />
          
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route
            path="/store/complete-profile"
            element={
              <ProtectedRoute>
                <CompleteProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pending-approval"
            element={
              <ProtectedRoute>
                <PendingApproval />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Store Management */}
            <Route path="store">
              <Route index element={<StoreProfile />} />
              <Route path="documents" element={<StoreDocuments />} />
            </Route>

            {/* Products */}
            <Route path="products">
              <Route index element={<ProductList />} />
              <Route path="create" element={<ProductCreate />} />
              <Route path=":id" element={<ProductDetail />} />
              <Route path=":id/edit" element={<ProductEdit />} />
            </Route>

            {/* Orders */}
            <Route path="orders">
              <Route index element={<OrderList />} />
              <Route path=":id" element={<OrderDetail />} />
              <Route path=":id/accept" element={<OrderAccept />} />
              <Route path=":id/packing-slip" element={<PackingSlip />} />
              <Route path=":id/print-label" element={<PrintLabel />} />
            </Route>

            {/* Shipping */}
            <Route path="shipping">
              <Route index element={<HandoverList />} />
              <Route path=":id" element={<PackageDetails />} />
              <Route path=":id/ready" element={<ReadyForPickup />} />
              <Route path=":id/tracking" element={<TrackingInfo />} />
              <Route path=":id/tracking/edit" element={<TrackingInfo />} />
              <Route path=":id/pickup" element={<PickupSchedule />} />
            </Route>

            {/* Wallet */}
            <Route path="wallet">
              <Route index element={<WalletOverview />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="payouts" element={<PayoutRequests />} />
              <Route path="payouts/:id" element={<PayoutDetail />} />
              <Route path="request-payout" element={<RequestPayout />} />
            </Route>

            <Route path="promotions" element={<Promotions />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="notifications" element={<Notifications />} />

            {/* Staff */}
            <Route path="staff">
              <Route index element={<StaffList />} />
              <Route path="invite" element={<InviteStaff />} />
              <Route path="activity" element={<ActivityLog />} />
              <Route path=":id" element={<StaffDetail />} />
              <Route path=":id/edit" element={<EditStaff />} />
            </Route>

            {/* Support */}
            <Route path="support">
              <Route index element={<TicketList />} />
              <Route path="new" element={<CreateTicket />} />
              <Route path=":id" element={<TicketDetail />} />
              <Route path="disputes" element={<Disputes />} />
              <Route path="disputes/:id" element={<DisputeDetail />} />
            </Route>

            {/* Analytics */}
            <Route path="analytics">
              <Route index element={<AnalyticsDashboard />} />
              <Route path="sales" element={<SalesReport />} />
              <Route path="products" element={<TopProducts />} />
              <Route path="performance" element={<Performance />} />
            </Route>

            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
