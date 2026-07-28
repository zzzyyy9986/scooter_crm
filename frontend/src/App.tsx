import { observer } from 'mobx-react-lite';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { ToastContainer } from './components/ui/ToastContainer';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RentalsPage } from './pages/RentalsPage';
import { ScootersMapPage } from './pages/ScootersMapPage';
import { ScootersPage } from './pages/ScootersPage';
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
