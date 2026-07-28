import { makeAutoObservable } from 'mobx';
import { getErrorMessage } from '../utils/getErrorMessage';

export type NotificationType = 'error' | 'success' | 'info';

export interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
}

const AUTO_DISMISS_MS = 5000;
const EXIT_ANIMATION_MS = 320;

/** MobX-store единого потока уведомлений (toast). */
export class NotificationStore {
  items: NotificationItem[] = [];
  exitingIds: string[] = [];

  private dismissTimers = new Map<string, number>();

  /** Регистрирует store как observable для MobX. */
  public constructor() {
    makeAutoObservable(this);
  }

  /**
   * Показывает toast с ошибкой.
   * @param message - Текст ошибки для пользователя.
   */
  public showError(message: string): void {
    this.addNotification('error', message);
  }

  /**
   * Показывает toast об успешной операции.
   * @param message - Текст уведомления.
   */
  public showSuccess(message: string): void {
    this.addNotification('success', message);
  }

  /**
   * Показывает toast из перехваченной ошибки.
   * @param error - Исходная ошибка.
   */
  public showErrorFromUnknown(error: unknown): void {
    this.showError(getErrorMessage(error));
  }

  /**
   * Запускает анимацию скрытия и удаляет уведомление.
   * @param notificationId - ID уведомления.
   */
  public dismiss(notificationId: string): void {
    if (this.exitingIds.includes(notificationId)) {
      return;
    }

    const timerId = this.dismissTimers.get(notificationId);
    if (timerId !== undefined) {
      window.clearTimeout(timerId);
      this.dismissTimers.delete(notificationId);
    }

    this.exitingIds.push(notificationId);

    window.setTimeout(() => {
      this.exitingIds = this.exitingIds.filter((id) => id !== notificationId);
      this.remove(notificationId);
    }, EXIT_ANIMATION_MS);
  }

  /**
   * Удаляет уведомление из очереди без анимации.
   * @param notificationId - ID уведомления.
   */
  private remove(notificationId: string): void {
    this.items = this.items.filter((item) => item.id !== notificationId);
    this.dismissTimers.delete(notificationId);
  }

  /**
   * Добавляет уведомление и планирует автоматическое скрытие.
   * @param type - Тип уведомления.
   * @param message - Текст уведомления.
   */
  private addNotification(type: NotificationType, message: string): void {
    const id = crypto.randomUUID();
    this.items.push({ id, message, type });

    const timerId = window.setTimeout(() => {
      this.dismiss(id);
    }, AUTO_DISMISS_MS);

    this.dismissTimers.set(id, timerId);
  }
}

export const notificationStore = new NotificationStore();
