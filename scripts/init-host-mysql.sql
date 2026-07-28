-- Подготовка MySQL на хосте для Scooter CRM.
-- Выполните от root: mysql -u root -p < scripts/init-host-mysql.sql
-- Замените 'change_me_db' на пароль из .env (MYSQL_PASSWORD).

CREATE DATABASE IF NOT EXISTS scooter_crm
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'scooter'@'localhost' IDENTIFIED BY 'change_me_db';
GRANT ALL PRIVILEGES ON scooter_crm.* TO 'scooter'@'localhost';
FLUSH PRIVILEGES;
