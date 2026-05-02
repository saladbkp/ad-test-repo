-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `dutyfree`;

USE `dutyfree`;

ALTER DATABASE `dutyfree` CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `users` (
    `id` CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID_v4()),
    `full_name` VARCHAR(255) NOT NULL,
    `username` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(32) NOT NULL,
    `loyalty_points` INT NOT NULL,
    `auth_key` CHAR(128) NOT NULL UNIQUE,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `products` (
    `id` CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID_v4()),
    `name` TEXT NOT NULL,
    `image` TEXT NOT NULL,
    `description` LONGTEXT NOT NULL,
    `price` INT NOT NULL,
    `is_customizable` BOOLEAN NOT NULL,
    `tag` TEXT,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `orders` (
    `id` CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID_v4()),
    `user_id` CHAR(36) NOT NULL,
    `total` INT NOT NULL,
    `loyalty_discount` INT NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);

CREATE TABLE IF NOT EXISTS `product_orders` (
    `id` CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID_v4()),
    `product_id` CHAR(36) NOT NULL,
    `order_id` CHAR(36) NOT NULL,
    `quantity` INT NOT NULL,
    `customization` LONGTEXT,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),  
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)  
);

CREATE TABLE IF NOT EXISTS `order_shares` (
    `id` CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID_v4()),
    `order_id` CHAR(36) NOT NULL,
    `auth_key` CHAR(128) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
    FOREIGN KEY (`auth_key`) REFERENCES `users` (`auth_key`),
    UNIQUE (`order_id`, `auth_key`)
);

CREATE USER IF NOT EXISTS 'mariadb'@'%' IDENTIFIED BY 'password';

-- this prevents other teams from changing/deleting flags
-- i wouldn't change it if i were you, but you do you
GRANT SELECT, INSERT ON `dutyfree`.* TO 'mariadb'@'%';
GRANT UPDATE (`loyalty_points`) ON `dutyfree`.`users` TO 'mariadb'@'%';
GRANT DELETE ON `dutyfree`.`order_shares` TO 'mariadb'@'%';

FLUSH PRIVILEGES;