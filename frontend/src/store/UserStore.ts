import { makeAutoObservable, runInAction } from 'mobx';
import { QueryService } from '../services/QueryService';
import type { User } from '../types/api';
import { FetchGuard } from './fetchGuard';
import { notificationStore } from './NotificationStore';

/** MobX-store списка пользователей. */
export class UserStore {
  items: User[] = [];
  loading = false;

  private fetchGuard = new FetchGuard();

  /** Регистрирует store как observable для MobX. */
  public constructor() {
    makeAutoObservable(this);
  }

  /**
   * Загружает список пользователей для выбора арендатора.
   * @returns Promise завершения загрузки.
   */
  public fetchUsers(): Promise<void> {
    return this.fetchGuard.runGuardedRequest('users', () => this.loadUsersList());
  }

  /**
   * Внутренний метод: выполняет GET `/users` и обновляет `items`.
   */
  private async loadUsersList(): Promise<void> {
    this.loading = true;

    try {
      const data = await QueryService.getRequest<User[]>('/users');
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
}

export const userStore = new UserStore();
