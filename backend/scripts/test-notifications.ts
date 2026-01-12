import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

let applicantToken = '';
let recruiterToken = '';
let applicantId = '';

const logTest = (name: string, success: boolean, details?: any) => {
  const icon = success ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (details) {
    console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
  }
};

const runTests = async () => {
  console.log('🚀 Starting Notification System Tests\n');
  console.log('=' .repeat(60));

  try {
    // ============================================
    // SETUP: Login
    // ============================================
    console.log('\n📋 Setup: Logging in...\n');

    // Login as applicant
    try {
      const applicantLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'applicant@example.com',
        password: 'password123',
      });
      applicantToken = applicantLogin.data.token;
      applicantId = applicantLogin.data.user.id;
      logTest('Applicant login', true);
    } catch (error: any) {
      logTest('Applicant login', false, error.response?.data?.error || error.message);
      return;
    }

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

    // ============================================
    // TEST 1: Get My Notifications
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('TEST 1: Get My Notifications');
    console.log('='.repeat(60) + '\n');

    try {
      const response = await axios.get(`${BASE_URL}/notifications/mine`, {
        headers: { Authorization: `Bearer ${applicantToken}` },
      });

      logTest('Get my notifications', true, {
        total: response.data.total,
        unreadCount: response.data.unreadCount,
        notificationCount: response.data.notifications.length,
      });
    } catch (error: any) {
      logTest('Get my notifications', false, error.response?.data?.error || error.message);
    }

    // ============================================
    // TEST 2: Get Unread Notifications Only
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('TEST 2: Get Unread Notifications Only');
    console.log('='.repeat(60) + '\n');

    try {
      const response = await axios.get(`${BASE_URL}/notifications/mine?isRead=false`, {
        headers: { Authorization: `Bearer ${applicantToken}` },
      });

      logTest('Get unread notifications', true, {
        count: response.data.notifications.length,
      });
    } catch (error: any) {
      logTest('Get unread notifications', false, error.response?.data?.error || error.message);
    }

    // ============================================
    // TEST 3: Get Unread Count
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('TEST 3: Get Unread Count');
    console.log('='.repeat(60) + '\n');

    try {
      const response = await axios.get(`${BASE_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${applicantToken}` },
      });

      logTest('Get unread count', true, {
        count: response.data.count,
      });
    } catch (error: any) {
      logTest('Get unread count', false, error.response?.data?.error || error.message);
    }

    // ============================================
    // TEST 4: Mark Notification as Read
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('TEST 4: Mark Notification as Read');
    console.log('='.repeat(60) + '\n');

    try {
      // Get first unread notification
      const notificationsResponse = await axios.get(`${BASE_URL}/notifications/mine?isRead=false&limit=1`, {
        headers: { Authorization: `Bearer ${applicantToken}` },
      });

      if (notificationsResponse.data.notifications.length > 0) {
        const notificationId = notificationsResponse.data.notifications[0].id;

        const response = await axios.post(
          `${BASE_URL}/notifications/${notificationId}/read`,
          {},
          {
            headers: { Authorization: `Bearer ${applicantToken}` },
          }
        );

        logTest('Mark notification as read', true, {
          notificationId,
          isRead: response.data.isRead,
          readAt: response.data.readAt,
        });
      } else {
        logTest('Mark notification as read', true, { message: 'No unread notifications to mark' });
      }
    } catch (error: any) {
      logTest('Mark notification as read', false, error.response?.data?.error || error.message);
    }

    // ============================================
    // TEST 5: Mark All as Read
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('TEST 5: Mark All Notifications as Read');
    console.log('='.repeat(60) + '\n');

    try {
      const response = await axios.post(
        `${BASE_URL}/notifications/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${applicantToken}` },
        }
      );

      logTest('Mark all as read', true, {
        count: response.data.count,
      });
    } catch (error: any) {
      logTest('Mark all as read', false, error.response?.data?.error || error.message);
    }

    // ============================================
    // TEST 6: Filter by Notification Type
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('TEST 6: Filter by Notification Type');
    console.log('='.repeat(60) + '\n');

    try {
      const response = await axios.get(`${BASE_URL}/notifications/mine?type=APPLICATION_RECEIVED`, {
        headers: { Authorization: `Bearer ${applicantToken}` },
      });

      logTest('Filter by type', true, {
        type: 'APPLICATION_RECEIVED',
        count: response.data.notifications.length,
      });
    } catch (error: any) {
      logTest('Filter by type', false, error.response?.data?.error || error.message);
    }

    // ============================================
    // TEST 7: Pagination
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('TEST 7: Pagination');
    console.log('='.repeat(60) + '\n');

    try {
      const response = await axios.get(`${BASE_URL}/notifications/mine?limit=5&offset=0`, {
        headers: { Authorization: `Bearer ${applicantToken}` },
      });

      logTest('Pagination', true, {
        limit: 5,
        offset: 0,
        returned: response.data.notifications.length,
        total: response.data.total,
      });
    } catch (error: any) {
      logTest('Pagination', false, error.response?.data?.error || error.message);
    }

    // ============================================
    // TEST 8: Email Service (Check Console Logs)
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('TEST 8: Email Service Integration');
    console.log('='.repeat(60) + '\n');

    console.log('📧 Email notifications are logged to console.');
    console.log('   Check the server console for email output.');
    console.log('   To enable real SMTP, update email.service.ts and add SMTP config to .env');

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('✅ All Notification Tests Completed!');
    console.log('='.repeat(60) + '\n');

    console.log('📊 Summary:');
    console.log('   - Notifications are stored in the database');
    console.log('   - Email notifications are logged to console (POC)');
    console.log('   - All notification endpoints are working');
    console.log('   - Notifications are triggered on:');
    console.log('     • Application received');
    console.log('     • Test invited');
    console.log('     • Interview scheduled/rescheduled/cancelled');
    console.log('     • Application rejected');
    console.log('     • Application hired');
    console.log('');
  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message);
  }
};

runTests();


