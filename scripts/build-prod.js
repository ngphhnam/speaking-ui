const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Copy .env.pro to .env.production before build
const envProPath = path.join(process.cwd(), '.env.pro');
const envProductionPath = path.join(process.cwd(), '.env.production');

if (fs.existsSync(envProPath)) {
  fs.copyFileSync(envProPath, envProductionPath);
  console.log('✓ Copied .env.pro to .env.production');
} else {
  console.warn('⚠ Warning: .env.pro file not found');
  process.exit(1);
}

// Set NODE_ENV to production and run next build
process.env.NODE_ENV = 'production';
execSync('next build', { stdio: 'inherit' });


