-- ====================================================================
-- ADITYA BIRLA - UNIT BIRLA WHITE SALES ERP DATABASE SCHEMA
-- PostgreSQL Database: birla_white_erp
-- ====================================================================

-- 1. Stockists Master Table
CREATE TABLE IF NOT EXISTS stockists (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    firm_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(150),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    gstin VARCHAR(30),
    pan VARCHAR(30),
    territory VARCHAR(100),
    zone VARCHAR(50),
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    credit_limit NUMERIC(12, 2) DEFAULT 1500000.00,
    credit_days INT DEFAULT 45,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Retailers Master Table (With Stockist-to-Retailer Mapping)
CREATE TABLE IF NOT EXISTS retailers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    firm_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(150),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    gstin VARCHAR(30),
    pan_aadhar VARCHAR(50),
    stockist_id INT REFERENCES stockists(id) ON DELETE SET NULL,
    territory VARCHAR(100),
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    credit_limit NUMERIC(12, 2) DEFAULT 300000.00,
    credit_days INT DEFAULT 30,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Product Catalog Table
-- Unit Types: Bag, Bucket, Box, Manual
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit_type VARCHAR(50) NOT NULL, -- 'Bag', 'Bucket', 'Box', 'Manual'
    packaging_size VARCHAR(50) NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL,
    hsn_code VARCHAR(20) DEFAULT '25232100',
    gst_rate NUMERIC(5, 2) DEFAULT 18.00,
    min_order_qty INT DEFAULT 1,
    in_stock_qty INT DEFAULT 500,
    status VARCHAR(20) DEFAULT 'Active',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    retailer_id INT REFERENCES retailers(id) NOT NULL,
    stockist_id INT REFERENCES stockists(id) NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    status VARCHAR(30) DEFAULT 'Confirmed', -- 'Draft', 'Confirmed', 'Processing', 'Dispatched', 'Completed', 'Cancelled'
    dispatch_status VARCHAR(30) DEFAULT 'Pending', -- 'Pending', 'Full', 'Partial', 'Out of Stock'
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    gst_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    dispatched_amount NUMERIC(12, 2) DEFAULT 0.00,
    pending_amount NUMERIC(12, 2) DEFAULT 0.00,
    sales_officer VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Order Line Items Table (Supports Manual Rate Entry per item!)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    unit_type VARCHAR(50) NOT NULL,
    packaging_size VARCHAR(50),
    standard_price NUMERIC(10, 2) NOT NULL,
    manual_rate NUMERIC(10, 2) NOT NULL, -- Negotiated/entered rate for this retailer
    ordered_qty INT NOT NULL,
    dispatched_qty INT DEFAULT 0,
    pending_qty INT DEFAULT 0,
    gst_rate NUMERIC(5, 2) DEFAULT 18.00,
    item_subtotal NUMERIC(12, 2) NOT NULL,
    item_gst NUMERIC(12, 2) NOT NULL,
    item_total NUMERIC(12, 2) NOT NULL
);

-- 6. Dispatch Records Table (For Partial / Full / Out-of-Stock Dispatches)
CREATE TABLE IF NOT EXISTS dispatch_records (
    id SERIAL PRIMARY KEY,
    dispatch_number VARCHAR(50) UNIQUE NOT NULL,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    dispatch_type VARCHAR(30) NOT NULL, -- 'Full', 'Partial', 'Out of Stock'
    dispatch_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    vehicle_no VARCHAR(50),
    driver_name VARCHAR(100),
    driver_contact VARCHAR(50),
    partial_reason TEXT, -- Mandatory / specific reason when partial
    total_dispatched_qty INT NOT NULL,
    total_dispatched_amt NUMERIC(12, 2) NOT NULL,
    total_pending_qty INT NOT NULL,
    total_pending_amt NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Dispatch Items Breakdown
CREATE TABLE IF NOT EXISTS dispatch_items (
    id SERIAL PRIMARY KEY,
    dispatch_id INT REFERENCES dispatch_records(id) ON DELETE CASCADE,
    order_item_id INT REFERENCES order_items(id),
    product_id INT REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    unit_type VARCHAR(50) NOT NULL,
    packaging_size VARCHAR(50),
    ordered_qty INT NOT NULL,
    dispatched_qty INT NOT NULL,
    pending_qty INT NOT NULL,
    manual_rate NUMERIC(10, 2) NOT NULL,
    dispatched_amount NUMERIC(12, 2) NOT NULL,
    pending_amount NUMERIC(12, 2) NOT NULL
);

-- 8. Ledger and Payments Table (Retailer & Stockist Accounts, Overdue Tracking)
CREATE TABLE IF NOT EXISTS payments_ledger (
    id SERIAL PRIMARY KEY,
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    entity_type VARCHAR(20) NOT NULL, -- 'Retailer' or 'Stockist'
    retailer_id INT REFERENCES retailers(id),
    stockist_id INT REFERENCES stockists(id),
    order_id INT REFERENCES orders(id),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(12, 2) NOT NULL,
    payment_type VARCHAR(20) NOT NULL, -- 'Credit' (Payment Received) or 'Debit' (Invoice/Bill)
    payment_mode VARCHAR(50), -- 'NEFT/RTGS', 'UPI', 'Cheque', 'Cash', 'Credit Note'
    reference_no VARCHAR(100), -- UTR or Cheque number
    bank_name VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. PJP Beats (Permanent Journey Plan - Beats / Route Masters)
CREATE TABLE IF NOT EXISTS pjp_beats (
    id SERIAL PRIMARY KEY,
    beat_code VARCHAR(50) UNIQUE NOT NULL,
    beat_name VARCHAR(100) NOT NULL,
    sales_officer VARCHAR(100) NOT NULL,
    territory VARCHAR(100) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL, -- 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. PJP Retailer Visits / Route Executions
CREATE TABLE IF NOT EXISTS pjp_visits (
    id SERIAL PRIMARY KEY,
    beat_id INT REFERENCES pjp_beats(id) ON DELETE CASCADE,
    retailer_id INT REFERENCES retailers(id) NOT NULL,
    sales_officer VARCHAR(100) NOT NULL,
    planned_date DATE NOT NULL,
    actual_visit_date DATE,
    visit_status VARCHAR(30) DEFAULT 'Planned', -- 'Planned', 'Visited', 'Order Booked', 'Payment Collected', 'Rescheduled', 'Shop Closed'
    discussion_notes TEXT,
    order_booked_amt NUMERIC(12, 2) DEFAULT 0.00,
    payment_collected_amt NUMERIC(12, 2) DEFAULT 0.00,
    next_followup_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_retailers_stockist ON retailers(stockist_id);
CREATE INDEX IF NOT EXISTS idx_orders_retailer ON orders(retailer_id);
CREATE INDEX IF NOT EXISTS idx_orders_stockist ON orders(stockist_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_order ON dispatch_records(order_id);
CREATE INDEX IF NOT EXISTS idx_ledger_retailer ON payments_ledger(retailer_id);
CREATE INDEX IF NOT EXISTS idx_ledger_stockist ON payments_ledger(stockist_id);
CREATE INDEX IF NOT EXISTS idx_pjp_visits_date ON pjp_visits(planned_date);
