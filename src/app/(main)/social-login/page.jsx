'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaGoogle, FaGithub, FaLinkedinIn } from 'react-icons/fa';
import { signIn } from 'next-auth/react';
import { Suspense } from 'react';

const SocialAuthInner = () => {
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState({
    google: false,
    github: false,
    linkedin: false
  });

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('success');
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
    
    if (successParam) {
      setSuccess(decodeURIComponent(successParam));
    }
  }, [searchParams]);

  const handleSocialLogin = async (provider) => {
    setIsLoading(prev => ({ ...prev, [provider]: true }));
    setError('');
    setSuccess('');
    
    try {
      const result = await signIn(provider, { 
        callbackUrl: '/dashboard',
        redirect: true
      });
      
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(`Failed to sign in with ${provider}`);
      console.error(`Sign in error with ${provider}:`, err);
    } finally {
      setIsLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <div className="flex justify-center h-screen items-center">
      <div className="w-full bg-gray-800 bg-opacity-60 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-700 border-opacity-30 p-10 max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-white">Sign in to Your Account</h2>
          <p className="text-sm text-white">Choose your preferred method</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-gray-800 bg-opacity-60 backdrop-blur-lg text-sm text-white">
              OR CONTINUE WITH
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading.google}
            className="w-full flex items-center gap-3 justify-center px-4 py-2 border rounded-lg bg-white shadow hover:bg-gray-100 text-gray-700 disabled:opacity-70"
          >
            <FaGoogle className="text-red-500 text-lg" />
            {isLoading.google ? 'Processing...' : 'Continue with Google'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSocialLogin('github')}
            disabled={isLoading.github}
            className="w-full flex items-center gap-3 justify-center px-4 py-2 border rounded-lg bg-white shadow hover:bg-gray-100 text-gray-700 disabled:opacity-70"
          >
            <FaGithub className="text-gray-800 text-lg" />
            {isLoading.github ? 'Processing...' : 'Continue with GitHub'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSocialLogin('linkedin')}
            disabled={isLoading.linkedin}
            className="w-full flex items-center gap-3 justify-center px-4 py-2 border rounded-lg bg-white shadow hover:bg-gray-100 text-gray-700 disabled:opacity-70"
          >
            <FaLinkedinIn className="text-blue-800 text-lg" />
            {isLoading.linkedin ? 'Processing...' : 'Continue with LinkedIn'}
          </motion.button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> When signing in with social providers, a password will be automatically generated and sent to your email. You can use this password for email login later.
          </p>
        </div>

        <p className="mt-6 text-xs text-center text-gray-500">
          By continuing, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

const SocialAuth = () => (
  <Suspense>
    <SocialAuthInner />
  </Suspense>
);

export default SocialAuth;