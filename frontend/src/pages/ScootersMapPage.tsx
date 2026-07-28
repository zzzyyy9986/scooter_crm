import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { ScooterFilters } from '../components/scooters/ScooterFilters';
import { ScooterMap } from '../components/scooters/ScooterMap';
import { BasePage } from '../components/pages/BasePage';
import { LiveRefreshIndicator } from '../components/ui/LiveRefreshIndicator';
import { POLL_INTERVAL_MS } from '../constants/polling';
import { usePolling } from '../hooks/usePolling';
import { useRootStore } from '../store/root-store';

/** Страница карты самокатов с фильтрами и автообновлением. */
export const ScootersMapPage = observer(function ScootersMapPage() {
  const { scooterStore } = useRootStore();

  useEffect(() => {
    void scooterStore.fetchScooters();
  }, [scooterStore, scooterStore.appliedSearch, scooterStore.statusFilter]);

  usePolling(() => scooterStore.refreshScooters(), POLL_INTERVAL_MS);

  return (
    <BasePage title="Карта самокатов">
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <ScooterFilters />
        </div>
      </div>

      <div className="mb-3">
        <LiveRefreshIndicator
          lastUpdatedAt={scooterStore.lastUpdatedAt}
          refreshing={scooterStore.refreshing}
        />
      </div>

      {scooterStore.loading && scooterStore.items.length === 0 ? (
        <div className="text-center py-5 text-muted">Загрузка карты...</div>
      ) : scooterStore.items.length === 0 ? (
        <div className="text-center py-5 text-muted">Самокаты не найдены</div>
      ) : (
        <ScooterMap scooters={scooterStore.items} boundsKey={scooterStore.filterKey} />
      )}
    </BasePage>
  );
});
