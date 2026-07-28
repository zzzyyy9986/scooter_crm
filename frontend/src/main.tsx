import { StrictMode, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css';
import { App } from './App';
import { RootStoreContext } from './store/root-store';
import { analyticsStore } from './store/AnalyticsStore';
import { authStore } from './store/AuthStore';
import { notificationStore } from './store/NotificationStore';
import { rentalStore } from './store/RentalStore';
import { scooterStore } from './store/ScooterStore';
import './index.css';

/** Инициализирует приложение и восстанавливает сессию пользователя. */
function Bootstrap() {
  useEffect(() => {
    void authStore.initialize();
  }, []);

  return <App />;
}

/** Точка входа: монтирует React-приложение с провайдером MobX store. */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootStoreContext.Provider
      value={{
        authStore,
        analyticsStore,
        scooterStore,
        rentalStore,
        notificationStore,
      }}
    >
      <Bootstrap />
    </RootStoreContext.Provider>
  </StrictMode>,
);
