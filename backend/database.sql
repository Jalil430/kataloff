-- ==============================
--   Islamic Murabaha Calculator
--   Database schema for PostgreSQL
-- ==============================

CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    whatsapp_number TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- таблица для сохранения всех расчётов
CREATE TABLE IF NOT EXISTS calculations (
    id SERIAL PRIMARY KEY,
    product_name TEXT NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    term INT NOT NULL,
    has_guarantor BOOLEAN DEFAULT FALSE,
    has_down BOOLEAN DEFAULT FALSE,
    down_percent NUMERIC(5,2) DEFAULT 0,
    markup_percent NUMERIC(5,2) DEFAULT 0,
    down_payment NUMERIC(12,2) DEFAULT 0,
    financed NUMERIC(12,2) DEFAULT 0,
    monthly_payment NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- вставляем WhatsApp-номер по умолчанию (можно изменить позже)
INSERT INTO settings (whatsapp_number)
VALUES ('79990001122')
ON CONFLICT DO NOTHING;
