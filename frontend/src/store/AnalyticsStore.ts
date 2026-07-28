import { makeAutoObservable, runInAction } from 'mobx';
import { QueryService } from '../services/QueryService';
import type { Analytics } from '../types/api';
import { FetchGuard } from './fetchGuard';

/** MobX-store аналитики самокатов и аренд. */
export class AnalyticsStore {
  data: Analytics | null = null;
  loading = false;
  error: string | null = null;

  private fetchGuard = new FetchGuard();

  /** Регистрирует store как observable для MobX. */
  public constructor() {
    makeAutoObservable(this);
  }

  /**
   * Загружает аналитику с backend.
   * Повторный вызов во время активного запроса не создаёт дубликат HTTP-запроса.
   * @returns Promise завершения загрузки.
   */
  public fetchAnalytics(): Promise<void> {
    return this.fetchGuard.runGuardedRequest('analytics', () => this.loadAnalyticsData());
  }

  /**
   * Внутренний метод: выполняет GET `/analytics` и обновляет состояние store.
   */
  private async loadAnalyticsData(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const data = await QueryService.getRequest<Analytics>('/analytics');
      runInAction(() => {
        this.data = data;
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        this.loading = false;
      });
    }
  }
}

export const analyticsStore = new AnalyticsStore();
