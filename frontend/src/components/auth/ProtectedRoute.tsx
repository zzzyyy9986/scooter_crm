import { observer } from 'mobx-react-lite';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useRootStore } from '../../store/root-store';

/**
 * Защищает вложенные маршруты: перенаправляет неавторизованных пользователей на `/login`.
 */
export const ProtectedRoute = observer(function ProtectedRoute() {
  const { authStore } = useRootStore();
  const location = useLocation();

  if (!authStore.initialized) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light text-muted">
        Загрузка...
      </div>
    );
  }

  if (!authStore.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
});
