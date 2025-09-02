# SUPABASE SCHEMA CLEANUP GUIDE

## Problem: Duplicate/Conflicting SQL Files

You have multiple SQL files with different column naming conventions:
- Some use `camelCase` (createdAt, wholesalePrice) 
- Others use `snake_case` (created_at, wholesale_price)

## Solution: Use Single Correct Schema

### Step 1: Clean Up Supabase Database

1. **Go to Supabase Dashboard** → Your Project → SQL Editor
2. **Run this cleanup query first** (to remove any conflicting tables):

```sql
-- Remove existing tables if they have wrong column names
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS variants CASCADE;  
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
```

### Step 2: Create Correct Schema

1. **Copy the contents** of `WINSIDE-SUPABASE-SCHEMA.sql`
2. **Paste and run** in Supabase SQL Editor
3. **Verify** all tables are created with `snake_case` columns

### Step 3: Remove Duplicate Files

**Delete these conflicting files:**
- `supabase-schema.sql` (has wrong camelCase columns)
- `database/schema.sql` (MySQL specific, not for Supabase)

**Keep only:**
- `WINSIDE-SUPABASE-SCHEMA.sql` (correct PostgreSQL schema)

### Step 4: Verify Schema

Run this query in Supabase to verify correct columns:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY column_name;
```

**Expected columns:**
- `address` (text)
- `company` (text)
- `created_at` (timestamp with time zone) ✅
- `email` (text)
- `id` (text)
- `name` (text)
- `phone` (text)
- `total_orders` (integer)
- `total_spent` (numeric)
- `type` (text)
- `updated_at` (timestamp with time zone)

### Step 5: Test Application

After applying the correct schema:
1. **Deploy** your application 
2. **Check Vercel logs** - should see no more column errors
3. **Test** customers, products, and invoices functionality

## Column Naming Rules

✅ **Correct (snake_case):**
- `created_at`
- `updated_at` 
- `total_spent`
- `product_id`

❌ **Wrong (camelCase):**
- `createdAt`
- `updatedAt`
- `totalSpent`
- `productId`

## Environment Variables Required

Make sure these are set in Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
