import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

// Test data
let recruiterToken: string;
let interviewerToken: string;
let managerToken: string;
let applicantToken: string;
let departmentId: string;
let vacancyId: string;
let applicationId: string;
let interviewId: string;
let evaluationId: string;

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
  if (error) {
    console.log(`   Error: ${error}`);
  }
}

async function setup() {
  console.log('Setting up test data...\n');

  try {
    // Create recruiter
    const recruiterRes = await axios.post(`${BASE_URL}/auth/register`, {
      email: `recruiter-${Date.now()}@example.com`,
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'Recruiter',
      role: 'RECRUITER',
    });
    recruiterToken = recruiterRes.data.token;

    // Create interviewer
    const interviewerRes = await axios.post(`${BASE_URL}/auth/register`, {
      email: `interviewer-${Date.now()}@example.com`,
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'Interviewer',
      role: 'INTERVIEWER',
    });
    interviewerToken = interviewerRes.data.token;

    // Create manager
    const managerRes = await axios.post(`${BASE_URL}/auth/register`, {
      email: `manager-${Date.now()}@example.com`,
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'Manager',
      role: 'MANAGER',
    });
    managerToken = managerRes.data.token;

    // Create applicant
    const applicantRes = await axios.post(`${BASE_URL}/auth/register`, {
      email: `applicant-${Date.now()}@example.com`,
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'Applicant',
    });
    applicantToken = applicantRes.data.token;

    // Create department (as admin - you may need to create an admin user first)
    // For now, we'll assume a department exists or create one via direct DB access
    // This is a simplified test - in production you'd have proper setup

    console.log('✅ Test users created\n');
  } catch (error: any) {
    console.error('Setup failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function testRecruiterEvaluation() {
  try {
    // First, create a vacancy and application
    // This is simplified - you'd need proper setup
    const response = await axios.post(
      `${BASE_URL}/applications/${applicationId}/evaluations`,
      {
        rating: 8,
        comments: 'Strong candidate with good technical skills',
        strengths: 'Excellent communication, strong technical background',
        weaknesses: 'Limited experience with our specific tech stack',
        recommendation: 'PROCEED',
      },
      {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      }
    );

    logResult(
      'Recruiter creates evaluation',
      response.status === 201 && response.data.rating === 8
    );
    evaluationId = response.data.id;
  } catch (error: any) {
    logResult('Recruiter creates evaluation', false, error.response?.data?.error || error.message);
  }
}

async function testInterviewerEvaluationWithoutAssignment() {
  try {
    await axios.post(
      `${BASE_URL}/applications/${applicationId}/evaluations`,
      {
        rating: 7,
        comments: 'Good interview performance',
        recommendation: 'PROCEED',
      },
      {
        headers: { Authorization: `Bearer ${interviewerToken}` },
      }
    );

    logResult('Interviewer evaluates without assignment (should fail)', false, 'Should have failed');
  } catch (error: any) {
    logResult(
      'Interviewer evaluates without assignment (should fail)',
      error.response?.status === 400,
      error.response?.status === 400 ? 'Correctly rejected' : error.response?.data?.error
    );
  }
}

async function testStatusTransitionRules() {
  try {
    // Try to move from APPLIED to OFFERED (should fail - must go through SCREENING/INTERVIEW)
    await axios.post(
      `${BASE_URL}/applications/${applicationId}/status`,
      {
        status: 'OFFERED',
        notes: 'Trying to skip steps',
      },
      {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      }
    );

    logResult('Invalid status transition (should fail)', false, 'Should have failed');
  } catch (error: any) {
    logResult(
      'Invalid status transition (should fail)',
      error.response?.status === 400,
      error.response?.status === 400 ? 'Correctly rejected' : error.response?.data?.error
    );
  }
}

async function testValidStatusTransition() {
  try {
    // Move from APPLIED to SCREENING (valid)
    const response = await axios.post(
      `${BASE_URL}/applications/${applicationId}/status`,
      {
        status: 'SCREENING',
        notes: 'Moving to screening phase',
      },
      {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      }
    );

    logResult(
      'Valid status transition (APPLIED → SCREENING)',
      response.status === 200 && response.data.status === 'SCREENING'
    );
  } catch (error: any) {
    logResult('Valid status transition (APPLIED → SCREENING)', false, error.response?.data?.error || error.message);
  }
}

async function testBusinessRuleViolation() {
  try {
    // Try to move to OFFERED without sufficient evaluations (should fail)
    await axios.post(
      `${BASE_URL}/applications/${applicationId}/status`,
      {
        status: 'OFFERED',
        notes: 'Trying to offer without proper evaluation',
      },
      {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      }
    );

    logResult('Business rule violation (should fail)', false, 'Should have failed');
  } catch (error: any) {
    logResult(
      'Business rule violation (should fail)',
      error.response?.status === 400,
      error.response?.status === 400 ? 'Correctly rejected' : error.response?.data?.error
    );
  }
}

async function testManagerGetVacancies() {
  try {
    const response = await axios.get(`${BASE_URL}/manager/vacancies?page=1&limit=20`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });

    logResult(
      'Manager gets department vacancies',
      response.status === 200 && Array.isArray(response.data.data)
    );
  } catch (error: any) {
    logResult('Manager gets department vacancies', false, error.response?.data?.error || error.message);
  }
}

async function testManagerGetApplication() {
  try {
    const response = await axios.get(`${BASE_URL}/manager/applications/${applicationId}`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });

    logResult(
      'Manager gets application detail',
      response.status === 200 && response.data.id === applicationId
    );
  } catch (error: any) {
    logResult('Manager gets application detail', false, error.response?.data?.error || error.message);
  }
}

async function testManagerRecommendation() {
  try {
    const response = await axios.post(
      `${BASE_URL}/manager/applications/${applicationId}/recommendation`,
      {
        comment: 'This candidate shows great potential and aligns well with our team culture.',
        suggestedDecision: 'RECOMMEND_HIRE',
        confidential: false,
      },
      {
        headers: { Authorization: `Bearer ${managerToken}` },
      }
    );

    logResult(
      'Manager creates recommendation',
      response.status === 201 && response.data.suggestedDecision === 'RECOMMEND_HIRE'
    );
  } catch (error: any) {
    logResult('Manager creates recommendation', false, error.response?.data?.error || error.message);
  }
}

async function runTests() {
  console.log('🧪 Testing Evaluation & Pipeline Endpoints\n');
  console.log('='.repeat(50));

  await setup();

  console.log('\n📝 RECRUITER TESTS');
  console.log('-'.repeat(50));
  await testRecruiterEvaluation();
  await testValidStatusTransition();

  console.log('\n🎤 INTERVIEWER TESTS');
  console.log('-'.repeat(50));
  await testInterviewerEvaluationWithoutAssignment();

  console.log('\n🔄 STATUS TRANSITION TESTS');
  console.log('-'.repeat(50));
  await testStatusTransitionRules();
  await testBusinessRuleViolation();

  console.log('\n👔 MANAGER TESTS');
  console.log('-'.repeat(50));
  await testManagerGetVacancies();
  await testManagerGetApplication();
  await testManagerRecommendation();

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

  console.log('\n⚠️  Note: Some tests require proper database setup with departments, vacancies, and applications.');
  console.log('    Run the full integration test suite for complete validation.');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((error) => {
  console.error('Test execution failed:', error);
  process.exit(1);
});

