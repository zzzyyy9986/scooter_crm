import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/root-store';

/** Фильтры поиска и статуса для списка и карты самокатов. */
export const ScooterFilters = observer(function ScooterFilters() {
  const { scooterStore } = useRootStore();

  return (
    <div className="row g-2">
      <div className="col-12 col-md-6">
        <input
          className="form-control"
          placeholder="Поиск по номеру или модели..."
          value={scooterStore.search}
          onChange={(event) => scooterStore.setSearchQuery(event.target.value)}
        />
      </div>
      <div className="col-12 col-md-4">
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
  );
});
