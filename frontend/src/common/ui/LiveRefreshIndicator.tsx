import { POLL_INTERVAL_MS } from '../../constants/polling';

interface LiveRefreshIndicatorProps {
  lastUpdatedAt: Date | null;
  refreshing?: boolean;
}

/**
 * Индикатор автообновления данных через polling.
 * @param lastUpdatedAt - Время последнего успешного обновления.
 * @param refreshing - Флаг фонового запроса.
 */
export function LiveRefreshIndicator({ lastUpdatedAt, refreshing = false }: LiveRefreshIndicatorProps) {
  const intervalSeconds = Math.round(POLL_INTERVAL_MS / 1000);

  return (
    <div className="d-flex align-items-center gap-2 text-muted small">
      <span
        className={`live-refresh-dot${refreshing ? ' live-refresh-dot--active' : ''}`}
        aria-hidden
      />
      <span>
        Автообновление каждые {intervalSeconds} сек
        {lastUpdatedAt && (
          <>
            {' '}
            · обновлено{' '}
            {lastUpdatedAt.toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </>
        )}
      </span>
    </div>
  );
}
