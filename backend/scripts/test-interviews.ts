import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

let recruiterToken = '';
let interviewerToken = '';
let applicantToken = '';
let vacancyId = '';
let applicationId = '';
let interviewId = '';
let interviewerId = '';

const logTest = (name: string, success: boolean, details?: any) => {
  const icon = success ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (details) {
    console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
  }
};

const runTests = async () => {
  console.log('🚀 Starting Interview Scheduling Tests\n');
  console.log('=' .repeat(60));

  try {
    // ============================================
    // SETUP: Login and create test data
    // ============================================
    console.log('\n📋 Setup: Logging in and creating test data...\n');

    // Login as recruiter
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

    // Login as interviewer
    try {
      const interviewerLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'interviewer@example.com',
        password: 'password123',
      });
      interviewerToken = interviewerLogin.data.token;
      interviewerId = interviewerLogin.data.user.id;
      logTest('Interviewer login', true);
    } catch (error: any) {
      logTest('Interviewer login', false, error.response?.data?.error || error.message);
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
      vacancyId = vacancies.data[0]?.id;
      if (!vacancyId) {
        console.log('❌ No vacancies found. Please create a vacancy first.');
        return;
      }
      logTest('Get vacancy', true, { vacancyId });
    } catch (error: any) {
      logTest('Get vacancy', false, error.response?.data?.error || error.message);
      return;
    }

    // Get an application
    try {
      const applications = await axios.get(`${BASE_URL}/applications`, {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      });
      applicationId = applications.data[0]?.id;
      if (!applicationId) {
        console.log('❌ No applications found. Please create an application first.');
        return;
      }
      logTest('Get application', true, { applicationId });
    } catch (error: any) {
      logTest('Get application', false, error.response?.data?.error || error.message);
      return;
    }

    // ============================================
    // TEST 1: Schedule Interview
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('TEST 1: Schedule Interview');
    console.log('='.repeat(60) + '\n');

    try {
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 7); // 7 days from now

      const response = await axios.post(
        `${BASE_URL}/applications/${applicationId}/interviews`,
        {
          title: 'Technical Interview - Round 1',
          description: 'Technical assessment focusing on JavaScript and React',
          round: 1,
          scheduledAt: scheduledAt.toISOString(),
          duration: 60,
          location: 'https://meet.google.com/abc-defg-hij',
          notes: 'Please prepare coding examples',
          interviewerIds: [interviewerId],
        },
        {
          headers: { Authorization: `Bearer ${recruiterToken}` },
        }
      );

      interviewId = response.data.id;
      logTest('Schedule interview', true, {
        interviewId,
        title: response.data.title,
        status: response.data.status,
      });
    } catch (error: any) {
      logTest('Schedule interview', false, error.response?.data?.error || error.message);
    }

    // ============================================
    // TEST 2: Get Interviewer Interviews
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('TEST 2: Get Interviewer Interviews');
    console.log('='.repeat(60) + '\n');

    try {
      const response = await axios.get(`${BASE_URL}/interviewer/interviews`, {
        headers: { Authorization: `Bearer ${interviewerToken}` },
      });

      logTest('Get interviewer interviews', true, {
        count: response.data.length,
      });
    } catch (error: any) {
      logTest('Get interviewer interviews', false, error.response?.data?.error || error.message);
    }

    // ============================================
    // TEST 3: Get Interview Details
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('TEST 3: Get Interview Details (with CV and evaluations)');
    console.log('='.repeat(60) + '\n');

    try {
      const response = await axios.get(`${BASE_URL}/interviewer/interviews/${interviewId}`, {
        headers: { Authorization: `Bearer ${interviewerToken}` },
      });

      logTest('Get interview details', true, {
        title: response.data.title,
        applicant: response.data.application.applicant.email,
        hasCV: !!response.data.application.cv,
      });
    } catch (error: any) {
      logTest('Get interview details', false, error.response?.data?.error || error.message);
    }

    // ============================================
    // TEST 4: Reschedule Interview
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('TEST 4: Reschedule Interview');
    console.log('='.repeat(60) + '\n');

    try {
      const newScheduledAt = new Date();
      newScheduledAt.setDate(newScheduledAt.getDate() + 10); // 10 days from now

      const response = await axios.put(
        `${BASE_URL}/interviews/${interviewId}/reschedule`,
        {
          scheduledAt: newScheduledAt.toISOString(),
          duration: 90,
          reason: 'Interviewer requested different time',
        },
        {
          headers: { Authorization: `Bearer ${recruiterToken}` },
        }
      );

      logTest('Reschedule interview', true, {
        status: response.data.status,
        newScheduledAt: response.data.scheduledAt,
      });
    } catch (error: any) {
      logTest('Reschedule interview', false, error.response?.data?.error || error.message);
    }

    // ============================================
    // TEST 5: Assign Additional Interviewers
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('TEST 5: Assign Additional Interviewers');
    console.log('='.repeat(60) + '\n');

    try {
      const response = await axios.post(
        `${BASE_URL}/interviews/${interviewId}/assign-interviewers`,
        {
          interviewerIds: [interviewerId], // Keep same interviewer for now
        },
        {
          headers: { Authorization: `Bearer ${recruiterToken}` },
        }
      );

      logTest('Assign interviewers', true, {
        interviewerCount: response.data.interviewers.length,
      });
    } catch (error: any) {
      logTest('Assign interviewers', false, error.response?.data?.error || error.message);
    }

    // ============================================
    // TEST 6: Complete Interview
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('TEST 6: Complete Interview');
    console.log('='.repeat(60) + '\n');

    try {
      const response = await axios.post(
        `${BASE_URL}/interviewer/interviews/${interviewId}/complete`,
        {
          feedback: 'Strong technical skills, excellent communication. Recommended for next round.',
          rating: 8,
          recommendation: 'PROCEED',
          attended: true,
        },
        {
          headers: { Authorization: `Bearer ${interviewerToken}` },
        }
      );

      logTest('Complete interview', true, {
        rating: response.data.rating,
        recommendation: response.data.recommendation,
      });
    } catch (error: any) {
      logTest('Complete interview', false, error.response?.data?.error || error.message);
    }

    // ============================================
    // TEST 7: Cancel Interview (create new one first)
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('TEST 7: Cancel Interview');
    console.log('='.repeat(60) + '\n');

    let cancelInterviewId = '';

    try {
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 14);

      const createResponse = await axios.post(
        `${BASE_URL}/applications/${applicationId}/interviews`,
        {
          title: 'Technical Interview - Round 2',
          round: 2,
          scheduledAt: scheduledAt.toISOString(),
          duration: 60,
          interviewerIds: [interviewerId],
        },
        {
          headers: { Authorization: `Bearer ${recruiterToken}` },
        }
      );

      cancelInterviewId = createResponse.data.id;

      const cancelResponse = await axios.post(
        `${BASE_URL}/interviews/${cancelInterviewId}/cancel`,
        {
          reason: 'Candidate withdrew application',
        },
        {
          headers: { Authorization: `Bearer ${recruiterToken}` },
        }
      );

      logTest('Cancel interview', true, {
        status: cancelResponse.data.status,
        reason: cancelResponse.data.cancelReason,
      });
    } catch (error: any) {
      logTest('Cancel interview', false, error.response?.data?.error || error.message);
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('✅ All Interview Scheduling Tests Completed!');
    console.log('='.repeat(60) + '\n');
  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message);
  }
};

runTests();


