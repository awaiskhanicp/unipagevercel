'use client';

import Layout from '../components/Layout';
import JobList from '../pages/JobPosts/JobList';
import { JobProvider } from '../pages/JobPosts/JobContext';

const JobPostsPage = () => {
  return (
    <Layout>
      <JobProvider>
        <JobList />
      </JobProvider>
    </Layout>
  );
};

export default JobPostsPage; 