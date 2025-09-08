'use client';

import React, { useState } from 'react';
import Heading from '../atoms/Heading';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';


const ConsultantChnage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.newPassword !== form.confirmPassword) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/internal/auth/users/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          email: session?.user?.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {

        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
   
        alert('password changed')
      } else {

      }
    } catch (err) {
      console.error(err);
 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <Heading level={5} className="text-center mb-6">
        Change Password
      </Heading>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-[#0B6D76]"
            required
            minLength={8}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-[#0B6D76]"
            required
            minLength={8}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-[#0B6D76]"
            required
            minLength={8}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#0B6D76] text-white py-2 px-4 rounded-lg hover:bg-[#095a62] disabled:opacity-70"
        >
          {isLoading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default ConsultantChnage;