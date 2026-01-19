#!/usr/bin/env node
/**
 * Check if yFiles for HTML is installed
 * If not, provide helpful instructions
 */

const fs = require('fs');
const path = require('path');

const YFILES_LIB_DIR = path.join(__dirname, '..', 'lib');
const YFILES_PACKAGE_PATTERN = /yfiles.*\.tgz$/;

console.log('\n========================================');
console.log('  yFiles for HTML Installation Check');
console.log('========================================\n');

// Check if any yFiles package exists in lib/
const hasYFiles = fs.existsSync(YFILES_LIB_DIR) &&
  fs.readdirSync(YFILES_LIB_DIR).some(file => YFILES_PACKAGE_PATTERN.test(file));

if (hasYFiles) {
  console.log('✅ yFiles package found in lib/ directory');
  console.log('   Installation complete!\n');
} else {
  console.log('⚠️  yFiles for HTML package not found\n');
  console.log('To use this application, you need to install yFiles for HTML:\n');
  console.log('1. Visit: https://www.yworks.com/products/yfiles-for-html/evaluate');
  console.log('2. Request an evaluation license (free)');
  console.log('3. Download the yFiles for HTML package (.tgz file)');
  console.log('4. Place it in the lib/ directory of this project');
  console.log('5. Update package.json to reference the package:');
  console.log('   "yfiles": "file:./lib/yfiles-30.0.4+eval.tgz"');
  console.log('6. Run: npm install\n');
  console.log('A valid evaluation license is already included in lib/license.json\n');
  console.log('The application code is complete and ready to use once yFiles is installed.\n');
}

console.log('========================================\n');
