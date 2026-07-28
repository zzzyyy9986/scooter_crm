import { makeAutoObservable, runInAction } from 'mobx';
import { SEARCH_DEBOUNCE_MS } from '../constants/polling';
import { QueryService } from '../services/QueryService';
import type { Scooter, ScooterFormData, ScooterStatus } from '../types/api';
import { FetchGuard } from './fetchGuard';
import { notificationStore } from './NotificationStore';

/** Значения формы по умолчанию при создании нового самоката. */
const DEFAULT_SCOOTER_FORM: ScooterFormData = {
  number: '',
  model: '',
  status: 'available',
  battery_level: 80,
  latitude: 55.7558,
  longitude: 37.6173,
};

/** MobX-store списка самокатов и CRUD-операций. */
export class ScooterStore {
  items: Scooter[] = [];
  loading = false;
  refreshing = false;
  lastUpdatedAt: Date | null = null;

  search = '';
  appliedSearch = '';
  statusFilter = '';

  modalOpen = false;
  modalMode: 'create' | 'edit' | null = null;
  editingScooterId: number | null = null;
  formData: ScooterFormData = { ...DEFAULT_SCOOTER_FORM };
  formSubmitting = false;

  private fetchGuard = new FetchGuard();
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  /** Регистрирует store как observable для MobX. */
  public constructor() {
    makeAutoObservable(this);
  }

  /** Самокаты со статусом available. */
  public get availableScooters(): Scooter[] {
    return this.items.filter((scooter) => scooter.status === 'available');
  }

  /** Ключ текущих фильтров для карты и запросов. */
  public get filterKey(): string {
    return `${this.appliedSearch}:${this.statusFilter}`;
  }

  /** Заголовок модального окна формы самоката. */
  public get modalTitle(): string {
    return this.modalMode === 'create' ? 'Новый самокат' : 'Редактирование';
  }

  /**
   * Устанавливает строку поиска по номеру или модели.
   * @param searchQuery - Текст поиска; пустая строка сбрасывает фильтр.
   */
  public setSearchQuery(searchQuery: string): void {
    this.search = searchQuery;
    this.scheduleSearchApply();
  }

  /**
   * Устанавливает фильтр по статусу самоката.
   * @param statusFilterValue - Значение статуса или пустая строка для всех.
   */
  public setStatusFilterValue(statusFilterValue: string): void {
    this.statusFilter = statusFilterValue;
  }

  /**
   * Загружает список самокатов с учётом текущих фильтров.
   * @param options.silent - Фоновое обновление без индикатора полной загрузки.
   * @returns Promise завершения загрузки.
   */
  public fetchScooters(options?: { silent?: boolean }): Promise<void> {
    const silent = options?.silent ?? false;
    const requestKey = `${this.appliedSearch}:${this.statusFilter}:${silent ? 'silent' : 'full'}`;
    return this.fetchGuard.runGuardedRequest(requestKey, () => this.loadScootersList(silent));
  }

  /**
   * Фоновое обновление для polling.
   * @returns Promise завершения загрузки.
   */
  public refreshScooters(): Promise<void> {
    return this.fetchScooters({ silent: true });
  }

  /**
   * Подготавливает список доступных самокатов для формы аренды.
   * @returns Promise завершения загрузки.
   */
  public async prepareAvailableScooters(): Promise<void> {
    if (this.searchDebounceTimer !== null) {
      window.clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }

    this.statusFilter = 'available';
    this.search = '';
    this.appliedSearch = '';
    await this.fetchScooters();
  }

  /** Открывает модальное окно создания самоката. */
  public openCreateModal(): void {
    this.modalOpen = true;
    this.modalMode = 'create';
    this.editingScooterId = null;
    this.formData = { ...DEFAULT_SCOOTER_FORM };
    this.formSubmitting = false;
  }

  /**
   * Открывает модальное окно редактирования самоката.
   * @param scooter - Редактируемый самокат.
   */
  public openEditModal(scooter: Scooter): void {
    this.modalOpen = true;
    this.modalMode = 'edit';
    this.editingScooterId = scooter.id;
    this.formData = this.mapScooterToFormData(scooter);
    this.formSubmitting = false;
  }

  /** Закрывает модальное окно формы самоката. */
  public closeModal(): void {
    this.modalOpen = false;
    this.modalMode = null;
    this.editingScooterId = null;
    this.formSubmitting = false;
  }

