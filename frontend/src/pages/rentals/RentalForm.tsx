import { observer } from 'mobx-react-lite';
import type { ChangeEvent, FormEvent } from 'react';
import {
  AutocompleteField,
  type AutocompleteOption,
} from '../../common/ui/AutocompleteField';
import { useRootStore } from '../../store/root-store';
import type { Client } from '../../types/api';

/** Форма создания новой аренды самоката. */
export const RentalForm = observer(function RentalForm() {
  const { rentalStore, scooterStore } = useRootStore();

  const clientOptions: AutocompleteOption<Client>[] = rentalStore.clientSuggestions.map(
    (client) => ({
      id: client.id,
      label: client.phone,
      sublabel: client.name,
      value: client,
    }),
  );

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

      <div className="mb-3">
        <AutocompleteField
          label="Телефон клиента"
          name="phone"
          type="tel"
          value={rentalStore.formData.phone}
          options={clientOptions}
          loading={rentalStore.clientSearchLoading}
          required
          minLengthToOpen={1}
          showEmptyState={
            rentalStore.clientSearchCompleted &&
            !rentalStore.clientSearchLoading &&
            rentalStore.clientSuggestions.length === 0
          }
          hint="Начните вводить номер с +7 или 8 — появятся подсказки из базы"
          emptyMessage="Клиенты не найдены — введите имя ниже для нового клиента"
          onValueChange={(phone) => rentalStore.setFormField('phone', phone)}
          onOptionSelect={(option) => rentalStore.selectClientSuggestion(option.value)}
        />
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
          Заполнится автоматически при выборе клиента или введите вручную для нового.
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
