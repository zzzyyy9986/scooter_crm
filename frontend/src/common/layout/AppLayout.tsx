import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useRootStore } from '../../store/root-store';
import './AppLayout.css';

/** Общий layout приложения: навигация и область для вложенных маршрутов. */
export const AppLayout = observer(function AppLayout() {
  const { authStore } = useRootStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

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
    setNavOpen(false);
    await authStore.logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm app-nav">
        <div className="container">
          <span className="navbar-brand fw-bold me-auto">Scooter CRM</span>
          <button
            type="button"
            className="navbar-toggler border-0"
            aria-expanded={navOpen}
            aria-label="Открыть меню"
            onClick={() => setNavOpen((open) => !open)}
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className={`collapse navbar-collapse${navOpen ? ' show' : ''}`}>
            <ul className="navbar-nav ms-lg-auto align-items-lg-center gap-lg-1">
              <li className="nav-item">
                <NavLink to="/" end className={({ isActive }) => buildNavLinkClassName(isActive)}>
                  Аналитика
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/scooters"
                  className={({ isActive }) => buildNavLinkClassName(isActive)}
                >
                  Самокаты
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/map" className={({ isActive }) => buildNavLinkClassName(isActive)}>
                  Карта
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/rentals"
                  className={({ isActive }) => buildNavLinkClassName(isActive)}
                >
                  Аренды
                </NavLink>
              </li>
              <li className="nav-item app-nav__user-row w-100">
                <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-2 px-3 px-lg-0">
                  <span className="nav-link px-0 text-white-50 small mb-0">
                    {authStore.user?.name}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-light"
                    onClick={() => void handleLogout()}
                  >
                    Выйти
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
});
