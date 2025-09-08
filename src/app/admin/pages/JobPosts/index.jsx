import JobList from "./JobList";
import { JobProvider } from "./JobContext";

const JobPosts = () => (
  <JobProvider>
    <JobList />
  </JobProvider>
);

export default JobPosts; 