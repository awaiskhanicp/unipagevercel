"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import NewDashboard from "../../../app/components/molecules/NewDashboard";
import ConSultantDashboard from "../../../app/components/organisms/ConSultantDashboard";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status !== 'authenticated') return null;

  // Render dashboard based on user role
  if (session?.user?.role === 'consultant') {
    return <ConSultantDashboard />;
  }
  // Default: student dashboard
  return <NewDashboard />;
}