import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { BasePage } from '../../common/layout/BasePage';
import { BatteryIndicator } from '../../common/ui/BatteryIndicator';
import { formatDate } from '../../common/ui/formatDate';
import { LiveRefreshIndicator } from '../../common/ui/LiveRefreshIndicator';
import { StatusBadge } from '../../common/ui/StatusBadge';
import { POLL_INTERVAL_MS } from '../../constants/polling';
import { usePolling } from '../../hooks/usePolling';
import { useRootStore } from '../../store/root-store';
import { ScooterFilters } from './ScooterFilters';
import { ScooterForm } from './ScooterForm';

/** Страница управления самокатами: список, фильтры, создание и редактирование. */
export const ScootersPage = observer(function ScootersPage() {
  const { scooterStore } = useRootStore();

  useEffect(() => {
    void scooterStore.fetchScooters();
  }, [scooterStore, scooterStore.appliedSearch, scooterStore.statusFilter]);

  usePolling(() => scooterStore.refreshScooters(), POLL_INTERVAL_MS);

  return (
    <BasePage
      title="Самокаты"
      actions={
        <button className="btn btn-primary" onClick={() => scooterStore.openCreateModal()}>
          + Добавить
        </button>
      }
    >
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

      {scooterStore.loading ? (
        <div className="text-center py-5 text-muted">Загрузка...</div>
      ) : scooterStore.items.length === 0 ? (
        <div className="text-center py-5 text-muted">Самокаты не найдены</div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Номер</th>
                  <th>Модель</th>
                  <th>Статус</th>
                  <th>Заряд</th>
                  <th>Координаты</th>
                  <th>Обновлён</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {scooterStore.items.map((scooter) => (
                  <tr key={scooter.id}>
                    <td>{scooter.id}</td>
                    <td className="fw-semibold">{scooter.number}</td>
                    <td>{scooter.model}</td>
                    <td>
                      <StatusBadge status={scooter.status} />
                    </td>
                    <td style={{ minWidth: 140 }}>
                      <BatteryIndicator level={scooter.battery_level} />
                    </td>
                    <td className="text-muted small">
                      {Number(scooter.latitude).toFixed(4)}, {Number(scooter.longitude).toFixed(4)}
                    </td>
                    <td className="text-muted small">{formatDate(scooter.updated_at)}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => scooterStore.openEditModal(scooter)}
                        >
                          Изменить
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => void scooterStore.deleteScooterWithConfirm(scooter.id)}
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {scooterStore.modalOpen && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{scooterStore.modalTitle}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => scooterStore.closeModal()}
                  />
                </div>
                <div className="modal-body">
                  <ScooterForm />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" />
        </>
      )}
    </BasePage>
  );
});
