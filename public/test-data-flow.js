// Test script to verify data flow fixes
// Run this in browser console on any page with authentication

console.log('🔍 Testing data flow fixes...');

// Test 1: Check if profile API is working
async function testProfileAPI() {
  try {
    console.log('📋 Testing Profile API...');
    const response = await fetch('/api/profile');
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Profile API working - user has profile:', result.profile);
      return { success: true, profile: result.profile };
    } else {
      console.log('❌ Profile API returned:', result);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log('❌ Profile API error:', error);
    return { success: false, error: error.message };
  }
}

// Test 2: Check localStorage data
function testLocalStorageData() {
  console.log('💾 Testing localStorage data...');
  const stepperData = localStorage.getItem('stepperFormData');
  
  if (stepperData) {
    try {
      const parsed = JSON.parse(stepperData);
      console.log('✅ Found stepper data in localStorage:', parsed);
      return { success: true, data: parsed };
    } catch (error) {
      console.log('❌ Invalid stepper data in localStorage:', error);
      return { success: false, error: 'Invalid JSON in localStorage' };
    }
  } else {
    console.log('❌ No stepper data found in localStorage');
    return { success: false, error: 'No stepper data' };
  }
}

// Test 3: Check comparison API
async function testComparisonAPI() {
  try {
    console.log('⚖️ Testing Comparison API...');
    
    // Test with minimal data
    const testData = {
      orientation1: {
        id: "10453",
        name: "علوم التصرف",
        university: "جامعة قرطاج",
        hub: "بنزرت"
      },
      orientation2: {
        id: "10454", 
        name: "الاقتصاد",
        university: "جامعة تونس",
        hub: "تونس"
      },
      userProfile: {
        score: 150,
        location: "تونس",
        bacType: "إقتصاد وتصرف"
      }
    };
    
    const response = await fetch('/api/comparison', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Comparison API working:', result);
      return { success: true, comparison: result };
    } else {
      console.log('❌ Comparison API failed:', result);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log('❌ Comparison API error:', error);
    return { success: false, error: error.message };
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive data flow tests...\n');
  
  const profileTest = await testProfileAPI();
  const localStorageTest = testLocalStorageData();
  const comparisonTest = await testComparisonAPI();
  
  console.log('\n📊 Test Results Summary:');
  console.log('Profile API:', profileTest.success ? '✅ PASS' : '❌ FAIL');
  console.log('localStorage:', localStorageTest.success ? '✅ PASS' : '❌ FAIL');
  console.log('Comparison API:', comparisonTest.success ? '✅ PASS' : '❌ FAIL');
  
  // Provide recommendations
  if (!profileTest.success && !localStorageTest.success) {
    console.log('\n🔧 Recommendation: User needs to complete stepper first');
    console.log('   → Navigate to /stepper');
  } else if (profileTest.success) {
    console.log('\n✅ Data flow is working correctly!');
    console.log('   → User can proceed to comparison tool');
  } else if (localStorageTest.success) {
    console.log('\n⚠️  Data in localStorage but not in database');
    console.log('   → Stepper review page should save to database');
  }
  
  return {
    profile: profileTest,
    localStorage: localStorageTest,
    comparison: comparisonTest
  };
}

// Export for manual testing
window.testDataFlow = runAllTests;

// Auto-run if in development
if (window.location.hostname === 'localhost') {
  runAllTests();
}
