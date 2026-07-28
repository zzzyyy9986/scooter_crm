import { makeAutoObservable, runInAction } from 'mobx';
import { QueryService } from '../services/QueryService';
import type { LoginFormData, LoginResponse, User } from '../types/api';
import { notificationStore } from './NotificationStore';

/** MobX-store аутентификации пользователя. */
export class AuthStore {
  user: User | null = null;
  token: string | null = null;
  loading = false;
  initialized = false;

  loginEmail = '';
  loginPassword = '';

  /** Регистрирует store как observable для MobX. */
  public constructor() {
    makeAutoObservable(this);
    QueryService.setOnUnauthorized(() => {
      this.clearSession();
      notificationStore.showError('Сессия истекла. Войдите снова.');
    });
  }

  /** Пользователь авторизован и имеет действующий token. */
  public get isAuthenticated(): boolean {
    return this.token !== null && this.user !== null;
  }

  /**
   * Восстанавливает сессию из localStorage и проверяет token через `/user`.
   * @returns Promise завершения инициализации.
   */
  public async initialize(): Promise<void> {
    const savedToken = localStorage.getItem('auth_token');
    if (!savedToken) {
      runInAction(() => {
        this.initialized = true;
      });
      return;
    }

    QueryService.setAuthToken(savedToken);

    try {
      const user = await QueryService.getRequest<User>('/user');
      runInAction(() => {
        this.token = savedToken;
        this.user = user;
        this.initialized = true;
      });
    } catch {
      this.clearSession();
      runInAction(() => {
        this.initialized = true;
      });
    }
  }

  /**
   * Обновляет поле формы входа.
   * @param fieldName - Имя поля (`email` или `password`).
   * @param fieldValue - Новое значение поля.
   */
  public setLoginField(fieldName: 'email' | 'password', fieldValue: string): void {
    if (fieldName === 'email') {
      this.loginEmail = fieldValue;
      return;
    }

    this.loginPassword = fieldValue;
  }

  /**
   * Выполняет вход по данным формы.
   * @returns Promise успешности входа.
   */
  public async submitLogin(): Promise<boolean> {
    this.loading = true;

    const credentials: LoginFormData = {
      email: this.loginEmail,
      password: this.loginPassword,
    };

    try {
      const response = await QueryService.postRequest<LoginResponse>('/login', credentials);
      QueryService.setAuthToken(response.token);
      runInAction(() => {
        this.token = response.token;
        this.user = response.user;
        this.loading = false;
      });
      notificationStore.showSuccess('Вход выполнен успешно');
      return true;
    } catch (error) {
      runInAction(() => {
        this.loading = false;
      });
      notificationStore.showErrorFromUnknown(error);
      return false;
    }
  }

  /**
   * Завершает сессию на сервере и очищает локальное состояние.
   */
  public async logout(): Promise<void> {
    try {
      if (this.token) {
        await QueryService.postRequest<{ message: string }>('/logout', {});
      }
    } catch {
      // Игнорируем ошибки logout — локальная сессия всё равно сбрасывается.
    } finally {
      this.clearSession();
      notificationStore.showSuccess('Вы вышли из системы');
    }
  }

  /** Сбрасывает token и данные пользователя. */
  public clearSession(): void {
    QueryService.setAuthToken(null);
    runInAction(() => {
      this.token = null;
      this.user = null;
    });
  }
}

export const authStore = new AuthStore();
