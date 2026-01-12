import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, error?: string) {
  results.push({ name, passed, error });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (error) {
    console.log(`   Error: ${error}`);
  }
}

async function runTests() {
  console.log('🧪 Starting Test Functionality Tests...\n');

  let recruiterToken = '';
  let applicantToken = '';
  let vacancyId = '';
  let applicationId = '';
  let internalTestId = '';
  let externalTestId = '';
  let questionIds: string[] = [];

  try {
    // ============================================
    // SETUP: Login as recruiter
    // ============================================
    console.log('📋 Setup: Logging in...\n');

    try {
      const recruiterLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'recruiter@example.com',
        password: 'password123',
      });
      recruiterToken = recruiterLogin.data.token;
      logTest('Recruiter login', true);
    } catch (error: any) {
      logTest('Recruiter login', false, error.response?.data?.error || error.message);
      return;
    }

    // Login as applicant
    try {
      const applicantLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'applicant@example.com',
        password: 'password123',
      });
      applicantToken = applicantLogin.data.token;
      logTest('Applicant login', true);
    } catch (error: any) {
      logTest('Applicant login', false, error.response?.data?.error || error.message);
      return;
    }

    // Get a vacancy
    try {
      const vacancies = await axios.get(`${BASE_URL}/vacancies`, {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      });
      vacancyId = vacancies.data.data[0]?.id;
      if (!vacancyId) {
        throw new Error('No vacancies found');
      }
      logTest('Get vacancy', true);
    } catch (error: any) {
      logTest('Get vacancy', false, error.response?.data?.error || error.message);
      return;
    }

    // Get an application
    try {
      const applications = await axios.get(`${BASE_URL}/applications`, {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      });
      applicationId = applications.data.data[0]?.id;
      if (!applicationId) {
        throw new Error('No applications found');
      }
      logTest('Get application', true);
    } catch (error: any) {
      logTest('Get application', false, error.response?.data?.error || error.message);
      return;
    }

    console.log('\n📝 Test Creation Tests...\n');

    // ============================================
    // TEST 1: Create External Link Test
    // ============================================
    try {
      const response = await axios.post(
        `${BASE_URL}/vacancies/${vacancyId}/test`,
        {
          type: 'EXTERNAL_LINK',
          title: 'HackerRank Coding Challenge',
          description: 'Complete the coding challenge',
          instructions: 'You have 2 hours',
          externalUrl: 'https://www.hackerrank.com/test/abc123',
          duration: 120,
          passingScore: 70,
        },
        {
          headers: { Authorization: `Bearer ${recruiterToken}` },
        }
      );
      externalTestId = response.data.id;
      logTest('Create external link test', response.status === 201);
    } catch (error: any) {
      logTest('Create external link test', false, error.response?.data?.error || error.message);
    }

    // ============================================
    // TEST 2: Create Internal Quiz Test
    // ============================================
    try {
      const response = await axios.post(
        `${BASE_URL}/vacancies/${vacancyId}/test`,
        {
          type: 'INTERNAL_QUIZ',
          title: 'JavaScript Fundamentals Quiz',
          description: 'Test your knowledge',
          instructions: 'Answer all questions',
          duration: 30,
          passingScore: 70,
          questions: [
            {
              type: 'MULTIPLE_CHOICE',
              question: 'What is typeof null?',
              points: 10,
              options: ['null', 'undefined', 'object', 'number'],
              correctAnswer: 'object',
            },
            {
              type: 'TRUE_FALSE',
              question: 'JavaScript is statically typed.',
              points: 5,
              correctAnswer: false,
            },
            {
              type: 'SHORT_ANSWER',
              question: 'Keyword for block-scoped variable?',
              points: 5,
              correctAnswer: 'let',
              acceptableAnswers: ['let', 'const'],
            },
          ],
        },
        {
          headers: { Authorization: `Bearer ${recruiterToken}` },
        }
      );
      internalTestId = response.data.id;
      questionIds = response.data.questions.map((q: any) => q.id);
      logTest('Create internal quiz test', response.status === 201 && questionIds.length === 3);
    } catch (error: any) {
      logTest('Create internal quiz test', false, error.response?.data?.error || error.message);
    }

    // ============================================
    // TEST 3: Get All Tests for Vacancy
    // ============================================
    try {
      const response = await axios.get(`${BASE_URL}/vacancies/${vacancyId}/tests`, {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      });
      logTest('Get all tests for vacancy', response.status === 200 && response.data.length >= 2);
    } catch (error: any) {
      logTest('Get all tests for vacancy', false, error.response?.data?.error || error.message);
    }

    console.log('\n📨 Test Invitation Tests...\n');

    // ============================================
    // TEST 4: Invite Applicant to Internal Quiz
    // ============================================
    try {
      const response = await axios.post(
        `${BASE_URL}/applications/${applicationId}/test-invite`,
        {
          testId: internalTestId,
          message: 'Please complete this test',
        },
        {
          headers: { Authorization: `Bearer ${recruiterToken}` },
        }
      );
      logTest('Invite applicant to test', response.status === 201);
    } catch (error: any) {
      logTest('Invite applicant to test', false, error.response?.data?.error || error.message);
    }

    // ============================================
    // TEST 5: Try to Invite Again (should fail)
    // ============================================
    try {
      await axios.post(
        `${BASE_URL}/applications/${applicationId}/test-invite`,
        {
          testId: internalTestId,
        },
        {
          headers: { Authorization: `Bearer ${recruiterToken}` },
        }
      );
      logTest('Prevent duplicate invitation', false, 'Should have failed');
    } catch (error: any) {
      logTest('Prevent duplicate invitation', error.response?.status === 400);
    }

    console.log('\n👤 Applicant Test Access...\n');

    // ============================================
    // TEST 6: Applicant Gets Test (without answers)
    // ============================================
    try {
      const response = await axios.get(`${BASE_URL}/applications/${applicationId}/test`, {
        headers: { Authorization: `Bearer ${applicantToken}` },
      });
      const hasQuestions = response.data.test.questions && response.data.test.questions.length > 0;
      const noCorrectAnswers = !response.data.test.questions[0].correctAnswer;
      logTest('Applicant gets test without answers', hasQuestions && noCorrectAnswers);
    } catch (error: any) {
      logTest('Applicant gets test without answers', false, error.response?.data?.error || error.message);
    }

    // ============================================
    // TEST 7: Applicant Submits Quiz
    // ============================================
    try {
      const response = await axios.post(
        `${BASE_URL}/applications/${applicationId}/test/submit`,
        {
          answers: [
            { questionId: questionIds[0], answer: 'object' },
            { questionId: questionIds[1], answer: false },
            { questionId: questionIds[2], answer: 'let' },
          ],
        },
        {
          headers: { Authorization: `Bearer ${applicantToken}` },
        }
      );
      const scored = response.data.score !== undefined;
      const passed = response.data.isPassed !== undefined;
      logTest('Applicant submits quiz and gets score', scored && passed);
      console.log(`   Score: ${response.data.score}/${response.data.totalScore} (${response.data.percentage}%)`);
    } catch (error: any) {
      logTest('Applicant submits quiz and gets score', false, error.response?.data?.error || error.message);
    }

    // ============================================
    // TEST 8: Try to Submit Again (should fail)
    // ============================================
    try {
      await axios.post(
        `${BASE_URL}/applications/${applicationId}/test/submit`,
        {
          answers: [],
        },
        {
          headers: { Authorization: `Bearer ${applicantToken}` },
        }
      );
      logTest('Prevent duplicate submission', false, 'Should have failed');
    } catch (error: any) {
      logTest('Prevent duplicate submission', error.response?.status === 400);
    }

    console.log('\n📊 Recruiter Review Tests...\n');

    // ============================================
    // TEST 9: Recruiter Gets Test Attempt
    // ============================================
    try {
      const response = await axios.get(`${BASE_URL}/applications/${applicationId}/test-attempt`, {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      });
      const hasScore = response.data.score !== undefined;
      const hasAnswers = response.data.answers !== undefined;
      logTest('Recruiter gets test attempt with results', hasScore && hasAnswers);
    } catch (error: any) {
      logTest('Recruiter gets test attempt with results', false, error.response?.data?.error || error.message);
    }

    console.log('\n🔗 External Link Test Flow...\n');

    // Create new application for external test
    let externalApplicationId = '';
    try {
      const apps = await axios.get(`${BASE_URL}/applications?page=2`, {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      });
      externalApplicationId = apps.data.data[0]?.id || applicationId;
    } catch (error) {
      externalApplicationId = applicationId;
    }

    // ============================================
    // TEST 10: Invite to External Test
    // ============================================
    if (externalTestId && externalApplicationId !== applicationId) {
      try {
        await axios.post(
          `${BASE_URL}/applications/${externalApplicationId}/test-invite`,
          {
            testId: externalTestId,
          },
          {
            headers: { Authorization: `Bearer ${recruiterToken}` },
          }
        );
        logTest('Invite to external test', true);

        // ============================================
        // TEST 11: Mark External Test Complete
        // ============================================
        try {
          const response = await axios.post(
            `${BASE_URL}/applications/${externalApplicationId}/test/mark-complete`,
            {
              notes: 'Completed HackerRank. Score: 85/100',
            },
            {
              headers: { Authorization: `Bearer ${applicantToken}` },
            }
          );
          logTest('Mark external test complete', response.status === 200);
        } catch (error: any) {
          logTest('Mark external test complete', false, error.response?.data?.error || error.message);
        }
      } catch (error: any) {
        logTest('Invite to external test', false, error.response?.data?.error || error.message);
      }
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));

    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    const total = results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\nFailed Tests:');
      results
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.log(`  - ${r.name}: ${r.error}`);
        });
    }

    console.log('\n✨ Test suite completed!\n');
  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run tests
runTests().catch(console.error);


