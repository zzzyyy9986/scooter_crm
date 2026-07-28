import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { ScooterFormData, ScooterStatus } from '../../types/api';

/** Значения формы по умолчанию при создании нового самоката. */
const DEFAULT_SCOOTER_FORM: ScooterFormData = {
  number: '',
  model: '',
  status: 'available',
  battery_level: 80,
  latitude: 55.7558,
  longitude: 37.6173,
};

interface ScooterFormProps {
  initial?: ScooterFormData;
  onSubmit: (data: ScooterFormData) => Promise<void>;
  onCancel: () => void;
}

/**
 * Форма создания или редактирования самоката.
 * @param initial - Начальные значения полей; если не переданы, используются defaults.
 * @param onSubmit - Callback сохранения данных формы.
 * @param onCancel - Callback закрытия формы без сохранения.
 */
export function ScooterForm({ initial, onSubmit, onCancel }: ScooterFormProps) {
  const [formData, setFormData] = useState<ScooterFormData>(initial ?? DEFAULT_SCOOTER_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Обновляет поле формы при изменении input/select.
   * @param event - Событие изменения поля формы.
   */
  const handleFormFieldChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: ['battery_level', 'latitude', 'longitude'].includes(name)
        ? parseFloat(value)
        : value,
    }));
  };

  /**
   * Отправляет форму на сохранение через callback onSubmit.
   * @param event - Событие submit формы.
   */
  const handleFormSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <div className="mb-3">
        <label className="form-label">Номер</label>
        <input
          className="form-control"
          name="number"
          value={formData.number}
          onChange={handleFormFieldChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Модель</label>
        <input
          className="form-control"
          name="model"
          value={formData.model}
          onChange={handleFormFieldChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Статус</label>
        <select
          className="form-select"
          name="status"
          value={formData.status}
          onChange={handleFormFieldChange}
        >
          <option value="available">Доступен</option>
          <option value="in_use">В аренде</option>
          <option value="maintenance">Обслуживание</option>
          <option value="offline">Офлайн</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Заряд (%)</label>
        <input
          className="form-control"
          name="battery_level"
          type="number"
          min={0}
          max={100}
          value={formData.battery_level}
          onChange={handleFormFieldChange}
          required
        />
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">Широта</label>
          <input
            className="form-control"
            name="latitude"
            type="number"
            step="0.0000001"
            value={formData.latitude}
            onChange={handleFormFieldChange}
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Долгота</label>
          <input
            className="form-control"
            name="longitude"
            type="number"
            step="0.0000001"
            value={formData.longitude}
            onChange={handleFormFieldChange}
            required
          />
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
          Отмена
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </form>
  );
}

/**
 * Преобразует объект самоката из API в данные формы редактирования.
 * @param scooter - Самокат, полученный из backend.
 * @returns Объект ScooterFormData для заполнения формы.
 */
export function mapScooterToFormData(scooter: {
  number: string;
  model: string;
  status: ScooterStatus;
  battery_level: number;
  latitude: number;
  longitude: number;
}): ScooterFormData {
  return {
    number: scooter.number,
    model: scooter.model,
    status: scooter.status,
    battery_level: scooter.battery_level,
    latitude: scooter.latitude,
    longitude: scooter.longitude,
  };
}
