const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function createAdminUser() {
  console.log('--- CREATING DEMO ADMINISTRATOR ACCOUNT ---');
  
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully!');

    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';

    // 1. Check if user already exists
    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log(`User ${adminEmail} already exists. Upgrading to admin role and resetting password...`);
      admin.role = 'admin';
      admin.password = adminPassword; // Pre-save hook will encrypt this password automatically
      await admin.save();
      console.log('✅ Demo administrator account upgraded successfully!');
    } else {
      console.log(`Creating fresh admin user for ${adminEmail}...`);
      admin = await User.create({
        name: 'Municipal Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      console.log('✅ Demo administrator account created successfully!');
    }

    console.log('\n--- ADMIN LOGIN CREDENTIALS ---');
    console.log(`📧 Email:    ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('--------------------------------\n');

  } catch (error) {
    console.error('❌ Failed to create administrator account:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

createAdminUser();
