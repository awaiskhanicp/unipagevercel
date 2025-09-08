"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../app/context/authContext';

export default function ConsultantDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else if (user.role !== 'consultant') {
      router.push('/dashboard'); // redirect students to their dashboard
    }
  }, [user]);

  if (!user || user.role !== 'consultant') return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-[#E7F1F2] p-10 rounded-3xl shadow-lg w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-4">Consultant Dashboard</h1>
        <p className="text-lg mb-2">Welcome, <span className="font-semibold text-[var(--brand-color)]">{user.consultant?.first_name} {user.consultant?.last_name}</span>!</p>
        <p className="text-gray-600">This is your consultant dashboard. You can add consultant-specific features here.</p>
      </div>
    </div>
  );
} 