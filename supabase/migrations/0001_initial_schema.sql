-- Active: 1713500000
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  barcode TEXT UNIQUE,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;

CREATE TABLE product_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  unit_type TEXT NOT NULL,
  price_sell DECIMAL(10,2) NOT NULL CHECK (price_sell >= 0),
  price_cost DECIMAL(10,2) NOT NULL CHECK (price_cost >= 0),
  qty_per_base_unit INTEGER NOT NULL DEFAULT 1 CHECK (qty_per_base_unit > 0),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, unit_type)
);
CREATE INDEX idx_product_units_product ON product_units(product_id);

CREATE TABLE product_stock (
  product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  stock_qty INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  debt_balance DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (debt_balance >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_customers_phone ON customers(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_customers_active ON customers(is_active) WHERE is_active = true;

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('CASH', 'NON_CASH', 'KREDIT')),
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  profit DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);
CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_date ON transactions(created_at DESC);
CREATE INDEX idx_transactions_synced ON transactions(synced_at) WHERE synced_at IS NULL;

CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  unit_type TEXT NOT NULL,
  qty INTEGER NOT NULL CHECK (qty > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  unit_cost DECIMAL(10,2) NOT NULL CHECK (unit_cost >= 0),
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0)
);
CREATE INDEX idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product ON transaction_items(product_id);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  transaction_id UUID REFERENCES transactions(id),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('CASH', 'NON_CASH')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_date ON payments(created_at DESC);

CREATE TABLE sync_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  client_id TEXT NOT NULL,
  client_timestamp TIMESTAMPTZ NOT NULL,
  processed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_sync_events_status ON sync_events(status) WHERE status = 'PENDING';
CREATE INDEX idx_sync_events_client ON sync_events(client_id);

CREATE TABLE cash_book_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('INCOME', 'EXPENSE')),
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_cash_book_date ON cash_book_entries(created_at DESC);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Reduce stock
CREATE OR REPLACE FUNCTION reduce_stock(p_product_id UUID, p_qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE product_stock 
  SET stock_qty = stock_qty - p_qty,
      last_updated = NOW()
  WHERE product_id = p_product_id;
  
  IF (SELECT stock_qty FROM product_stock WHERE product_id = p_product_id) < 0 THEN
    RAISE EXCEPTION 'Stok tidak cukup untuk produk %', p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Adjust stock
CREATE OR REPLACE FUNCTION adjust_stock(p_product_id UUID, p_adjustment INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE product_stock 
  SET stock_qty = stock_qty + p_adjustment,
      last_updated = NOW()
  WHERE product_id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Auto-update customer debt
CREATE OR REPLACE FUNCTION update_customer_debt()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_method = 'KREDIT' THEN
    UPDATE customers 
    SET debt_balance = debt_balance + (NEW.total - NEW.paid_amount)
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_update_debt AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_customer_debt();

-- Auto-reduce debt on payment
CREATE OR REPLACE FUNCTION reduce_customer_debt()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customers 
  SET debt_balance = GREATEST(0, debt_balance - NEW.amount)
  WHERE id = NEW.customer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_reduce_debt AFTER INSERT ON payments
  FOR EACH ROW EXECUTE FUNCTION reduce_customer_debt();
