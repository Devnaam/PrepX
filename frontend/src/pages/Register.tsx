import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { register as registerUser, clearError } from '@/features/auth/authSlice';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import toast from 'react-hot-toast';

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

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

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
    await dispatch(registerUser(registerData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            PrepX
          </h1>
          <p className="text-gray-600">Start Your Learning Journey</p>
        </div>

        {/* Register Card */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Create Account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              label="Username"
              type="text"
              placeholder="Choose a unique username"
              error={errors.username?.message}
              {...register('username')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link to="/login">
            <Button variant="outline" className="w-full">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
