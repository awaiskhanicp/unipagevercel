'use client';

import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import PagesList from '../pages/PagesList';
import Notifications from './Notifications';

export default function AdminPagesRouter() {
  const [pathname, setPathname] = useState('');

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  if (pathname === '/admin/notifications') {
    return <Notifications />;
  }

  return (
    <Layout>
      <PagesList />
    </Layout>
  );
}
