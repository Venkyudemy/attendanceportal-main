// Test API connectivity from frontend perspective
const fetch = require('node-fetch');

// Test different API base URLs
const testUrls = [
  'http://backend:5000/api',
  'http://localhost:5000/api',
  'http://127.0.0.1:5000/api'
];

async function testApiConnectivity() {
  console.log('=== Testing API Connectivity ===\n');

  for (const baseUrl of testUrls) {
    console.log(`Testing base URL: ${baseUrl}`);
    
    try {
      // Test health endpoint
      const healthResponse = await fetch(`${baseUrl}/health`);
      console.log(`  Health check: ${healthResponse.status} ${healthResponse.ok ? '✅' : '❌'}`);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log(`  Health data:`, healthData);
        
        // Test employee stats endpoint
        const statsResponse = await fetch(`${baseUrl}/employee/stats`);
        console.log(`  Employee stats: ${statsResponse.status} ${statsResponse.ok ? '✅' : '❌'}`);
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log(`  Stats data:`, statsData);
          
          // Test admin recent activities
          const activitiesResponse = await fetch(`${baseUrl}/employee/admin/recent-activities?limit=5`);
          console.log(`  Recent activities: ${activitiesResponse.status} ${activitiesResponse.ok ? '✅' : '❌'}`);
          
          if (activitiesResponse.ok) {
            const activitiesData = await activitiesResponse.json();
            console.log(`  Activities data:`, activitiesData);
          }
        }
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    console.log('---\n');
  }
}

testApiConnectivity().catch(console.error);
