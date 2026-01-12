import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000/api';

// Test tokens (replace with actual tokens from your test users)
let recruiterToken = '';
let applicantToken = '';
let adminToken = '';
let vacancyId = '';
let applicationId = '';
let cvId = '';

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
}

const results: TestResult[] = [];

function logResult(name: string, success: boolean, error?: string) {
  results.push({ name, success, error });
  const icon = success ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (error) console.log(`   Error: ${error}`);
}

async function setup() {
  console.log('🔧 Setting up test environment...\n');

  try {
    // Login as recruiter
    const recruiterRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'recruiter@example.com',
      password: 'Recruiter123!',
    });
    recruiterToken = recruiterRes.data.token;
    console.log('✅ Logged in as recruiter');

    // Login as applicant
    const applicantRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'applicant@example.com',
      password: 'Applicant123!',
    });
    applicantToken = applicantRes.data.token;
    console.log('✅ Logged in as applicant');

    // Get a published vacancy
    const vacanciesRes = await axios.get(`${BASE_URL}/public/vacancies?limit=1`);
    if (vacanciesRes.data.data.length > 0) {
      vacancyId = vacanciesRes.data.data[0].id;
      console.log(`✅ Found vacancy: ${vacancyId}\n`);
    } else {
      throw new Error('No published vacancies found. Please create and publish a vacancy first.');
    }
  } catch (error: any) {
    console.error('❌ Setup failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function testApplyWithStructuredCV() {
  try {
    const response = await axios.post(
      `${BASE_URL}/applications`,
      {
        vacancyId,
        motivationLetter: 'I am very interested in this position and believe my skills align perfectly.',
        structuredCV: {
          personalInfo: {
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            location: 'New York, NY',
            linkedIn: 'https://linkedin.com/in/johndoe',
          },
          summary: 'Experienced software engineer with 5+ years',
          education: [
            {
              institution: 'MIT',
              degree: 'Bachelor of Science',
              field: 'Computer Science',
              startDate: '2015-09',
              endDate: '2019-06',
            },
          ],
          experience: [
            {
              company: 'Tech Corp',
              position: 'Senior Software Engineer',
              startDate: '2019-07',
              current: true,
              description: 'Lead development',
            },
          ],
          skills: {
            technical: ['TypeScript', 'React', 'Node.js'],
            languages: [{ language: 'English', proficiency: 'NATIVE' }],
          },
        },
      },
      {
        headers: { Authorization: `Bearer ${applicantToken}` },
      }
    );

    applicationId = response.data.id;
    cvId = response.data.cvId;
    logResult('Apply with structured CV', response.status === 201);
  } catch (error: any) {
    logResult('Apply with structured CV', false, error.response?.data?.error || error.message);
  }
}

async function testGetMyApplications() {
  try {
    const response = await axios.get(`${BASE_URL}/applications/mine?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${applicantToken}` },
    });

    logResult(
      'Get my applications',
      response.status === 200 && Array.isArray(response.data.data)
    );
  } catch (error: any) {
    logResult('Get my applications', false, error.response?.data?.error || error.message);
  }
}

async function testGetMyApplicationDetail() {
  try {
    const response = await axios.get(`${BASE_URL}/applications/mine/${applicationId}`, {
      headers: { Authorization: `Bearer ${applicantToken}` },
    });

    logResult(
      'Get my application detail',
      response.status === 200 && response.data.id === applicationId
    );
  } catch (error: any) {
    logResult('Get my application detail', false, error.response?.data?.error || error.message);
  }
}

async function testGetVacancyApplications() {
  try {
    const response = await axios.get(
      `${BASE_URL}/vacancies/${vacancyId}/applications?page=1&limit=20`,
      {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      }
    );

    logResult(
      'Get vacancy applications (Recruiter)',
      response.status === 200 && Array.isArray(response.data.data)
    );
  } catch (error: any) {
    logResult('Get vacancy applications (Recruiter)', false, error.response?.data?.error || error.message);
  }
}

