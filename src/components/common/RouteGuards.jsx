import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/utils/constants';

/** Redirige vers /login si l'utilisateur n'est pas connecté. */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }
  return <Outlet />;
}

/** Empêche un utilisateur connecté de revenir sur /login. */
export function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  return isAuthenticated ? <Navigate to={ROUTES.home} replace /> : <Outlet />;
}
