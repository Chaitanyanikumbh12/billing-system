-- ============================================================
-- BillEase — Supabase / PostgreSQL Schema
-- Run this in your Supabase SQL editor BEFORE first launch
-- (Spring Boot will auto-create tables via JPA, but this gives
--  you manual control and sample data)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    gst_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DOUBLE PRECISION NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    category VARCHAR(100),
    hsn_code VARCHAR(20),
    tax_rate DOUBLE PRECISION DEFAULT 18.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bills table
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    user_id UUID REFERENCES users(id),
    subtotal DOUBLE PRECISION NOT NULL,
    discount DOUBLE PRECISION DEFAULT 0,
    cgst_amount DOUBLE PRECISION DEFAULT 0,
    sgst_amount DOUBLE PRECISION DEFAULT 0,
    igst_amount DOUBLE PRECISION DEFAULT 0,
    total_tax DOUBLE PRECISION DEFAULT 0,
    total_amount DOUBLE PRECISION NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'CASH',
    status VARCHAR(50) DEFAULT 'PAID',
    gst_type VARCHAR(20) DEFAULT 'CGST_SGST',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bill Items table
CREATE TABLE IF NOT EXISTS bill_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    hsn_code VARCHAR(20),
    quantity INTEGER NOT NULL,
    unit_price DOUBLE PRECISION NOT NULL,
    tax_rate DOUBLE PRECISION DEFAULT 0,
    tax_amount DOUBLE PRECISION DEFAULT 0,
    total_price DOUBLE PRECISION NOT NULL
);

-- ─── Sample Products ──────────────────────────────────────
INSERT INTO products (name, description, price, stock_quantity, category, hsn_code, tax_rate) VALUES
('LED Bulb 9W',      'Energy-saving LED bulb',      85.00,  150, 'Electronics',      '8539', 18),
('USB-C Cable 1m',   'Fast charging cable',         299.00, 80,  'Electronics',      '8544', 18),
('A4 Paper Ream',    '500 sheets, 75 GSM',          320.00, 60,  'Stationery',       '4802', 12),
('Ball Pen Blue',    'Smooth writing pen',          15.00,  300, 'Stationery',       '9608', 12),
('Hand Sanitizer',   '500ml, 70% alcohol',          120.00, 200, 'Health & Beauty',  '3808',  5),
('Coffee Mug 350ml', 'Ceramic coffee mug',          250.00, 45,  'Home & Kitchen',   '6912', 18),
('Notebook A5',      '200 pages ruled',             80.00,  120, 'Stationery',       '4820', 12),
('HDMI Cable 2m',    '4K UHD HDMI cable',           450.00, 35,  'Electronics',      '8544', 18)
ON CONFLICT DO NOTHING;
