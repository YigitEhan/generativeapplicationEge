/**
 * Automated test script for Vacancy endpoints
 * Tests all CRUD operations and role-based access control
 */

import axios, { AxiosError } from 'axios';

const API_URL = 'http://localhost:3000/api';
const PUBLIC_URL = 'http://localhost:3000/api/public';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message?: string;
}

const results: TestResult[] = [];

// Test tokens and IDs (will be populated during tests)
let recruiterToken = '';
let adminToken = '';
let managerToken = '';
let departmentId = '';
let approvedRequestId = '';
let vacancyId = '';

function logResult(name: string, status: 'PASS' | 'FAIL', message?: string) {
  results.push({ name, status, message });
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${name}${message ? ': ' + message : ''}`);
}

async function setup() {
  console.log('\n🔧 Setting up test environment...\n');

  try {
    // Login as recruiter
    const recruiterLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'recruiter@example.com',
      password: 'Password123!',
    });
    recruiterToken = recruiterLogin.data.token;
    logResult('Login as Recruiter', 'PASS');

    // Login as admin
    const adminLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'Password123!',
    });
    adminToken = adminLogin.data.token;
    logResult('Login as Admin', 'PASS');

    // Login as manager
    const managerLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'manager@example.com',
      password: 'Password123!',
    });
    managerToken = managerLogin.data.token;
    logResult('Login as Manager', 'PASS');

    // Get a department
    const departments = await axios.get(`${API_URL}/departments`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (departments.data.length > 0) {
      departmentId = departments.data[0].id;
      logResult('Get Department', 'PASS', departmentId);
    }

    // Create and approve a vacancy request
    const requestData = {
      title: 'Test Position for Vacancy',
      description: 'Test description',
      departmentId,
      numberOfPositions: 1,
      requiredSkills: ['Skill 1', 'Skill 2'],
      status: 'PENDING',
    };

    const createRequest = await axios.post(`${API_URL}/vacancy-requests`, requestData, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    const requestId = createRequest.data.id;

    // Approve the request
    await axios.post(
      `${API_URL}/vacancy-requests/${requestId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );
    approvedRequestId = requestId;
    logResult('Create and Approve Vacancy Request', 'PASS', approvedRequestId);
  } catch (error: any) {
    logResult('Setup', 'FAIL', error.message);
    throw error;
  }
}