  /**
   * Обновляет поле формы самоката.
   * @param fieldName - Имя поля формы.
   * @param fieldValue - Новое значение поля.
   */
  public setFormField(fieldName: keyof ScooterFormData, fieldValue: string | number): void {
    this.formData = {
      ...this.formData,
      [fieldName]: fieldValue,
    };
  }

  /**
   * Сохраняет форму самоката (создание или обновление).
   * @returns Promise завершения операции.
   */
  public async submitForm(): Promise<void> {
    this.formSubmitting = true;

    try {
      if (this.modalMode === 'create') {
        await this.createScooter(this.formData);
        notificationStore.showSuccess('Самокат успешно создан');
      } else if (this.editingScooterId !== null) {
        await this.updateScooter(this.editingScooterId, this.formData);
        notificationStore.showSuccess('Самокат успешно обновлён');
      }

      this.closeModal();
    } catch (error) {
      runInAction(() => {
        this.formSubmitting = false;
      });
      notificationStore.showErrorFromUnknown(error);
    }
  }

  /**
   * Удаляет самокат после подтверждения пользователя.
   * @param scooterId - ID удаляемого самоката.
   */
  public async deleteScooterWithConfirm(scooterId: number): Promise<void> {
    if (!window.confirm('Удалить самокат?')) {
      return;
    }

    try {
      await this.deleteScooter(scooterId);
      notificationStore.showSuccess('Самокат успешно удалён');
    } catch (error) {
      notificationStore.showErrorFromUnknown(error);
    }
  }

  /**
   * Откладывает применение строки поиска для debounce.
   */
  private scheduleSearchApply(): void {
    if (this.searchDebounceTimer !== null) {
      window.clearTimeout(this.searchDebounceTimer);
    }

    this.searchDebounceTimer = window.setTimeout(() => {
      runInAction(() => {
        this.appliedSearch = this.search;
      });
    }, SEARCH_DEBOUNCE_MS);
  }

  /**
   * Внутренний метод: выполняет GET `/scooters` и обновляет `items`.
   * @param silent - Фоновое обновление без полноэкранного loading.
   */
  private async loadScootersList(silent: boolean): Promise<void> {
    if (silent) {
      this.refreshing = true;
    } else {
      this.loading = true;
    }

    try {
      const params: Record<string, string> = {};
      if (this.appliedSearch) params.search = this.appliedSearch;
      if (this.statusFilter) params.status = this.statusFilter;
      const data = await QueryService.getRequest<Scooter[]>('/scooters', params);
      runInAction(() => {
        this.items = data;
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

  /**
   * Создаёт новый самокат и перезагружает список.
   * @param scooterFormData - Данные формы создания самоката.
   */
  private async createScooter(scooterFormData: ScooterFormData): Promise<void> {
    await QueryService.postRequest<Scooter>('/scooters', scooterFormData);
    await this.fetchScooters();
  }

  /**
   * Обновляет существующий самокат и перезагружает список.
   * @param scooterId - ID редактируемого самоката.
   * @param scooterFormData - Обновлённые поля самоката.
   */
  private async updateScooter(scooterId: number, scooterFormData: ScooterFormData): Promise<void> {
    await QueryService.putRequest<Scooter>(`/scooters/${scooterId}`, scooterFormData);
    await this.fetchScooters();
  }

  /**
   * Удаляет самокат по ID и перезагружает список.
   * @param scooterId - ID удаляемого самоката.
   */
  private async deleteScooter(scooterId: number): Promise<void> {
    await QueryService.deleteRequest(`/scooters/${scooterId}`);
    await this.fetchScooters();
  }

  /**
   * Преобразует самокат из API в данные формы редактирования.
   * @param scooter - Самокат из backend.
   * @returns Данные для формы.
   */
  private mapScooterToFormData(scooter: {
    number: string;
    model: string;
    status: ScooterStatus;
    battery_level: number;
    latitude: number;
    longitude: number;
  }): ScooterFormData {
    return {
      number: scooter.number,
      model: scooter.model,
      status: scooter.status,
      battery_level: scooter.battery_level,
      latitude: scooter.latitude,
      longitude: scooter.longitude,
    };
  }
}

export const scooterStore = new ScooterStore();
