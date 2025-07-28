#!/usr/bin/env node

// Production optimization and verification script

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production build verification...\n');

// Function to run commands with error handling
function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ ${description} completed successfully\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

// Function to check for remaining debug code
function checkForDebugCode() {
  console.log('🔍 Checking for remaining debug code...');
  
  const debugPatterns = [
    'console.log(',
    'console.debug(',
    'console.info(',
    'debugLog(',
    '[Debug:',
    'TODO:',
    'FIXME:'
  ];
  
  let foundIssues = false;
  
  // Check source files
  const checkFile = (filePath) => {
    if (!fs.existsSync(filePath)) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    debugPatterns.forEach(pattern => {
      if (content.includes(pattern)) {
        console.log(`⚠️  Found "${pattern}" in ${filePath}`);
        foundIssues = true;
      }
    });
  };
  
  // Check all relevant files
  const checkDirectory = (dir) => {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    files.forEach(file => {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
        checkDirectory(fullPath);
      } else if (file.isFile() && /\.(js|jsx|ts|tsx)$/.test(file.name)) {
        checkFile(fullPath);
      }
    });
  };
  
  checkDirectory('./src');
  
  if (!foundIssues) {
    console.log('✅ No debug code found\n');
  } else {
    console.log('❌ Debug code found - consider removing for production\n');
  }
  
  return !foundIssues;
}

// Function to analyze bundle size
function analyzeBundleSize() {
  console.log('📦 Analyzing bundle size...');
  
  const buildDir = './.next';
  if (!fs.existsSync(buildDir)) {
    console.log('❌ Build directory not found. Run build first.\n');
    return false;
  }
  
  try {
    // Check if bundle analyzer is available
    execSync('npx --version', { stdio: 'ignore' });
    
    console.log('📊 Bundle analysis available via: npx @next/bundle-analyzer');
    console.log('💡 Consider running: ANALYZE=true npm run build\n');
    return true;
  } catch (error) {
    console.log('⚠️  Bundle analyzer not available\n');
    return true; // Not critical
  }
}

// Function to check performance metrics
function checkPerformanceMetrics() {
  console.log('⚡ Checking performance configurations...');
  
  const nextConfig = './next.config.mjs';
  if (fs.existsSync(nextConfig)) {
    const content = fs.readFileSync(nextConfig, 'utf8');
    
    const checks = [
      { pattern: 'removeConsole', name: 'Console removal' },
      { pattern: 'compress: true', name: 'Compression' },
      { pattern: 'optimizeCss', name: 'CSS optimization' },
      { pattern: 'images:', name: 'Image optimization' }
    ];
    
    checks.forEach(check => {
      if (content.includes(check.pattern)) {
        console.log(`✅ ${check.name} enabled`);
      } else {
        console.log(`⚠️  ${check.name} not found`);
      }
    });
    
    console.log('');
    return true;
  } else {
    console.log('❌ next.config.mjs not found\n');
    return false;
  }
}

// Main execution
async function main() {
  console.log('📋 Production Optimization Checklist\n');
  
  // Step 1: Check for debug code
  const debugCheck = checkForDebugCode();
  
  // Step 2: Check performance configurations
  const perfCheck = checkPerformanceMetrics();
  
  // Step 3: Lint check
  const lintCheck = runCommand('npm run lint', 'Running ESLint check');
  
  // Step 4: Type check (if TypeScript)
  // const typeCheck = runCommand('npx tsc --noEmit', 'TypeScript type check');
  
  // Step 5: Build check
  const buildCheck = runCommand('npm run build', 'Production build');
  
  // Step 6: Bundle analysis
  if (buildCheck) {
    analyzeBundleSize();
  }
  
  // Summary
  console.log('📊 Optimization Summary:');
  console.log(`Debug code check: ${debugCheck ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Performance config: ${perfCheck ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Lint check: ${lintCheck ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Build check: ${buildCheck ? '✅ PASS' : '❌ FAIL'}`);
  
  if (debugCheck && perfCheck && lintCheck && buildCheck) {
    console.log('\n🎉 All optimization checks passed! Ready for production.');
  } else {
    console.log('\n⚠️  Some checks failed. Review the issues above.');
  }
  
  console.log('\n💡 Performance Tips:');
  console.log('• Use next/image for all images');
  console.log('• Implement lazy loading for heavy components');
  console.log('• Consider code splitting for large components');
  console.log('• Use React.memo for expensive renders');
  console.log('• Monitor Core Web Vitals in production');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, checkForDebugCode, checkPerformanceMetrics };
