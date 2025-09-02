# VERCEL ENVIRONMENT VARIABLES SETUP

## Required Environment Variables for Production

### Supabase Configuration (Required for customers, products, invoices)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Database Tables Required in Supabase:

#### 1. customers
```sql
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  company TEXT,
  address TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('retail', 'wholesale', 'club')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL DEFAULT 0
);
```

#### 2. products
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  article TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL CHECK (brand IN ('greenhil', 'harican', 'byko')),
  taxable BOOLEAN DEFAULT TRUE,
  attributes TEXT[],
  media_main TEXT,
  archived BOOLEAN DEFAULT FALSE,
  wholesale DECIMAL NOT NULL,
  retail DECIMAL NOT NULL,
  club DECIMAL NOT NULL,
  cost_before DECIMAL NOT NULL,
  cost_after DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. variants
```sql
CREATE TABLE variants (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  attributes JSONB,
  qty INTEGER DEFAULT 0,
  wholesale DECIMAL,
  retail DECIMAL,
  club DECIMAL,
  cost_before DECIMAL,
  cost_after DECIMAL
);
```

#### 4. invoices
```sql
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id),
  invoice_number TEXT UNIQUE,
  total_amount DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date DATE,
  notes TEXT
);
```

## How to Set Environment Variables on Vercel:

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the sidebar
4. Add each variable with the appropriate values
5. Make sure to set them for "Production", "Preview", and "Development" environments
6. Redeploy your application after adding the variables

## Database Column Mapping:

The application uses camelCase in TypeScript (e.g., `createdAt`) but Supabase uses snake_case (e.g., `created_at`). The database functions automatically handle this mapping.
