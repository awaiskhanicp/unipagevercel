'use client';

import Layout from '../../components/Layout';
import AddJobs from '../../pages/JobPosts/AddJobs';
import { JobProvider } from '../../pages/JobPosts/JobContext';

const AddJobsPage = () => {
  return (
    <Layout>
      <JobProvider>
        <AddJobs />
      </JobProvider>
    </Layout>
  );
};

export default AddJobsPage; 