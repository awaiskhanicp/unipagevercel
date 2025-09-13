'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Heading from '../../components/atoms/Heading';
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaLinkedinIn } from 'react-icons/fa';
import Button from '../../components/atoms/Button';
import { signIn } from 'next-auth/react';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

export default function LoginForm() {
  const router = useRouter();
  const pathname = usePathname();

  const [form, setForm] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    setIsSubmitting(true)

    const response  = await fetch("/api/frontend/login/", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(form)
    })

    if(!response.ok) {
      const errorData = await response.json();

      const errorMessages = errorData.message;

      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: errorMessages || 'An error occurred',
      });

      setIsSubmitting(false)
      return;
    }

    const data = await response.json();

    toast.success(data.message);

    if(data.role === "admin"){
      router.push('/admin');
    } else {
      router.push('/student');
    }

  } catch {
    setIsSubmitting(false)
  } finally {
    setIsSubmitting(false);
  }

}
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-6xl w-full items-center gap-[80px]">
        {/* Form Section */}
        <div className="w-full">
          <Heading level={3}>
            Login <span className="text-[#0B6D76]">{pathname.includes('/admin') ? 'As Admin' : 'As Student'}</span>
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
                <FcGoogle /> Google
              </button>
              <button
                type="button"
                onClick={() => signIn('github')}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-full py-2 px-4 text-sm"
              >
                <FaGithub /> GitHub
              </button>
              <button
                type="button"
                onClick={() => signIn('linkedin')}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-full py-2 px-4 text-sm"
              >
                <FaLinkedinIn /> LinkedIn
              </button>
            </div>

            <p className="text-sm text-center text-black">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/student-register')}
                className="text-[#0B6D76] underline"
              >
                {pathname.includes('/admin') ? 'Register As Admin' : 'Register As Student'}
              </button>
            </p>

         
          </form>
        </div>

        {/* Image Section */}
        <div className="relative rounded-3xl shadow-lg hidden md:block">
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