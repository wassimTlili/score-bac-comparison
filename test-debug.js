#!/usr/bin/env node

// Simple test to check if the app can start
console.log('Testing Next.js app...');

try {
  const { spawn } = require('child_process');
  
  console.log('Starting Next.js development server...');
  
  const child = spawn('npm', ['run', 'dev'], { 
    cwd: process.cwd(),
    stdio: 'inherit'
  });
  
  child.on('error', (error) => {
    console.error('Error starting server:', error);
  });
  
  child.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
  });
  
  // Kill after 10 seconds for testing
  setTimeout(() => {
    child.kill();
    console.log('Test completed');
  }, 10000);
  
} catch (error) {
  console.error('Failed to start test:', error);
}
