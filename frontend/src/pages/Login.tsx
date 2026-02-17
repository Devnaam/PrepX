import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Smartphone, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { login } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

// ==================== VALIDATION SCHEMA ====================
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ==================== LOGIN COMPONENT ====================
export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/learn');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await dispatch(login(data)).unwrap();
      toast.success('Welcome back!');
      
      if (result.user?.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/learn');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[935px] flex items-center justify-center gap-8">
        {/* ==================== LEFT SIDE - APP PREVIEW (Desktop Only) ==================== */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col items-center flex-1"
        >
          <div className="relative">
            {/* Phone Frame */}
            <div className="w-[380px] h-[650px] bg-white rounded-[3rem] border-[14px] border-gray-900 shadow-2xl overflow-hidden relative">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl z-10"></div>
              
              {/* App Preview Content */}
              <div className="h-full bg-white p-4 pt-10 overflow-hidden">
                {/* App Preview - MCQ Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      P
                    </div>
                    <div>
                      <p className="font-semibold text-sm">PrepX Questions</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium mb-3">What is the capital of France?</p>
                  <div className="space-y-2">
                    {['Paris', 'London', 'Berlin', 'Madrid'].map((opt, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border text-sm ${
                          i === 0 ? 'border-green-500 bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Bottom Nav Preview */}
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-around">
                  <div className="w-6 h-6 bg-gray-300 rounded"></div>
                  <div className="w-6 h-6 bg-gray-300 rounded"></div>
                  <div className="w-6 h-6 bg-blue-600 rounded"></div>
                  <div className="w-6 h-6 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ==================== RIGHT SIDE - LOGIN FORM ==================== */}
        <div className="w-full lg:w-[350px] flex flex-col gap-3">
          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white border border-gray-300 px-10 py-8"
          >
            {/* Logo */}
            <h1 className="text-4xl font-semibold text-center mb-8 tracking-tight">
              PrepX
            </h1>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
              {/* Email Input */}
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-2 py-2 text-xs bg-gray-50 border border-gray-300 rounded focus:outline-none focus:border-gray-400 transition-colors"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="w-full px-2 py-2 text-xs bg-gray-50 border border-gray-300 rounded focus:outline-none focus:border-gray-400 transition-colors"
                  {...register('password')}
                  disabled={isLoading}
                />
                {register('password').value && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-900"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                )}
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold py-2 rounded-lg mt-4 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            {/* OR Divider */}
            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-xs font-semibold text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Forgot Password */}
            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-xs text-[#00376b] hover:text-[#00376b]/80"
              >
                Forgot password?
              </Link>
            </div>
          </motion.div>

          {/* Sign Up Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white border border-gray-300 px-10 py-6 text-center"
          >
            <p className="text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#0095f6] font-semibold hover:text-[#1877f2]"
              >
                Sign up
              </Link>
            </p>
          </motion.div>

          {/* Get the app */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-4"
          >
            <p className="text-sm mb-4">Get the app.</p>
            <div className="flex justify-center gap-2">
              <div className="h-10 px-4 bg-black rounded-lg flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <Smartphone className="w-5 h-5 text-white" />
                <div className="text-left">
                  <p className="text-[8px] text-white leading-none">Download on</p>
                  <p className="text-xs text-white font-semibold leading-tight">App Store</p>
                </div>
              </div>
              <div className="h-10 px-4 bg-black rounded-lg flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <Smartphone className="w-5 h-5 text-white" />
                <div className="text-left">
                  <p className="text-[8px] text-white leading-none">GET IT ON</p>
                  <p className="text-xs text-white font-semibold leading-tight">Google Play</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="fixed bottom-0 left-0 right-0 bg-gray-50 py-6"
      >
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600">
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline">Help</a>
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Locations</a>
            <a href="#" className="hover:underline">Language</a>
          </div>
          <p className="text-center text-xs text-gray-500 mt-4">
            © 2026 PrepX by Your Team
          </p>
        </div>
      </motion.footer>
    </div>
  );
};
