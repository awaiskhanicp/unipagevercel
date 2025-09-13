"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Container from "../../../../../app/components/atoms/Container";
import Heading from "../../../../../app/components/atoms/Heading";
import Swal from "sweetalert2";
import { BriefcaseIcon, MapPinIcon, SparklesIcon } from "lucide-react";
import { MdChecklist } from "react-icons/md";

const JobDetailPage = () => {
  const params = useParams();
  const id = params?.id;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    start_date: "",
    resume: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const response = await fetch(`/api/frontend/jobs/${id}`);
        if (!response.ok) throw new Error("Failed to fetch job");
        const data = await response.json();

        console.log("Jobs Fetched", data.data)

        setJob(data.data);

      } catch (error) {
        setNotFound(true);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "resume") {
      setForm((prev) => ({ ...prev, resume: files[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanedPhone = form.phone.replace(/[\s()-]/g, "");
    const phoneRegex = /^\+?[1-9]\d{6,15}$/;

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.start_date.trim() ||
      !form.resume
    ) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill all required fields and upload your resume.",
        confirmButtonColor: "#f59e0b",
      });
      return false;
    }

    if (!emailRegex.test(form.email)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#f59e0b",
      });
      return false;
    }

    if (!phoneRegex.test(cleanedPhone)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Phone Number",
        text: "Phone number must be a valid international format like +1234567890.",
        confirmButtonColor: "#f59e0b",
      });
      return false;
    }

    if (form.resume && form.resume.type !== "application/pdf") {
      Swal.fire({
        icon: "warning",
        title: "Invalid File Type",
        text: "Please upload a PDF resume.",
        confirmButtonColor: "#f59e0b",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('phone_number', form.phone.replace(/[\s()-]/g, ""));
    formData.append('start_date', form.start_date);
    formData.append('job_id', id);
    formData.append('resume', form.resume);

    try {
      const res = await fetch("/api/frontend/jobs/job-applies", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit application");
      }

      Swal.fire({
        icon: "success",
        title: "Application Submitted",
        text: "Your job application has been submitted successfully!",
        confirmButtonColor: "#0B6D76",
      });

      setForm({ name: "", email: "", phone: "", start_date: "", resume: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err.message || "Something went wrong. Please try again.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center py-12 text-gray-500 text-lg">
          Loading job details...
        </div>
      </Container>
    );
  }

  if (notFound) {
    return (
      <Container>
        <div className="text-center py-12 text-red-500 text-lg">
          Job not found.
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="grid lg:grid-cols-3 gap-8 py-14">
        {/* Job Details */}
        <div className="lg:col-span-2 bg-white shadow-xl border border-gray-100 rounded-2xl p-8 space-y-6">
          <Heading level={3} className="text-center text-gray-800">
            {job?.title || "Job Detail"}
          </Heading>

          <div className="grid grid-cols-1 gap-4 text-[15px] text-gray-700">
            <div className="flex gap-2 flex-col items-start">
              <div className="flex gap-[10px] items-center">
                <BriefcaseIcon className="w-8 h-8 mt-1 text-green-600" />
                <Heading level={4}>Type:</Heading>
              </div>
              <p className="px-10">
                {job?.job_type} {job?.site_based ? "(Onsite)" : "(Remote)"}
              </p>
            </div>
            <div className="flex flex-col gap-2 items-start">
              <div className=" flex gap-[10px] items-center">
                <MapPinIcon className="w-8 h-8 mt-1 text-green-600" />
                <Heading level={4}>Location:</Heading>
              </div>
              <p className="px-10">
                {[job?.city, job?.province, job?.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
            <div className="flex flex-col gap-2 items-start">
              <div className=" flex gap-[10px] items-center">
                <MdChecklist className="w-8 h-8 mt-1 text-green-600" />
                <Heading level={4}>Experience:</Heading>
              </div>
              <p className="px-10">{job?.experience}</p>
            </div>
            {job?.skills && (
              <div className="flex flex-col gap-2 items-start col-span-full">
                <div className=" flex gap-[10px] items-center">
                  <SparklesIcon className="w-8 h-8 mt-1 text-green-600" />
                  <Heading level={4}>Skills:</Heading>
                </div>
                <p className="px-10">
                  {Array.isArray(job.skills)
                    ? job.skills.join(", ")
                    : job.skills
                        .split(",")
                        .map((s) => s.trim())
                        .join(", ")}
                </p>
              </div>
            )}
          </div>

          {job?.requirements && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-1">
                Requirements
              </h4>
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: job.requirements }}
              />
            </div>
          )}

          {job?.responsibilities && (
            <div>
              <Heading level={4}>Responsibilities</Heading>
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: job.responsibilities }}
              />
            </div>
          )}

          <div>
            <Heading level={4}>Description</Heading>
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: job?.description || "" }}
            />
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-gradient-to-br h-[75vh] from-green-50 to-white border border-gray-200 shadow-md rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-5 text-[var(--brand-color)] text-center">
            Apply Now
          </h3>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                className="block text-sm font-semibold text-gray-700 mb-1"
                htmlFor="name"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label
                className="block text-sm font-semibold text-gray-700 mb-1"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label
                className="block text-sm font-semibold text-gray-700 mb-1"
                htmlFor="phone"
              >
                Phone
              </label>
              <input
                id="phone"
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 (975) 648-1649 or +92 300-1234567"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label
                className="block text-sm font-semibold text-gray-700 mb-1"
                htmlFor="start_date"
              >
                Earliest Start Date
              </label>
              <input
                id="start_date"
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label
                className="block text-sm font-semibold text-gray-700 mb-1"
                htmlFor="resume"
              >
                Upload Resume (PDF)
              </label>
              <input
                id="resume"
                type="file"
                name="resume"
                accept=".pdf"
                ref={fileInputRef}
                onChange={handleChange}
                className="w-full file:px-4 file:py-2 file:border-0 file:rounded-lg file:bg-[var(--brand-color)] file:text-white file:cursor-pointer"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 rounded-lg bg-[var(--brand-color)] text-white font-semibold transition ${submitting ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      </div>
    </Container>
  );
};

export default JobDetailPage;
