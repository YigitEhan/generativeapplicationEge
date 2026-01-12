/**
 * Authentication Testing Script
 * Run with: npx tsx scripts/test-auth.ts
 */

const BASE_URL = 'http://localhost:3000/api';

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  data?: any;
}

const results: TestResult[] = [];

async function testEndpoint(
  name: string,
  method: string,
  endpoint: string,
  body?: any,
  token?: string
): Promise<any> {
  try {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (response.ok) {
      results.push({
        name,
        success: true,
        message: `✅ ${response.status} ${response.statusText}`,
        data,
      });
      return data;
    } else {
      results.push({
        name,
        success: false,
        message: `❌ ${response.status} - ${data.error || data.message}`,
        data,
      });
      return null;
    }
  } catch (error: any) {
    results.push({
      name,
      success: false,
      message: `❌ Error: ${error.message}`,
    });
    return null;
  }
}

async function runTests() {
  console.log('🧪 Starting Authentication Tests...\n');
  console.log('Make sure the server is running on http://localhost:3000\n');

  let adminToken = '';
  let applicantToken = '';

  // Test 1: Register new applicant
  console.log('1️⃣  Testing applicant registration...');
  await testEndpoint(
    'Register Applicant',
    'POST',
    '/auth/register',
    {
      email: `test${Date.now()}@example.com`,
      password: 'SecurePass123',
      firstName: 'Test',
      lastName: 'User',
      phone: '+1234567890',
    }
  );

  // Test 2: Login as admin
  console.log('2️⃣  Testing admin login...');
  const adminLogin = await testEndpoint(
    'Login as Admin',
    'POST',
    '/auth/login',
    {
      email: 'admin@recruitment.com',
      password: 'admin123',
    }
  );
  if (adminLogin?.token) {
    adminToken = adminLogin.token;
  }

  // Test 3: Login as applicant
  console.log('3️⃣  Testing applicant login...');
  const applicantLogin = await testEndpoint(
    'Login as Applicant',
    'POST',
    '/auth/login',
    {
      email: 'applicant@recruitment.com',
      password: 'applicant123',
    }
  );
  if (applicantLogin?.token) {
    applicantToken = applicantLogin.token;
  }

  // Test 4: Get current user (admin)
  console.log('4️⃣  Testing get current user (admin)...');
  await testEndpoint(
    'Get Current User (Admin)',
    'GET',
    '/auth/me',
    undefined,
    adminToken
  );

  // Test 5: Get current user (applicant)
  console.log('5️⃣  Testing get current user (applicant)...');
  await testEndpoint(
    'Get Current User (Applicant)',
    'GET',
    '/auth/me',
    undefined,
    applicantToken
  );

  // Test 6: Create new recruiter (admin only)
  console.log('6️⃣  Testing create user (admin)...');
  await testEndpoint(
    'Create Recruiter (Admin)',
    'POST',
    '/auth/users',
    {
      email: `recruiter${Date.now()}@company.com`,
      password: 'SecurePass123',
      firstName: 'New',
      lastName: 'Recruiter',
      role: 'RECRUITER',
      phone: '+1987654321',
    },
    adminToken
  );

  // Test 7: Get all users (admin only)
  console.log('7️⃣  Testing get all users (admin)...');
  await testEndpoint(
    'Get All Users (Admin)',
    'GET',
    '/auth/users',
    undefined,
    adminToken
  );

  // Test 8: Try to access protected route without token (should fail)
  console.log('8️⃣  Testing protected route without token (should fail)...');
  await testEndpoint(
    'Get Current User (No Token)',
    'GET',
    '/auth/me'
  );

  // Test 9: Try to create user as applicant (should fail)
  console.log('9️⃣  Testing create user as applicant (should fail)...');
  await testEndpoint(
    'Create User (Applicant - Should Fail)',
    'POST',
    '/auth/users',
    {
      email: 'unauthorized@test.com',
      password: 'SecurePass123',
      firstName: 'Should',
      lastName: 'Fail',
      role: 'ADMIN',
    },
    applicantToken
  );

  // Print results
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(80) + '\n');

  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.name}`);
    console.log(`   ${result.message}\n`);
  });

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('='.repeat(80));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${results.length}`);
  console.log('='.repeat(80));
}

runTests().catch(console.error);

