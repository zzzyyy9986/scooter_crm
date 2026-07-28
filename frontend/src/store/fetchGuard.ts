/**
 * Предотвращает параллельные одинаковые запросы (например, при двойном mount в StrictMode).
 */
export class FetchGuard {
  private inFlightRequest: Promise<void> | null = null;
  private currentRequestKey = '';

  /**
   * Запускает асинхронную операцию с дедупликацией по ключу.
   * Если запрос с тем же ключом уже выполняется, возвращает существующий Promise.
   * @param requestKey - Уникальный ключ текущего запроса (фильтры, параметры).
   * @param requestFunction - Функция, выполняющая фактическую загрузку данных.
   * @returns Promise завершения операции.
   */
  public runGuardedRequest(
    requestKey: string,
    requestFunction: () => Promise<void>,
  ): Promise<void> {
    if (this.inFlightRequest && this.currentRequestKey === requestKey) {
      return this.inFlightRequest;
    }

    this.currentRequestKey = requestKey;
    this.inFlightRequest = requestFunction().finally(() => {
      if (this.currentRequestKey === requestKey) {
        this.inFlightRequest = null;
      }
    });

    return this.inFlightRequest;
  }
}
