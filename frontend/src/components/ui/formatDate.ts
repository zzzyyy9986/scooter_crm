/**
 * Форматирует ISO-дату в локальную строку для отображения в таблицах.
 * @param dateString - Дата в формате ISO или null/undefined.
 * @returns Отформатированная дата или «—», если значение пустое.
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('ru-RU');
}
