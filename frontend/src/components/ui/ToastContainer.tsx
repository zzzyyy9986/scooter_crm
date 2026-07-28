import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/root-store';
import type { NotificationType } from '../../store/NotificationStore';
import './ToastContainer.css';

const TYPE_LABEL: Record<NotificationType, string> = {
  success: 'Успешно',
  error: 'Ошибка',
  info: 'Информация',
};

/** Контейнер toast-уведомлений в правом нижнем углу. */
export const ToastContainer = observer(function ToastContainer() {
  const { notificationStore } = useRootStore();

  if (notificationStore.items.length === 0) {
    return null;
  }

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="false">
      {notificationStore.items.map((item) => {
        const isExiting = notificationStore.exitingIds.includes(item.id);

        return (
          <div
            key={item.id}
            className={`toast-item toast-item--${item.type}${isExiting ? ' toast-item--exit' : ' toast-item--enter'}`}
            role="alert"
          >
            <div className="toast-item__content">
              <span className="toast-item__label">{TYPE_LABEL[item.type]}</span>
              <p className="toast-item__message">{item.message}</p>
            </div>
            <button
              type="button"
              className="toast-item__close"
              aria-label="Закрыть уведомление"
              onClick={(event) => {
                event.stopPropagation();
                notificationStore.dismiss(item.id);
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
});