async function testGetApplicationDetail() {
  try {
    const response = await axios.get(`${BASE_URL}/applications/${applicationId}`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });

    logResult(
      'Get application detail (Recruiter)',
      response.status === 200 && response.data.id === applicationId
    );
  } catch (error: any) {
    logResult('Get application detail (Recruiter)', false, error.response?.data?.error || error.message);
  }
}

async function testUpdateApplicationStatus() {
  try {
    const response = await axios.put(
      `${BASE_URL}/applications/${applicationId}/status`,
      {
        status: 'SCREENING',
        notes: 'Candidate has strong technical background.',
      },
      {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      }
    );

    logResult(
      'Update application status',
      response.status === 200 && response.data.status === 'SCREENING'
    );
  } catch (error: any) {
    logResult('Update application status', false, error.response?.data?.error || error.message);
  }
}

async function testWithdrawApplication() {
  try {
    const response = await axios.post(
      `${BASE_URL}/applications/${applicationId}/withdraw`,
      {
        reason: 'I have accepted another offer. Thank you for your consideration.',
      },
      {
        headers: { Authorization: `Bearer ${applicantToken}` },
      }
    );

    logResult(
      'Withdraw application',
      response.status === 200 && response.data.status === 'WITHDRAWN'
    );
  } catch (error: any) {
    logResult('Withdraw application', false, error.response?.data?.error || error.message);
  }
}

async function testApplyWithoutCV() {
  try {
    await axios.post(
      `${BASE_URL}/applications`,
      {
        vacancyId,
        motivationLetter: 'I want to apply',
      },
      {
        headers: { Authorization: `Bearer ${applicantToken}` },
      }
    );

    logResult('Apply without CV (should fail)', false, 'Should have failed but succeeded');
  } catch (error: any) {
    logResult(
      'Apply without CV (should fail)',
      error.response?.status === 400,
      error.response?.status === 400 ? 'Correctly rejected' : error.response?.data?.error
    );
  }
}

async function testApplyTwice() {
  try {
    // Create a new applicant for this test
    const newApplicantRes = await axios.post(`${BASE_URL}/auth/register`, {
      email: `test-${Date.now()}@example.com`,
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User',
    });
    const newToken = newApplicantRes.data.token;

    // Apply first time
    await axios.post(
      `${BASE_URL}/applications`,
      {
        vacancyId,
        structuredCV: {
          personalInfo: {
            fullName: 'Test User',
            email: 'test@test.com',
          },
        },
      },
      {
        headers: { Authorization: `Bearer ${newToken}` },
      }
    );

    // Try to apply second time (should fail)
    await axios.post(
      `${BASE_URL}/applications`,
      {
        vacancyId,
        structuredCV: {
          personalInfo: {
            fullName: 'Test User',
            email: 'test@test.com',
          },
        },
      },
      {
        headers: { Authorization: `Bearer ${newToken}` },
      }
    );

    logResult('Apply twice (should fail)', false, 'Should have failed but succeeded');
  } catch (error: any) {
    logResult(
      'Apply twice (should fail)',
      error.response?.status === 400,
      error.response?.status === 400 ? 'Correctly rejected' : error.response?.data?.error
    );
  }
}

async function runTests() {
  console.log('🧪 Testing Application Endpoints\n');
  console.log('='.repeat(50));

  await setup();

  console.log('\n📝 APPLICANT TESTS');
  console.log('-'.repeat(50));
  await testApplyWithStructuredCV();
  await testGetMyApplications();
  await testGetMyApplicationDetail();

  console.log('\n👔 RECRUITER TESTS');
  console.log('-'.repeat(50));
  await testGetVacancyApplications();
  await testGetApplicationDetail();
  await testUpdateApplicationStatus();

  console.log('\n🔄 WORKFLOW TESTS');
  console.log('-'.repeat(50));
  await testWithdrawApplication();

  console.log('\n❌ ERROR CASE TESTS');
  console.log('-'.repeat(50));
  await testApplyWithoutCV();
  await testApplyTwice();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`Total: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed tests:');
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - ${r.name}: ${r.error}`);
      });
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((error) => {
  console.error('Test execution failed:', error);
  process.exit(1);
});

