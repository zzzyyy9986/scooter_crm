import axios from 'axios';
import type { ApiErrorBody } from '../types/api';

/**
 * Преобразует ошибку в читаемое сообщение для пользователя.
 * @param error - Исходная ошибка из catch или rejected Promise.
 * @returns Текст ошибки.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const data = error.response?.data;
    if (data?.message) return data.message;
    if (data?.errors) return Object.values(data.errors).flat().join(', ');
    return `Request failed (${error.response?.status ?? 'network'})`;
  }

  if (error instanceof Error) return error.message;

  return 'Unknown error';
}
