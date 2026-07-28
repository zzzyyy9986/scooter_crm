-- НЕ используется при деплое с MySQL в Docker (режим external по умолчанию).
-- Этот скрипт нужен только если вы сознательно подключаетесь к MySQL на хосте.
--
-- mysql -u root -p < scripts/init-host-mysql.sql

CREATE DATABASE IF NOT EXISTS scooter_crm
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'scooter'@'localhost' IDENTIFIED BY 'change_me_db';
GRANT ALL PRIVILEGES ON scooter_crm.* TO 'scooter'@'localhost';
FLUSH PRIVILEGES;
