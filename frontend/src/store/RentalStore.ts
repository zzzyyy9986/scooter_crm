import { makeAutoObservable, runInAction } from 'mobx';
import { QueryService } from '../services/QueryService';
import type { Rental, RentalFormData } from '../types/api';
import { FetchGuard } from './fetchGuard';

/** MobX-store списка аренд и операций с ними. */
export class RentalStore {
  items: Rental[] = [];
  loading = false;
  error: string | null = null;
  statusFilter = '';

  private fetchGuard = new FetchGuard();

  /** Регистрирует store как observable для MobX. */
  public constructor() {
    makeAutoObservable(this);
  }

  /**
   * Устанавливает фильтр по статусу аренды.
   * @param statusFilterValue - `active`, `completed` или пустая строка для всех.
   */
  public setStatusFilterValue(statusFilterValue: string): void {
    this.statusFilter = statusFilterValue;
  }

  /**
   * Загружает список аренд с учётом текущего фильтра статуса.
   * @returns Promise завершения загрузки.
   */
  public fetchRentals(): Promise<void> {
    const requestKey = this.statusFilter;
    return this.fetchGuard.runGuardedRequest(requestKey, () => this.loadRentalsList());
  }

  /**
   * Внутренний метод: выполняет GET `/rentals` и обновляет `items`.
   */
  private async loadRentalsList(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const params: Record<string, string> = {};
      if (this.statusFilter) params.status = this.statusFilter;
      const data = await QueryService.getRequest<Rental[]>('/rentals', params);
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
   * Создаёт новую аренду и перезагружает список.
   * @param rentalFormData - Данные формы: scooter_id, user_id.
   */
  public async createRental(rentalFormData: RentalFormData): Promise<void> {
    await QueryService.postRequest<Rental>('/rentals', rentalFormData);
    await this.fetchRentals();
  }

  /**
   * Завершает активную аренду по ID и перезагружает список.
   * @param rentalId - ID аренды для завершения.
   */
  public async completeRental(rentalId: number): Promise<void> {
    await QueryService.postRequest<Rental>(`/rentals/${rentalId}/complete`, {});
    await this.fetchRentals();
  }
}

export const rentalStore = new RentalStore();
