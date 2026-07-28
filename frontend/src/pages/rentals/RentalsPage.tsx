import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { BasePage } from '../../common/layout/BasePage';
import { formatDate } from '../../common/ui/formatDate';
import { StatusBadge } from '../../common/ui/StatusBadge';
import { useRootStore } from '../../store/root-store';
import { RentalForm } from './RentalForm';

/** Страница управления арендами: список, фильтр, создание и завершение. */
export const RentalsPage = observer(function RentalsPage() {
  const { rentalStore, scooterStore } = useRootStore();

  useEffect(() => {
    void rentalStore.fetchRentals();
  }, [rentalStore, rentalStore.statusFilter]);

  return (
    <BasePage
      title="Аренды"
      actions={
        <button
          className="btn btn-primary"
          onClick={() => void rentalStore.openCreateModal(scooterStore)}
        >
          + Новая аренда
        </button>
      }
    >
      <p className="text-muted small mb-3">
        История аренд: один самокат может встречаться в нескольких строках. Активная аренда у
        самоката может быть только одна — используйте фильтр «Активные», чтобы видеть только
        текущие.
      </p>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <select
            className="form-select"
            style={{ maxWidth: 240 }}
            value={rentalStore.statusFilter}
            onChange={(event) => rentalStore.setStatusFilterValue(event.target.value)}
          >
            <option value="">Все</option>
            <option value="active">Активные</option>
            <option value="completed">Завершённые</option>
          </select>
        </div>
      </div>

      {rentalStore.loading ? (
        <div className="text-center py-5 text-muted">Загрузка...</div>
      ) : rentalStore.items.length === 0 ? (
        <div className="text-center py-5 text-muted">Аренды не найдены</div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Самокат</th>
                  <th>Клиент</th>
                  <th>Телефон</th>
                  <th>Начало</th>
                  <th>Окончание</th>
                  <th>Статус</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rentalStore.items.map((rental) => (
                  <tr key={rental.id}>
                    <td>{rental.id}</td>
                    <td>
                      {rental.scooter?.number} ({rental.scooter?.model})
                    </td>
                    <td>{rental.client?.name}</td>
                    <td>{rental.client?.phone}</td>
                    <td className="text-muted small">{formatDate(rental.started_at)}</td>
                    <td className="text-muted small">{formatDate(rental.ended_at)}</td>
                    <td>
                      <StatusBadge status={rental.status} />
                    </td>
                    <td>
                      {rental.status === 'active' && (
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => void rentalStore.completeRentalWithConfirm(rental.id)}
                        >
                          Завершить
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rentalStore.isCreateModalOpen && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Новая аренда</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => rentalStore.closeCreateModal()}
                  />
                </div>
                <div className="modal-body">
                  {scooterStore.availableScooters.length === 0 ? (
                    <div className="alert alert-warning mb-0">Нет доступных самокатов</div>
                  ) : (
                    <RentalForm />
                  )}
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
