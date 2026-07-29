import { observer } from 'mobx-react-lite';
import type { ChangeEvent, FormEvent } from 'react';
import { useRootStore } from '../../store/root-store';

/** Форма создания новой аренды самоката. */
export const RentalForm = observer(function RentalForm() {
  const { rentalStore, scooterStore } = useRootStore();

  /**
   * Обновляет поле формы при вводе пользователя.
   * @param event - Событие изменения поля формы.
   */
  const handleFormFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    rentalStore.setFormField(
      event.target.name as 'scooter_id' | 'phone' | 'name',
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

      <div className="mb-3 position-relative">
        <label className="form-label">Телефон клиента</label>
        <input
          className="form-control"
          name="phone"
          type="tel"
          value={rentalStore.formData.phone}
          onChange={handleFormFieldChange}
          autoComplete="off"
          required
        />
        <div className="form-text">Начните вводить номер, начиная с +7 или 8</div>
        {rentalStore.clientSearchLoading && (
          <div className="form-text">Поиск клиентов...</div>
        )}
        {rentalStore.clientSuggestions.length > 0 && (
          <ul className="list-group position-absolute w-100 shadow-sm mt-1 z-3">
            {rentalStore.clientSuggestions.map((client) => (
              <li key={client.id}>
                <button
                  type="button"
                  className="list-group-item list-group-item-action py-2"
                  onClick={() => rentalStore.selectClientSuggestion(client)}
                >
                  <div className="fw-semibold">{client.phone}</div>
                  <div className="small text-muted">{client.name}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">Имя клиента</label>
        <input
          className="form-control"
          name="name"
          value={rentalStore.formData.name}
          onChange={handleFormFieldChange}
          placeholder="Иван Петров"
          required
        />
        <div className="form-text">
          Выберите клиента из списка или введите имя для нового клиента.
        </div>
      </div>

      <div className="d-flex flex-column flex-sm-row justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary w-100 w-sm-auto"
          onClick={() => rentalStore.closeCreateModal()}
        >
          Отмена
        </button>
        <button
          type="submit"
          className="btn btn-primary w-100 w-sm-auto"
          disabled={rentalStore.formSubmitting}
        >
          {rentalStore.formSubmitting ? 'Создание...' : 'Создать аренду'}
        </button>
      </div>
    </form>
  );
});
