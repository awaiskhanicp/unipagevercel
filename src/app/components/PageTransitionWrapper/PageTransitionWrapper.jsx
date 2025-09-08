// app/components/PageTransitionWrapper.jsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Loader from '../Loader/Loader';

export default function PageTransitionWrapper({ children }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    // Delay to simulate loading (optional)
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500); // Adjust this delay as needed

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      {loading && <Loader />}
      {children}
    </>
  );
}
