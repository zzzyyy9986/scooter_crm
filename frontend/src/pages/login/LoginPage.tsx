import { observer } from 'mobx-react-lite';
import type { ChangeEvent, FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useRootStore } from '../../store/root-store';

const adminerUrl =
  import.meta.env.VITE_ADMINER_URL ??
  (import.meta.env.DEV ? 'http://localhost:8080' : undefined);

const adminerDbUser = import.meta.env.VITE_ADMINER_DB_USER ?? 'scooter';
const adminerDbName = import.meta.env.VITE_ADMINER_DB_NAME ?? 'scooter_crm';

/** Страница входа в систему. */
export const LoginPage = observer(function LoginPage() {
  const { authStore } = useRootStore();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath =
    (location.state as { from?: string } | null)?.from ?? '/';

  if (authStore.initialized && authStore.isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  /**
   * Обновляет поле формы при вводе.
   * @param event - Событие изменения input.
   */
  const handleFieldChange = (event: ChangeEvent<HTMLInputElement>): void => {
    authStore.setLoginField(
      event.target.name as 'email' | 'password',
      event.target.value,
    );
  };

  /**
   * Отправляет форму входа.
   * @param event - Событие submit формы.
   */
  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    const isSuccess = await authStore.submitLogin();
    if (isSuccess) {
      navigate(redirectPath, { replace: true });
    }
  };

  if (!authStore.initialized) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light text-muted">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm" style={{ width: '100%', maxWidth: 420 }}>
        <div className="card-body p-4">
          <h1 className="h4 mb-1 text-center">Scooter CRM</h1>
          <p className="text-muted text-center mb-4">Вход в систему</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="form-control"
                type="email"
                name="email"
                value={authStore.loginEmail}
                onChange={handleFieldChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label" htmlFor="password">
                Пароль
              </label>
              <input
                id="password"
                className="form-control"
                type="password"
                name="password"
                value={authStore.loginPassword}
                onChange={handleFieldChange}
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={authStore.loading}>
              {authStore.loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <p className="text-muted small text-center mt-4 mb-0">
            admin@scooter-crm.local / password
          </p>

          {adminerUrl && (
            <div className="text-center mt-3 pt-3 border-top">
              <a
                href={adminerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="small"
              >
                Adminer — просмотр БД
              </a>
              <p className="text-muted small mb-0 mt-2">
                Server: <code>mysql</code>, user: <code>{adminerDbUser}</code>, database:{' '}
                <code>{adminerDbName}</code>
                {import.meta.env.DEV ? (
                  <>
                    , password: <code>scooter</code>
                  </>
                ) : (
                  <> (пароль — <code>MYSQL_PASSWORD</code> из <code>.env</code> на сервере)</>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
