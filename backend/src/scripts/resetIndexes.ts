import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model';

dotenv.config();

const resetIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    // Drop all indexes
    await User.collection.dropIndexes();
    console.log('🗑️  Dropped old indexes');

    // Recreate indexes
    await User.syncIndexes();
    console.log('✅ Recreated indexes');

    console.log('✅ Index reset complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetIndexes();
