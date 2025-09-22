-- WINSIDE TRACKING Database Schema
-- Complete schema for both WINSIDE main system and INSOLE CLINIC

-- ===============================================
-- MAIN WINSIDE SYSTEM TABLES
-- ===============================================

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(20) CHECK (brand IN ('greenhil', 'harican', 'byko')) NOT NULL,
    taxable BOOLEAN DEFAULT true,
    attributes TEXT[] DEFAULT '{}',
    media_main TEXT,
    archived BOOLEAN DEFAULT false,
    wholesale DECIMAL(10,2) DEFAULT 0,
    retail DECIMAL(10,2) DEFAULT 0,
    club DECIMAL(10,2) DEFAULT 0,
    cost_before DECIMAL(10,2) DEFAULT 0,
    cost_after DECIMAL(10,2) DEFAULT 0,
    variants JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    company VARCHAR(200),
    address TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'retail' CHECK (type IN ('retail', 'wholesale', 'club')),
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id),
    customer_name VARCHAR(200),
    date DATE DEFAULT CURRENT_DATE,
    items JSONB DEFAULT '[]',
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    tax DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'pending', 'paid', 'overdue', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid', 'partial')),
    due_date DATE,
    notes TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- INSOLE CLINIC SYSTEM TABLES (SEPARATE)
-- ===============================================

-- Insole Users Table
CREATE TABLE IF NOT EXISTS public.insole_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insole Products Table
CREATE TABLE IF NOT EXISTS public.insole_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    taxable BOOLEAN DEFAULT true,
    attributes JSONB DEFAULT '{}',
    variations JSONB DEFAULT '[]',
    media_main TEXT,
    archived BOOLEAN DEFAULT false,
    wholesale DECIMAL(10,2) DEFAULT 0,
    retail DECIMAL(10,2) DEFAULT 0,
    club DECIMAL(10,2) DEFAULT 0,
    cost_before DECIMAL(10,2) DEFAULT 0,
    cost_after DECIMAL(10,2) DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insole Customers Table
CREATE TABLE IF NOT EXISTS public.insole_customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    company VARCHAR(200),
    address TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'retail' CHECK (type IN ('retail', 'wholesale', 'club')),
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insole Invoices Table
CREATE TABLE IF NOT EXISTS public.insole_invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.insole_customers(id),
    customer_name VARCHAR(200),
    date DATE DEFAULT CURRENT_DATE,
    items JSONB DEFAULT '[]',
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    tax DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'pending', 'paid', 'overdue', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid', 'partial')),
    due_date DATE,
    notes TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insole Product Attributes Table
CREATE TABLE IF NOT EXISTS public.insole_product_attributes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'number', 'select', 'multiselect')),
    options JSONB DEFAULT '[]',
    required BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- INDEXES
-- ===============================================

-- Main system indexes
CREATE INDEX IF NOT EXISTS idx_products_article ON public.products(article);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);

-- Insole system indexes
CREATE INDEX IF NOT EXISTS idx_insole_products_article ON public.insole_products(article);
CREATE INDEX IF NOT EXISTS idx_insole_products_category ON public.insole_products(category);
CREATE INDEX IF NOT EXISTS idx_insole_customers_phone ON public.insole_customers(phone);
CREATE INDEX IF NOT EXISTS idx_insole_invoices_number ON public.insole_invoices(invoice_number);

-- ===============================================
-- ROW LEVEL SECURITY (RLS)
-- ===============================================

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insole_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insole_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insole_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insole_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insole_product_attributes ENABLE ROW LEVEL SECURITY;

-- Public access policies (adjust based on your security needs)
-- Main system policies
CREATE POLICY "Enable all for products" ON public.products FOR ALL USING (true);
CREATE POLICY "Enable all for customers" ON public.customers FOR ALL USING (true);
CREATE POLICY "Enable all for invoices" ON public.invoices FOR ALL USING (true);

-- Insole system policies
CREATE POLICY "Enable all for insole_products" ON public.insole_products FOR ALL USING (true);
CREATE POLICY "Enable all for insole_customers" ON public.insole_customers FOR ALL USING (true);
CREATE POLICY "Enable all for insole_invoices" ON public.insole_invoices FOR ALL USING (true);
CREATE POLICY "Enable all for insole_users" ON public.insole_users FOR ALL USING (true);
CREATE POLICY "Enable all for insole_attributes" ON public.insole_product_attributes FOR ALL USING (true);

-- ===============================================
-- TRIGGERS
-- ===============================================

-- Function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to insole tables
CREATE TRIGGER update_insole_products_updated_at BEFORE UPDATE ON public.insole_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insole_customers_updated_at BEFORE UPDATE ON public.insole_customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insole_invoices_updated_at BEFORE UPDATE ON public.insole_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insole_users_updated_at BEFORE UPDATE ON public.insole_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- SAMPLE DATA
-- ===============================================

-- Insert default insole admin user
INSERT INTO public.insole_users (username, password_hash, full_name, email, role) 
VALUES (
    'insole-admin', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for 'insole123'
    'Insole Administrator',
    'admin@insoleclinic.com',
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- Insert sample product attributes for insole system
INSERT INTO public.insole_product_attributes (name, type, options, required) VALUES
('Size', 'select', '["XS", "S", "M", "L", "XL", "XXL", "38", "39", "40", "41", "42", "43", "44", "45"]', true),
('Color', 'select', '["Black", "White", "Brown", "Blue", "Red", "Green", "Gray", "Navy"]', false),
('Material', 'select', '["Leather", "Fabric", "Synthetic", "Memory Foam", "Gel", "Silicone"]', false),
('Arch Support', 'select', '["Low", "Medium", "High", "Extra High"]', false),
('Width', 'select', '["Narrow", "Regular", "Wide", "Extra Wide"]', false),
('Thickness', 'select', '["Thin", "Medium", "Thick", "Extra Thick"]', false),
('Heel Type', 'select', '["Flat", "Low Heel", "Medium Heel", "High Heel"]', false)
ON CONFLICT DO NOTHING;