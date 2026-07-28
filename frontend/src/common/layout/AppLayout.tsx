import { observer } from 'mobx-react-lite';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useRootStore } from '../../store/root-store';

/** Общий layout приложения: навигация и область для вложенных маршрутов. */
export const AppLayout = observer(function AppLayout() {
  const { authStore } = useRootStore();
  const navigate = useNavigate();

  /**
   * Формирует CSS-класс для пункта навигации в зависимости от активного маршрута.
   * @param isActive - Флаг активного маршрута из react-router.
   * @returns Строка CSS-классов для NavLink.
   */
  const buildNavLinkClassName = (isActive: boolean): string =>
    `nav-link px-3 rounded${isActive ? ' active bg-white bg-opacity-25' : ''}`;

  /**
   * Завершает сессию и перенаправляет на страницу входа.
   */
  const handleLogout = async (): Promise<void> => {
    await authStore.logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold">Scooter CRM</span>
          <div className="navbar-nav ms-auto flex-row gap-1 align-items-center">
            <NavLink to="/" end className={({ isActive }) => buildNavLinkClassName(isActive)}>
              Аналитика
            </NavLink>
            <NavLink to="/scooters" className={({ isActive }) => buildNavLinkClassName(isActive)}>
              Самокаты
            </NavLink>
            <NavLink to="/map" className={({ isActive }) => buildNavLinkClassName(isActive)}>
              Карта
            </NavLink>
            <NavLink to="/rentals" className={({ isActive }) => buildNavLinkClassName(isActive)}>
              Аренды
            </NavLink>
            <span className="nav-link px-3 text-white-50 small">{authStore.user?.name}</span>
            <button type="button" className="btn btn-sm btn-outline-light ms-2" onClick={() => void handleLogout()}>
              Выйти
            </button>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
});
