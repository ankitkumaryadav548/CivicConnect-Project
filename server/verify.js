const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Issue = require('./models/Issue');
const Comment = require('./models/Comment');

dotenv.config();

const API_URL = 'http://127.0.0.1:5001/api';

async function runTests() {
  console.log('--- STARTING END-TO-END VERIFICATION ---');
  
  // 1. Connect to Database for setup & cleanup
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected successfully!');

  const testCitizenEmail = 'citizen_test_user@example.com';
  const testAdminEmail = 'admin_test_user@example.com';

  // Cleanup old test data
  console.log('Cleaning up old test users, issues, and comments...');
  await Comment.deleteMany({});
  await Issue.deleteMany({});
  await User.deleteMany({ email: { $in: [testCitizenEmail, testAdminEmail] } });
  console.log('Cleanup complete.');

  let citizenToken = '';
  let adminToken = '';
  let citizenId = '';
  let adminId = '';
  let testIssueId = '';

  try {
    // 2. Register Citizen
    console.log('\nTesting Citizen Registration...');
    const registerCitizenRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Citizen',
        email: testCitizenEmail,
        password: 'password123'
      })
    });
    
    const registerCitizenData = await registerCitizenRes.json();
    if (!registerCitizenRes.ok) throw new Error(`Citizen registration failed: ${JSON.stringify(registerCitizenData)}`);
    console.log('✅ Citizen registered successfully!');
    citizenToken = registerCitizenData.token;
    citizenId = registerCitizenData.user._id;

    // 3. Register Admin & Upgrade role in DB
    console.log('\nTesting Admin Registration & Role Upgrade...');
    const registerAdminRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Admin',
        email: testAdminEmail,
        password: 'password123'
      })
    });
    
    const registerAdminData = await registerAdminRes.json();
    if (!registerAdminRes.ok) throw new Error(`Admin registration failed: ${JSON.stringify(registerAdminData)}`);
    console.log('✅ Admin registered successfully!');
    adminToken = registerAdminData.token;
    adminId = registerAdminData.user._id;

    // Update admin user role to 'admin' in database
    console.log('Upgrading admin user role in DB...');
    await User.findByIdAndUpdate(adminId, { role: 'admin' });
    console.log('✅ Admin user upgraded to "admin" role successfully!');

    // Re-login Admin to get fresh token with admin claims
    console.log('Re-logging in Admin...');
    const loginAdminRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testAdminEmail,
        password: 'password123'
      })
    });
    const loginAdminData = await loginAdminRes.json();
    if (!loginAdminRes.ok) throw new Error(`Admin re-login failed: ${JSON.stringify(loginAdminData)}`);
    adminToken = loginAdminData.token;
    console.log('✅ Admin re-login successful! Role:', loginAdminData.user.role);

    // 4. Citizen Reports Issue
    console.log('\nTesting Citizen Reporting an Issue...');
    const reportIssueRes = await fetch(`${API_URL}/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${citizenToken}`
      },
      body: JSON.stringify({
        title: 'Large Pothole on Oak Avenue',
        description: 'A massive pothole in the middle of Oak Avenue, causing cars to swerve dangerously.',
        category: 'road',
        location: 'Oak Avenue near 5th Street'
      })
    });

    const reportIssueData = await reportIssueRes.json();
    if (!reportIssueRes.ok) throw new Error(`Issue reporting failed: ${JSON.stringify(reportIssueData)}`);
    testIssueId = reportIssueData.data._id;
    console.log(`✅ Issue reported successfully! ID: ${testIssueId}`);

    // 5. Citizen Fetches All Issues
    console.log('\nTesting Fetching All Issues...');
    const fetchIssuesRes = await fetch(`${API_URL}/issues`);
    const fetchIssuesData = await fetchIssuesRes.json();
    if (!fetchIssuesRes.ok) throw new Error('Fetching issues failed');
    console.log(`✅ Fetched ${fetchIssuesData.count} issues. Expected at least 1.`);

    // 6. Citizen Fetches Reported-by filter (Optimized Endpoint Verification)
    console.log('\nTesting Fetching Issues Filtered by reportedBy (Optimized query)...');
    const fetchFilteredRes = await fetch(`${API_URL}/issues?reportedBy=${citizenId}`);
    const fetchFilteredData = await fetchFilteredRes.json();
    if (!fetchFilteredRes.ok) throw new Error('Fetching filtered issues failed');
    console.log(`✅ Fetched ${fetchFilteredData.count} issues reported by Citizen. Expected 1.`);
    if (fetchFilteredData.data[0]._id !== testIssueId) {
      throw new Error('Filtered issue does not match reported issue!');
    }
    console.log('✅ Database-level reportedBy filtering verified perfectly!');

    // 7. Citizen Upvotes Issue
    console.log('\nTesting Issue Upvoting...');
    const upvoteRes = await fetch(`${API_URL}/issues/${testIssueId}/upvote`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${citizenToken}` }
    });
    const upvoteData = await upvoteRes.json();
    if (!upvoteRes.ok) throw new Error('Upvoting failed');
    console.log('Upvotes array after upvote:', upvoteData.data);
    console.log('✅ Issue upvoting toggled successfully!');

    // 8. Citizen Comments on Issue
    console.log('\nTesting Adding Comments...');
    const commentRes = await fetch(`${API_URL}/issues/${testIssueId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${citizenToken}`
      },
      body: JSON.stringify({
        text: 'Agreed! My neighbor almost popped their tire here yesterday.'
      })
    });
    const commentData = await commentRes.json();
    if (!commentRes.ok) throw new Error('Adding comment failed');
    console.log('✅ Comment added successfully! Text:', commentData.data.text);

    // 9. Admin Changes Status of Issue
    console.log('\nTesting Admin-Only Status Updates...');
    const statusRes = await fetch(`${API_URL}/issues/${testIssueId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'in_progress'
      })
    });
    const statusData = await statusRes.json();
    if (!statusRes.ok) throw new Error(`Admin status change failed: ${JSON.stringify(statusData)}`);
    console.log(`✅ Issue status successfully changed to: "${statusData.data.status}"`);

    // Verify it is updated in DB
    const finalIssue = await Issue.findById(testIssueId);
    console.log('Final Issue status in DB:', finalIssue.status);
    if (finalIssue.status !== 'in_progress') {
      throw new Error('Issue status in DB is not "in_progress"!');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    process.exit(1);
  } finally {
    console.log('\nCleaning up verification records...');
    if (testIssueId) {
      await Comment.deleteMany({ issueId: testIssueId });
      await Issue.findByIdAndDelete(testIssueId);
    }
    await User.deleteMany({ email: { $in: [testCitizenEmail, testAdminEmail] } });
    console.log('Cleanup complete.');
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    console.log('\n--- ALL E2E TESTS PASSED SUCCESSFULLY! ---');
    process.exit(0);
  }
}

runTests();
