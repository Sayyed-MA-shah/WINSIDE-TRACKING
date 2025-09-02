# WINSIDE Deployment for winsideinvent.brandsports.co.uk

## 🎯 Your Specific Setup

**Subdomain**: winsideinvent.brandsports.co.uk  
**Server Path**: `home2/gfnqismy/winsideinvent.brandsports.co.uk/`  
**Database**: gfnqismy_invoices (already created)

## 📂 Correct File Placement

1. **Move files from `cgi-bin` to web root:**
   ```bash
   # Your files should be in:
   home2/gfnqismy/winsideinvent.brandsports.co.uk/
   
   # NOT in:
   home2/gfnqismy/winsideinvent.brandsports.co.uk/cgi-bin/
   ```

2. **Directory structure should look like:**
   ```
   home2/gfnqismy/winsideinvent.brandsports.co.uk/
   ├── .next/                 (built application)
   ├── src/                   (source code)
   ├── public/                (static files)
   ├── scripts/               (database setup)
   ├── package.json
   ├── .env.production
   └── ... other files
   ```

## 🚀 Deployment Commands

SSH into your Bluehost server and run:

```bash
# Navigate to your subdomain root
cd /home2/gfnqismy/winsideinvent.brandsports.co.uk/

# Install Node.js dependencies
npm install --production

# Set up database schema (run ONCE only)
node scripts/setup-bluehost-schema.js

# Populate with sample Byko products (run ONCE only)  
node scripts/populate-bluehost-data.js

# Start WINSIDE application
npm start
```

## 🌐 Access Your WINSIDE Dashboard

After deployment, visit:
**https://winsideinvent.brandsports.co.uk**

You should see:
- ✅ WINSIDE login page
- ✅ Dashboard with brand tabs (Green Hill, Harican, Byko)  
- ✅ Real inventory data
- ✅ Customer and invoice management

## 🔧 Troubleshooting

**If the site doesn't load:**
1. Check if files are in the correct location (not in cgi-bin)
2. Verify Node.js is enabled for your subdomain in cPanel
3. Check error logs in cPanel

**Database issues:**
- Your credentials are already configured correctly
- Database `gfnqismy_invoices` exists and is accessible

## 📞 Support

Your WINSIDE Business Dashboard is configured for:
- **Domain**: winsideinvent.brandsports.co.uk
- **Database**: gfnqismy_invoices  
- **Multi-brand support**: Green Hill, Harican, Byko
- **Real-time inventory tracking**
- **Customer management**
- **Invoice automation**

🎉 **WINSIDE is ready to power your business!**
