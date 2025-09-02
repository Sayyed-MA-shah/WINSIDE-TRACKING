# WINSIDE Deployment on Vercel (FREE)

Vercel is perfect for Next.js applications and offers free hosting with database support.

## 🚀 Quick Deployment Steps

### 1. Push to GitHub
```bash
# In your local project folder
git init
git add .
git commit -m "WINSIDE Business Dashboard"
git branch -M main
git remote add origin https://github.com/yourusername/winside-dashboard.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to **https://vercel.com**
2. **Sign up** with GitHub
3. **Import** your repository
4. Vercel will **auto-deploy** your WINSIDE app!

### 3. Add Database (FREE)
- **Vercel Postgres** (free tier): 60k rows, 1GB storage
- **PlanetScale** (free tier): 1 database, 1GB storage  
- **Supabase** (free tier): 500MB database, API included

### 4. Environment Variables
In Vercel dashboard, add:
```
DB_HOST=your-vercel-postgres-host
DB_USER=your-vercel-postgres-user
DB_PASSWORD=your-vercel-postgres-password
DB_NAME=your-vercel-postgres-db
NEXTAUTH_SECRET=your-secret-key
```

## ✅ Benefits
- ✅ **100% FREE** for small projects
- ✅ **Perfect for Next.js** 
- ✅ **Automatic deployments**
- ✅ **Global CDN**
- ✅ **SSL certificate included**
- ✅ **Custom domain support**

## 🌐 Your WINSIDE URL
After deployment: `https://winside-dashboard.vercel.app`
Custom domain: `winsideinvent.brandsports.co.uk` (you can point this to Vercel)
