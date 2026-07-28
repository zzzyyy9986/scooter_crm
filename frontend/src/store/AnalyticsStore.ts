import { makeAutoObservable, runInAction } from 'mobx';
import { QueryService } from '../services/QueryService';
import type { Analytics } from '../types/api';
import { FetchGuard } from './fetchGuard';
import { notificationStore } from './NotificationStore';

/** MobX-store аналитики самокатов и аренд. */
export class AnalyticsStore {
  data: Analytics | null = null;
  loading = false;
  refreshing = false;
  lastUpdatedAt: Date | null = null;

  private fetchGuard = new FetchGuard();

  /** Регистрирует store как observable для MobX. */
  public constructor() {
    makeAutoObservable(this);
  }

  /**
   * Загружает аналитику с backend.
   * @param options.silent - Фоновое обновление без полноэкранного loading.
   * @returns Promise завершения загрузки.
   */
  public fetchAnalytics(options?: { silent?: boolean }): Promise<void> {
    const silent = options?.silent ?? false;
    const requestKey = silent ? 'analytics:silent' : 'analytics:full';
    return this.fetchGuard.runGuardedRequest(requestKey, () => this.loadAnalyticsData(silent));
  }

  /**
   * Фоновое обновление для polling.
   * @returns Promise завершения загрузки.
   */
  public refreshAnalytics(): Promise<void> {
    return this.fetchAnalytics({ silent: true });
  }

  /**
   * Внутренний метод: выполняет GET `/analytics` и обновляет состояние store.
   * @param silent - Фоновое обновление без полноэкранного loading.
   */
  private async loadAnalyticsData(silent: boolean): Promise<void> {
    if (silent) {
      this.refreshing = true;
    } else {
      this.loading = true;
    }

    try {
      const data = await QueryService.getRequest<Analytics>('/analytics');
      runInAction(() => {
        this.data = data;
        this.loading = false;
        this.refreshing = false;
        this.lastUpdatedAt = new Date();
      });
    } catch (error) {
      runInAction(() => {
        this.loading = false;
        this.refreshing = false;
      });

      if (!silent) {
        notificationStore.showErrorFromUnknown(error);
      }
    }
  }
}

export const analyticsStore = new AnalyticsStore();
