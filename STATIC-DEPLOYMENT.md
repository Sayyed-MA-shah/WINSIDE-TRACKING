# WINSIDE Static Deployment (No Node.js Required)

If Node.js/npm is not available on your Bluehost server, you can deploy WINSIDE as a static site.

## 🏗️ Build Static Version Locally

On your local machine, run:

```bash
# Navigate to your project
cd C:\Users\Work-PC\Documents\askfor

# Build static export
npm run build
npm run export
```

## 📁 Upload Static Files

1. **Locate the `out` folder** (created after export)
2. **Upload contents of `out` folder** to:
   `home2/gfnqismy/winsideinvent.brandsports.co.uk/`
3. **No npm install required** - just static HTML/CSS/JS files

## ⚠️ Limitations of Static Version

- No server-side API routes
- Database features won't work without backend
- Limited to frontend-only functionality

## 🎯 Recommended Solution

Contact Bluehost support to:
1. **Enable Node.js** for your subdomain
2. **Add npm to PATH**
3. **Configure Node.js environment**

Most Bluehost plans support Node.js, it just needs to be enabled in cPanel.
