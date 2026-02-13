// User Types
export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  profilePicture?: {
    url: string;
    publicId: string;
  };
  bio?: string;
  targetExam?: string;
  totalQuestionsAttempted: number;
  totalCorrectAnswers: number;
  currentStreak: number;
  longestStreak: number;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  privacy: {
    profileVisibility: 'EVERYONE' | 'FOLLOWERS' | 'PRIVATE';
    showActivityGraph: boolean;
    showStreak: boolean;
    showQuestionsAttempted: boolean;
    showBadges: boolean;
    showPostedQuestions: boolean;
    showFollowersCount: boolean;
    followApprovalRequired: boolean;
  };
  isVerified: boolean;
  isAdmin: boolean;
  overallAccuracy: number;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Question Types
export interface QuestionOption {
  optionText: string;
  isCorrect: boolean;
}

export interface Question {
  _id: string;
  questionText: string;
  options: QuestionOption[];
  correctOptionIndex?: number;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  examTypes: string[];
  totalAttempts: number;
  correctAttempts: number;
  accuracyPercentage: number;
  createdAt: string;
}

export interface QuestionFeedResponse {
  questions: Question[];
  total: number;
  hasMore: boolean;
  nextSkip: number;
}

export interface SubmitAnswerRequest {
  selectedOptionIndex: number;
  timeTaken: number;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  correctOptionIndex: number;
  explanation: string;
  userStats: {
    totalAttempted: number;
    totalCorrect: number;
    currentStreak: number;
    todayAttempted: number;
  };
  badgeEarned?: Badge;
}

// Stats Types
export interface TodayStats {
  date: string;
  attempted: number;
  correct: number;
  accuracy: number;
  timeSpent: number;
  subjectBreakdown: SubjectStats[];
}

export interface SubjectStats {
  subject: string;
  attempted: number;
  correct: number;
  accuracy: number;
}

export interface WeekStats {
  weekStart: string;
  weekEnd: string;
  totalAttempted: number;
  totalCorrect: number;
  overallAccuracy: number;
  dailyBreakdown: DailyStats[];
  weakestTopics: TopicStats[];
}

export interface DailyStats {
  date: string;
  dayName: string;
  attempted: number;
  correct: number;
  accuracy: number;
}

export interface TopicStats {
  topic: string;
  attempted: number;
  accuracy: number;
}

export interface ActivityData {
  date: string;
  count: number;
  level: number;
}

// Badge Types
export interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  criteria: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message: string;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}


// from here we are adding abotu post andall
// ... existing types ...

// Post Types
export interface Post {
  _id: string;
  author: {
    _id: string;
    username: string;
    fullName: string;
    profilePicture?: string;
  };
  content: string;
  postType: 'TEXT' | 'QUESTION_SHARE' | 'ACHIEVEMENT';
  sharedQuestion?: {
    _id: string;
    questionText: string;
    subject: string;
    topic: string;
    difficulty: string;
  };
  achievement?: {
    type: string;
    milestone: number;
  };
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  content: string;
  postType: 'TEXT' | 'QUESTION_SHARE' | 'ACHIEVEMENT';
  sharedQuestion?: string;
  achievement?: {
    type: string;
    milestone: number;
  };
}

// Follow Types
export interface FollowResponse {
  status: 'PENDING' | 'ACCEPTED';
}

export interface FollowUser {
  _id: string;
  username: string;
  fullName: string;
  profilePicture?: string;
  bio?: string;
}
