'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Heading from '../atoms/Heading';
import Button from '../atoms/Button';
import Paragraph from '../atoms/Paragraph';
import Container from '../atoms/Container';
import UniversityCoursesSection from '../molecules/UniversityCoursesSection';

const UniversitiesPage = () => {
  const [countries, setCountries] = useState([]);
  const [coursesData, setCoursesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch countries data
        const countriesResponse = await fetch('/api/frontend/getcountries', {
          method: "POST",
          cache: 'no-store'
        });
        if (!countriesResponse.ok) {
          throw new Error('Failed to fetch countries');
        }
        const countriesData = await countriesResponse.json();
        
        // Extract countries array from response
        const countries = countriesData.success && countriesData.data ? countriesData.data : [];
        if (!Array.isArray(countries)) {
          console.warn('Countries data is not an array:', countries);
          setCountries([]);
        } else {
          console.log('Countries data:', countriesData, 'Extracted countries:', countries);
        }

        // Fetch universities
        const universitiesResponse = await fetch('/api/frontend/getalluniversities', {
          method: "POST",
          cache: 'no-store'
        });
        if (!universitiesResponse.ok) {
          throw new Error('Failed to fetch universities');
        }
        const universitiesData = await universitiesResponse.json();
        const universities = Array.isArray(universitiesData.data) ? universitiesData.data : [];
        console.log('Universities data:', universitiesData, 'Extracted universities:', universities);
        const universityCountries = new Set(universities.map(u => (u.country || '').toLowerCase().trim()));

        // Filter countries to only those with universities
        if (Array.isArray(countries)) {
          const filteredCountries = countries.filter(c => universityCountries.has((c.country || c.country_name || c.name || '').toLowerCase().trim()));
          console.log('Filtered countries:', filteredCountries);
          setCountries(filteredCountries);
        }

        // Fetch subjects
        const subjectsResponse = await fetch('/api/frontend/getsubject', {
          method: "POST",
          cache: 'no-store'
        });
        if (!subjectsResponse.ok) {
          throw new Error('Failed to fetch subjects');
        }
        const subjectsData = await subjectsResponse.json();
        const subjects = subjectsData.success && subjectsData.data ? subjectsData.data : (Array.isArray(subjectsData) ? subjectsData : []);
        
        if (!Array.isArray(subjects)) {
          console.warn('Subjects data is not an array:', subjects);
          setCoursesData({});
        } else {
          // Fetch courses data
          const coursesResponse = await fetch('/api/frontend/getallcourses', {
          method: "POST",
          cache: 'no-store'
        });
          if (!coursesResponse.ok) {
            throw new Error('Failed to fetch courses');
          }
          const coursesData = await coursesResponse.json();
          const courses = coursesData.success && coursesData.data ? coursesData.data : (Array.isArray(coursesData) ? coursesData : []);
          
          if (!Array.isArray(courses)) {
            console.warn('Courses data is not an array:', courses);
            setCoursesData({});
          } else {
            // Group courses by subject name
            const grouped = {};
            subjects.forEach(subject => {
              grouped[subject.name] = courses.filter(course => course.subject_id === subject.id);
            });
            setCoursesData(grouped);
          }
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error('Error fetching data:', err);
        // Set default values on error
        setCountries([]);
        setCoursesData({});
      }
    };

    fetchData();
  }, []);

  // Helper function to transform courses data if API returns array
  const transformCoursesData = (data) => {
    // If data is already in the correct format (object with categories), return it
    if (!Array.isArray(data)) return data;
    
    // If data is array, transform it to category-based object
    const transformed = {};
    data.forEach(course => {
      if (!transformed[course.category]) {
        transformed[course.category] = [];
      }
      transformed[course.category].push(course.name);
    });
    return transformed;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p>Error loading data: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative md:h-[84vh] sm:h-[100vh] h-[100vh] flex items-center justify-center overflow-hidden pt-[80px]">
        <img
          src="/assets/se.png"
          alt="Hero Background"
          className="absolute top-0 left-0 w-full h-full object-center object-cover z-0"
          loading="eager"
        />
        <div className="absolute inset-0 bg-black opacity-50 z-10" />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[rgba(0,0,0,0.1)] to-[rgba(0,0,0,0.9)]" />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto pb-12">
          <Heading level={1}>
            <div className="text-white pb-[10px] md:pt-[0px] sm:pt-[30px] pt-[30px]">
              Find Top Ranked Universities and Colleges
            </div>
          </Heading>
          <Paragraph>
            <p className="text-white w-[65%] mx-auto leading-relaxed">
              Discover global opportunities and expand your horizons with world-class education
            </p>
          </Paragraph>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
            <Link href="/search">
              <Button size="lg">
                Search Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Country and Courses Section */}
      <Container>
        <section className="complete-page-spaceing banner-bottom-space bottom-session-space">
          {/* {countries.length > 0 && <UniversityCountrySection countries={countries} />} */}
          {Object.keys(coursesData).length > 0 && (
            <UniversityCoursesSection coursesData={coursesData} />
          )}
        </section>
      </Container>
    </div>
  );
};

export default UniversitiesPage;