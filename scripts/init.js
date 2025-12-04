#!/usr/bin/env node

/**
 * Complete Initialization Script
 * Sets up everything needed on a vanilla laptop
 * Checks prerequisites, installs dependencies, sets up database, and starts servers
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command, errorMessage) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    log(errorMessage, 'red');
    return false;
  }
}

function checkNodeVersion() {
  try {
    const version = execSync('node --version', { encoding: 'utf-8' }).trim();
    const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
    if (majorVersion >= 16) {
      log(`✅ Node.js ${version} found`, 'green');
      return true;
    } else {
      log(`❌ Node.js version ${version} found, but v16+ is required`, 'red');
      return false;
    }
  } catch {
    log('❌ Node.js is not installed', 'red');
    return false;
  }
}

function checkMongoDB() {
  try {
    execSync('mongod --version', { stdio: 'ignore' });
    log('✅ MongoDB is installed', 'green');
    
    // Check if MongoDB is running
    try {
      execSync('mongosh --eval "db.adminCommand(\'ping\')"', { stdio: 'ignore', timeout: 2000 });
      log('✅ MongoDB is running', 'green');
      return true;
    } catch {
      log('⚠️  MongoDB is installed but not running', 'yellow');
      log('   Starting MongoDB...', 'cyan');
      return startMongoDB();
    }
  } catch {
    log('❌ MongoDB is not installed', 'red');
    log('\n📦 MongoDB Installation Instructions:', 'yellow');
    log('   macOS: brew install mongodb-community', 'cyan');
    log('   Linux: sudo apt-get install mongodb', 'cyan');
    log('   Windows: Download from https://www.mongodb.com/try/download/community', 'cyan');
    log('\n   After installation, start MongoDB:', 'yellow');
    log('   macOS/Linux: brew services start mongodb-community (or sudo systemctl start mongod)', 'cyan');
    log('   Windows: net start MongoDB', 'cyan');
    return false;
  }
}

function startMongoDB() {
  try {
    // Try to start MongoDB in background
    const platform = process.platform;
    if (platform === 'darwin') {
      try {
        execSync('brew services start mongodb-community', { stdio: 'inherit' });
        log('✅ MongoDB started', 'green');
        return true;
      } catch {
        log('⚠️  Could not start MongoDB automatically. Please start it manually:', 'yellow');
        log('   brew services start mongodb-community', 'cyan');
        return false;
      }
    } else if (platform === 'linux') {
      try {
        execSync('sudo systemctl start mongod', { stdio: 'inherit' });
        log('✅ MongoDB started', 'green');
        return true;
      } catch {
        log('⚠️  Could not start MongoDB automatically. Please start it manually:', 'yellow');
        log('   sudo systemctl start mongod', 'cyan');
        return false;
      }
    } else {
      log('⚠️  Please start MongoDB manually on Windows:', 'yellow');
      log('   net start MongoDB', 'cyan');
      return false;
    }
  } catch {
    return false;
  }
}

function installDependencies(dir, name) {
  log(`\n📦 Installing ${name} dependencies...`, 'cyan');
  try {
    process.chdir(dir);
    execSync('npm install', { stdio: 'inherit' });
    log(`✅ ${name} dependencies installed`, 'green');
    return true;
  } catch (error) {
    log(`❌ Failed to install ${name} dependencies`, 'red');
    return false;
  }
}

function checkDependencies(dir) {
  const nodeModulesPath = path.join(dir, 'node_modules');
  return fs.existsSync(nodeModulesPath) && fs.readdirSync(nodeModulesPath).length > 0;
}

async function waitForMongoDB(maxAttempts = 10) {
  log('\n⏳ Waiting for MongoDB to be ready...', 'cyan');
  for (let i = 0; i < maxAttempts; i++) {
    try {
      execSync('mongosh --eval "db.adminCommand(\'ping\')"', { stdio: 'ignore', timeout: 2000 });
      log('✅ MongoDB is ready!', 'green');
      return true;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 2000));
      process.stdout.write('.');
    }
  }
  log('\n❌ MongoDB did not start in time', 'red');
  return false;
}

async function initializeDatabase() {
  log('\n🌱 Initializing database...', 'cyan');
  try {
    const rootDir = path.resolve(__dirname, '..');
    process.chdir(path.join(rootDir, 'backend'));
    execSync('npm run init', { stdio: 'inherit' });
    log('✅ Database initialized', 'green');
    return true;
  } catch (error) {
    log('⚠️  Database initialization had issues, but continuing...', 'yellow');
    return true; // Continue even if init fails
  }
}

async function setup() {
  log('\n🚀 Healthcare Wellness Portal - Complete Setup', 'magenta');
  log('='.repeat(60), 'cyan');
  
  const rootDir = path.resolve(__dirname, '..');
  const backendDir = path.join(rootDir, 'backend');
  const frontendDir = path.join(rootDir, 'FrontEnd');
  
  // Step 1: Check Node.js
  log('\n📋 Step 1: Checking prerequisites...', 'blue');
  if (!checkNodeVersion()) {
    log('\n❌ Please install Node.js v16+ from https://nodejs.org/', 'red');
    log('   Then run this script again.', 'yellow');
    process.exit(1);
  }
  
  // Step 2: Check MongoDB
  log('\n📋 Step 2: Checking MongoDB...', 'blue');
  const mongoReady = await checkMongoDB();
  if (!mongoReady) {
    log('\n⚠️  MongoDB setup required. Please:', 'yellow');
    log('   1. Install MongoDB', 'cyan');
    log('   2. Start MongoDB service', 'cyan');
    log('   3. Run this script again', 'cyan');
    log('\n   The application will still work, but database features will not function.', 'yellow');
  } else {
    await waitForMongoDB();
  }
  
  // Step 3: Install root dependencies
  log('\n📋 Step 3: Installing dependencies...', 'blue');
  if (!checkDependencies(rootDir)) {
    if (!installDependencies(rootDir, 'root')) {
      process.exit(1);
    }
  } else {
    log('✅ Root dependencies already installed', 'green');
  }
  
  // Step 4: Install backend dependencies
  if (!checkDependencies(backendDir)) {
    if (!installDependencies(backendDir, 'backend')) {
      process.exit(1);
    }
  } else {
    log('✅ Backend dependencies already installed', 'green');
  }
  
  // Step 5: Install frontend dependencies
  if (fs.existsSync(frontendDir) && fs.existsSync(path.join(frontendDir, 'package.json'))) {
    if (!checkDependencies(frontendDir)) {
      if (!installDependencies(frontendDir, 'frontend')) {
        log('⚠️  Frontend dependencies installation failed, but continuing...', 'yellow');
      }
    } else {
      log('✅ Frontend dependencies already installed', 'green');
    }
  }
  
  // Return to root directory
  process.chdir(rootDir);
  
  // Step 6: Initialize database (if MongoDB is ready)
  if (mongoReady) {
    log('\n📋 Step 4: Setting up database...', 'blue');
    await initializeDatabase();
  } else {
    log('\n⚠️  Skipping database initialization (MongoDB not available)', 'yellow');
  }
  
  // Step 7: Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('✨ Setup completed successfully!', 'green');
  log('='.repeat(60), 'cyan');
  
  log('\n📝 Next Steps:', 'blue');
  log('   1. Start the backend server:', 'cyan');
  log('      cd backend && npm start', 'yellow');
  log('   2. Start the frontend server (in a new terminal):', 'cyan');
  log('      cd FrontEnd && npm run dev', 'yellow');
  log('   3. Or run both together:', 'cyan');
  log('      npm run dev', 'yellow');
  log('\n   Backend will be available at: http://localhost:5001', 'cyan');
  log('   Frontend will be available at: http://localhost:5173', 'cyan');
  
  if (!mongoReady) {
    log('\n⚠️  Remember to install and start MongoDB before using database features!', 'yellow');
  }
  
  log('\n🎉 You\'re all set!', 'green');
}

// Run setup
setup().catch((error) => {
  log(`\n❌ Setup failed: ${error.message}`, 'red');
  process.exit(1);
});

