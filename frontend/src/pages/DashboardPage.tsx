import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { BasePage } from '../components/pages/BasePage';
import { STATUS_LABELS } from '../components/ui/StatusBadge';
import { useRootStore } from '../store/root-store';
import type { ScooterStatus } from '../types/api';

/** Страница дашборда с аналитикой по самокатам и арендам. */
export const DashboardPage = observer(function DashboardPage() {
  const { analyticsStore } = useRootStore();

  useEffect(() => {
    void analyticsStore.fetchAnalytics();
  }, [analyticsStore]);

  const { data, loading, error } = analyticsStore;

  if (loading && !data) {
    return (
      <BasePage title="Аналитика">
        <div className="text-center py-5 text-muted">Загрузка...</div>
      </BasePage>
    );
  }

  return (
    <BasePage title="Аналитика">
      {error && <div className="alert alert-danger">{error}</div>}

      {data && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small">Всего самокатов</div>
                  <div className="display-6 fw-bold">{data.total_scooters}</div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small">Активных аренд</div>
                  <div className="display-6 fw-bold">{data.active_rentals_count}</div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small">Средний заряд</div>
                  <div className="display-6 fw-bold">{data.average_battery_level}%</div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="h5 text-muted mb-3">Самокаты по статусам</h2>
          <div className="row g-3">
            {(Object.entries(data.scooters_by_status) as [ScooterStatus, number][]).map(
              ([status, count]) => (
                <div key={status} className="col-6 col-md-3">
                  <div className="card shadow-sm text-center">
                    <div className="card-body">
                      <div className="fs-3 fw-bold">{count}</div>
                      <div className="text-muted small">{STATUS_LABELS[status] ?? status}</div>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </>
      )}
    </BasePage>
  );
});
