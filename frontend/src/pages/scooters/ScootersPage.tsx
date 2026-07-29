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
        <button
          className="btn btn-primary page-action-btn"
          onClick={() => scooterStore.openCreateModal()}
        >
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
        <>
          <div className="d-md-none">
            <div className="vstack gap-3">
              {scooterStore.items.map((scooter) => (
                <div key={scooter.id} className="card shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <div>
                        <div className="fw-semibold">{scooter.number}</div>
                        <div className="text-muted small">
                          {scooter.model} · ID {scooter.id}
                        </div>
                      </div>
                      <StatusBadge status={scooter.status} />
                    </div>
                    <BatteryIndicator level={scooter.battery_level} />
                    <div className="text-muted small mt-2">
                      {Number(scooter.latitude).toFixed(4)},{' '}
                      {Number(scooter.longitude).toFixed(4)}
                    </div>
                    <div className="text-muted small">
                      Обновлён: {formatDate(scooter.updated_at)}
                    </div>
                    <div className="d-flex gap-2 mt-3">
                      <button
                        className="btn btn-sm btn-outline-primary flex-fill"
                        onClick={() => scooterStore.openEditModal(scooter)}
                      >
                        Изменить
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger flex-fill"
                        onClick={() => void scooterStore.deleteScooterWithConfirm(scooter.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card shadow-sm d-none d-md-block">
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
        </>
      )}

      {scooterStore.modalOpen && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down">
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
