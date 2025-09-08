'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Heading from '../../components/atoms/Heading';
import { FcGoogle } from "react-icons/fc";
import {   FaGithub, FaLinkedinIn } from 'react-icons/fa';
import Button from '../../components/atoms/Button';
import { signIn } from 'next-auth/react';
import Swal from 'sweetalert2';

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Enhanced email validation
      if (!form.email || !form.email.trim()) {
        Swal.fire({
          icon: 'error',
          title: '❌ Email Required',
          text: 'Please enter your email address.',
          confirmButtonColor: '#0B6D76'
        });
        setIsSubmitting(false);
        return;
      }

      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        Swal.fire({
          icon: 'error',
          title: '❌ Invalid Email Format',
          text: 'Please enter a valid email address (e.g., user@example.com).',
          confirmButtonColor: '#0B6D76'
        });
        setIsSubmitting(false);
        return;
      }

      // Enhanced password validation
      if (!form.password || !form.password.trim()) {
        Swal.fire({
          icon: 'error',
          title: '❌ Password Required',
          text: 'Please enter your password.',
          confirmButtonColor: '#0B6D76'
        });
        setIsSubmitting(false);
        return;
      }

      // Check password length
      if (form.password.trim().length < 1) {
        Swal.fire({
          icon: 'error',
          title: '❌ Password Too Short',
          text: 'Password must be at least 1 character long.',
          confirmButtonColor: '#0B6D76'
        });
        setIsSubmitting(false);
        return;
      }

      // Proceed directly with NextAuth login
      console.log('🔍 Proceeding with NextAuth login...');

      const result = await signIn('credentials', {
        redirect: false,
        email: form.email,
        password: form.password,
        callbackUrl: '/'
      });

      if (result?.error) {
        // Enhanced debug logging to see exactly what error we're getting
        console.log('🔍 Login error received:', result.error);
        console.log('🔍 Error type:', typeof result.error);
        console.log('🔍 Error length:', result.error.length);
        console.log('🔍 Raw error string:', JSON.stringify(result.error));
        console.log('🔍 Error includes "USER_NOT_FOUND":', result.error.includes('USER_NOT_FOUND'));
        console.log('🔍 Error includes "WRONG_PASSWORD":', result.error.includes('WRONG_PASSWORD'));
        console.log('🔍 Error includes "SOCIAL_USER":', result.error.includes('SOCIAL_USER'));
        console.log('🔍 Error includes "Database":', result.error.includes('Database'));
        console.log('🔍 Error includes "Configuration":', result.error.includes('Configuration'));
        console.log('🔍 Error includes "System":', result.error.includes('System'));
        console.log('🔍 Error includes "password":', result.error.includes('password'));
        console.log('🔍 Error includes "incorrect":', result.error.includes('incorrect'));
        console.log('🔍 Error includes "wrong":', result.error.includes('wrong'));
        console.log('🔍 Error includes "failed":', result.error.includes('failed'));
        console.log('🔍 Error includes "CallbackRouteError":', result.error.includes('CallbackRouteError'));
        console.log('🔍 Error includes "sign up first":', result.error.includes('sign up first'));
        console.log('🔍 Error includes "not registered":', result.error.includes('not registered'));
        console.log('🔍 Full result object:', result);
        
        // Convert to lowercase for case-insensitive matching
        const errorLower = result.error.toLowerCase();
        
        // Handle specific error cases
        let errorMessage = '';
        let errorTitle = '❌ Login Failed';
        
        // Check for USER_NOT_FOUND FIRST - when email doesn't exist in database
        if (result.error.includes('USER_NOT_FOUND') || 
                 errorLower.includes('user_not_found') ||
                 errorLower.includes('please sign up first') ||
                 errorLower.includes('not registered') ||
                 errorLower.includes('email is not registered') ||
                 errorLower.includes('account not found') ||
                 errorLower.includes('email not found') ||
                 errorLower.includes('user does not exist') ||
                 errorLower.includes('no user found') ||
                 errorLower.includes('sign up first')) {
          errorTitle = '❌ Account Not Found';
          errorMessage = 'This email is not registered. Please sign up first to create an account.';
          
          Swal.fire({
            icon: 'error',
            title: errorTitle,
            text: errorMessage,
            confirmButtonColor: '#0B6D76',
            confirmButtonText: 'Sign Up Now',
            showCancelButton: true,
            cancelButtonText: 'Try Again',
            cancelButtonColor: '#6B7280'
          }).then((result) => {
            if (result.isConfirmed) {
              router.push('/consultant-register');
            }
          });
          return;
        }
        // Check for WRONG_PASSWORD - password errors
        else if (result.error.includes('WRONG_PASSWORD') || 
                 result.error.includes('password') ||
                 errorLower.includes('wrong_password') ||
                 errorLower.includes('password you entered is incorrect') ||
                 errorLower.includes('password is incorrect') ||
                 errorLower.includes('wrong password') ||
                 errorLower.includes('invalid password') ||
                 errorLower.includes('password does not match') ||
                 errorLower.includes('password mismatch') ||
                 errorLower.includes('incorrect password') ||
                 errorLower.includes('password') ||
                 errorLower.includes('incorrect') ||
                 errorLower.includes('wrong') ||
                 (errorLower.includes('error') && errorLower.includes('password'))) {
          errorTitle = '❌ Incorrect Password';
          errorMessage = 'The password you entered is incorrect. Please check your password and try again.';
          
          Swal.fire({
            icon: 'error',
            title: errorTitle,
            text: errorMessage,
            confirmButtonColor: '#0B6D76',
            showCancelButton: true,
            cancelButtonText: 'Try Again',
            cancelButtonColor: '#6B7280'
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                icon: 'info',
                title: 'Password Reset',
                text: 'Please contact support to reset your password, or try logging in with the correct password.',
                confirmButtonColor: '#0B6D76',
                confirmButtonText: 'OK'
              });
            }
          });
          return;
        }
        // Check for specific error types from NextAuth
        else if (result.error.includes('USER_NOT_FOUND:') || result.error.includes('Please sign up first')) {
          errorTitle = '❌ Account Not Found';
          errorMessage = 'This email is not registered. Please sign up first to create an account.';
          
          Swal.fire({
            icon: 'error',
            title: errorTitle,
            text: errorMessage,
            confirmButtonColor: '#0B6D76',
            confirmButtonText: 'Sign Up Now',
            showCancelButton: true,
            cancelButtonText: 'Try Again',
            cancelButtonColor: '#6B7280'
          }).then((result) => {
            if (result.isConfirmed) {
              router.push('/consultant-register');
            }
          });
          return;
        } else if (result.error.includes('WRONG_PASSWORD:') || result.error.includes('password you entered is incorrect')) {
          errorTitle = '❌ Incorrect Password';
          errorMessage = 'The password you entered is incorrect. Please check your password and try again.';
          
          Swal.fire({
            icon: 'error',
            title: errorTitle,
            text: errorMessage,
            confirmButtonColor: '#0B6D76',
            confirmButtonText: 'Forgot Password?',
            showCancelButton: true,
            cancelButtonText: 'Try Again',
            cancelButtonColor: '#6B7280'
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                icon: 'info',
                title: 'Password Reset',
                text: 'Please contact support to reset your password, or try logging in with the correct password.',
                confirmButtonColor: '#0B6D76',
                confirmButtonText: 'OK'
              });
            }
          });
          return;
        } else if (result.error.includes('SOCIAL_USER:') || result.error.includes('social login')) {
          errorTitle = '❌ Social Login Account';
          errorMessage = 'This account was created with social login. Please use the password sent to your email or sign in with your social provider.';
          
          Swal.fire({
            icon: 'error',
            title: errorTitle,
            text: errorMessage,
            confirmButtonColor: '#0B6D76',
            confirmButtonText: 'OK'
          });
          return;
        } else if (result.error.includes('Database connection error') || result.error.includes('Unable to connect')) {
          errorTitle = '❌ Server Error';
          errorMessage = 'Unable to connect to the server. Please try again later.';
          
          Swal.fire({
            icon: 'error',
            title: errorTitle,
            text: errorMessage,
            confirmButtonColor: '#0B6D76',
            confirmButtonText: 'Retry',
            showCancelButton: true,
            cancelButtonText: 'OK',
            cancelButtonColor: '#6B7280'
          }).then((result) => {
            if (result.isConfirmed) {
              handleSubmit(new Event('submit'));
            }
          });
          return;
        } else if (result.error.includes('Email and password are required')) {
          errorTitle = '❌ Missing Information';
          errorMessage = 'Please enter both email and password.';
        } else if (result.error.includes('Invalid email or password') || result.error.includes('Authentication failed')) {
                    errorTitle = '❌ Login Failed';
          errorMessage = 'The email or password you entered is incorrect. Please check your credentials and try again.';
        } else {
          // For any other errors, DEFAULT TO PASSWORD ERROR (most common case)
          console.log('⚠️ Unhandled error type, defaulting to password error:', result.error);
          console.log('⚠️ Raw error for debugging:', JSON.stringify(result.error));
          
          // If we can't identify the specific error, assume it's a password issue
          // since that's the most common login failure
          errorTitle = '❌ Incorrect Password';
          errorMessage = 'The password you entered is incorrect. Please check your password and try again.';
          
          Swal.fire({
            icon: 'error',
            title: errorTitle,
            text: errorMessage,
            confirmButtonColor: '#0B6D76',
            confirmButtonText: 'Forgot Password?',
            showCancelButton: true,
            cancelButtonText: 'Try Again',
            cancelButtonColor: '#6B7280'
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                icon: 'info',
                title: 'Password Reset',
                text: 'Please contact support to reset your password, or try logging in with the correct password.',
                confirmButtonColor: '#0B6D76',
                confirmButtonText: 'OK'
              });
            }
          });
          return;
        }

        Swal.fire({
          icon: 'error',
          title: errorTitle,
          text: errorMessage,
          confirmButtonColor: '#0B6D76',
          confirmButtonText: 'OK'
        });
      } else if (result?.ok || result?.url) {
        // Login successful
        Swal.fire({
          icon: 'success',
          title: '✅ Login successful!',
          text: 'Welcome back! Redirecting you to your dashboard...',
          confirmButtonColor: '#0B6D76',
          timer: 2000,
          showConfirmButton: false
        });
        
        // Redirect after success message
        setTimeout(() => {
          if (result?.url) {
            router.push(result.url);
          } else {
            router.push('/');
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Login error:', err);
      Swal.fire({
        icon: 'error',
        title: '❌ Something went wrong, please try again later',
        text: 'An unexpected error occurred. Please try again.',
        confirmButtonColor: '#0B6D76'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-6xl w-full items-center gap-[80px]">
        {/* Form Section */}
        <div className="w-full">
          <Heading level={3}>
            Login <span className="text-[#0B6D76]">As Consultant</span>
          </Heading>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">

            <div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-4 rounded-full bg-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] text-black"
                placeholder="Email"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-10 py-4 rounded-full bg-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] text-black"
                placeholder="Password"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 cursor-pointer text-gray-600"
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center text-black gap-2">
                <input type="checkbox" />
                <span>Remember Me</span>
              </label>
              <button type="button" className="text-[#0B6D76] underline">
                Forgot Password
              </button>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Logging in...' : 'Submit'}
            </Button>

            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => signIn('google')}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-full py-2 px-4 text-sm"
              >
                <FcGoogle/>
                Google
              </button>
              <button
                type="button"
                onClick={() => signIn('github')}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-full py-2 px-4 text-sm"
              >
                <FaGithub/>
                GitHub
              </button>
              <button
                type="button"
                onClick={() => signIn('linkedin')}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-full py-2 px-4 text-sm"
              >
                <FaLinkedinIn/>
                LinkedIn
              </button>
            </div>

            <p className="text-sm text-center text-black">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/students')}
                className="text-[#0B6D76] underline"
              >
                Register As Student
              </button>
            </p>
          </form>
        </div>

        {/* Image Section */}
                <div className="relative rounded-3xl  shadow-lg hidden md:block">
           <div className="absolute left-[-5%] top-1/2 -translate-y-1/2 h-[80%] w-[30px] bg-[#0B6D76] rounded-bl-3xl rounded-tl-3xl z-10"></div>
           <img
            src="/assets/dsic.png"
            alt="Free Consultation"
            className="w-full h-auto object-cover relative z-0 rounded-3xl"
          />
        </div>
      </div>
    </div>
  );
}