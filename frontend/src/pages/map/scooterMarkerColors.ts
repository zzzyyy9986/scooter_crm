import type { ScooterStatus } from '../../types/api';

/** Цвета маркеров на карте по статусу самоката. */
export const SCOOTER_MARKER_COLORS: Record<ScooterStatus, string> = {
  available: '#198754',
  in_use: '#0d6efd',
  maintenance: '#fd7e14',
  offline: '#dc3545',
};

/** Центр карты по умолчанию (Москва). */
export const DEFAULT_MAP_CENTER: [number, number] = [55.7558, 37.6173];