async function testCreateVacancy() {
  console.log('\n📝 Testing Create Vacancy...\n');

  try {
    const response = await axios.post(
      `${API_URL}/vacancies`,
      {
        vacancyRequestId: approvedRequestId,
        title: 'Senior Software Engineer',
        description: 'We are looking for an experienced engineer',
        requirements: ['5+ years experience', 'TypeScript', 'React'],
        responsibilities: ['Lead development', 'Code reviews'],
        qualifications: ["Bachelor's degree"],
        benefits: ['Health insurance', 'Remote work'],
        salaryMin: 80000,
        salaryMax: 120000,
        location: 'Remote',
        employmentType: 'FULL_TIME',
        experienceYears: 5,
        educationLevel: "Bachelor's",
        deadline: '2024-12-31T23:59:59Z',
      },
      { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );

    vacancyId = response.data.id;
    logResult('Create Vacancy', 'PASS', `ID: ${vacancyId}`);
  } catch (error: any) {
    logResult('Create Vacancy', 'FAIL', error.response?.data?.error || error.message);
  }
}

async function testUpdateVacancy() {
  console.log('\n✏️  Testing Update Vacancy...\n');

  try {
    await axios.put(
      `${API_URL}/vacancies/${vacancyId}`,
      {
        title: 'Senior Software Engineer - Updated',
        salaryMax: 130000,
      },
      { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );
    logResult('Update Vacancy', 'PASS');
  } catch (error: any) {
    logResult('Update Vacancy', 'FAIL', error.response?.data?.error || error.message);
  }
}

async function testPublishVacancy() {
  console.log('\n📢 Testing Publish Vacancy...\n');

  try {
    await axios.post(
      `${API_URL}/vacancies/${vacancyId}/publish`,
      {},
      { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );
    logResult('Publish Vacancy', 'PASS');
  } catch (error: any) {
    logResult('Publish Vacancy', 'FAIL', error.response?.data?.error || error.message);
  }
}

async function testGetPublicVacancies() {
  console.log('\n🌐 Testing Public Endpoints...\n');

  try {
    const response = await axios.get(`${PUBLIC_URL}/vacancies`);
    logResult('Get Public Vacancies', 'PASS', `Found ${response.data.data.length} vacancies`);
  } catch (error: any) {
    logResult('Get Public Vacancies', 'FAIL', error.message);
  }

  try {
    const response = await axios.get(`${PUBLIC_URL}/vacancies/${vacancyId}`);
    logResult('Get Public Vacancy by ID', 'PASS', response.data.title);
  } catch (error: any) {
    logResult('Get Public Vacancy by ID', 'FAIL', error.message);
  }

  try {
    const response = await axios.get(
      `${PUBLIC_URL}/vacancies?keyword=engineer&employmentType=FULL_TIME`
    );
    logResult('Get Public Vacancies with Filters', 'PASS', `Found ${response.data.data.length}`);
  } catch (error: any) {
    logResult('Get Public Vacancies with Filters', 'FAIL', error.message);
  }
}

async function testUnpublishVacancy() {
  console.log('\n🔒 Testing Unpublish Vacancy...\n');

  try {
    await axios.post(
      `${API_URL}/vacancies/${vacancyId}/unpublish`,
      {},
      { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );
    logResult('Unpublish Vacancy', 'PASS');
  } catch (error: any) {
    logResult('Unpublish Vacancy', 'FAIL', error.response?.data?.error || error.message);
  }
}

async function testGetAllVacancies() {
  console.log('\n📋 Testing Get All Vacancies (Recruiter)...\n');

  try {
    const response = await axios.get(`${API_URL}/vacancies`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    logResult('Get All Vacancies', 'PASS', `Found ${response.data.data.length} vacancies`);
  } catch (error: any) {
    logResult('Get All Vacancies', 'FAIL', error.response?.data?.error || error.message);
  }

  try {
    const response = await axios.get(`${API_URL}/vacancies/${vacancyId}`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    logResult('Get Vacancy by ID', 'PASS', response.data.title);
  } catch (error: any) {
    logResult('Get Vacancy by ID', 'FAIL', error.response?.data?.error || error.message);
  }
}

async function testCloseVacancy() {
  console.log('\n🚫 Testing Close Vacancy...\n');

  try {
    await axios.post(
      `${API_URL}/vacancies/${vacancyId}/close`,
      {},
      { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );
    logResult('Close Vacancy', 'PASS');
  } catch (error: any) {
    logResult('Close Vacancy', 'FAIL', error.response?.data?.error || error.message);
  }
}

async function testRBAC() {
  console.log('\n🔐 Testing Role-Based Access Control...\n');

  // Manager should NOT be able to access vacancy endpoints
  try {
    await axios.get(`${API_URL}/vacancies`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    logResult('Manager Access Denied', 'FAIL', 'Manager should not have access');
  } catch (error: any) {
    if (error.response?.status === 403) {
      logResult('Manager Access Denied', 'PASS', 'Correctly denied');
    } else {
      logResult('Manager Access Denied', 'FAIL', error.message);
    }
  }

  // Admin should be able to delete
  try {
    // Create a new vacancy to delete
    const createResponse = await axios.post(
      `${API_URL}/vacancies`,
      {
        vacancyRequestId: approvedRequestId,
        title: 'Vacancy to Delete',
        description: 'Test',
        requirements: ['Test'],
        employmentType: 'FULL_TIME',
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    const deleteId = createResponse.data.id;

    await axios.delete(`${API_URL}/vacancies/${deleteId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    logResult('Admin Delete Vacancy', 'PASS');
  } catch (error: any) {
    logResult('Admin Delete Vacancy', 'FAIL', error.response?.data?.error || error.message);
  }
}

async function testErrorCases() {
  console.log('\n⚠️  Testing Error Cases...\n');

  // Try to update closed vacancy
  try {
    await axios.put(
      `${API_URL}/vacancies/${vacancyId}`,
      { title: 'Should fail' },
      { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );
    logResult('Update Closed Vacancy Error', 'FAIL', 'Should have been rejected');
  } catch (error: any) {
    if (error.response?.status === 400) {
      logResult('Update Closed Vacancy Error', 'PASS', 'Correctly rejected');
    } else {
      logResult('Update Closed Vacancy Error', 'FAIL', error.message);
    }
  }

  // Try to access non-existent vacancy
  try {
    await axios.get(`${API_URL}/vacancies/00000000-0000-0000-0000-000000000000`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    logResult('Non-existent Vacancy Error', 'FAIL', 'Should have returned 400');
  } catch (error: any) {
    if (error.response?.status === 400) {
      logResult('Non-existent Vacancy Error', 'PASS', 'Correctly returned error');
    } else {
      logResult('Non-existent Vacancy Error', 'FAIL', error.message);
    }
  }
}

async function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const total = results.length;

  console.log(`\nTotal Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('Failed Tests:');
    results
      .filter((r) => r.status === 'FAIL')
      .forEach((r) => {
        console.log(`  ❌ ${r.name}: ${r.message}`);
      });
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

async function runTests() {
  console.log('🚀 Starting Vacancy Endpoint Tests...');

  try {
    await setup();
    await testCreateVacancy();
    await testUpdateVacancy();
    await testPublishVacancy();
    await testGetPublicVacancies();
    await testUnpublishVacancy();
    await testGetAllVacancies();
    await testCloseVacancy();
    await testRBAC();
    await testErrorCases();
  } catch (error: any) {
    console.error('\n❌ Test suite failed:', error.message);
  } finally {
    await printSummary();
  }
}

runTests();

