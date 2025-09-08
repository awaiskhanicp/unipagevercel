'use client';
import CvGenerator from '../../components/organisms/CvGenerator';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function ResumeContent() {
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();
  const std = searchParams.get('std');

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or a loading spinner
  }

  return <CvGenerator studentId={std} />;
}

export default function ResumePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResumeContent />
    </Suspense>
  );
}