// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'prepx_auth_token',
  USER_DATA: 'prepx_user_data',
  THEME: 'prepx_theme',
} as const;

// Subject Options
export const SUBJECTS = [
  { value: 'GENERAL_KNOWLEDGE', label: 'General Knowledge' },
  { value: 'GENERAL_SCIENCE', label: 'General Science' },
  { value: 'MATHEMATICS', label: 'Mathematics' },
  { value: 'ENGLISH', label: 'English' },
  { value: 'REASONING', label: 'Reasoning' },
  { value: 'COMPUTER', label: 'Computer' },
  { value: 'CURRENT_AFFAIRS', label: 'Current Affairs' },
] as const;

// Difficulty Levels
export const DIFFICULTY_LEVELS = [
  { value: 'EASY', label: 'Easy', color: 'bg-green-500' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'HARD', label: 'Hard', color: 'bg-red-500' },
] as const;

// Exam Types
export const EXAM_TYPES = [
  { value: 'SSC_CGL', label: 'SSC CGL' },
  { value: 'SSC_CHSL', label: 'SSC CHSL' },
  { value: 'RAILWAYS_NTPC', label: 'Railways NTPC' },
  { value: 'RAILWAYS_GROUP_D', label: 'Railways Group D' },
  { value: 'IBPS_PO', label: 'IBPS PO' },
  { value: 'SBI_CLERK', label: 'SBI Clerk' },
  { value: 'STATE_PSC', label: 'State PSC' },
  { value: 'DEFENSE', label: 'Defense' },
  { value: 'TEACHING', label: 'Teaching' },
  { value: 'OTHER', label: 'Other' },
] as const;

// Topics by Subject
export const TOPICS_BY_SUBJECT: Record<string, string[]> = {
  GENERAL_KNOWLEDGE: [
    'Polity',
    'History',
    'Geography',
    'Economy',
    'Culture',
    'Awards',
    'Books & Authors',
  ],
  GENERAL_SCIENCE: [
    'Physics',
    'Chemistry',
    'Biology',
    'Environment',
    'Space Science',
  ],
  CURRENT_AFFAIRS: [
    'National',
    'International',
    'Sports',
    'Awards',
    'Government Schemes',
  ],
  MATHEMATICS: [
    'Arithmetic',
    'Algebra',
    'Geometry',
    'Trigonometry',
    'Statistics',
  ],
  ENGLISH: [
    'Grammar',
    'Vocabulary',
    'Comprehension',
    'Sentence Correction',
  ],
  REASONING: [
    'Logical Reasoning',
    'Analytical Reasoning',
    'Verbal Reasoning',
    'Non-Verbal Reasoning',
  ],
  COMPUTER: [
    'Basics',
    'MS Office',
    'Internet',
    'Networking',
    'Programming',
  ],
};

// Routes
export const ROUTES = {
  HOME: '/',
  LEARN: '/learn',
  STATS: '/stats',
  PROFILE: '/profile',
  EXPLORE: '/explore',
  LOGIN: '/login',
  REGISTER: '/register',
  USER_PROFILE: '/user/:username',
} as const;
