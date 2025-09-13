'use client';

import { useEffect, useState } from "react";
import Container from "../atoms/Container";
import Heading from "../atoms/Heading";
import { JobOpportunitiesfirst } from "../molecules/Job-Opportunitiesfirst";
import Swal from "sweetalert2";

function JobOpportunitiesorgan() {

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/frontend/jobs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }

        const data = await response.json();
        setJobs(data.data);
        setLoading(false);

      } catch (error) {
        console.error("Error fetching jobs:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.message,
        })
        setLoading(false);
      }
    };

    fetchJobs();
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Container>
        <div>
          <div className="text-center mb-16 pt-[80px] md:pt-0">
            <Heading level={3}>
              Current <span className="text-teal-600">Openings</span>
            </Heading>
          </div>

          {loading ? (
            <div className="text-center text-gray-500">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="text-center text-gray-500">No jobs found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[60px] mx-auto">
              {jobs.map((job, index) => (
                <JobOpportunitiesfirst
                  key={job.id || index}
                  id={job.id}
                  image={
                    job.image ||
                    "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800"
                  }
                  title={job.title}
                  workType={[
                    job.job_type || "Full Time",
                    job.site_based ? "Onsite" : "Remote",
                  ]}
                  location={
                    [job.city, job.province, job.country]
                      .filter(Boolean)
                      .join(", ")
                  }
                  experience={job.experience}
                  skills={job.skills || []}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

export default JobOpportunitiesorgan;