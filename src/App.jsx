import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PageLoader } from '@/components/common/PageLoader';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/common/RouteGuards';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApplyTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/utils/constants';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ApplicationsPage = lazy(() => import('@/pages/ApplicationsPage'));
const ServiceDetailPage = lazy(() => import('@/pages/ServiceDetailPage'));
const TechnologiesPage = lazy(() => import('@/pages/TechnologiesPage'));
const DevelopersPage = lazy(() => import('@/pages/DevelopersPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const AdminUsersPage = lazy(() => import('@/pages/AdminUsersPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export default function App() {
  useApplyTheme();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.signup} element={<RegisterPage />} />
          <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path={ROUTES.home} element={<DashboardPage />} />
            <Route path={ROUTES.applications} element={<ApplicationsPage />} />
            <Route path={ROUTES.applicationDetail()} element={<ServiceDetailPage />} />
            <Route path={ROUTES.technologies} element={<TechnologiesPage />} />
            <Route path={ROUTES.developers} element={<DevelopersPage />} />
            <Route path={ROUTES.settings} element={<SettingsPage />} />
            <Route path={ROUTES.adminUsers} element={<AdminUsersPage />} />
            <Route path={ROUTES.notifications} element={<NotificationsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
