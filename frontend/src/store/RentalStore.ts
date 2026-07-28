import { makeAutoObservable, runInAction } from 'mobx';
import { QueryService } from '../services/QueryService';
import type { Rental, RentalFormData } from '../types/api';
import type { ScooterStore } from './ScooterStore';
import { FetchGuard } from './fetchGuard';
import { notificationStore } from './NotificationStore';
import type { UserStore } from './UserStore';

/** MobX-store списка аренд и операций с ними. */
export class RentalStore {
  items: Rental[] = [];
  loading = false;
  statusFilter = '';

  isCreateModalOpen = false;
  formData = { scooter_id: '', user_id: '' };
  formSubmitting = false;

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
   * Открывает модальное окно создания аренды и загружает справочники.
   * @param scooterStore - Store самокатов.
   * @param userStore - Store пользователей.
   */
  public async openCreateModal(scooterStore: ScooterStore, userStore: UserStore): Promise<void> {
    this.isCreateModalOpen = true;
    this.formData = { scooter_id: '', user_id: '' };
    this.formSubmitting = false;

    await Promise.all([scooterStore.prepareAvailableScooters(), userStore.fetchUsers()]);
  }

  /** Закрывает модальное окно создания аренды. */
  public closeCreateModal(): void {
    this.isCreateModalOpen = false;
    this.formSubmitting = false;
  }

  /**
   * Обновляет поле формы создания аренды.
   * @param fieldName - Имя поля (`scooter_id` или `user_id`).
   * @param fieldValue - Значение поля.
   */
  public setFormField(fieldName: 'scooter_id' | 'user_id', fieldValue: string): void {
    this.formData = {
      ...this.formData,
      [fieldName]: fieldValue,
    };
  }

  /**
   * Создаёт аренду по данным формы и закрывает модальное окно.
   * @returns Promise завершения операции.
   */
  public async submitCreateForm(): Promise<void> {
    this.formSubmitting = true;

    const rentalFormData: RentalFormData = {
      scooter_id: parseInt(this.formData.scooter_id, 10),
      user_id: parseInt(this.formData.user_id, 10),
    };

    try {
      await this.createRental(rentalFormData);
      notificationStore.showSuccess('Аренда успешно создана');
      this.closeCreateModal();
    } catch (error) {
      runInAction(() => {
        this.formSubmitting = false;
      });
      notificationStore.showErrorFromUnknown(error);
    }
  }

  /**
   * Завершает активную аренду после подтверждения пользователя.
   * @param rentalId - ID аренды для завершения.
   */
  public async completeRentalWithConfirm(rentalId: number): Promise<void> {
    if (!window.confirm('Завершить аренду?')) {
      return;
    }

    try {
      await this.completeRental(rentalId);
      notificationStore.showSuccess('Аренда успешно завершена');
    } catch (error) {
      notificationStore.showErrorFromUnknown(error);
    }
  }

  /**
   * Внутренний метод: выполняет GET `/rentals` и обновляет `items`.
   */
  private async loadRentalsList(): Promise<void> {
    this.loading = true;

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
        this.loading = false;
      });
      notificationStore.showErrorFromUnknown(error);
    }
  }

  /**
   * Создаёт новую аренду и перезагружает список.
   * @param rentalFormData - Данные формы: scooter_id, user_id.
   */
  private async createRental(rentalFormData: RentalFormData): Promise<void> {
    await QueryService.postRequest<Rental>('/rentals', rentalFormData);
    await this.fetchRentals();
  }

  /**
   * Завершает активную аренду по ID и перезагружает список.
   * @param rentalId - ID аренды для завершения.
   */
  private async completeRental(rentalId: number): Promise<void> {
    await QueryService.postRequest<Rental>(`/rentals/${rentalId}/complete`, {});
    await this.fetchRentals();
  }
}

export const rentalStore = new RentalStore();
