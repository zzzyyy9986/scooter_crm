import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { RentalForm } from '../components/rentals/RentalForm';
import { BasePage } from '../components/pages/BasePage';
import { formatDate } from '../components/ui/formatDate';
import { StatusBadge } from '../components/ui/StatusBadge';
import { QueryService } from '../services/QueryService';
import { useRootStore } from '../store/root-store';
import type { User } from '../types/api';

/** Страница управления арендами: список, фильтр, создание и завершение. */
export const RentalsPage = observer(function RentalsPage() {
  const { rentalStore, scooterStore } = useRootStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    void rentalStore.fetchRentals();
  }, [rentalStore, rentalStore.statusFilter]);

  useEffect(() => {
    if (isCreateModalOpen) {
      scooterStore.setStatusFilterValue('available');
      scooterStore.setSearchQuery('');
      void scooterStore.fetchScooters();
      setUsersLoading(true);
      void QueryService.getRequest<User[]>('/users')
        .then(setUsers)
        .finally(() => setUsersLoading(false));
    }
  }, [isCreateModalOpen, scooterStore]);

  const availableScooters = scooterStore.items.filter((scooter) => scooter.status === 'available');

  /**
   * Завершает активную аренду после подтверждения пользователя.
   * @param rentalId - ID аренды для завершения.
   */
  const handleCompleteRental = async (rentalId: number): Promise<void> => {
    if (!window.confirm('Завершить аренду?')) return;
    try {
      await rentalStore.completeRental(rentalId);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <BasePage
      title="Аренды"
      actions={
        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          + Новая аренда
        </button>
      }
    >
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

      {rentalStore.error && <div className="alert alert-danger">{rentalStore.error}</div>}

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
                  <th>Пользователь</th>
                  <th>Email</th>
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
                    <td>{rental.user?.name}</td>
                    <td>{rental.user?.email}</td>
                    <td className="text-muted small">{formatDate(rental.started_at)}</td>
                    <td className="text-muted small">{formatDate(rental.ended_at)}</td>
                    <td>
                      <StatusBadge status={rental.status} />
                    </td>
                    <td>
                      {rental.status === 'active' && (
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleCompleteRental(rental.id)}
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

      {isCreateModalOpen && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Новая аренда</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setIsCreateModalOpen(false)}
                  />
                </div>
                <div className="modal-body">
                  {availableScooters.length === 0 ? (
                    <div className="alert alert-warning mb-0">Нет доступных самокатов</div>
                  ) : usersLoading ? (
                    <div className="text-center py-3 text-muted">Загрузка пользователей...</div>
                  ) : users.length === 0 ? (
                    <div className="alert alert-warning mb-0">Нет пользователей для аренды</div>
                  ) : (
                    <RentalForm
                      availableScooters={availableScooters}
                      users={users}
                      onSubmit={async (formData) => {
                        await rentalStore.createRental(formData);
                        setIsCreateModalOpen(false);
                      }}
                      onCancel={() => setIsCreateModalOpen(false)}
                    />
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
