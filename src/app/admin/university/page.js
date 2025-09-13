'use client';

import Layout from '../components/Layout';
import UniversityList from '../pages/University/UniversityList';

const UniversityPage = () => {
  
  return (
    <Layout>
      <title>List of all Universities - University Page</title>
      <meta name="description" content="In this page you can see list of all Universities" />
      <UniversityList />
    </Layout>
  );
};

export default UniversityPage; 