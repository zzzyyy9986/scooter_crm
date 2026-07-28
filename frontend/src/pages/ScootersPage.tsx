import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { ScooterForm, mapScooterToFormData } from '../components/scooters/ScooterForm';
import { BasePage } from '../components/pages/BasePage';
import { BatteryIndicator } from '../components/ui/BatteryIndicator';
import { formatDate } from '../components/ui/formatDate';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useRootStore } from '../store/root-store';
import type { Scooter } from '../types/api';

type ScooterModalState = null | 'create' | { type: 'edit'; scooter: Scooter };

/** Страница управления самокатами: список, фильтры, создание и редактирование. */
export const ScootersPage = observer(function ScootersPage() {
  const { scooterStore } = useRootStore();
  const [modalState, setModalState] = useState<ScooterModalState>(null);

  useEffect(() => {
    void scooterStore.fetchScooters();
  }, [scooterStore, scooterStore.search, scooterStore.statusFilter]);

  /**
   * Удаляет самокат после подтверждения пользователя.
   * @param scooterId - ID самоката для удаления.
   */
  const handleDeleteScooter = async (scooterId: number): Promise<void> => {
    if (!window.confirm('Удалить самокат?')) return;
    try {
      await scooterStore.deleteScooter(scooterId);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <BasePage
      title="Самокаты"
      actions={
        <button className="btn btn-primary" onClick={() => setModalState('create')}>
          + Добавить
        </button>
      }
    >
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Поиск по номеру или модели..."
                value={scooterStore.search}
                onChange={(event) => scooterStore.setSearchQuery(event.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={scooterStore.statusFilter}
                onChange={(event) => scooterStore.setStatusFilterValue(event.target.value)}
              >
                <option value="">Все статусы</option>
                <option value="available">Доступен</option>
                <option value="in_use">В аренде</option>
                <option value="maintenance">Обслуживание</option>
                <option value="offline">Офлайн</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {scooterStore.error && <div className="alert alert-danger">{scooterStore.error}</div>}

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
                          onClick={() => setModalState({ type: 'edit', scooter })}
                        >
                          Изменить
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteScooter(scooter.id)}
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

      {modalState && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {modalState === 'create' ? 'Новый самокат' : 'Редактирование'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setModalState(null)}
                  />
                </div>
                <div className="modal-body">
                  <ScooterForm
                    initial={
                      modalState === 'create'
                        ? undefined
                        : mapScooterToFormData(modalState.scooter)
                    }
                    onSubmit={async (formData) => {
                      if (modalState === 'create') {
                        await scooterStore.createScooter(formData);
                      } else {
                        await scooterStore.updateScooter(modalState.scooter.id, formData);
                      }
                      setModalState(null);
                    }}
                    onCancel={() => setModalState(null)}
                  />
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
