# WINSIDE - Bluehost Deployment Guide

## About WINSIDE
WINSIDE is your complete business management solution featuring real-time inventory tracking, customer management, and sales analytics across multiple brands.

## Your Bluehost Database Details
- **Database Name**: gfnqismy_invoices  
- **Username**: gfnqismy_invoices
- **Password**: #Claim77887788
- **Host**: localhost (when on Bluehost server)

## Deployment Steps

### 1. Upload Files to Bluehost
1. Compress your entire project folder (excluding node_modules)
2. Upload via Bluehost File Manager or FTP to your domain's public_html folder
3. Extract the files on the server

### 2. Install Dependencies on Server
SSH into your Bluehost server and run:
```bash
cd /home/your-username/public_html/your-domain
npm install
```

### 3. Set Up Environment Variables
Create a `.env.production` file on your server:
```env
DB_HOST=localhost
DB_USER=gfnqismy_invoices
DB_PASSWORD=#Claim77887788
DB_NAME=gfnqismy_invoices
DB_PORT=3306
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://yourdomain.com
```

### 4. Set Up Database Schema
Run the schema setup script on your server:
```bash
node scripts/setup-bluehost-schema.js
```

### 5. Populate with Sample Data
Run the data population script:
```bash
node scripts/populate-bluehost-data.js
```

### 6. Build and Start the Application
```bash
npm run build
npm start
```

## Alternative: Static Export (Recommended for Bluehost)
If you have issues with the server-side features, you can export a static version:

1. Add to your `next.config.ts`:
```typescript
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}
```

2. Build and export:
```bash
npm run build
```

3. Upload the `out` folder contents to your public_html

## Testing Your Deployment
1. Visit your domain
2. Go to `/dashboard` to see the dashboard with real data
3. Create test invoices to verify database connectivity
4. Check that brand tabs (Green Hill, Harican, Byko) work correctly

## Troubleshooting
- **Database connection errors**: Verify your .env file has correct credentials
- **Module not found**: Make sure you ran `npm install` on the server  
- **Build errors**: The build should now complete successfully with warnings ignored
- **API routes not working**: Check if your hosting supports Node.js and API routes

## Security Notes
- Change the default database password after setup
- Add proper authentication before going live
- Consider adding SSL certificate for HTTPS
- Set up proper backup procedures for your database

Your invoice management system is now ready for production! 🎉

## 🌟 WINSIDE Features Now Live
- **Multi-Brand Management**: Green Hill, Harican, and Byko product lines
- **Real-Time Analytics**: Live revenue tracking and performance metrics  
- **Smart Inventory**: Automatic stock deduction and low-stock alerts
- **Customer Insights**: Retail vs wholesale customer analytics
- **Invoice Automation**: Streamlined billing and payment tracking

Welcome to WINSIDE - Your business, simplified. 🚀
