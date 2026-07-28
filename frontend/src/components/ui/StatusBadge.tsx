import type { RentalStatus, ScooterStatus } from '../../types/api';

/** Человекочитаемые подписи статусов самокатов и аренд. */
const STATUS_LABELS: Record<ScooterStatus | RentalStatus, string> = {
  available: 'Доступен',
  in_use: 'В аренде',
  maintenance: 'Обслуживание',
  offline: 'Офлайн',
  active: 'Активна',
  completed: 'Завершена',
};

/** Bootstrap-классы badge для каждого статуса. */
const STATUS_CLASS: Record<ScooterStatus | RentalStatus, string> = {
  available: 'text-bg-success',
  in_use: 'text-bg-primary',
  maintenance: 'text-bg-warning',
  offline: 'text-bg-danger',
  active: 'text-bg-primary',
  completed: 'text-bg-secondary',
};

interface StatusBadgeProps {
  status: ScooterStatus | RentalStatus;
}

/**
 * Отображает цветной badge со статусом самоката или аренды.
 * @param status - Код статуса из API.
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`badge ${STATUS_CLASS[status] ?? 'text-bg-secondary'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export { STATUS_LABELS };
