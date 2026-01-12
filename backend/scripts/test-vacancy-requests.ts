/**
 * VacancyRequest Testing Script
 * Run with: npx tsx scripts/test-vacancy-requests.ts
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
  console.log('🧪 Starting VacancyRequest Tests...\n');
  console.log('Make sure the server is running on http://localhost:3000\n');

  let managerToken = '';
  let recruiterToken = '';
  let adminToken = '';
  let departmentId = '';
  let draftRequestId = '';
  let pendingRequestId = '';

  // Login as different roles
  console.log('1️⃣  Logging in as Manager...');
  const managerLogin = await testEndpoint(
    'Login as Manager',
    'POST',
    '/auth/login',
    {
      email: 'manager@recruitment.com',
      password: 'manager123',
    }
  );
  if (managerLogin?.token) {
    managerToken = managerLogin.token;
  }

  console.log('2️⃣  Logging in as Recruiter...');
  const recruiterLogin = await testEndpoint(
    'Login as Recruiter',
    'POST',
    '/auth/login',
    {
      email: 'recruiter@recruitment.com',
      password: 'recruiter123',
    }
  );
  if (recruiterLogin?.token) {
    recruiterToken = recruiterLogin.token;
  }

  console.log('3️⃣  Logging in as Admin...');
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

  // Get a department ID (assuming departments exist)
  console.log('4️⃣  Getting departments...');
  const departments = await testEndpoint(
    'Get Departments',
    'GET',
    '/departments',
    undefined,
    adminToken
  );
  if (departments?.data && departments.data.length > 0) {
    departmentId = departments.data[0].id;
  }

  // Manager creates DRAFT vacancy request
  console.log('5️⃣  Creating DRAFT vacancy request (Manager)...');
  const draftRequest = await testEndpoint(
    'Create DRAFT Request',
    'POST',
    '/vacancy-requests',
    {
      title: 'Senior Software Engineer',
      description: 'We need an experienced software engineer',
      departmentId,
      justification: 'Team expansion',
      numberOfPositions: 2,
      requiredSkills: ['JavaScript', 'TypeScript', 'React'],
      experienceLevel: 'Senior (5+ years)',
      salaryRange: '$100,000 - $130,000',
      status: 'DRAFT',
    },
    managerToken
  );
  if (draftRequest?.id) {
    draftRequestId = draftRequest.id;
  }

  // Manager updates DRAFT request
  console.log('6️⃣  Updating DRAFT request (Manager)...');
  await testEndpoint(
    'Update DRAFT Request',
    'PUT',
    `/vacancy-requests/${draftRequestId}`,
    {
      numberOfPositions: 3,
      salaryRange: '$110,000 - $140,000',
    },
    managerToken
  );

  // Manager submits request (DRAFT -> PENDING)
  console.log('7️⃣  Submitting request (Manager)...');
  const submittedRequest = await testEndpoint(
    'Submit Request',
    'POST',
    `/vacancy-requests/${draftRequestId}/submit`,
    undefined,
    managerToken
  );
  if (submittedRequest?.id) {
    pendingRequestId = submittedRequest.id;
  }

  // Manager creates another PENDING request
  console.log('8️⃣  Creating PENDING vacancy request (Manager)...');
  const pendingRequest2 = await testEndpoint(
    'Create PENDING Request',
    'POST',
    '/vacancy-requests',
    {
      title: 'Product Manager',
      description: 'Looking for a product manager',
      departmentId,
      justification: 'New product line',
      numberOfPositions: 1,
      requiredSkills: ['Product Management', 'Agile'],
      experienceLevel: 'Mid-level (3-5 years)',
      salaryRange: '$90,000 - $110,000',
      status: 'PENDING',
    },
    managerToken
  );

  // Recruiter views PENDING requests
  console.log('9️⃣  Getting PENDING requests (Recruiter)...');
  await testEndpoint(
    'Get PENDING Requests',
    'GET',
    '/vacancy-requests?status=PENDING',
    undefined,
    recruiterToken
  );

  // Recruiter approves request
  console.log('🔟 Approving request (Recruiter)...');
  await testEndpoint(
    'Approve Request',
    'POST',
    `/vacancy-requests/${pendingRequestId}/approve`,
    undefined,
    recruiterToken
  );

  // Recruiter declines another request
  if (pendingRequest2?.id) {
    console.log('1️⃣1️⃣  Declining request (Recruiter)...');
    await testEndpoint(
      'Decline Request',
      'POST',
      `/vacancy-requests/${pendingRequest2.id}/decline`,
      {
        declinedReason: 'Budget constraints - please resubmit next quarter',
      },
      recruiterToken
    );
  }

  // Manager tries to update approved request (should fail)
  console.log('1️⃣2️⃣  Trying to update approved request (should fail)...');
  await testEndpoint(
    'Update Approved Request (Should Fail)',
    'PUT',
    `/vacancy-requests/${pendingRequestId}`,
    {
      title: 'This should fail',
    },
    managerToken
  );

  // Manager tries to approve request (should fail - wrong role)
  console.log('1️⃣3️⃣  Manager trying to approve (should fail)...');
  const newPendingRequest = await testEndpoint(
    'Create Request for Role Test',
    'POST',
    '/vacancy-requests',
    {
      title: 'Test Request',
      description: 'For role testing',
      departmentId,
      numberOfPositions: 1,
      requiredSkills: ['Testing'],
      status: 'PENDING',
    },
    managerToken
  );

  if (newPendingRequest?.id) {
    await testEndpoint(
      'Manager Approve (Should Fail)',
      'POST',
      `/vacancy-requests/${newPendingRequest.id}/approve`,
      undefined,
      managerToken
    );
  }

  // Manager cancels a request
  console.log('1️⃣4️⃣  Cancelling request (Manager)...');
  const cancelRequest = await testEndpoint(
    'Create Request to Cancel',
    'POST',
    '/vacancy-requests',
    {
      title: 'Request to Cancel',
      description: 'This will be cancelled',
      departmentId,
      numberOfPositions: 1,
      requiredSkills: ['Testing'],
      status: 'PENDING',
    },
    managerToken
  );

  if (cancelRequest?.id) {
    await testEndpoint(
      'Cancel Request',
      'POST',
      `/vacancy-requests/${cancelRequest.id}/cancel`,
      undefined,
      managerToken
    );
  }

  // Admin views all requests
  console.log('1️⃣5️⃣  Getting all requests (Admin)...');
  await testEndpoint(
    'Get All Requests (Admin)',
    'GET',
    '/vacancy-requests',
    undefined,
    adminToken
  );

  // Manager views their own requests
  console.log('1️⃣6️⃣  Getting own requests (Manager)...');
  await testEndpoint(
    'Get Own Requests (Manager)',
    'GET',
    '/vacancy-requests',
    undefined,
    managerToken
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

