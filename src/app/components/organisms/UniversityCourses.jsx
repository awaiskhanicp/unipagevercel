'use client';

import { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Heading from '../atoms/Heading';
import SimpleCourseCard from '../molecules/SimpleCourseCard';

const UniversityCourses = ({ university }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [qualifications, setQualifications] = useState(['All']);
  const [selectedQualification, setSelectedQualification] = useState('All');
  const [allCourses, setAllCourses] = useState([]);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [subjectSearchTerm, setSubjectSearchTerm] = useState('');
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const SUBJECTS_PER_PAGE = 10; // 2 rows with 5 items each
  const COURSES_PER_PAGE = 12; // Show more courses per page

  const toggleSubject = (subjectId) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch courses for this university
        const coursesResponse = await fetch(`/api/frontend/getcourses/${university.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });
        if (!coursesResponse.ok) {
          const data = await coursesResponse.json();

          alert(data.message)
          return;
        }
        const coursesData = await coursesResponse.json();
        const courses = coursesData.data || [];
        
        // Fetch all subjects
        const subjectsResponse = await fetch('/api/frontend/getsubject', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });
        if (!subjectsResponse.ok) {
          throw new Error('Failed to fetch subjects');
        }
        const subjectsData = await subjectsResponse.json();
        const allSubjects = subjectsData.data || [];
        
        // Process courses and group by subject
        const coursesBySubject = {};
        const subjectCounts = {};
        
        courses.forEach(course => {
          if (course.subject_id) {
            const subjectId = course.subject_id;
            if (!coursesBySubject[subjectId]) {
              coursesBySubject[subjectId] = [];
              subjectCounts[subjectId] = 0;
            }
            coursesBySubject[subjectId].push(course);
            subjectCounts[subjectId]++;
          }
        });
        
        // Create subjects array with counts and courses
        const subjectsWithCourses = allSubjects
          .filter(subject => subjectCounts[subject.id])
          .map(subject => ({
            ...subject,
            count: subjectCounts[subject.id] || 0,
            courses: coursesBySubject[subject.id] || []
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        
        // Extract unique qualifications
        const uniqueQuals = [...new Set(
          courses.map(course => course.qualification).filter(Boolean)
        )].sort();
        
        // Initialize expanded state for all subjects
        const initialExpanded = {};
        subjectsWithCourses.forEach(subject => {
          initialExpanded[subject.id] = false;
        });
        
        // Update state
        setAllCourses(courses);
        setSubjects(subjectsWithCourses);
        setQualifications(['All', ...uniqueQuals]);
        setExpandedSubjects(initialExpanded);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (university?.id) {
      fetchData();
    }
  }, [university?.id]);

  const getFilteredSubjects = () => {
    let filtered = [...subjects];
    
    // Filter by qualification
    if (selectedQualification !== 'All') {
      filtered = filtered.map(subject => ({
        ...subject,
        courses: subject.courses.filter(course => 
          course.qualification === selectedQualification
        )
      })).filter(subject => subject.courses.length > 0);
    }
    
    // Filter subjects by subject search term
    if (subjectSearchTerm) {
      const searchLower = subjectSearchTerm.toLowerCase();
      filtered = filtered.filter(subject => 
        subject.name.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  };
  
  const getFilteredCourses = (subject) => {
    let courses = [...(subject?.courses || [])];
    
    // Filter by qualification
    if (selectedQualification !== 'All') {
      courses = courses.filter(course => course.qualification === selectedQualification);
    }
    
    // Filter by course search term
    if (courseSearchTerm) {
      const searchLower = courseSearchTerm.toLowerCase();
      courses = courses.filter(course => 
        course.name.toLowerCase().includes(searchLower) ||
        (course.qualification?.title?.toLowerCase().includes(searchLower) ?? false)
      );
    }
    
    return courses;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filteredSubjects = getFilteredSubjects();
  const visibleSubjects = showAllSubjects ? filteredSubjects : filteredSubjects.slice(0, SUBJECTS_PER_PAGE);
  
  // Get all filtered courses
  const getAllFilteredCourses = () => {
    let courses = [];
    
    // If a subject is selected, only get courses from that subject
    const subjectsToShow = selectedSubjectId 
      ? filteredSubjects.filter(s => s.id === selectedSubjectId)
      : filteredSubjects;
    
    subjectsToShow.forEach(subject => {
      courses = [...courses, ...getFilteredCourses(subject)];
    });
    
    return showAllCourses ? courses : courses.slice(0, COURSES_PER_PAGE);
  };
  
  // Toggle subject selection
  const handleSubjectClick = (subjectId) => {
    setSelectedSubjectId(prevId => prevId === subjectId ? null : subjectId);
    setShowAllCourses(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <Heading level="h2" className="text-3xl font-bold">
            {university.name} Courses
          </Heading>
        </div>

        {/* Subjects Section */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="text-xl font-semibold">Filter by Subject</h3>
            <div className="w-full md:w-1/3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={subjectSearchTerm}
                  onChange={(e) => setSubjectSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                />
                {subjectSearchTerm && (
                  <button
                    onClick={() => setSubjectSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedSubjectId(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                !selectedSubjectId 
                  ? 'bg-[#0B6D76] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Subjects
            </button>
            
            {visibleSubjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => handleSubjectClick(subject.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedSubjectId === subject.id
                    ? 'bg-[#0B6D76] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {subject.name} ({subject.count})
              </button>
            ))}
          </div>

          {filteredSubjects.length > SUBJECTS_PER_PAGE && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowAllSubjects(!showAllSubjects)}
                className="px-6 py-2 text-[#0B6D76] hover:underline text-sm font-medium"
              >
                {showAllSubjects ? 'Show Less' : 'Show More Subjects'}
              </button>
            </div>
          )}
        </div>

        {/* Courses Section */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="text-xl font-semibold">
              {selectedSubjectId 
                ? `${subjects.find(s => s.id === selectedSubjectId)?.name} Courses` 
                : selectedQualification === 'All' 
                  ? 'All Courses' 
                  : `${selectedQualification} Courses`}
            </h3>
            <div className="w-full md:w-1/3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={courseSearchTerm}
                  onChange={(e) => setCourseSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                />
                {courseSearchTerm && (
                  <button
                    onClick={() => setCourseSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {selectedQualification !== 'All' && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setSelectedQualification('All')}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <span className="mr-1">✕</span> Clear Filter
              </button>
            </div>
          )}
          
          <div className="space-y-6">
            {getAllFilteredCourses().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getAllFilteredCourses().map(course => {
                  const courseSubject = subjects.find(s => s.id === course.subject_id);
                  return (
                    <SimpleCourseCard 
                      key={course.id}
                      course={{
                        ...course,
                        subject: courseSubject?.name || 'General'
                      }}
                      isSelected={true}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No courses found matching your search.</p>
                {selectedSubjectId && (
                  <button
                    onClick={() => setSelectedSubjectId(null)}
                    className="mt-4 text-[#0B6D76] hover:underline"
                  >
                    Clear subject filter
                  </button>
                )}
              </div>
            )}
            
            {getAllFilteredCourses().length >= COURSES_PER_PAGE && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setShowAllCourses(!showAllCourses)}
                  className="px-6 py-2 bg-[#0B6D76] text-white rounded-lg hover:bg-[#0a5a62] transition-colors"
                >
                  {showAllCourses ? 'Show Less' : 'Load More Courses'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityCourses;
