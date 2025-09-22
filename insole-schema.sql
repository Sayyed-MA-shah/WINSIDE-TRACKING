-- INSOLE CLINIC Database Schema
-- Run this in your Supabase SQL Editor to create the insole-specific tables

-- 1. Insole Users Table
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

-- 2. Insole Products Table
CREATE TABLE IF NOT EXISTS public.insole_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    taxable BOOLEAN DEFAULT true,
    attributes JSONB DEFAULT '[]',
    variations JSONB DEFAULT '[]',
    media_main TEXT,
    archived BOOLEAN DEFAULT false,
    wholesale DECIMAL(10,2) DEFAULT 0,
    retail DECIMAL(10,2) DEFAULT 0,
    cost_before DECIMAL(10,2) DEFAULT 0,
    cost_after DECIMAL(10,2) DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Insole Customers Table
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

-- 4. Insole Invoices Table
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

-- 5. Insole Product Attributes Table (for managing available attributes)
CREATE TABLE IF NOT EXISTS public.insole_product_attributes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'number', 'select', 'multiselect')),
    options JSONB DEFAULT '[]', -- For select/multiselect types
    required BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_insole_products_article ON public.insole_products(article);
CREATE INDEX IF NOT EXISTS idx_insole_products_category ON public.insole_products(category);
CREATE INDEX IF NOT EXISTS idx_insole_products_brand ON public.insole_products(brand);
CREATE INDEX IF NOT EXISTS idx_insole_customers_phone ON public.insole_customers(phone);
CREATE INDEX IF NOT EXISTS idx_insole_customers_email ON public.insole_customers(email);
CREATE INDEX IF NOT EXISTS idx_insole_invoices_number ON public.insole_invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_insole_invoices_customer ON public.insole_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_insole_invoices_status ON public.insole_invoices(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.insole_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insole_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insole_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insole_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insole_product_attributes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your authentication needs)
CREATE POLICY "Enable read access for all users" ON public.insole_products FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.insole_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.insole_products FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.insole_products FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.insole_customers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.insole_customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.insole_customers FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.insole_customers FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.insole_invoices FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.insole_invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.insole_invoices FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.insole_invoices FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.insole_users FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.insole_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.insole_users FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.insole_product_attributes FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.insole_product_attributes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.insole_product_attributes FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.insole_product_attributes FOR DELETE USING (true);

-- Insert default admin user (password: insole123)
-- Note: In production, use proper password hashing
INSERT INTO public.insole_users (username, password_hash, full_name, email, role) 
VALUES (
    'insole-admin', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for 'insole123'
    'Insole Administrator',
    'admin@insoleclinic.com',
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- Insert sample product attributes
INSERT INTO public.insole_product_attributes (name, type, options, required) VALUES
('Size', 'select', '["XS", "S", "M", "L", "XL", "XXL"]', true),
('Color', 'select', '["Black", "White", "Brown", "Blue", "Red", "Green"]', false),
('Material', 'select', '["Leather", "Fabric", "Synthetic", "Memory Foam", "Gel"]', false),
('Arch Support', 'select', '["Low", "Medium", "High"]', false),
('Width', 'select', '["Narrow", "Regular", "Wide", "Extra Wide"]', false)
ON CONFLICT DO NOTHING;

-- Update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_insole_products_updated_at BEFORE UPDATE ON public.insole_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insole_customers_updated_at BEFORE UPDATE ON public.insole_customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insole_invoices_updated_at BEFORE UPDATE ON public.insole_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insole_users_updated_at BEFORE UPDATE ON public.insole_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();