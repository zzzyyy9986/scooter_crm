import { observer } from 'mobx-react-lite';
import type { ChangeEvent, FormEvent } from 'react';
import { useRootStore } from '../../store/root-store';

/** Форма создания или редактирования самоката. */
export const ScooterForm = observer(function ScooterForm() {
  const { scooterStore } = useRootStore();

  /**
   * Обновляет поле формы при изменении input/select.
   * @param event - Событие изменения поля формы.
   */
  const handleFormFieldChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target;
    const parsedValue = ['battery_level', 'latitude', 'longitude'].includes(name)
      ? parseFloat(value)
      : value;

    scooterStore.setFormField(name as keyof typeof scooterStore.formData, parsedValue);
  };

  /**
   * Отправляет форму на сохранение.
   * @param event - Событие submit формы.
   */
  const handleFormSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    await scooterStore.submitForm();
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="mb-3">
        <label className="form-label">Номер</label>
        <input
          className="form-control"
          name="number"
          value={scooterStore.formData.number}
          onChange={handleFormFieldChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Модель</label>
        <select
          className="form-select"
          name="scooter_model_id"
          value={scooterStore.formData.scooter_model_id}
          onChange={handleFormFieldChange}
          required
          disabled={scooterStore.modelsLoading}
        >
          <option value="">
            {scooterStore.modelsLoading ? 'Загрузка...' : 'Выберите модель'}
          </option>
          {scooterStore.models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Статус</label>
        <select
          className="form-select"
          name="status"
          value={scooterStore.formData.status}
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
          value={scooterStore.formData.battery_level}
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
            value={scooterStore.formData.latitude}
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
            value={scooterStore.formData.longitude}
            onChange={handleFormFieldChange}
            required
          />
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => scooterStore.closeModal()}
        >
          Отмена
        </button>
        <button type="submit" className="btn btn-primary" disabled={scooterStore.formSubmitting}>
          {scooterStore.formSubmitting ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </form>
  );
});
