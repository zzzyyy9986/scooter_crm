import type { ReactNode } from 'react';

export interface BasePageProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

/**
 * Базовая обёртка страницы с заголовком и опциональной панелью действий.
 * @param title - Заголовок страницы.
 * @param children - Основное содержимое страницы.
 * @param actions - Кнопки или элементы управления справа от заголовка.
 */
export function BasePage({ title, children, actions }: BasePageProps) {
  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h1 className="h3 mb-0">{title}</h1>
        {actions}
      </div>
      {children}
    </div>
  );
}
