import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { queryClient } from './lib/react-query';
import { useAppDispatch, useAppSelector } from './hooks/useRedux';
import { getCurrentUser } from './features/auth/authSlice';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Learn } from './pages/Learn';
import { Stats } from './pages/Stats';
import { Profile } from './pages/Profile';
import { Explore } from './pages/Explore';
import { Bookmarks } from './pages/Bookmarks';
import { History } from './pages/History';

// Admin Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { QuestionManagement } from './pages/admin/QuestionManagement';
import { UserManagement } from './pages/admin/UserManagement';
import { Analytics } from './pages/admin/Analytics';
import { PostsManagement } from './pages/admin/PostsManagement';

// Components
import { BottomNav } from './components/layout/BottomNav';
import { Loader } from './components/common/Loader';

// ==================== PROTECTED ROUTE COMPONENT ====================
interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
}) => {
  const { isAuthenticated, isLoading, user } = useAppSelector(
    (state) => state.auth
  );

  // DEBUG LOGS
  console.log('🔐 ProtectedRoute Check:', {
    path: window.location.pathname,
    isAuthenticated,
    isLoading,
    username: user?.username,
    isAdmin: user?.isAdmin,
    adminOnly,
    willRedirect: !isAuthenticated ? 'to /login' : (adminOnly && !user?.isAdmin) ? 'to /home' : 'allowed',
  });

  // Show loader while checking authentication
  if (isLoading) {
    console.log('⏳ Auth loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if admin access required but user is not admin
  if (adminOnly && !user?.isAdmin) {
    console.log('❌ Admin access required but user is not admin, redirecting to /home');
    return <Navigate to="/home" replace />;
  }

  console.log('✅ Access granted!');
  return <>{children}</>;
};


// ==================== APP LAYOUT WITH BOTTOM NAV ====================
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
};

// ==================== APP CONTENT ====================
const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [token, isAuthenticated, dispatch]);

  return (
    <>
      <Routes>
        {/* ==================== PUBLIC ROUTES ==================== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ==================== PROTECTED USER ROUTES ==================== */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Home />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Learn />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Stats />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Explore />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Bookmarks />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <AppLayout>
                <History />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* ==================== ADMIN ROUTES ==================== */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="questions" element={<QuestionManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="posts" element={<PostsManagement />} />
        </Route>

        {/* ==================== DEFAULT REDIRECTS ==================== */}
        <Route path="/" element={<Navigate to="/learn" replace />} />
        <Route path="*" element={<Navigate to="/learn" replace />} />
      </Routes>

      {/* ==================== TOAST NOTIFICATIONS ==================== */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
};

// ==================== MAIN APP COMPONENT ====================
function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
