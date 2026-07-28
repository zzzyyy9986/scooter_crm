import { makeAutoObservable, runInAction } from 'mobx';
import { QueryService } from '../services/QueryService';
import type { LoginFormData, LoginResponse, User } from '../types/api';

/** MobX-store аутентификации пользователя. */
export class AuthStore {
  user: User | null = null;
  token: string | null = null;
  loading = false;
  error: string | null = null;
  initialized = false;

  /** Регистрирует store как observable для MobX. */
  public constructor() {
    makeAutoObservable(this);
    QueryService.setOnUnauthorized(() => this.clearSession());
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
   * Выполняет вход по email и паролю.
   * @param credentials - Email и пароль пользователя.
   */
  public async login(credentials: LoginFormData): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const response = await QueryService.postRequest<LoginResponse>('/login', credentials);
      QueryService.setAuthToken(response.token);
      runInAction(() => {
        this.token = response.token;
        this.user = response.user;
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        this.loading = false;
      });
      throw error;
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
    }
  }

  /** Сбрасывает token и данные пользователя. */
  public clearSession(): void {
    QueryService.setAuthToken(null);
    runInAction(() => {
      this.token = null;
      this.user = null;
      this.error = null;
    });
  }
}

export const authStore = new AuthStore();
