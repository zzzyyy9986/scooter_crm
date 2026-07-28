import { makeAutoObservable, runInAction } from 'mobx';
import { QueryService } from '../services/QueryService';
import type { Scooter, ScooterFormData } from '../types/api';
import { FetchGuard } from './fetchGuard';

/** MobX-store списка самокатов и CRUD-операций. */
export class ScooterStore {
  items: Scooter[] = [];
  loading = false;
  error: string | null = null;
  search = '';
  statusFilter = '';

  private fetchGuard = new FetchGuard();

  /** Регистрирует store как observable для MobX. */
  public constructor() {
    makeAutoObservable(this);
  }

  /**
   * Устанавливает строку поиска по номеру или модели.
   * @param searchQuery - Текст поиска; пустая строка сбрасывает фильтр.
   */
  public setSearchQuery(searchQuery: string): void {
    this.search = searchQuery;
  }

  /**
   * Устанавливает фильтр по статусу самоката.
   * @param statusFilterValue - Значение статуса (`available`, `in_use`, …) или пустая строка для всех.
   */
  public setStatusFilterValue(statusFilterValue: string): void {
    this.statusFilter = statusFilterValue;
  }

  /**
   * Загружает список самокатов с учётом текущих фильтров.
   * @returns Promise завершения загрузки.
   */
  public fetchScooters(): Promise<void> {
    const requestKey = `${this.search}:${this.statusFilter}`;
    return this.fetchGuard.runGuardedRequest(requestKey, () => this.loadScootersList());
  }

  /**
   * Внутренний метод: выполняет GET `/scooters` и обновляет `items`.
   */
  private async loadScootersList(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const params: Record<string, string> = {};
      if (this.search) params.search = this.search;
      if (this.statusFilter) params.status = this.statusFilter;
      const data = await QueryService.getRequest<Scooter[]>('/scooters', params);
      runInAction(() => {
        this.items = data;
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        this.loading = false;
      });
    }
  }

  /**
   * Создаёт новый самокат и перезагружает список.
   * @param scooterFormData - Данные формы создания самоката.
   */
  public async createScooter(scooterFormData: ScooterFormData): Promise<void> {
    await QueryService.postRequest<Scooter>('/scooters', scooterFormData);
    await this.fetchScooters();
  }

  /**
   * Обновляет существующий самокат и перезагружает список.
   * @param scooterId - ID редактируемого самоката.
   * @param scooterFormData - Обновлённые поля самоката.
   */
  public async updateScooter(scooterId: number, scooterFormData: ScooterFormData): Promise<void> {
    await QueryService.putRequest<Scooter>(`/scooters/${scooterId}`, scooterFormData);
    await this.fetchScooters();
  }

  /**
   * Удаляет самокат по ID и перезагружает список.
   * @param scooterId - ID удаляемого самоката.
   */
  public async deleteScooter(scooterId: number): Promise<void> {
    await QueryService.deleteRequest(`/scooters/${scooterId}`);
    await this.fetchScooters();
  }
}

export const scooterStore = new ScooterStore();
