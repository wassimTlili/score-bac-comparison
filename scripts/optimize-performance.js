#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Performance optimization script to remove debug logs and console statements

// Files to process
const includePatterns = [
  'src/**/*.js',
  'src/**/*.jsx',
  'src/**/*.ts',
  'src/**/*.tsx'
];

// Console methods to remove in production
const consoleMethodsToRemove = [
  'console.log',
  'console.debug',
  'console.info',
  'console.warn'
];

// Keep only console.error for critical errors
const consoleMethodsToKeep = [
  'console.error'
];

function optimizeFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove debug console statements but keep error logging
    consoleMethodsToRemove.forEach(method => {
      const regex = new RegExp(`\\s*${method.replace('.', '\\.')}\\([^;]*\\);?\\s*`, 'g');
      const newContent = content.replace(regex, '');
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    // Convert detailed console.error to simple comments for production
    if (content.includes('console.error')) {
      const errorRegex = /console\.error\([^)]*\);?/g;
      const matches = content.match(errorRegex);
      
      if (matches) {
        matches.forEach(match => {
          // Keep only the essential error handling, convert detailed logs to comments
          if (match.includes('Error ') || match.includes('error:') || match.includes('❌')) {
            const simplified = '// Error handled silently in production';
            content = content.replace(match, simplified);
            modified = true;
          }
        });
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Optimized: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Starting performance optimization...\n');
  
  let totalOptimized = 0;
  
  includePatterns.forEach(pattern => {
    const files = glob.sync(pattern, { 
      cwd: process.cwd(),
      ignore: ['node_modules/**', '.next/**', 'dist/**']
    });
    
    files.forEach(file => {
      if (optimizeFile(file)) {
        totalOptimized++;
      }
    });
  });
  
  console.log(`\n🎉 Performance optimization complete!`);
  console.log(`📊 Total files optimized: ${totalOptimized}`);
}

if (require.main === module) {
  main();
}

module.exports = { optimizeFile, main };
