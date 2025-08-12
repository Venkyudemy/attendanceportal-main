// Test runner - runs all tests in sequence
const { exec } = require('child_process');
const path = require('path');

const tests = [
  'test-backend.js',
  'test-endpoints.js',
  'test-api-connectivity.js',
  'test-docker-network.js'
];

async function runTest(testFile) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Running ${testFile}...`);
    console.log('='.repeat(50));
    
    const testPath = path.join(__dirname, testFile);
    const child = exec(`node "${testPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.log(`❌ ${testFile} failed:`, error.message);
        resolve(false);
      } else {
        console.log(stdout);
        if (stderr) {
          console.log('Warnings:', stderr);
        }
        console.log(`✅ ${testFile} completed`);
        resolve(true);
      }
    });
    
    // Add timeout
    setTimeout(() => {
      child.kill();
      console.log(`⏰ ${testFile} timed out`);
      resolve(false);
    }, 30000); // 30 second timeout
  });
}

async function runAllTests() {
  console.log('🚀 Starting all tests...\n');
  
  const results = [];
  
  for (const test of tests) {
    const success = await runTest(test);
    results.push({ test, success });
  }
  
  console.log('\n📊 Test Results:');
  console.log('='.repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  results.forEach(({ test, success }) => {
    if (success) {
      console.log(`✅ ${test} - PASSED`);
      passed++;
    } else {
      console.log(`❌ ${test} - FAILED`);
      failed++;
    }
  });
  
  console.log('\n📈 Summary:');
  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above.');
  }
}

// Run all tests
runAllTests().catch(console.error);
