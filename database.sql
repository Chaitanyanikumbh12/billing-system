-- Run this on your MySQL server (Railway / PlanetScale / Clever Cloud / etc.)

CREATE DATABASE IF NOT EXISTS advanced_billing_db;
USE advanced_billing_db;

CREATE TABLE IF NOT EXISTS users (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50)  NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);

INSERT IGNORE INTO users (username, password) VALUES ('admin', 'admin123');

CREATE TABLE IF NOT EXISTS products (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    price        DOUBLE       NOT NULL,
    stock        INT          NOT NULL
);

CREATE TABLE IF NOT EXISTS bills (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    customer_name  VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20),
    total_amount   DOUBLE       NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bill_items (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    bill_id   INT,
    item_name VARCHAR(100),
    price     DOUBLE,
    qty       INT,
    total     DOUBLE,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
);
