# 🚀 WINSIDE Deployment: Vercel + Supabase (100% FREE)

## Why This is the BEST Solution:
- ✅ **100% FREE** - No hosting costs
- ✅ **Professional grade** - Enterprise-level infrastructure  
- ✅ **Online database** - PostgreSQL in the cloud
- ✅ **Auto-deployments** - Push code, automatic updates
- ✅ **Global CDN** - Fast loading worldwide
- ✅ **Custom domain** - Use winsideinvent.brandsports.co.uk
- ✅ **SSL included** - Secure HTTPS connection

## 📋 Step-by-Step Setup

### Step 1: Create GitHub Repository (5 minutes)

```bash
# In your project folder (C:\Users\Work-PC\Documents\askfor)
git init
git add .
git commit -m "WINSIDE Business Dashboard - Initial Deployment"
```

1. Go to **github.com** and create account (if needed)
2. Click **"New Repository"**
3. Name it: `winside-business-dashboard`
4. Make it **Public**
5. Click **"Create Repository"**

6. Copy the commands GitHub shows you:
```bash
git remote add origin https://github.com/YOUR-USERNAME/winside-business-dashboard.git
git branch -M main  
git push -u origin main
```

### Step 2: Deploy to Vercel (3 minutes)

1. Go to **vercel.com**
2. Click **"Sign up with GitHub"**
3. **Import** your `winside-business-dashboard` repository
4. Click **"Deploy"**
5. **Done!** Your WINSIDE app is live at: `https://winside-business-dashboard.vercel.app`

### Step 3: Set Up Supabase Database (5 minutes)

1. Go to **supabase.com**
2. **Sign up with GitHub**
3. Click **"New Project"**
4. Name: `winside-database`
5. **Copy the database credentials** (you'll need these)

### Step 4: Configure Environment Variables (2 minutes)

In your **Vercel dashboard**:
1. Go to your project → **Settings** → **Environment Variables**
2. Add these variables:

```
DB_HOST=db.your-supabase-ref.supabase.co
DB_USER=postgres
DB_PASSWORD=your-supabase-password
DB_NAME=postgres
DB_PORT=5432
NEXTAUTH_SECRET=winside-super-secret-change-this
NEXTAUTH_URL=https://winside-business-dashboard.vercel.app
```

### Step 5: Set Up Database Tables (3 minutes)

1. In **Supabase dashboard** → **SQL Editor**
2. Run this SQL to create your tables:

```sql
-- Products table
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(20) CHECK (brand IN ('Green Hill', 'Harican', 'Byko')) NOT NULL,
    category VARCHAR(100) NOT NULL,
    wholesalePrice DECIMAL(10, 2) NOT NULL,
    retailPrice DECIMAL(10, 2) NOT NULL,
    article VARCHAR(100),
    shelfNo VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Variants table  
CREATE TABLE variants (
    id VARCHAR(50) PRIMARY KEY,
    productId VARCHAR(50) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    attributes JSONB NOT NULL,
    qty INTEGER DEFAULT 0,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- Customers table
CREATE TABLE customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('retailer', 'wholesaler')) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table
CREATE TABLE invoices (
    id VARCHAR(50) PRIMARY KEY,
    invoiceNumber VARCHAR(100) UNIQUE NOT NULL,
    customerId VARCHAR(50) NOT NULL,
    customerName VARCHAR(255) NOT NULL,
    customerType VARCHAR(20) CHECK (customerType IN ('retailer', 'wholesaler')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('paid', 'pending', 'overdue')) DEFAULT 'pending',
    items JSONB NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dueDate DATE,
    FOREIGN KEY (customerId) REFERENCES customers(id)
);
```

### Step 6: Add Sample Data (2 minutes)

```sql
-- Sample customers
INSERT INTO customers (id, name, type, email, phone, address) VALUES
('cust-001', 'ABC Retail Store', 'retailer', 'abc@retailstore.com', '+1-555-0101', '123 Main Street'),
('cust-002', 'XYZ Wholesale Hub', 'wholesaler', 'orders@xyzwholesale.com', '+1-555-0102', '456 Industrial Ave');

-- Sample Byko products
INSERT INTO products (id, name, brand, category, wholesalePrice, retailPrice, article, shelfNo) VALUES
('prod-001', 'Byko Premium T-Shirt', 'Byko', 'T-Shirts', 12.50, 25.00, 'BYK-TS-001', 'A1-001'),
('prod-002', 'Byko Classic Polo', 'Byko', 'Polo Shirts', 18.75, 37.50, 'BYK-PL-002', 'A1-002');

-- Sample variants
INSERT INTO variants (id, productId, sku, attributes, qty) VALUES
('var-001', 'prod-001', 'BYK-TS-001-RED-S', '{"Size": "S", "Color": "Red"}', 50),
('var-002', 'prod-001', 'BYK-TS-001-BLUE-M', '{"Size": "M", "Color": "Blue"}', 75);
```

## 🎉 **You're LIVE!**

### Your WINSIDE Dashboard URLs:
- **Vercel URL**: `https://winside-business-dashboard.vercel.app`
- **Custom Domain**: Point `winsideinvent.brandsports.co.uk` to Vercel (optional)

### What You Get:
- ✅ **Professional business dashboard**
- ✅ **Real-time online database**
- ✅ **Multi-brand support** (Green Hill, Harican, Byko)
- ✅ **Inventory management**
- ✅ **Customer tracking**
- ✅ **Invoice automation**
- ✅ **Global access** - works from anywhere
- ✅ **Mobile responsive**
- ✅ **Automatic backups**

**Total setup time: ~20 minutes**
**Total cost: $0.00 forever** (within free limits)

🚀 **WINSIDE is now a professional, cloud-based business management system!**
