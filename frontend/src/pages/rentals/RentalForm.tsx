import { observer } from 'mobx-react-lite';
import type { ChangeEvent, FormEvent } from 'react';
import { useRootStore } from '../../store/root-store';

/** Форма создания новой аренды самоката. */
export const RentalForm = observer(function RentalForm() {
  const { rentalStore, scooterStore, userStore } = useRootStore();

  /**
   * Обновляет поле формы при вводе пользователя.
   * @param event - Событие изменения select.
   */
  const handleFormFieldChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    rentalStore.setFormField(
      event.target.name as 'scooter_id' | 'user_id',
      event.target.value,
    );
  };

  /**
   * Отправляет форму создания аренды.
   * @param event - Событие submit формы.
   */
  const handleFormSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    await rentalStore.submitCreateForm();
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="mb-3">
        <label className="form-label">Самокат</label>
        <select
          className="form-select"
          name="scooter_id"
          value={rentalStore.formData.scooter_id}
          onChange={handleFormFieldChange}
          required
        >
          <option value="">Выберите самокат</option>
          {scooterStore.availableScooters.map((scooter) => (
            <option key={scooter.id} value={scooter.id}>
              {scooter.number} — {scooter.model} ({scooter.battery_level}%)
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Пользователь</label>
        <select
          className="form-select"
          name="user_id"
          value={rentalStore.formData.user_id}
          onChange={handleFormFieldChange}
          required
        >
          <option value="">Выберите пользователя</option>
          {userStore.items.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => rentalStore.closeCreateModal()}
        >
          Отмена
        </button>
        <button type="submit" className="btn btn-primary" disabled={rentalStore.formSubmitting}>
          {rentalStore.formSubmitting ? 'Создание...' : 'Создать аренду'}
        </button>
      </div>
    </form>
  );
});
