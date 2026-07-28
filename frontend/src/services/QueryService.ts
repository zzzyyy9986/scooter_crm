import axios from 'axios';

/** HTTP-клиент axios с базовым URL из переменных окружения Vite. */
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let authToken: string | null = localStorage.getItem('auth_token');
let onUnauthorized: (() => void) | null = null;

client.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && authToken) {
      onUnauthorized?.();
    }

    return Promise.reject(error);
  },
);

/** Сервис HTTP-запросов к backend API. */
export class QueryService {
  /** Устанавливает Bearer token для последующих запросов. */
  public static setAuthToken(token: string | null): void {
    authToken = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  /** Регистрирует callback при ответе 401 Unauthorized. */
  public static setOnUnauthorized(callback: () => void): void {
    onUnauthorized = callback;
  }

  /**
   * Выполняет GET-запрос к API.
   * @param url - Относительный путь ресурса (например, `/scooters`).
   * @param params - Query-параметры строки запроса.
   * @returns Тело ответа, типизированное generic-параметром T.
   */
  public static async getRequest<T>(
    url: string,
    params?: Record<string, string>,
  ): Promise<T> {
    const response = await client.get<T>(url, { params });
    return response.data;
  }

  /**
   * Выполняет POST-запрос к API.
   * @param url - Относительный путь ресурса.
   * @param data - JSON-тело запроса.
   * @returns Тело ответа, типизированное generic-параметром T.
   */
  public static async postRequest<T>(url: string, data: object): Promise<T> {
    const response = await client.post<T>(url, data);
    return response.data;
  }

  /**
   * Выполняет PUT-запрос к API.
   * @param url - Относительный путь ресурса.
   * @param data - JSON-тело запроса с обновляемыми полями.
   * @returns Тело ответа, типизированное generic-параметром T.
   */
  public static async putRequest<T>(url: string, data: object): Promise<T> {
    const response = await client.put<T>(url, data);
    return response.data;
  }

  /**
   * Выполняет DELETE-запрос к API.
   * @param url - Относительный путь удаляемого ресурса.
   */
  public static async deleteRequest(url: string): Promise<void> {
    await client.delete(url);
  }
}
