import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// User Schema (inline for seeder)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  targetExam: String,
  bio: String,
  profilePicture: String,
  totalQuestionsAttempted: { type: Number, default: 0 },
  totalCorrectAnswers: { type: Number, default: 0 },
  overallAccuracy: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: Date,
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// Admin credentials
const ADMIN_USER = {
  username: 'admin',
  email: 'admin@prepx.com',
  password: 'Admin@123',
  fullName: 'PrepX Admin',
  isAdmin: true,
  isVerified: true,
  bio: 'PrepX Platform Administrator',
  targetExam: 'ADMIN',
};

async function seedAdmin() {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: ADMIN_USER.email },
        { username: ADMIN_USER.username }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Username:', existingAdmin.username);
      console.log('🔑 isAdmin:', existingAdmin.isAdmin);

      // Update to ensure isAdmin is true
      if (!existingAdmin.isAdmin) {
        existingAdmin.isAdmin = true;
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin');
      }
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_USER.password, salt);

      // Create admin user
      const admin = await User.create({
        ...ADMIN_USER,
        password: hashedPassword,
      });

      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', admin.email);
      console.log('👤 Username:', admin.username);
      console.log('🔑 Password:', ADMIN_USER.password);
    }

    console.log('\n🎉 Admin setup complete!');
    console.log('\n📝 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    ', ADMIN_USER.email);
    console.log('Username: ', ADMIN_USER.username);
    console.log('Password: ', ADMIN_USER.password);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
