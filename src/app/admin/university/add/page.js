'use client';
import Layout from '../../components/Layout';
import AddUniversity from '../../pages/University/AddUniversity';
export default function AddUniversityPage() {
  return (
    <Layout>
      <title>Add New University - University Page</title>
      <meta name="description" content="On this page you can add new universities" />
      <AddUniversity />
    </Layout>
  );
} 