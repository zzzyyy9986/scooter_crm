import axios from 'axios';
import type { ApiErrorBody } from '../types/api';

const AUTH_TOKEN_KEY = 'auth_token';

/** HTTP-клиент axios с базовым URL из переменных окружения Vite. */
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let authToken: string | null = localStorage.getItem(AUTH_TOKEN_KEY);
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

/**
 * Преобразует ошибку axios или JavaScript в читаемое сообщение для UI.
 * @param error - Исходная ошибка из блока catch.
 * @returns Текст ошибки для отображения пользователю.
 */
function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const data = error.response?.data;
    if (data?.message) return data.message;
    if (data?.errors) return Object.values(data.errors).flat().join(', ');
    return `Request failed (${error.response?.status ?? 'network'})`;
  }
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}

/** Сервис HTTP-запросов к backend API. */
export class QueryService {
  /** Устанавливает Bearer token для последующих запросов. */
  public static setAuthToken(token: string | null): void {
    authToken = token;
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
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
    try {
      const response = await client.get<T>(url, { params });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  /**
   * Выполняет POST-запрос к API.
   * @param url - Относительный путь ресурса.
   * @param data - JSON-тело запроса.
   * @returns Тело ответа, типизированное generic-параметром T.
   */
  public static async postRequest<T>(url: string, data: object): Promise<T> {
    try {
      const response = await client.post<T>(url, data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  /**
   * Выполняет PUT-запрос к API.
   * @param url - Относительный путь ресурса.
   * @param data - JSON-тело запроса с обновляемыми полями.
   * @returns Тело ответа, типизированное generic-параметром T.
   */
  public static async putRequest<T>(url: string, data: object): Promise<T> {
    try {
      const response = await client.put<T>(url, data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  /**
   * Выполняет DELETE-запрос к API.
   * @param url - Относительный путь удаляемого ресурса.
   */
  public static async deleteRequest(url: string): Promise<void> {
    try {
      await client.delete(url);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }
}
