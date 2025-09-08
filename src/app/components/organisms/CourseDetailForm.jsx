'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../atoms/Button';
import Container from '../atoms/Container';

const ReadOnlyField = ({ label, value }) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <span className="block w-full min-h-[40px] px-3 py-2 rounded-tl-[30px] rounded-tr-[30px] rounded-br-[30px] bg-white border border-gray-300 text-gray-800">
      {value || 'N/A'}
    </span>
  </div>
);

const CourseDetailForm = ({ course }) => {
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      if (!course?.qualification) return;
      
      setLoadingPosts(true);
      setError(null);
      console.log("Fetching related posts for qualification_id:", course.qualification);

      try {
        const response = await fetch(`/api/internal/add_post_level?id=${course.qualification}`);
        const data = await response.json();

        console.log("API Response:", data); // Full API response

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch related posts');
        }

        // Extract qualification name from the response
        if (data.data) {
          // If response has data array
          const posts = Array.isArray(data.data) ? data.data : [data.data];
          setRelatedPosts(posts);
        } else if (data.name) {
          // If response is a single object
          setRelatedPosts([data]);
        } else {
          setRelatedPosts([]);
          setError('No related posts found');
        }
      } catch (err) {
        console.error('Error fetching related posts:', err);
        setError(err.message);
        setRelatedPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchRelatedPosts();
  }, [course?.qualification]);

  if (!course) {
    return (
      <Container>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Link href="/"><Button>Go Back Home</Button></Link>
        </div>
      </Container>
    );
  }

  const formatDuration = () => {
    if (course.duration && course.duration_type) {
      return `${course.duration} ${course.duration_type}`;
    } else if (course.duration) {
      return `${course.duration} months`;
    }
    return 'N/A';
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return `$${parseFloat(amount).toLocaleString()}`;
  };

  const formatScholarship = (scholarship) => {
    if (scholarship === 1 || scholarship === '1' || scholarship === true) {
      return 'Available';
    } else if (scholarship === 0 || scholarship === '0' || scholarship === false) {
      return 'Not Available';
    }
    return 'N/A';
  };

  const getDiscountedConsultationFee = (fee, discount) => {
    if (!fee || !discount) return fee;
    const discountAmount = (fee * discount) / 100;
    return fee - discountAmount;
  };

  const consultationFee = course.country_info?.consultation_fee;
  const consultationDiscount = course.country_info?.consultation_fee_discount || 0;

  console.log(relatedPosts,"related postes")
  // Get qualification name from the first related post or fallback to course.qualification.title
  const qualificationName = relatedPosts[0]?.title || course.qualification?.title || 'N/A';

  return (
    <div className="bg-[#E7F1F2] p-6 md:p-10 rounded-tl-[30px] rounded-tr-[30px] rounded-br-[30px] border-none-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReadOnlyField label="Subject" value={course.subject_info?.name || course.subject?.name} />
        <ReadOnlyField 
          label="Qualification" 
          value={
            loadingPosts ? 'Loading...' : 
            error ? 'Error loading data' :
            qualificationName
          } 
        />
        <ReadOnlyField label="Duration" value={formatDuration()} />
        <ReadOnlyField label="Intakes" value="September / January" />
        <ReadOnlyField label="Languages" value={course.languages || course.language || 'English'} />
        <ReadOnlyField label="Tuition Fee" value={formatCurrency(course.yearly_fee)} />
        <ReadOnlyField label="Consultation Fee" value={formatCurrency(consultationFee)} />
        <ReadOnlyField label="Discount" value={`${consultationDiscount}%`} />
        <ReadOnlyField
          label="Consultation After Discount"
          value={formatCurrency(
            getDiscountedConsultationFee(consultationFee, consultationDiscount)
          )}
        />
        <ReadOnlyField label="Scholarship" value={formatScholarship(course.scholarship)} />
      </div>
    </div>
  );
};

export default CourseDetailForm;