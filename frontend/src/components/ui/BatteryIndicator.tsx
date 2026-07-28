interface BatteryIndicatorProps {
  level: number;
}

/**
 * Визуализирует уровень заряда батареи самоката в виде progress bar.
 * @param level - Процент заряда от 0 до 100.
 */
export function BatteryIndicator({ level }: BatteryIndicatorProps) {
  const progressVariant = level > 60 ? 'success' : level > 20 ? 'warning' : 'danger';

  return (
    <div className="d-flex align-items-center gap-2">
      <div className="progress flex-grow-1" style={{ height: 8, minWidth: 64 }}>
        <div
          className={`progress-bar bg-${progressVariant}`}
          role="progressbar"
          style={{ width: `${level}%` }}
          aria-valuenow={level}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <span className="text-muted small">{level}%</span>
    </div>
  );
}
