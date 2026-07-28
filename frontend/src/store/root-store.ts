import { createContext, useContext } from 'react';
import { analyticsStore } from './AnalyticsStore';
import { authStore } from './AuthStore';
import { notificationStore } from './NotificationStore';
import { rentalStore } from './RentalStore';
import { scooterStore } from './ScooterStore';

/** React Context с singleton-экземплярами MobX store. */
export const RootStoreContext = createContext({
  authStore,
  analyticsStore,
  scooterStore,
  rentalStore,
  notificationStore,
});

/**
 * Хук для доступа ко всем store из React-компонентов.
 * @returns Объект со всеми store приложения.
 */
export function useRootStore() {
  return useContext(RootStoreContext);
}
