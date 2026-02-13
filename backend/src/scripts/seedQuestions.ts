import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from '../models/Question.model';
import User from '../models/User.model';

dotenv.config();

const sampleQuestions = [
  // General Knowledge - Easy
  {
    questionText: 'Who is known as the Father of the Indian Constitution?',
    options: [
      { optionText: 'Mahatma Gandhi', isCorrect: false },
      { optionText: 'Dr. B.R. Ambedkar', isCorrect: true },
      { optionText: 'Jawaharlal Nehru', isCorrect: false },
      { optionText: 'Sardar Patel', isCorrect: false },
    ],
    correctOptionIndex: 1,
    explanation: 'Dr. B.R. Ambedkar is known as the Father of the Indian Constitution. He was the chairman of the drafting committee and played a pivotal role in framing the Constitution of India.',
    subject: 'GENERAL_KNOWLEDGE',
    topic: 'Polity',
    difficulty: 'EASY',
    examTypes: ['SSC_CGL', 'SSC_CHSL', 'STATE_PSC'],
    isApproved: true,
    isActive: true,
  },
  {
    questionText: 'What is the capital of Uttarakhand?',
    options: [
      { optionText: 'Dehradun', isCorrect: false },
      { optionText: 'Gairsain', isCorrect: true },
      { optionText: 'Haridwar', isCorrect: false },
      { optionText: 'Nainital', isCorrect: false },
    ],
    correctOptionIndex: 1,
    explanation: 'Gairsain was declared as the summer capital of Uttarakhand in 2020. Dehradun serves as the winter capital.',
    subject: 'GENERAL_KNOWLEDGE',
    topic: 'Geography',
    difficulty: 'EASY',
    examTypes: ['SSC_CGL', 'RAILWAYS_NTPC', 'STATE_PSC'],
    isApproved: true,
    isActive: true,
  },

  // Mathematics - Easy
  {
    questionText: 'If 20% of a number is 50, what is the number?',
    options: [
      { optionText: '200', isCorrect: false },
      { optionText: '250', isCorrect: true },
      { optionText: '300', isCorrect: false },
      { optionText: '150', isCorrect: false },
    ],
    correctOptionIndex: 1,
    explanation: 'Let the number be x. Then 20% of x = 50, so (20/100) × x = 50. Solving: x = 50 × 100/20 = 250.',
    subject: 'MATHEMATICS',
    topic: 'Arithmetic',
    difficulty: 'EASY',
    examTypes: ['SSC_CGL', 'SSC_CHSL', 'IBPS_PO'],
    isApproved: true,
    isActive: true,
  },
  {
    questionText: 'What is the average of 10, 20, 30, 40, and 50?',
    options: [
      { optionText: '25', isCorrect: false },
      { optionText: '30', isCorrect: true },
      { optionText: '35', isCorrect: false },
      { optionText: '40', isCorrect: false },
    ],
    correctOptionIndex: 1,
    explanation: 'Average = Sum of all numbers / Total count = (10+20+30+40+50)/5 = 150/5 = 30',
    subject: 'MATHEMATICS',
    topic: 'Arithmetic',
    difficulty: 'EASY',
    examTypes: ['SSC_CHSL', 'RAILWAYS_GROUP_D', 'IBPS_PO'],
    isApproved: true,
    isActive: true,
  },

  // English - Easy
  {
    questionText: 'Choose the correctly spelled word:',
    options: [
      { optionText: 'Accomodate', isCorrect: false },
      { optionText: 'Accommodate', isCorrect: true },
      { optionText: 'Acomodate', isCorrect: false },
      { optionText: 'Acommodate', isCorrect: false },
    ],
    correctOptionIndex: 1,
    explanation: 'The correct spelling is "Accommodate" with two C\'s and two M\'s.',
    subject: 'ENGLISH',
    topic: 'Vocabulary',
    difficulty: 'EASY',
    examTypes: ['SSC_CGL', 'SSC_CHSL', 'RAILWAYS_NTPC'],
    isApproved: true,
    isActive: true,
  },

  // General Science - Medium
  {
    questionText: 'Which gas is primarily responsible for the greenhouse effect?',
    options: [
      { optionText: 'Oxygen', isCorrect: false },
      { optionText: 'Carbon Dioxide', isCorrect: true },
      { optionText: 'Nitrogen', isCorrect: false },
      { optionText: 'Hydrogen', isCorrect: false },
    ],
    correctOptionIndex: 1,
    explanation: 'Carbon dioxide (CO2) is the primary greenhouse gas emitted through human activities and is responsible for trapping heat in the Earth\'s atmosphere.',
    subject: 'GENERAL_SCIENCE',
    topic: 'Environment',
    difficulty: 'MEDIUM',
    examTypes: ['SSC_CGL', 'RAILWAYS_NTPC', 'DEFENSE'],
    isApproved: true,
    isActive: true,
  },
  {
    questionText: 'What is the powerhouse of the cell?',
    options: [
      { optionText: 'Nucleus', isCorrect: false },
      { optionText: 'Mitochondria', isCorrect: true },
      { optionText: 'Ribosome', isCorrect: false },
      { optionText: 'Chloroplast', isCorrect: false },
    ],
    correctOptionIndex: 1,
    explanation: 'Mitochondria are known as the powerhouse of the cell because they generate most of the cell\'s supply of ATP (energy).',
    subject: 'GENERAL_SCIENCE',
    topic: 'Biology',
    difficulty: 'MEDIUM',
    examTypes: ['SSC_CGL', 'RAILWAYS_NTPC', 'TEACHING'],
    isApproved: true,
    isActive: true,
  },

  // Reasoning - Medium
  {
    questionText: 'If DELHI is coded as 73541 and CALCUTTA as 82589662, how is CALICUT coded?',
    options: [
      { optionText: '8251896', isCorrect: false },
      { optionText: '8452896', isCorrect: false },
      { optionText: '8251788', isCorrect: false },
      { optionText: '8251092', isCorrect: true },
    ],
    correctOptionIndex: 3,
    explanation: 'Based on the given codes: C=8, A=2, L=5, I=1, C=8, U=0, T=9, the code for CALICUT is 8251092.',
    subject: 'REASONING',
    topic: 'Logical Reasoning',
    difficulty: 'MEDIUM',
    examTypes: ['SSC_CGL', 'SSC_CHSL', 'IBPS_PO'],
    isApproved: true,
    isActive: true,
  },

  // Current Affairs - Easy
  {
    questionText: 'Who is the current President of India (as of 2026)?',
    options: [
      { optionText: 'Ram Nath Kovind', isCorrect: false },
      { optionText: 'Droupadi Murmu', isCorrect: true },
      { optionText: 'Narendra Modi', isCorrect: false },
      { optionText: 'Pranab Mukherjee', isCorrect: false },
    ],
    correctOptionIndex: 1,
    explanation: 'Droupadi Murmu is the 15th and current President of India, taking office on July 25, 2022.',
    subject: 'CURRENT_AFFAIRS',
    topic: 'National',
    difficulty: 'EASY',
    examTypes: ['SSC_CGL', 'SSC_CHSL', 'RAILWAYS_NTPC', 'STATE_PSC'],
    isApproved: true,
    isActive: true,
  },

  // Mathematics - Hard
  {
    questionText: 'A train 120 m long is running at 54 km/h. In how many seconds will it cross a pole?',
    options: [
      { optionText: '6 seconds', isCorrect: false },
      { optionText: '8 seconds', isCorrect: true },
      { optionText: '10 seconds', isCorrect: false },
      { optionText: '12 seconds', isCorrect: false },
    ],
    correctOptionIndex: 1,
    explanation: 'Speed = 54 km/h = 54 × (5/18) = 15 m/s. Time = Distance/Speed = 120/15 = 8 seconds.',
    subject: 'MATHEMATICS',
    topic: 'Arithmetic',
    difficulty: 'HARD',
    examTypes: ['SSC_CGL', 'RAILWAYS_NTPC', 'IBPS_PO'],
    isApproved: true,
    isActive: true,
  },

  // Computer - Easy
  {
    questionText: 'What does CPU stand for?',
    options: [
      { optionText: 'Central Process Unit', isCorrect: false },
      { optionText: 'Central Processing Unit', isCorrect: true },
      { optionText: 'Computer Personal Unit', isCorrect: false },
      { optionText: 'Central Processor Unit', isCorrect: false },
    ],
    correctOptionIndex: 1,
    explanation: 'CPU stands for Central Processing Unit, which is the primary component of a computer that performs most of the processing.',
    subject: 'COMPUTER',
    topic: 'Basics',
    difficulty: 'EASY',
    examTypes: ['SSC_CGL', 'SSC_CHSL', 'RAILWAYS_NTPC'],
    isApproved: true,
    isActive: true,
  },
];

const seedQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    // Find an admin user or create one
    let adminUser = await User.findOne({ isAdmin: true });
    
    if (!adminUser) {
      // Use the first user as admin
      adminUser = await User.findOne();
      if (!adminUser) {
        console.error('❌ No users found. Please create a user first.');
        process.exit(1);
      }
    }

    console.log(`📝 Using user: ${adminUser.username} as creator`);

    // Clear existing questions (optional)
    // await Question.deleteMany({});
    // console.log('🗑️  Cleared existing questions');

    // Add createdBy to all questions
    const questionsWithCreator = sampleQuestions.map(q => ({
      ...q,
      createdBy: adminUser!._id,
      isAdminCreated: true,
    }));

    // Insert questions
    const result = await Question.insertMany(questionsWithCreator);
    console.log(`✅ Added ${result.length} sample questions`);

    // Display summary
    const summary = await Question.aggregate([
      { $match: { isApproved: true, isActive: true } },
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 },
        },
      },
    ]);

    console.log('\n📊 Question Summary:');
    summary.forEach(item => {
      console.log(`   ${item._id}: ${item.count} questions`);
    });

    console.log('\n🎉 Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedQuestions();
