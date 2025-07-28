#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Comprehensive debug cleanup script

console.log('🧹 Starting comprehensive debug cleanup...\n');

// Function to recursively get files
function getFiles(dir, pattern = /\.(js|jsx|ts|tsx)$/) {
  let results = [];
  
  if (!fs.existsSync(dir)) return results;
  
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    
    if (file.isDirectory() && 
        !file.name.startsWith('.') && 
        !['node_modules', '.next', 'dist'].includes(file.name)) {
      results = results.concat(getFiles(filePath, pattern));
    } else if (file.isFile() && pattern.test(file.name)) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Function to clean debug code from a file
function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remove console.log statements (but keep console.error for production)
    const consoleLogRegex = /\s*console\.log\([^;]*\);?\s*/g;
    const newContent = content.replace(consoleLogRegex, '');
    
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
    
    // Remove console.debug and console.info
    const consoleDebugRegex = /\s*console\.(debug|info)\([^;]*\);?\s*/g;
    const newContent2 = content.replace(consoleDebugRegex, '');
    
    if (newContent2 !== content) {
      content = newContent2;
      modified = true;
    }
    
    // Remove debugLog statements
    const debugLogRegex = /\s*debugLog\([^;]*\);?\s*/g;
    const newContent3 = content.replace(debugLogRegex, '');
    
    if (newContent3 !== content) {
      content = newContent3;
      modified = true;
    }
    
    // Remove debug comments
    const debugCommentRegex = /\s*\/\/.*[Dd]ebug.*\n/g;
    const newContent4 = content.replace(debugCommentRegex, '');
    
    if (newContent4 !== content) {
      content = newContent4;
      modified = true;
    }
    
    // Remove debug JSX elements
    const debugJsxRegex = /<span[^>]*>\s*\[Debug:[^<]*<\/span>/g;
    const newContent5 = content.replace(debugJsxRegex, '');
    
    if (newContent5 !== content) {
      content = newContent5;
      modified = true;
    }
    
    // Remove TODO and FIXME comments in production
    const todoRegex = /\s*\/\/\s*(TODO|FIXME).*\n/g;
    const newContent6 = content.replace(todoRegex, '');
    
    if (newContent6 !== content) {
      content = newContent6;
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Cleaned: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
    return false;
  }
}

// Function to remove debug files
function removeDebugFiles() {
  const srcDir = './src';
  const rootFiles = [
    'test-debug.js',
    'test-db.js', 
    'test-comparison-data.js',
    'test-message-serialization.js',
    'test-recommendations.js'
  ];
  
  // Remove root level test files
  rootFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
        console.log(`🗑️  Removed debug file: ${file}`);
      } catch (error) {
        console.error(`❌ Failed to remove ${file}:`, error.message);
      }
    }
  });
  
  // Find and remove debug files in src
  if (fs.existsSync(srcDir)) {
    const files = getFiles(srcDir);
    files.forEach(file => {
      const filename = path.basename(file);
      if (filename.includes('debug') || 
          filename.includes('test') || 
          filename === 'LocaleDebugger.jsx') {
        try {
          fs.unlinkSync(file);
          console.log(`🗑️  Removed debug file: ${file}`);
        } catch (error) {
          console.error(`❌ Failed to remove ${file}:`, error.message);
        }
      }
    });
  }
}

// Function to optimize imports
function optimizeImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remove unused debug imports
    const debugImportRegex = /import.*debug.*from.*['"];?\s*\n/gi;
    const newContent = content.replace(debugImportRegex, '');
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`🔧 Optimized imports: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error optimizing imports in ${filePath}:`, error.message);
    return false;
  }
}

// Main function
function main() {
  console.log('🧹 Comprehensive Production Cleanup\n');
  
  // Step 1: Remove debug files
  console.log('🗑️  Removing debug files...');
  removeDebugFiles();
  console.log('');
  
  // Step 2: Clean source files
  console.log('🧹 Cleaning debug code from source files...');
  
  const srcFiles = getFiles('./src');
  
  let totalCleaned = 0;
  let totalOptimized = 0;
  
  srcFiles.forEach(file => {
    if (cleanFile(file)) {
      totalCleaned++;
    }
    
    if (optimizeImports(file)) {
      totalOptimized++;
    }
  });
  
  console.log(`\n📊 Cleanup Summary:`);
  console.log(`• Files cleaned: ${totalCleaned}`);
  console.log(`• Imports optimized: ${totalOptimized}`);
  
  console.log('\n🎉 Production cleanup complete!');
  console.log('\n💡 Next steps:');
  console.log('• Run: npm run lint -- --fix');
  console.log('• Run: npm run build');
  console.log('• Test the application thoroughly');
}

if (require.main === module) {
  main();
}

module.exports = { cleanFile, removeDebugFiles, optimizeImports, main };
