import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, AtSign, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { register as registerUser, clearError } from '@/features/auth/authSlice';
import toast from 'react-hot-toast';

// ==================== VALIDATION SCHEMA ====================
const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

// ==================== ANIMATION VARIANTS ====================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// ==================== REGISTER COMPONENT ====================
export const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const password = watch('password');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/learn');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = async (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    try {
      await dispatch(registerUser(registerData)).unwrap();
      toast.success('Account created successfully!');
      navigate('/learn');
    } catch (err: any) {
      toast.error(err?.message || 'Registration failed. Please try again.');
    }
  };

  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: '', color: '' };
    if (pwd.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (pwd.length < 10) return { strength: 2, label: 'Fair', color: 'bg-orange-500' };
    if (pwd.length < 14) return { strength: 3, label: 'Good', color: 'bg-yellow-500' };
    return { strength: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ==================== HEADER SECTION ==================== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-10 pb-6 px-6 sm:pt-14 sm:pb-8"
      >
        <div className="max-w-md mx-auto">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center mb-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 sm:w-9 sm:h-9 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Welcome Text */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-2">
            Create your account
          </h1>
          <p className="text-base sm:text-lg text-gray-600 text-center">
            Join thousands of learners today
          </p>
        </div>
      </motion.div>

      {/* ==================== FORM SECTION ==================== */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 px-6 pb-8"
      >
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
            {/* ==================== FULL NAME INPUT ==================== */}
            <motion.div variants={itemVariants}>
              <label htmlFor="fullName" className="input-label">
                Full name
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  className={`input pl-12 h-12 sm:h-13 text-base ${
                    errors.fullName ? 'input-error' : ''
                  }`}
                  {...register('fullName')}
                  disabled={isLoading}
                />
              </div>
              {errors.fullName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="input-error-text"
                >
                  {errors.fullName.message}
                </motion.p>
              )}
            </motion.div>

            {/* ==================== USERNAME INPUT ==================== */}
            <motion.div variants={itemVariants}>
              <label htmlFor="username" className="input-label">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <AtSign className="w-5 h-5" />
                </div>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="johndoe123"
                  className={`input pl-12 h-12 sm:h-13 text-base ${
                    errors.username ? 'input-error' : ''
                  }`}
                  {...register('username')}
                  disabled={isLoading}
                />
              </div>
              {errors.username && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="input-error-text"
                >
                  {errors.username.message}
                </motion.p>
              )}
            </motion.div>

            {/* ==================== EMAIL INPUT ==================== */}
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="input-label">
                Email address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`input pl-12 h-12 sm:h-13 text-base ${
                    errors.email ? 'input-error' : ''
                  }`}
                  {...register('email')}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="input-error-text"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </motion.div>

            {/* ==================== PASSWORD INPUT ==================== */}
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  className={`input pl-12 pr-12 h-12 sm:h-13 text-base ${
                    errors.password ? 'input-error' : ''
                  }`}
                  {...register('password')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {passwordStrength.label}
                    </span>
                  </div>
                </motion.div>
              )}
              
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="input-error-text"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </motion.div>

            {/* ==================== CONFIRM PASSWORD INPUT ==================== */}
            <motion.div variants={itemVariants}>
              <label htmlFor="confirmPassword" className="input-label">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  className={`input pl-12 pr-12 h-12 sm:h-13 text-base ${
                    errors.confirmPassword ? 'input-error' : ''
                  }`}
                  {...register('confirmPassword')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="input-error-text"
                >
                  {errors.confirmPassword.message}
                </motion.p>
              )}
            </motion.div>

            {/* ==================== SUBMIT BUTTON ==================== */}
            <motion.div variants={itemVariants} className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 sm:h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? (
                  <div className="spinner w-5 h-5" />
                ) : (
                  <>
                    <span className="text-base">Create account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* ==================== DIVIDER ==================== */}
          <motion.div
            variants={itemVariants}
            className="relative my-6 sm:my-8"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">
                Already have an account?
              </span>
            </div>
          </motion.div>

          {/* ==================== LOGIN LINK ==================== */}
          <motion.div variants={itemVariants}>
            <Link
              to="/login"
              className="w-full h-12 sm:h-13 border-2 border-gray-200 hover:border-gray-300 active:border-gray-400 text-gray-700 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 bg-white"
            >
              <span className="text-base">Sign in instead</span>
            </Link>
          </motion.div>

          {/* ==================== FOOTER TEXT ==================== */}
          <motion.p
            variants={itemVariants}
            className="text-center text-xs sm:text-sm text-gray-500 mt-6 leading-relaxed"
          >
            By creating an account, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Privacy Policy
            </a>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};
