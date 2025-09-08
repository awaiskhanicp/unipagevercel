'use client';

import React, { createContext, useState, useContext, useEffect } from "react";

const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/internal/jobs");
      if (!res.ok) {
        throw new Error(`Failed to fetch jobs: ${res.status}`);
      }
      const data = await res.json();
      const jobsWithSkills = data.map(job => ({
        ...job,
        skills: job.skills ? job.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
        active: job.post_status === 1,
      }));
      setJobs(jobsWithSkills);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError(error.message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch jobs if we're on a page that actually needs them
    const pathname = window.location.pathname;
    const jobRelatedPages = ['/jobs', '/apply-online', '/'];
    
    if (jobRelatedPages.some(page => pathname.startsWith(page))) {
      console.log('🔍 JobContext: Loading jobs for page:', pathname);
      fetchJobs();
    } else {
      // Don't fetch jobs on pages that don't need them
      console.log('🔍 JobContext: Skipping jobs load for page:', pathname);
      setLoading(false);
    }
  }, []);

  const addJob = async (jobData) => {
    try {
      const response = await fetch("/api/internal/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...jobData,
          skills: jobData.skills.join(","),
          post_status: jobData.active ? 1 : 0,
          site_based: jobData.site_based ? "true" : "false",
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add job: ${response.status}`);
      }
      
      await fetchJobs();
      return true;
    } catch (error) {
      console.error("Error adding job:", error);
      setError(error.message);
      return false;
    }
  };

  const updateJob = async (id, jobData) => {
    try {
      const response = await fetch(`/api/internal/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...jobData,
          skills: jobData.skills.join(","),
          post_status: jobData.active ? 1 : 0,
          site_based: jobData.site_based ? "true" : "false",
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update job: ${response.status}`);
      }
      
      await fetchJobs();
      return true;
    } catch (error) {
      console.error("Error updating job:", error);
      setError(error.message);
      return false;
    }
  };

  const deleteJob = async (id) => {
    try {
      const response = await fetch(`/api/internal/jobs/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete job: ${response.status}`);
      }
      
      await fetchJobs();
      return true;
    } catch (error) {
      console.error("Error deleting job:", error);
      setError(error.message);
      return false;
    }
  };

  const toggleJobStatus = async (id) => {
    try {
      const job = jobs.find(j => j.id === id);
      if (!job) throw new Error("Job not found");
      
      const response = await fetch(`/api/internal/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_status: job.active ? 0 : 1,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to toggle job status: ${response.status}`);
      }
      
      await fetchJobs();
      return true;
    } catch (error) {
      console.error("Error toggling job status:", error);
      setError(error.message);
      return false;
    }
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        loading,
        error,
        addJob,
        updateJob,
        deleteJob,
        toggleJobStatus,
        fetchJobs,
        clearError: () => setError(null),
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) throw new Error("useJobs must be used within a JobProvider");
  return context;
};














// 'use client';

// import React, { createContext, useState, useContext, useEffect } from "react";

// const JobContext = createContext();

// export const JobProvider = ({ children }) => {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchJobs = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/internal/jobs");
//       const data = await res.json();
//       const jobsWithSkills = data.map(job => ({
//         ...job,
//         skills: job.skills ? job.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
//         active: job.post_status === "active",
//       }));
//       setJobs(jobsWithSkills);
//     } catch (error) {
//       setJobs([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchJobs();
//   }, []);

//   const addJob = async (job) => {
//     try {
//       await fetch("/api/internal/jobs", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ...job, skills: JSON.stringify(job.skills) }),
//       });
//       await fetchJobs();
//     } catch (error) {
//       console.error("Error adding job:", error);
//     }
//   };

//   const deleteJob = async (id) => {
//     try {
//       await fetch(`/api/internal/jobs/${id}, { method: "DELETE" }`);
//       await fetchJobs();
//     } catch (error) {
//       console.error("Error deleting job:", error);
//     }
//   };

//   const toggleJobStatus = async (id) => {
//     try {
//       const job = jobs.find(j => j.id === id);
//       const newStatus = job?.active ? "closed" : "active";
//       await fetch(`/api/internal/jobs/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ post_status: newStatus }),
//       });
//       await fetchJobs();
//     } catch (error) {
//       console.error("Error toggling status:", error);
//     }
//   };

//   return (
//     <JobContext.Provider value={{ jobs, addJob, deleteJob, toggleJobStatus, loading }}>
//       {children}
//     </JobContext.Provider>
//   );
// };

// export const useJobs = () => {
//   const context = useContext(JobContext);
//   if (!context) throw new Error("useJobs must be used within a JobProvider");
//   return context;
// };