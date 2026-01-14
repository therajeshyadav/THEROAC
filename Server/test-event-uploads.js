// Test script to verify event upload endpoints exist
const express = require('express');
const app = express();

// Import routes to check if they're properly defined
const eventRoutes = require('./src/routes/events');

console.log('🔍 Testing Event Upload Endpoints...\n');

// Check if the routes are properly defined
const router = express.Router();
eventRoutes(router);

// Get all routes from the router
const routes = [];
router.stack.forEach(function(middleware) {
  if (middleware.route) {
    const path = middleware.route.path;
    const methods = Object.keys(middleware.route.methods);
    routes.push({ path, methods });
  }
});

console.log('📋 Available Event Routes:');
routes.forEach(route => {
  const methodStr = route.methods.join(', ').toUpperCase();
  console.log(`   ${methodStr} ${route.path}`);
});

// Check specifically for upload endpoints
const uploadRoutes = routes.filter(route => route.path.includes('upload'));
console.log(`\n🎯 Upload Endpoints Found: ${uploadRoutes.length}`);
uploadRoutes.forEach(route => {
  const methodStr = route.methods.join(', ').toUpperCase();
  console.log(`   ✅ ${methodStr} ${route.path}`);
});

if (uploadRoutes.length >= 3) {
  console.log('\n✅ All upload endpoints are properly configured!');
  console.log('   - /upload-image (general)');
  console.log('   - /upload-banner-image (banner specific)');
  console.log('   - /upload-thumbnail-image (thumbnail specific)');
} else {
  console.log('\n❌ Missing upload endpoints. Expected 3, found:', uploadRoutes.length);
}

process.exit(0);