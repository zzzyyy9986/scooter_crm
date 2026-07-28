/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ADMINER_URL?: string;
  readonly VITE_ADMINER_DB_USER?: string;
  readonly VITE_ADMINER_DB_NAME?: string;
  readonly VITE_ADMINER_DB_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.css';
