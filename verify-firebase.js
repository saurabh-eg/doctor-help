#!/usr/bin/env node

/**
 * Firebase FCM Configuration Validator
 * Run this script to verify your Firebase setup is working
 * 
 * Usage: node verify-firebase.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Firebase FCM Configuration Validator\n');

// Check 1: .env file exists
console.log('✓ Checking .env file...');
const envPath = path.join(__dirname, 'services/api/.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found at', envPath);
  process.exit(1);
}
console.log('✓ .env file found\n');

// Check 2: Load .env and parse
console.log('✓ Reading .env file...');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Extract FCM_SERVICE_ACCOUNT_JSON
const match = envContent.match(/FCM_SERVICE_ACCOUNT_JSON='(.+?)'\s*$/m);
if (!match || !match[1]) {
  console.log('❌ FCM_SERVICE_ACCOUNT_JSON not found in .env');
  console.log('\n📝 Please add the following to your .env file:');
  console.log('FCM_SERVICE_ACCOUNT_JSON=\'{"type":"service_account",...}\'');
  process.exit(1);
}

const jsonString = match[1];
console.log('✓ FCM_SERVICE_ACCOUNT_JSON found\n');

// Check 3: Parse JSON
console.log('✓ Validating JSON format...');
let serviceAccount;
try {
  serviceAccount = JSON.parse(jsonString);
  console.log('✓ JSON is valid\n');
} catch (err) {
  console.log('❌ JSON is invalid:', err.message);
  console.log('\n⚠️  JSON must be on a single line with no line breaks');
  console.log('See FIREBASE_CONFIG_GUIDE.md for correct format');
  process.exit(1);
}

// Check 4: Validate required fields
console.log('✓ Checking required fields...');
const requiredFields = [
  'type',
  'project_id',
  'private_key_id',
  'private_key',
  'client_email',
  'client_id'
];

const missingFields = requiredFields.filter(field => !serviceAccount[field]);
if (missingFields.length > 0) {
  console.log('❌ Missing fields:', missingFields.join(', '));
  process.exit(1);
}
console.log('✓ All required fields present\n');

// Check 5: Validate field values
console.log('✓ Validating field values...');
const validations = [
  {
    field: 'type',
    expected: 'service_account',
    actual: serviceAccount.type
  },
  {
    field: 'project_id',
    test: v => v && v.length > 0,
    actual: serviceAccount.project_id
  },
  {
    field: 'private_key',
    test: v => v && v.includes('BEGIN PRIVATE KEY'),
    actual: serviceAccount.private_key ? '***' : 'missing'
  },
  {
    field: 'client_email',
    test: v => v && v.includes('@'),
    actual: serviceAccount.client_email
  }
];

let valid = true;
for (const v of validations) {
  const check = v.expected !== undefined 
    ? v.actual === v.expected 
    : v.test(v.actual);
  
  if (!check) {
    console.log(`❌ Invalid ${v.field}: ${v.actual}`);
    valid = false;
  }
}

if (!valid) {
  process.exit(1);
}
console.log('✓ All field values valid\n');

// Check 6: Android google-services.json
console.log('✓ Checking google-services.json...');
const googleServicesPath = path.join(
  __dirname,
  'apps/flutter_app/android/app/google-services.json'
);
if (fs.existsSync(googleServicesPath)) {
  console.log('✓ google-services.json found\n');
} else {
  console.log('⚠️  google-services.json not found at:');
  console.log('   ', googleServicesPath);
  console.log('\n📝 Steps to get it:');
  console.log('1. Go to Firebase Console → Project Settings → General');
  console.log('2. Find your Android app in "Your apps" section');
  console.log('3. Click download button next to google-services.json');
  console.log('4. Save to: apps/flutter_app/android/app/google-services.json\n');
}

// Summary
console.log('════════════════════════════════════════');
console.log('✅ Firebase Configuration Validation PASSED\n');
console.log('Project Details:');
console.log('  Project ID:', serviceAccount.project_id);
console.log('  Service Account Email:', serviceAccount.client_email);
console.log('════════════════════════════════════════\n');

console.log('🚀 Next steps:');
console.log('1. Restart your backend server:');
console.log('   cd services/api && npm run build && npm start\n');
console.log('2. Check the logs - Firebase should initialize without errors\n');
console.log('3. Test sending a push notification:\n');
console.log('   - Login to Flutter app');
console.log('   - Create appointment from admin dashboard');
console.log('   - Push notification should appear when app is backgrounded\n');
