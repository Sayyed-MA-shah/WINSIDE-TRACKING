#!/usr/bin/env node

// WINSIDE Business Dashboard - Deployment Package Creator
// This script creates a deployment package for Bluehost hosting

const fs = require('fs-extra');
const path = require('path');

const deploymentDir = 'winside-deployment';

// Files and folders to include in deployment
const filesToInclude = [
  '.next',           // Built WINSIDE application
  'public',          // Static assets and images
  'src',             // Source code (needed for API routes)
  'scripts',         // Database setup scripts
  'package.json',    // Dependencies
  'next.config.ts',  // Next.js configuration
  'tsconfig.json',   // TypeScript config
  '.env.production', // Production environment variables
  'DEPLOYMENT.md'    // Deployment instructions
];

async function createDeploymentPackage() {
  try {
    console.log('🚀 Creating WINSIDE deployment package...');
    
    // Remove existing deployment directory
    if (fs.existsSync(deploymentDir)) {
      console.log('🧹 Removing existing deployment package...');
      await fs.remove(deploymentDir);
    }
    
    // Create deployment directory
    await fs.ensureDir(deploymentDir);
    
    // Copy necessary files
    for (const item of filesToInclude) {
      const sourcePath = path.join(__dirname, item);
      const destPath = path.join(__dirname, deploymentDir, item);
      
      if (fs.existsSync(sourcePath)) {
        console.log(`📁 Copying ${item}...`);
        await fs.copy(sourcePath, destPath);
      } else {
        console.log(`⚠️  ${item} not found, skipping...`);
      }
    }
    
    // Create a production package.json for WINSIDE
    const packageJson = await fs.readJson('package.json');
    const prodPackageJson = {
      ...packageJson,
      name: "winside-business-dashboard",
      version: "1.0.0",
      description: "WINSIDE - Complete business management solution",
      scripts: {
        start: "next start",
        build: "next build"
      }
    };
    
    await fs.writeJson(path.join(deploymentDir, 'package.json'), prodPackageJson, { spaces: 2 });
    
    // Create production environment file template
    const envContent = `# WINSIDE Production Environment Variables
DB_HOST=localhost
DB_USER=gfnqismy_invoices
DB_PASSWORD=#Claim77887788
DB_NAME=gfnqismy_invoices
DB_PORT=3306
NEXTAUTH_SECRET=your-super-secret-key-change-this
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production
`;
    
    await fs.writeFile(path.join(deploymentDir, '.env.production'), envContent);
    
    console.log('✅ WINSIDE deployment package created successfully!');
    console.log(`✅ Files are in the '${deploymentDir}' folder`);
    console.log('');
    console.log('🌟 WINSIDE Ready for Bluehost Deployment:');
    console.log('1. Compress the winside-deployment folder');
    console.log('2. Upload to your Bluehost public_html');
    console.log('3. Extract files on the server');
    console.log('4. Run: npm install --production');
    console.log('5. Run the database setup scripts');
    console.log('6. Run: npm start');
    console.log('');
    console.log('🎉 Your WINSIDE Business Dashboard will be live!');
    
  } catch (error) {
    console.error('❌ Error creating WINSIDE deployment package:', error.message);
    process.exit(1);
  }
}

createDeploymentPackage();
