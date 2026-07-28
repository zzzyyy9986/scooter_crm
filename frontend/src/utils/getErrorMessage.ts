import axios from 'axios';
import type { ApiErrorBody } from '../types/api';

/** Перевод типовых сообщений API на русский. */
const API_MESSAGE_TRANSLATIONS: Record<string, string> = {
  'Cannot delete scooter with active rental.': 'Нельзя удалить самокат с активной арендой.',
  'Нельзя удалить самокат с активной арендой.': 'Нельзя удалить самокат с активной арендой.',
  'Нельзя изменить статус самоката, пока у него есть активная аренда.':
    'Нельзя изменить статус самоката, пока у него есть активная аренда.',
  'Rental is already completed.': 'Аренда уже завершена.',
  'Server error.': 'Ошибка сервера.',
};

/**
 * Переводит сообщение API на русский, если есть известный ключ.
 * @param message - Исходный текст ошибки.
 */
function translateApiMessage(message: string): string {
  return API_MESSAGE_TRANSLATIONS[message] ?? message;
}

/**
 * Извлекает текст сообщения из тела ответа API.
 * @param data - Тело ошибки от backend.
 */
function extractMessageFromBody(data: ApiErrorBody | string | undefined): string | null {
  if (!data) {
    return null;
  }

  if (typeof data === 'string' && data.trim()) {
    return translateApiMessage(data.trim());
  }

  if (typeof data === 'object') {
    if (data.message) {
      return translateApiMessage(data.message);
    }

    if (data.errors) {
      return Object.values(data.errors).flat().join(', ');
    }
  }

  return null;
}

/**
 * Преобразует ошибку в читаемое сообщение для пользователя.
 * @param error - Исходная ошибка из catch или rejected Promise.
 * @returns Текст ошибки.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody | string>(error)) {
    const message = extractMessageFromBody(error.response?.data);

    if (message) {
      return message;
    }

    return `Ошибка запроса (${error.response?.status ?? 'сеть'})`;
  }

  if (error instanceof Error && error.message) {
    return translateApiMessage(error.message);
  }

  return 'Неизвестная ошибка';
}
