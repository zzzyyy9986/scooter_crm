import { observer } from 'mobx-react-lite';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from './common/auth/ProtectedRoute';
import { AppLayout } from './common/layout/AppLayout';
import { ToastContainer } from './common/ui/ToastContainer';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { LoginPage } from './pages/login/LoginPage';
import { ScootersMapPage } from './pages/map/ScootersMapPage';
import { RentalsPage } from './pages/rentals/RentalsPage';
import { ScootersPage } from './pages/scooters/ScootersPage';
import './App.css';

/** Маршруты приложения: вход, аналитика, самокаты, аренды. */
const applicationRouter = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'scooters', element: <ScootersPage /> },
          { path: 'map', element: <ScootersMapPage /> },
          { path: 'rentals', element: <RentalsPage /> },
        ],
      },
    ],
  },
]);

/** Корневой компонент приложения с роутингом. */
export const App = observer(function App() {
  return (
    <div className="App">
      <ToastContainer />
      <RouterProvider router={applicationRouter} />
    </div>
  );
});
