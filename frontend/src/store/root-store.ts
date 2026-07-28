import { createContext, useContext } from 'react';
import { analyticsStore } from './AnalyticsStore';
import { authStore } from './AuthStore';
import { rentalStore } from './RentalStore';
import { scooterStore } from './ScooterStore';

/** React Context с singleton-экземплярами MobX store. */
export const RootStoreContext = createContext({
  authStore,
  analyticsStore,
  scooterStore,
  rentalStore,
});

/**
 * Хук для доступа ко всем store из React-компонентов.
 * @returns Объект с authStore, analyticsStore, scooterStore и rentalStore.
 */
export function useRootStore() {
  return useContext(RootStoreContext);
}
