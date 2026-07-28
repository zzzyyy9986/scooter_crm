import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { RentalFormData, Scooter, User } from '../../types/api';

interface RentalFormProps {
  availableScooters: Scooter[];
  users: User[];
  onSubmit: (data: RentalFormData) => Promise<void>;
  onCancel: () => void;
}

/**
 * Форма создания новой аренды самоката.
 * @param availableScooters - Список доступных для аренды самокатов.
 * @param users - Список пользователей для выбора арендатора.
 * @param onSubmit - Callback создания аренды с данными формы.
 * @param onCancel - Callback закрытия формы без сохранения.
 */
export function RentalForm({ availableScooters, users, onSubmit, onCancel }: RentalFormProps) {
  const [formData, setFormData] = useState({ scooter_id: '', user_id: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Обновляет поле формы при вводе пользователя.
   * @param event - Событие изменения input/select.
   */
  const handleFormFieldChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setFormData((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  };

  /**
   * Отправляет форму и создаёт аренду через callback onSubmit.
   * @param event - Событие submit формы.
   */
  const handleFormSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onSubmit({
        scooter_id: parseInt(formData.scooter_id, 10),
        user_id: parseInt(formData.user_id, 10),
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <div className="mb-3">
        <label className="form-label">Самокат</label>
        <select
          className="form-select"
          name="scooter_id"
          value={formData.scooter_id}
          onChange={handleFormFieldChange}
          required
        >
          <option value="">Выберите самокат</option>
          {availableScooters.map((scooter) => (
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
          value={formData.user_id}
          onChange={handleFormFieldChange}
          required
        >
          <option value="">Выберите пользователя</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
          Отмена
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Создание...' : 'Создать аренду'}
        </button>
      </div>
    </form>
  );
}
