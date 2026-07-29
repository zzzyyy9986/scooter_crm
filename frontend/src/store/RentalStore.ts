import { makeAutoObservable, runInAction } from 'mobx';
import { QueryService } from '../services/QueryService';
import type { Client, Rental, RentalFormData } from '../types/api';
import type { ScooterStore } from './ScooterStore';
import { FetchGuard } from './fetchGuard';
import { notificationStore } from './NotificationStore';

const CLIENT_SEARCH_DEBOUNCE_MS = 300;

/** MobX-store списка аренд и операций с ними. */
export class RentalStore {
  items: Rental[] = [];
  loading = false;
  statusFilter = '';

  isCreateModalOpen = false;
  formData = { scooter_id: '', phone: '', name: '' };
  formSubmitting = false;
  clientSearchLoading = false;
  clientSuggestions: Client[] = [];
  clientSearchCompleted = false;

  private fetchGuard = new FetchGuard();
  private phoneSearchTimeoutId: ReturnType<typeof setTimeout> | null = null;

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
   * Открывает модальное окно создания аренды и загружает доступные самокаты.
   * @param scooterStore - Store самокатов.
   */
  public async openCreateModal(scooterStore: ScooterStore): Promise<void> {
    this.isCreateModalOpen = true;
    this.formData = { scooter_id: '', phone: '', name: '' };
    this.formSubmitting = false;
    this.clientSearchLoading = false;
    this.clientSuggestions = [];
    this.clientSearchCompleted = false;

    await scooterStore.prepareAvailableScooters();
  }

  /** Закрывает модальное окно создания аренды. */
  public closeCreateModal(): void {
    this.isCreateModalOpen = false;
    this.formSubmitting = false;
    this.clientSearchLoading = false;
    this.clientSuggestions = [];
    this.clientSearchCompleted = false;
    this.clearPhoneSearchTimeout();
  }

  /**
   * Обновляет поле формы создания аренды.
   * @param fieldName - Имя поля формы.
   * @param fieldValue - Значение поля.
   */
  public setFormField(
    fieldName: 'scooter_id' | 'phone' | 'name',
    fieldValue: string,
  ): void {
    if (fieldName === 'phone') {
      if (fieldValue.trim() === '') {
        this.formData = { ...this.formData, phone: '', name: '' };
        this.clientSuggestions = [];
        this.clientSearchLoading = false;
        this.clientSearchCompleted = false;
        this.clearPhoneSearchTimeout();
        return;
      }

      this.formData = { ...this.formData, phone: fieldValue };
      this.scheduleClientSearch(fieldValue);
      return;
    }

    this.formData = { ...this.formData, [fieldName]: fieldValue };
  }

  /**
   * Выбирает клиента из списка подсказок и заполняет телефон и имя.
   * @param client - Клиент из подсказок.
   */
  public selectClientSuggestion(client: Client): void {
    this.formData = {
      ...this.formData,
      phone: client.phone,
      name: client.name,
    };
    this.clientSuggestions = [];
    this.clientSearchCompleted = false;
  }

  /**
   * Запускает поиск клиентов с debounce при вводе телефона.
   * @param phone - Частичный номер телефона.
   */
  public scheduleClientSearch(phone: string): void {
    this.clearPhoneSearchTimeout();

    this.phoneSearchTimeoutId = setTimeout(() => {
      void this.searchClientsByPhone(phone);
    }, CLIENT_SEARCH_DEBOUNCE_MS);
  }

  /**
   * Создаёт аренду по данным формы и закрывает модальное окно.
   * @returns Promise завершения операции.
   */
  public async submitCreateForm(): Promise<void> {
    this.formSubmitting = true;

    const rentalFormData: RentalFormData = {
      scooter_id: parseInt(this.formData.scooter_id, 10),
      phone: this.formData.phone.trim(),
      name: this.formData.name.trim(),
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
   * Ищет до 10 клиентов по началу номера телефона.
   * @param phone - Частичный номер из формы.
   */
  private async searchClientsByPhone(phone: string): Promise<void> {
    runInAction(() => {
      this.clientSearchLoading = true;
      this.clientSearchCompleted = false;
    });

    try {
      const clients = await QueryService.getRequest<Client[]>('/clients/search', {
        phone: phone.trim(),
      });

      runInAction(() => {
        this.clientSuggestions = clients;
        this.clientSearchLoading = false;
        this.clientSearchCompleted = true;

        if (clients.length === 1) {
          this.formData = { ...this.formData, name: clients[0].name };
        }
      });
    } catch {
      runInAction(() => {
        this.clientSuggestions = [];
        this.clientSearchLoading = false;
        this.clientSearchCompleted = true;
      });
    }
  }

  /** Отменяет отложенный поиск клиентов. */
  private clearPhoneSearchTimeout(): void {
    if (this.phoneSearchTimeoutId !== null) {
      clearTimeout(this.phoneSearchTimeoutId);
      this.phoneSearchTimeoutId = null;
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
   * @param rentalFormData - Данные формы: scooter_id, phone, name.
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
