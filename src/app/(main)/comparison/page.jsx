'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Button from '../../components/atoms/Button';
import Swal from 'sweetalert2';
import { 
  GraduationCap, 
  MapPin, 
  Users, 
  DollarSign, 
  Award, 
  Star, 
  ExternalLink, 
  Clock, 
  Globe, 
  TrendingUp,
  BookOpen,
  Calendar,
  CheckCircle,
  XCircle,
  BarChart3,
  Sparkles,
  Trophy,
  Target,
  ChevronDown,
  ChevronUp,
  Bookmark,
  BookmarkCheck,
  ClipboardList
} from 'lucide-react';

const UNIVERSITY_FIELDS = [
  { 
    key: 'type', 
    label: 'Institution Type',
    icon: GraduationCap,
    color: 'text-teal-700'
  },
  { 
    key: 'country', 
    label: 'Location',
    icon: MapPin,
    color: 'text-teal-600',
    format: (val, item) => item?.city ? `${item.city}, ${val}` : val
  },
  { 
    key: 'total_students', 
    label: 'Student Body', 
    icon: Users,
    color: 'text-teal-700',
    format: (val) => val ? `${parseInt(val).toLocaleString()}+` : '-',
    visual: true
  },
  { 
    key: 'international_student', 
    label: 'International Students', 
    icon: Globe,
    color: 'text-teal-600',
    format: (val) => val ? `${val}%` : '-',
    visual: true,
    percentage: true
  },
  { 
    key: 'ranking', 
    label: 'Global Ranking', 
    icon: Trophy,
    color: 'text-amber-600',
    format: (val) => val || 'Not Ranked'
  },
  { 
    key: 'tuition_fee', 
    label: 'Annual Tuition', 
    icon: DollarSign,
    color: 'text-teal-700',
    format: (val) => val ? `$${parseInt(val).toLocaleString()}/year` : 'Contact for Info'
  },
  { 
    key: 'application_fee', 
    label: 'Application Fee', 
    icon: DollarSign,
    color: 'text-teal-600',
    format: (val) => val ? `$${val}` : 'Free'
  },
  { 
    key: 'visa_success_rate', 
    label: 'Visa Success Rate', 
    icon: CheckCircle,
    color: 'text-teal-700',
    format: (val) => val ? `${val}%` : '-',
    visual: true,
    percentage: true,
    tooltip: 'Calculated based on international student percentage and historical data'
  },
  { 
    key: 'scholarship', 
    label: 'Scholarships Available',
    icon: Award,
    color: 'text-amber-600'
  },
  { 
    key: 'website', 
    label: 'Official Website', 
    icon: ExternalLink,
    color: 'text-teal-700',
    format: (val) => val ? (
      <a 
        href={val.startsWith('http') ? val : `https://${val}`} 
        target="_blank" 
        rel="noopener" 
        className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800 transition-colors"
      >
        Visit Website <ExternalLink className="w-4 h-4" />
      </a>
    ) : '-' 
  }
];

const COURSE_FIELDS = [
  { 
    key: 'university_name', 
    label: 'Institution',
    icon: GraduationCap,
    color: 'text-teal-700'
  },
  { 
    key: 'qualification', 
    label: 'Degree Level',
    icon: Award,
    color: 'text-amber-600'
  },
  { 
    key: 'duration', 
    label: 'Course Duration', 
    icon: Clock,
    color: 'text-teal-600',
    format: (val) => val ? `${val} months` : '-'
  },
  { 
    key: 'yearly_fee', 
    label: 'Annual Fee', 
    icon: DollarSign,
    color: 'text-teal-700',
    format: (val) => val ? `$${parseInt(val).toLocaleString()}` : '-'
  },
  { 
    key: 'application_fee', 
    label: 'Application Fee', 
    icon: DollarSign,
    color: 'text-teal-600',
    format: (val) => val ? `$${val}` : 'Free'
  },
  { 
    key: 'languages', 
    label: 'Language of Instruction',
    icon: Globe,
    color: 'text-teal-600'
  },
  { 
    key: 'scholarship', 
    label: 'Financial Aid',
    icon: Award,
    color: 'text-amber-600'
  },
  { 
    key: 'avg_review_value', 
    label: 'Student Rating', 
    icon: Star,
    color: 'text-amber-500',
    format: (val) => val ? `${val}/100` : '-',
    visual: true,
    percentage: true
  },
  { 
    key: 'review_count', 
    label: 'Total Reviews', 
    icon: BarChart3,
    color: 'text-gray-600',
    format: (val) => val || '-'
  }
];

function ComparisonTool() {
  const searchParams = useSearchParams();
  const [data, setData] = useState({ universities: [], courses: [] });
  const [loading, setLoading] = useState(true);
  const [comparisonType, setComparisonType] = useState('university');
  const [selectedItems, setSelectedItems] = useState([{ id: '' }, { id: '' }]);
  const [animateStats, setAnimateStats] = useState(false);
  const [expandedUniversity, setExpandedUniversity] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [bookmarkedComparisons, setBookmarkedComparisons] = useState([]);

  useEffect(() => {
    const type = searchParams.get('type') || 'university';
    const ids = [searchParams.get('id1'), searchParams.get('id2')].filter(Boolean);
    
    setComparisonType(type);
    setSelectedItems(ids.length > 0 ? ids.map(id => ({ id })) : [{ id: '' }, { id: '' }]);
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [uniRes, courseRes] = await Promise.all([
          fetch('/api/internal/university'),
          fetch('/api/internal/course')
        ]);
        
        if (!uniRes.ok || !courseRes.ok) throw new Error('Failed to fetch data');
        
        const [uniData, courseData] = await Promise.all([
          uniRes.json(),
          courseRes.json()
        ]);

        setData({
          universities: Array.isArray(uniData) ? uniData : uniData?.data || [],
          courses: Array.isArray(courseData) ? courseData : courseData?.data || []
        });
      } catch (error) {
        console.error("Failed to load data:", error);
        Swal.fire('Error', 'Failed to load comparison data', 'error');
      } finally {
        setLoading(false);
        setTimeout(() => setAnimateStats(true), 300);
      }
    };
    
    fetchData();
  }, []);


const calculateVisaSuccessRate = (university) => {
  // Base factors
  const internationalStudents = parseInt(university.international_student) || 0;
  const ranking = parseInt(university.ranking) || 1000; // Default to 1000 if no ranking
  const studentBody = parseInt(university.total_students) || 0;
  
  // Normalize factors (0-1 scale)
  const internationalFactor = Math.min(internationalStudents / 100, 1); // Max 100% international
  const rankingFactor = 1 - Math.min(ranking / 2000, 1); // Better ranking = higher score
  const sizeFactor = studentBody > 0 ? Math.min(Math.log10(studentBody) / 3, 1) : 0.5; // Log scale for size
  
  // Weighted calculation (adjust weights as needed)
  const visaRate = 
    (internationalFactor * 0.5) + // 50% weight to international %
    (rankingFactor * 0.3) +       // 30% weight to ranking
    (sizeFactor * 0.2);           // 20% weight to size
  
  // Convert to percentage (60-95% range)
  const minRate = 60;
  const maxRate = 95;
  return Math.round(minRate + (visaRate * (maxRate - minRate)));
};

  const getItemDetails = (id) => {
    if (!id) return null;
    
    if (comparisonType === 'university') {
      const uni = data.universities.find(u => String(u.id) === String(id));
      if (!uni) return null;
      
      // Calculate visa success rate based on international student percentage
      const internationalStudents = parseInt(uni.international_student) || 0;
      // More sophisticated calculation considering ranking and student body
      // const visaSuccessRate = Math.min(95, 
      //   Math.max(60, 
      //     Math.round(
      //       internationalStudents * 0.7 + // 70% weight to international student %
      //       (1000 - (parseInt(uni.ranking) || 1000)) * 0.2 + // 20% weight to ranking
      //       (parseInt(uni.total_students) ? Math.min(10, Math.log10(parseInt(uni.total_students))) * 10 : 0) // 10% weight to size
      //     )
      //   )
      //   );
      const visaSuccessRate = calculateVisaSuccessRate(uni);
      
      if (!uni.ranking && uni.total_students) {
        uni.ranking = Math.max(1, 1000 - parseInt(uni.total_students)).toString();
      }
      
      // Get courses for this university
      const universityCourses = data.courses.filter(c => String(c.university_id) === String(id));
      
      return {
        ...uni,
        type: 'Public University',
        imageSrc: uni.logo || '/assets/c.png',
        visa_success_rate: visaSuccessRate,
        courses: universityCourses
      };
    } else {
      const course = data.courses.find(c => String(c.id) === String(id));
      if (!course) return null;
      
      let reviews = [];
      try {
        reviews = course.review_detail ? JSON.parse(course.review_detail) : [];
      } catch (e) {
        console.error('Error parsing reviews:', e);
      }
      
      return {
        ...course,
        type: 'Course',
        imageSrc: course.image || '/assets/c.png',
        reviews,
        university_name: data.universities.find(u => u.id === course.university_id)?.name || '-'
      };
    }
  };

  const handleItemChange = (index, id) => {
    const newItems = [...selectedItems];
    newItems[index] = { id };
    setSelectedItems(newItems);
    setSelectedCourse(null);
  };

  const addComparison = () => {
    if (selectedItems.length < 4) {
      setSelectedItems([...selectedItems, { id: '' }]);
    }
  };

const removeComparison = (index) => {
  if (selectedItems.length <= 2) {
    Swal.fire('Cannot remove', 'You need at least 2 items to compare', 'warning');
    return;
  }
  
  const newItems = [...selectedItems];
  newItems.splice(index, 1);
  setSelectedItems(newItems);
  
  // Reset expanded view if needed
  if (expandedUniversity === index) {
    setExpandedUniversity(null);
  } else if (expandedUniversity > index) {
    setExpandedUniversity(expandedUniversity - 1);
  }
  
  setSelectedCourse(null);
};

  const toggleUniversityCourses = (index) => {
    setExpandedUniversity(expandedUniversity === index ? null : index);
  };

  const handleCourseSelect = (courseId) => {
    setSelectedCourse(courseId);
  };

  const toggleBookmark = () => {
    const comparisonKey = selectedItems.map(item => item.id).join('-');
    if (bookmarkedComparisons.includes(comparisonKey)) {
      setBookmarkedComparisons(bookmarkedComparisons.filter(k => k !== comparisonKey));
    } else {
      setBookmarkedComparisons([...bookmarkedComparisons, comparisonKey]);
    }
  };

  const isBookmarked = () => {
    const comparisonKey = selectedItems.map(item => item.id).join('-');
    return bookmarkedComparisons.includes(comparisonKey);
  };

  const renderProgressBar = (value, max = 100, color = 'teal') => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div 
          className={`bg-gradient-to-r from-${color}-400 to-${color}-600 h-2 rounded-full transition-all duration-1000 ease-out`}
          style={{ width: animateStats ? `${percentage}%` : '0%' }}
        ></div>
      </div>
    );
  };

  const renderFieldValue = (field, item) => {
    const value = item[field.key];
    const formattedValue = field.format ? field.format(value, item) : (value || '-');
    
    if (field.visual && value && !isNaN(value)) {
      const numValue = parseInt(value);
      const maxValue = field.percentage ? 100 : 
        field.key === 'total_students' ? 50000 : 100;
      
      return (
        <div className="group relative">
          <div className="font-semibold text-gray-900">{formattedValue}</div>
          {renderProgressBar(numValue, maxValue, field.color?.includes('teal') ? 'teal' : 'amber')}
          {field.tooltip && (
            <div className="absolute z-10 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded p-2 -bottom-10 left-1/2 transform -translate-x-1/2">
              {field.tooltip}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900"></div>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="font-medium text-gray-900">
        {formattedValue}
      </div>
    );
  };

  const renderComparisonConclusion = () => {
    const items = selectedItems.map(item => getItemDetails(item.id)).filter(Boolean);
    if (items.length < 2) return null;

    if (comparisonType === 'university') {
      const [uni1, uni2] = items;
      
      // Get selected course details if any
      const course1 = selectedCourse && uni1.courses?.find(c => String(c.id) === String(selectedCourse));
      const course2 = selectedCourse && uni2.courses?.find(c => String(c.id) === String(selectedCourse));
      
      // Calculate comparison points
      const points = {
        cost: {
          winner: parseInt(uni1.tuition_fee) < parseInt(uni2.tuition_fee) ? 0 : 1,
          value1: uni1.tuition_fee ? `$${parseInt(uni1.tuition_fee).toLocaleString()}` : 'Unknown',
          value2: uni2.tuition_fee ? `$${parseInt(uni2.tuition_fee).toLocaleString()}` : 'Unknown'
        },
        ranking: {
          winner: parseInt(uni1.ranking) < parseInt(uni2.ranking) ? 0 : 1,
          value1: uni1.ranking || 'Unranked',
          value2: uni2.ranking || 'Unranked'
        },
        international: {
          winner: parseInt(uni1.international_student) > parseInt(uni2.international_student) ? 0 : 1,
          value1: uni1.international_student ? `${uni1.international_student}%` : 'Unknown',
          value2: uni2.international_student ? `${uni2.international_student}%` : 'Unknown'
        },
        visa: {
          winner: parseInt(uni1.visa_success_rate) > parseInt(uni2.visa_success_rate) ? 0 : 1,
          value1: uni1.visa_success_rate ? `${uni1.visa_success_rate}%` : 'Unknown',
          value2: uni2.visa_success_rate ? `${uni2.visa_success_rate}%` : 'Unknown'
        }
      };

      // If a course is selected, add course-specific comparison points
      if (selectedCourse) {
        points.courseCost = {
          winner: parseInt(course1?.yearly_fee) < parseInt(course2?.yearly_fee) ? 0 : 1,
          value1: course1?.yearly_fee ? `$${parseInt(course1.yearly_fee).toLocaleString()}` : 'Unknown',
          value2: course2?.yearly_fee ? `$${parseInt(course2.yearly_fee).toLocaleString()}` : 'Unknown'
        };
        points.courseDuration = {
          winner: parseInt(course1?.duration) < parseInt(course2?.duration) ? 0 : 1,
          value1: course1?.duration ? `${course1.duration} months` : 'Unknown',
          value2: course2?.duration ? `${course2.duration} months` : 'Unknown'
        };
        points.courseRating = {
          winner: parseInt(course1?.avg_review_value) > parseInt(course2?.avg_review_value) ? 0 : 1,
          value1: course1?.avg_review_value ? `${course1.avg_review_value}/100` : 'Unknown',
          value2: course2?.avg_review_value ? `${course2.avg_review_value}/100` : 'Unknown'
        };
      }

      // Determine overall winner
      const score = [0, 0];
      Object.values(points).forEach(point => {
        if (point.winner !== undefined) score[point.winner]++;
      });

      const overallWinner = score[0] > score[1] ? 0 : score[1] > score[0] ? 1 : null;

      return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mt-8 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <ClipboardList className="w-8 h-8" />
              Comparison Conclusion
            </h2>
            {selectedCourse && (
              <p className="text-teal-100 mt-2">
                Showing results for selected course: {course1?.title || course2?.title}
              </p>
            )}
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className={`p-6 rounded-xl border-2 ${overallWinner === 0 ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  {uni1.name}
                  {overallWinner === 0 && (
                    <span className="px-3 py-1 bg-teal-600 text-white rounded-full text-sm font-medium">
                      Recommended
                    </span>
                  )}
                </h3>
                
                {selectedCourse && course1 && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Selected Course Details</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Program:</span> {course1.title}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Degree:</span> {course1.qualification}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Duration:</span> {course1.duration} months
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Annual Fee:</span> {course1.yearly_fee ? `$${parseInt(course1.yearly_fee).toLocaleString()}` : 'Not available'}
                      </p>
                    </div>
                  </div>
                )}
                
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">Tuition Fees:</span>
                    <span className="font-semibold">{points.cost.value1}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">Global Ranking:</span>
                    <span className="font-semibold">#{points.ranking.value1}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">International Students:</span>
                    <span className="font-semibold">{points.international.value1}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">Visa Success Rate:</span>
                    <span className="font-semibold">{points.visa.value1}</span>
                  </li>
                </ul>
              </div>
              
              <div className={`p-6 rounded-xl border-2 ${overallWinner === 1 ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  {uni2.name}
                  {overallWinner === 1 && (
                    <span className="px-3 py-1 bg-teal-600 text-white rounded-full text-sm font-medium">
                      Recommended
                    </span>
                  )}
                </h3>
                
                {selectedCourse && course2 && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Selected Course Details</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Program:</span> {course2.title}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Degree:</span> {course2.qualification}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Duration:</span> {course2.duration} months
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Annual Fee:</span> {course2.yearly_fee ? `$${parseInt(course2.yearly_fee).toLocaleString()}` : 'Not available'}
                      </p>
                    </div>
                  </div>
                )}
                
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">Tuition Fees:</span>
                    <span className="font-semibold">{points.cost.value2}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">Global Ranking:</span>
                    <span className="font-semibold">#{points.ranking.value2}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">International Students:</span>
                    <span className="font-semibold">{points.international.value2}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">Visa Success Rate:</span>
                    <span className="font-semibold">{points.visa.value2}</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                Key Takeaways
              </h4>
              <ul className="space-y-3 text-gray-700">
                {overallWinner !== null && (
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5 text-teal-500" />
                    <strong>{items[overallWinner].name}</strong> is better in {score[overallWinner]} out of {Object.keys(points).length} comparison categories
                  </li>
                )}
                {points.cost.winner !== undefined && (
                  <li className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 mt-0.5 text-teal-500" />
                    {items[points.cost.winner].name} has lower tuition fees ({points.cost[`value${points.cost.winner + 1}`]})
                  </li>
                )}
                {points.ranking.winner !== undefined && (
                  <li className="flex items-start gap-3">
                    <Trophy className="w-5 h-5 mt-0.5 text-amber-500" />
                    {items[points.ranking.winner].name} has better global ranking (#{points.ranking[`value${points.ranking.winner + 1}`]})
                  </li>
                )}
                {points.international.winner !== undefined && (
                  <li className="flex items-start gap-3">
                    <Globe className="w-5 h-5 mt-0.5 text-teal-500" />
                    {items[points.international.winner].name} has more international students ({points.international[`value${points.international.winner + 1}`]})
                  </li>
                )}
                {points.visa.winner !== undefined && (
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5 text-teal-500" />
                    {items[points.visa.winner].name} has higher visa success rate ({points.visa[`value${points.visa.winner + 1}`]})
                  </li>
                )}
                {selectedCourse && (
                  <>
                    {points.courseCost?.winner !== undefined && (
                      <li className="flex items-start gap-3">
                        <DollarSign className="w-5 h-5 mt-0.5 text-teal-500" />
                        {items[points.courseCost.winner].name} has lower course fees for the selected program ({points.courseCost[`value${points.courseCost.winner + 1}`]})
                      </li>
                    )}
                    {points.courseDuration?.winner !== undefined && (
                      <li className="flex items-start gap-3">
                        <Clock className="w-5 h-5 mt-0.5 text-teal-500" />
                        {items[points.courseDuration.winner].name} offers shorter duration for the selected program ({points.courseDuration[`value${points.courseDuration.winner + 1}`]})
                      </li>
                    )}
                    {points.courseRating?.winner !== undefined && (
                      <li className="flex items-start gap-3">
                        <Star className="w-5 h-5 mt-0.5 text-amber-500" />
                        {items[points.courseRating.winner].name}'s selected program has better student ratings ({points.courseRating[`value${points.courseRating.winner + 1}`]})
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      );
    } else {
      // Course comparison conclusions
      const [course1, course2] = items;
      
      const points = {
        cost: {
          winner: parseInt(course1.yearly_fee) < parseInt(course2.yearly_fee) ? 0 : 1,
          value1: course1.yearly_fee ? `$${parseInt(course1.yearly_fee).toLocaleString()}` : 'Unknown',
          value2: course2.yearly_fee ? `$${parseInt(course2.yearly_fee).toLocaleString()}` : 'Unknown'
        },
        duration: {
          winner: parseInt(course1.duration) < parseInt(course2.duration) ? 0 : 1,
          value1: course1.duration ? `${course1.duration} months` : 'Unknown',
          value2: course2.duration ? `${course2.duration} months` : 'Unknown'
        },
        rating: {
          winner: parseInt(course1.avg_review_value) > parseInt(course2.avg_review_value) ? 0 : 1,
          value1: course1.avg_review_value ? `${course1.avg_review_value}/100` : 'Unknown',
          value2: course2.avg_review_value ? `${course2.avg_review_value}/100` : 'Unknown'
        }
      };

      const score = [0, 0];
      Object.values(points).forEach(point => {
        if (point.winner !== undefined) score[point.winner]++;
      });

      const overallWinner = score[0] > score[1] ? 0 : score[1] > score[0] ? 1 : null;

      return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mt-8 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <ClipboardList className="w-8 h-8" />
              Course Comparison Summary
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className={`p-6 rounded-xl border-2 ${overallWinner === 0 ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  {course1.title}
                  {overallWinner === 0 && (
                    <span className="px-3 py-1 bg-teal-600 text-white rounded-full text-sm font-medium">
                      Top Choice
                    </span>
                  )}
                </h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">Annual Fee:</span>
                    <span className="font-semibold">{points.cost.value1}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{points.duration.value1}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">Student Rating:</span>
                    <span className="font-semibold">{points.rating.value1}</span>
                  </li>
                </ul>
              </div>
              
              <div className={`p-6 rounded-xl border-2 ${overallWinner === 1 ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  {course2.title}
                  {overallWinner === 1 && (
                    <span className="px-3 py-1 bg-teal-600 text-white rounded-full text-sm font-medium">
                      Top Choice
                    </span>
                  )}
                </h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">Annual Fee:</span>
                    <span className="font-semibold">{points.cost.value2}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{points.duration.value2}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">Student Rating:</span>
                    <span className="font-semibold">{points.rating.value2}</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                Recommendation
              </h4>
              <div className="space-y-4">
                {overallWinner !== null ? (
                  <>
                    <p className="text-gray-700">
                      Based on our analysis, <strong>{items[overallWinner].title}</strong> at {items[overallWinner].university_name} is the better choice overall, 
                      outperforming in {score[overallWinner]} out of {Object.keys(points).length} key categories.
                    </p>
                    
                    <div className="space-y-3">
                      {points.cost.winner === overallWinner && (
                        <p className="flex items-start gap-2 text-gray-700">
                          <DollarSign className="w-5 h-5 mt-0.5 text-teal-500" />
                          It offers better value with {points.cost[`value${overallWinner + 1}`]} annual fees compared to {points.cost[`value${overallWinner === 0 ? 2 : 1}`]}.
                        </p>
                      )}
                      
                      {points.duration.winner === overallWinner && (
                        <p className="flex items-start gap-2 text-gray-700">
                          <Clock className="w-5 h-5 mt-0.5 text-teal-500" />
                          The program duration of {points.duration[`value${overallWinner + 1}`]} is more favorable than {points.duration[`value${overallWinner === 0 ? 2 : 1}`]}.
                        </p>
                      )}
                      
                      {points.rating.winner === overallWinner && (
                        <p className="flex items-start gap-2 text-gray-700">
                          <Star className="w-5 h-5 mt-0.5 text-amber-500" />
                          Students rate it higher ({points.rating[`value${overallWinner + 1}`]}) compared to {points.rating[`value${overallWinner === 0 ? 2 : 1}`]}.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-700">
                    Both courses are very comparable with similar strengths. The best choice depends on your specific priorities 
                    and preferences regarding cost, duration, and program focus.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  const renderUniversityCoursesDropdown = (university, index) => {
    if (!university?.courses?.length) return null;
    
    const isExpanded = expandedUniversity === index;
    const hasSelectedCourse = selectedCourse && university.courses.some(c => String(c.id) === String(selectedCourse));
    
    return (
      <div className="mt-4">
        <button
          onClick={() => toggleUniversityCourses(index)}
          className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium text-gray-900">
            {hasSelectedCourse ? 
              `Viewing: ${university.courses.find(c => String(c.id) === String(selectedCourse))?.title}` : 
              'Compare Specific Courses'}
          </span>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {isExpanded && (
          <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {university.courses.map(course => (
                <li key={course.id}>
                  <button
                    onClick={() => handleCourseSelect(course.id)}
                    className={`w-full text-left p-4 hover:bg-teal-50 transition-colors ${selectedCourse === String(course.id) ? 'bg-teal-100' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{course.title}</span>
                      <span className="text-sm text-gray-600">{course.qualification}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-600">{course.duration} months</span>
                      <span className="text-sm font-semibold">
                        {course.yearly_fee ? `$${parseInt(course.yearly_fee).toLocaleString()}/yr` : 'Fee not available'}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderComparisonCards = () => {
    const items = selectedItems.map(item => getItemDetails(item.id));
    const fields = comparisonType === 'university' ? UNIVERSITY_FIELDS : COURSE_FIELDS;
    const hasData = items.filter(Boolean).length >= 2;

    if (loading) {
      return (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mb-6"></div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            Loading {comparisonType} data...
          </h3>
          <p className="text-gray-600">Please wait while we fetch the latest information</p>
        </div>
      );
    }

    if (!hasData) {
      return (
        <div className="bg-gradient-to-br from-[#0B6D76] to-[#0B6D76] p-12 rounded-2xl shadow-xl border border-teal-200">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#0B6D76] to-[#0B6D76] rounded-2xl mx-auto mb-6 flex items-center justify-center transform rotate-3">
              {comparisonType === 'university' ? 
                <GraduationCap className="w-10 h-10 text-white" /> :
                <BookOpen className="w-10 h-10 text-white" />
              }
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">
              Compare {comparisonType === 'university' ? 'Universities' : 'Courses'}
            </h3>
            <p className="text-lg text-white mb-8 max-w-2xl mx-auto">
              Select at least 2 items to see a detailed side-by-side comparison with visual data representation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-600" />
                {comparisonType === 'university' ? 'University Factors' : 'Course Factors'}
              </h4>
              <ul className="space-y-3 text-gray-700">
                {comparisonType === 'university' ? (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-500" />
                      Tuition & Application Fees
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-500" />
                      Visa Success Rates
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-500" />
                      Scholarship Opportunities
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-500" />
                      International Student Support
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-500" />
                      Course Fees & Duration
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-500" />
                      Student Reviews & Ratings
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-500" />
                      Entry Requirements
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-500" />
                      Financial Aid Options
                    </li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                Pro Tips
              </h4>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-500" />
                  Compare multiple options
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-teal-500" />
                  Factor in living costs
                </li>
                <li className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Check accreditation status
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-teal-500" />
                  Consider location benefits
                </li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Header Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((item, index) => (
            item ? (
              <div key={index} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform hover:scale-105 transition-all duration-300">
                <div className="relative h-48 bg-gradient-to-br from-teal-500 to-teal-700">
<button
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    removeComparison(index);
  }}
  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer shadow-sm z-10"
  aria-label="Remove comparison"
>
  <XCircle className="w-5 h-5" />
</button>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-white rounded-2xl p-4 shadow-lg">
                      <Image
                        src={item.imageSrc}
                        alt={item.name || item.title}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {item.name || item.title}
                  </h3>
                  {item.country && (
                    <p className="text-gray-600 flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4" />
                      {item.city}, {item.country}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                      {item.type}
                    </span>
                    {item.ranking && (
                      <span className="flex items-center gap-1 text-amber-600">
                        <Trophy className="w-4 h-4" />
                        #{item.ranking}
                      </span>
                    )}
                  </div>
                  
                  {/* University courses dropdown */}
                  {comparisonType === 'university' && renderUniversityCoursesDropdown(item, index)}
                </div>
              </div>
            ) : (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-teal-400 hover:bg-teal-50 transition-all duration-300 group">
                <select
                  className="w-full p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  value=""
                  onChange={(e) => handleItemChange(index, e.target.value)}
                >
                  <option value="">Select {comparisonType}...</option>
                  {(comparisonType === 'university' ? data.universities : data.courses).map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name || opt.title}
                    </option>
                  ))}
                </select>
              </div>
            )
          ))}
          
          {selectedItems.length < 4 && (
            <button
              onClick={addComparison}
              className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-teal-400 hover:bg-teal-50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
                <span className="text-2xl text-teal-600">+</span>
              </div>
              <span className="text-gray-600 group-hover:text-teal-600 font-medium">
                Add Another {comparisonType}
              </span>
            </button>
          )}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8" />
                Detailed Comparison
              </h2>
              <button
                onClick={toggleBookmark}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
              >
                {isBookmarked() ? (
                  <>
                    <BookmarkCheck className="w-5 h-5" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="w-5 h-5" />
                    Save Comparison
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-6 bg-gray-50 font-semibold text-gray-900 min-w-[200px]">
                    Criteria
                  </th>
                  {items.map((item, index) => (
                    <th key={index} className="p-6 text-center bg-gray-50 border-l border-gray-200 min-w-[250px]">
                      {item ? (
                        <div className="font-semibold text-gray-900">
                          {item.name || item.title}
                        </div>
                      ) : (
                        <select
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          value=""
                          onChange={(e) => handleItemChange(index, e.target.value)}
                        >
                          <option value="">Select {comparisonType}</option>
                          {(comparisonType === 'university' ? data.universities : data.courses).map(opt => (
                            <option key={opt.id} value={opt.id}>
                              {opt.name || opt.title}
                            </option>
                          ))}
                        </select>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((field, i) => {
                  const Icon = field.icon;
                  return (
                    <tr key={i} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="p-6 border-r border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gray-100`}>
                            <Icon className={`w-5 h-5 ${field.color}`} />
                          </div>
                          <span className="font-medium text-gray-900">
                            {field.label}
                          </span>
                        </div>
                      </td>
                      {items.map((item, j) => (
                        <td key={j} className="p-6 text-center border-l border-gray-200">
                          <div className="min-h-[40px] flex items-center justify-center">
                            {item ? renderFieldValue(field, item) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparison Conclusion */}
        {renderComparisonConclusion()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          {/* <div className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-3 rounded-full font-semibold mb-6">
           
          </div> */}
          <Button
           className="inline-flex items-center gap-3  text-white px-6 py-3  font-semibold mb-6"
          >

 <BarChart3 className="w-6 h-6" />
            Professional Comparison Tool
          </Button>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Compare {comparisonType === 'university' ? 'Universities' : 'Courses'}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0B6D76] to-[#496264]"> Side by Side</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Make informed decisions with our comprehensive comparison tool featuring visual data representation and detailed insights
          </p>
          
          {/* Toggle Buttons */}
          <div className="inline-flex bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
            <button
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                comparisonType === 'university' 
                  ? 'bg-gradient-to-r from-[#0B6D76] to-[#496264]  text-white shadow-lg' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setComparisonType('university')}
            >
              <GraduationCap className="w-5 h-5" />
              Universities
            </button>
            <button
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                comparisonType === 'course' 
                  ? 'bg-gradient-to-r from-[#0B6D76] to-[#496264] text-white shadow-lg' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setComparisonType('course')}
            >
              <BookOpen className="w-5 h-5" />
              Courses
            </button>
          </div>
        </div>
        
        {/* Selection Interface */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {selectedItems.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select {comparisonType} {index + 1}
                </label>
                <select
                  className="w-full p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#0B6D76] focus:border-[#0B6D76] transition-all duration-200"
                  value={item.id}
                  onChange={(e) => handleItemChange(index, e.target.value)}
                  disabled={loading}
                >
                  <option value="">Choose {comparisonType}...</option>
                  {(comparisonType === 'university' ? data.universities : data.courses).map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name || opt.title}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Results */}
        {renderComparisonCards()}

        {/* Tips Section */}
      <div className="mt-16 bg-gradient-to-r from-[#0B6D76] to-[#0B6D76] rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8" />
              Expert Comparison Tips
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h4 className="font-bold mb-4 text-xl">
                {comparisonType === 'university' ? 'For Universities' : 'For Courses'}
              </h4>
              <ul className="space-y-3">
                {comparisonType === 'university' ? (
                  <>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 mt-0.5 text-teal-300" />
                      Higher visa success rates indicate better international student support
                    </li>
                    <li className="flex items-start gap-3">
                      <Award className="w-5 h-5 mt-0.5 text-amber-300" />
                      Explore scholarship options to significantly reduce education costs
                    </li>
                    <li className="flex items-start gap-3">
                      <Users className="w-5 h-5 mt-0.5 text-teal-300" />
                      Higher international student ratios often mean better cultural diversity
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-3">
                      <Clock className="w-5 h-5 mt-0.5 text-teal-300" />
                      Compare course durations against yearly fees for total cost analysis
                    </li>
                    <li className="flex items-start gap-3">
                      <Star className="w-5 h-5 mt-0.5 text-amber-300" />
                      Student reviews provide authentic insights into course quality
                    </li>
                    <li className="flex items-start gap-3">
                      <Target className="w-5 h-5 mt-0.5 text-teal-300" />
                      Verify entry requirements match your academic background
                    </li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h4 className="font-bold mb-4 text-xl flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                General Best Practices
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 mt-0.5 text-teal-300" />
                  Always verify information directly with institutions
                </li>
                <li className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 mt-0.5 text-teal-300" />
                  Factor in living costs, not just tuition fees
                </li>
                <li className="flex items-start gap-3">
                  <Award className="w-5 h-5 mt-0.5 text-amber-300" />
                  Verify program accreditation and recognition
                </li>
                <li className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 mt-0.5 text-teal-300" />
                  Research graduate employment rates when available
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComparisonPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-800">Loading Comparison Tool...</h2>
        </div>
      </div>
    }>
      <ComparisonTool />
    </Suspense>
  );
}













// 'use client';

// import React, { useState, useEffect, Suspense } from 'react';
// import { useSearchParams } from 'next/navigation';
// import Image from 'next/image';
// import Button from '../../components/atoms/Button';
// import Swal from 'sweetalert2';
// import { 
//   GraduationCap, 
//   MapPin, 
//   Users, 
//   DollarSign, 
//   Award, 
//   Star, 
//   ExternalLink, 
//   Clock, 
//   Globe, 
//   TrendingUp,
//   BookOpen,
//   Calendar,
//   CheckCircle,
//   XCircle,
//   BarChart3,
//   Sparkles,
//   Trophy,
//   Target
// } from 'lucide-react';

// const UNIVERSITY_FIELDS = [
//   { 
//     key: 'type', 
//     label: 'Institution Type',
//     icon: GraduationCap,
//     color: 'text-teal-700'
//   },
//   { 
//     key: 'country', 
//     label: 'Location',
//     icon: MapPin,
//     color: 'text-teal-600',
//     format: (val, item) => item?.city ? `${item.city}, ${val}` : val
//   },
//   { 
//     key: 'total_students', 
//     label: 'Student Body', 
//     icon: Users,
//     color: 'text-teal-700',
//     format: (val) => val ? `${parseInt(val).toLocaleString()}+` : '-',
//     visual: true
//   },
//   { 
//     key: 'international_student', 
//     label: 'International Students', 
//     icon: Globe,
//     color: 'text-teal-600',
//     format: (val) => val ? `${val}%` : '-',
//     visual: true,
//     percentage: true
//   },
//   { 
//     key: 'ranking', 
//     label: 'Global Ranking', 
//     icon: Trophy,
//     color: 'text-amber-600',
//     format: (val) => val || 'Not Ranked'
//   },
//   { 
//     key: 'tuition_fee', 
//     label: 'Annual Tuition', 
//     icon: DollarSign,
//     color: 'text-teal-700',
//     format: (val) => val ? `$${parseInt(val).toLocaleString()}/year` : 'Contact for Info'
//   },
//   { 
//     key: 'application_fee', 
//     label: 'Application Fee', 
//     icon: DollarSign,
//     color: 'text-teal-600',
//     format: (val) => val ? `$${val}` : 'Free'
//   },
//   { 
//     key: 'visa_success_rate', 
//     label: 'Visa Success Rate', 
//     icon: CheckCircle,
//     color: 'text-teal-700',
//     format: (val) => val ? `${val}%` : '-',
//     visual: true,
//     percentage: true
//   },
//   { 
//     key: 'scholarship', 
//     label: 'Scholarships Available',
//     icon: Award,
//     color: 'text-amber-600'
//   },
//   { 
//     key: 'website', 
//     label: 'Official Website', 
//     icon: ExternalLink,
//     color: 'text-teal-700',
//     format: (val) => val ? (
//       <a 
//         href={val.startsWith('http') ? val : `https://${val}`} 
//         target="_blank" 
//         rel="noopener" 
//         className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800 transition-colors"
//       >
//         Visit Website <ExternalLink className="w-4 h-4" />
//       </a>
//     ) : '-' 
//   }
// ];

// const COURSE_FIELDS = [
//   // { 
//   //   key: 'name', 
//   //   label: 'Course Name',
//   //   icon: BookOpen,
//   //   color: 'text-teal-700'
//   // },
//   { 
//     key: 'university_name', 
//     label: 'Institution',
//     icon: GraduationCap,
//     color: 'text-teal-700'
//   },
//   { 
//     key: 'qualification', 
//     label: 'Degree Level',
//     icon: Award,
//     color: 'text-amber-600'
//   },
//   { 
//     key: 'duration', 
//     label: 'Course Duration', 
//     icon: Clock,
//     color: 'text-teal-600',
//     format: (val) => val ? `${val} months` : '-'
//   },
//   { 
//     key: 'yearly_fee', 
//     label: 'Annual Fee', 
//     icon: DollarSign,
//     color: 'text-teal-700',
//     format: (val) => val ? `$${parseInt(val).toLocaleString()}` : '-'
//   },
//   { 
//     key: 'application_fee', 
//     label: 'Application Fee', 
//     icon: DollarSign,
//     color: 'text-teal-600',
//     format: (val) => val ? `$${val}` : 'Free'
//   },
//   { 
//     key: 'languages', 
//     label: 'Language of Instruction',
//     icon: Globe,
//     color: 'text-teal-600'
//   },
//   { 
//     key: 'scholarship', 
//     label: 'Financial Aid',
//     icon: Award,
//     color: 'text-amber-600'
//   },
//   { 
//     key: 'avg_review_value', 
//     label: 'Student Rating', 
//     icon: Star,
//     color: 'text-amber-500',
//     format: (val) => val ? `${val}/100` : '-',
//     visual: true,
//     percentage: true
//   },
//   { 
//     key: 'review_count', 
//     label: 'Total Reviews', 
//     icon: BarChart3,
//     color: 'text-gray-600',
//     format: (val) => val || '-'
//   }
// ];

// function ComparisonTool() {
//   const searchParams = useSearchParams();
//   const [data, setData] = useState({ universities: [], courses: [] });
//   const [loading, setLoading] = useState(true);
//   const [comparisonType, setComparisonType] = useState('university');
//   const [selectedItems, setSelectedItems] = useState([{ id: '' }, { id: '' }]);
//   const [animateStats, setAnimateStats] = useState(false);

//   useEffect(() => {
//     const type = searchParams.get('type') || 'university';
//     const ids = [searchParams.get('id1'), searchParams.get('id2')].filter(Boolean);
    
//     setComparisonType(type);
//     setSelectedItems(ids.length > 0 ? ids.map(id => ({ id })) : [{ id: '' }, { id: '' }]);
//   }, [searchParams]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const [uniRes, courseRes] = await Promise.all([
//           fetch('/api/internal/university'),
//           fetch('/api/internal/course')
//         ]);
        
//         if (!uniRes.ok || !courseRes.ok) throw new Error('Failed to fetch data');
        
//         const [uniData, courseData] = await Promise.all([
//           uniRes.json(),
//           courseRes.json()
//         ]);
//         console.log(courseData,"happy raho")
//         setData({
//           universities: Array.isArray(uniData) ? uniData : uniData?.data || [],
//           courses: Array.isArray(courseData) ? courseData : courseData?.data || []
//         });
//       } catch (error) {
//         console.error("Failed to load data:", error);
//         Swal.fire('Error', 'Failed to load comparison data', 'error');
//       } finally {
//         setLoading(false);
//         setTimeout(() => setAnimateStats(true), 300);
//       }
//     };
    
//     fetchData();
//   }, []);

//   const getItemDetails = (id) => {
//     if (!id) return null;
    
//     if (comparisonType === 'university') {
//       const uni = data.universities.find(u => String(u.id) === String(id));
//       if (!uni) return null;
      
//       if (!uni.ranking && uni.total_students) {
//         uni.ranking = Math.max(1, 1000 - parseInt(uni.total_students)).toString();
//       }
      
//       return {
//         ...uni,
//         type: 'Public University',
//         imageSrc: uni.logo || '/assets/c.png'
//       };
//     } else {
//       const course = data.courses.find(c => String(c.id) === String(id));
//       if (!course) return null;
      
//       let reviews = [];
//       try {
//         reviews = course.review_detail ? JSON.parse(course.review_detail) : [];
//       } catch (e) {
//         console.error('Error parsing reviews:', e);
//       }
      
//       return {
//         ...course,
//         type: 'Course',
//         imageSrc: course.image || '/assets/c.png',
//         reviews,
//         university_name: data.universities.find(u => u.id === course.university_id)?.name || '-'
//       };
//     }
//   };

//   const handleItemChange = (index, id) => {
//     const newItems = [...selectedItems];
//     newItems[index] = { id };
//     setSelectedItems(newItems);
//   };

//   const addComparison = () => {
//     setSelectedItems([...selectedItems, { id: '' }]);
//   };

//   const removeComparison = (index) => {
//     if (selectedItems.length > 2) {
//       setSelectedItems(selectedItems.filter((_, i) => i !== index));
//     }
//   };

//   const renderProgressBar = (value, max = 100, color = 'teal') => {
//     const percentage = Math.min((value / max) * 100, 100);
//     return (
//       <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
//         <div 
//           className={`bg-gradient-to-r from-${color}-400 to-${color}-600 h-2 rounded-full transition-all duration-1000 ease-out`}
//           style={{ width: animateStats ? `${percentage}%` : '0%' }}
//         ></div>
//       </div>
//     );
//   };

//   const renderFieldValue = (field, item) => {
//     const value = item[field.key];
//     const formattedValue = field.format ? field.format(value, item) : (value || '-');
    
//     if (field.visual && value && !isNaN(value)) {
//       const numValue = parseInt(value);
//       const maxValue = field.percentage ? 100 : 
//         field.key === 'total_students' ? 50000 : 100;
      
//       return (
//         <div>
//           <div className="font-semibold text-gray-900">{formattedValue}</div>
//           {renderProgressBar(numValue, maxValue, field.color?.includes('teal') ? 'teal' : 'amber')}
//         </div>
//       );
//     }
    
//     return (
//       <div className="font-medium text-gray-900">
//         {formattedValue}
//       </div>
//     );
//   };

//   const renderComparisonCards = () => {
//     const items = selectedItems.map(item => getItemDetails(item.id));
//     const fields = comparisonType === 'university' ? UNIVERSITY_FIELDS : COURSE_FIELDS;
//     const hasData = items.filter(Boolean).length >= 2;

//     if (loading) {
//       return (
//         <div className="text-center py-20">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mb-6"></div>
//           <h3 className="text-2xl font-semibold text-gray-800 mb-2">
//             Loading {comparisonType} data...
//           </h3>
//           <p className="text-gray-600">Please wait while we fetch the latest information</p>
//         </div>
//       );
//     }

//     if (!hasData) {
//       return (
//         <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-12 rounded-2xl shadow-xl border border-teal-200">
//           <div className="text-center mb-8">
//             <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl mx-auto mb-6 flex items-center justify-center transform rotate-3">
//               {comparisonType === 'university' ? 
//                 <GraduationCap className="w-10 h-10 text-white" /> :
//                 <BookOpen className="w-10 h-10 text-white" />
//               }
//             </div>
//             <h3 className="text-3xl font-bold text-gray-900 mb-4">
//               Compare {comparisonType === 'university' ? 'Universities' : 'Courses'}
//             </h3>
//             <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
//               Select at least 2 items to see a detailed side-by-side comparison with visual data representation
//             </p>
//           </div>
          
//           <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
//             <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
//               <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
//                 <Target className="w-5 h-5 text-teal-600" />
//                 {comparisonType === 'university' ? 'University Factors' : 'Course Factors'}
//               </h4>
//               <ul className="space-y-3 text-gray-700">
//                 {comparisonType === 'university' ? (
//                   <>
//                     <li className="flex items-center gap-2">
//                       <CheckCircle className="w-4 h-4 text-teal-500" />
//                       Tuition & Application Fees
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <CheckCircle className="w-4 h-4 text-teal-500" />
//                       Visa Success Rates
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <CheckCircle className="w-4 h-4 text-teal-500" />
//                       Scholarship Opportunities
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <CheckCircle className="w-4 h-4 text-teal-500" />
//                       International Student Support
//                     </li>
//                   </>
//                 ) : (
//                   <>
//                     <li className="flex items-center gap-2">
//                       <CheckCircle className="w-4 h-4 text-teal-500" />
//                       Course Fees & Duration
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <CheckCircle className="w-4 h-4 text-teal-500" />
//                       Student Reviews & Ratings
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <CheckCircle className="w-4 h-4 text-teal-500" />
//                       Entry Requirements
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <CheckCircle className="w-4 h-4 text-teal-500" />
//                       Financial Aid Options
//                     </li>
//                   </>
//                 )}
//               </ul>
//             </div>
            
//             <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
//               <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
//                 <Sparkles className="w-5 h-5 text-teal-600" />
//                 Pro Tips
//               </h4>
//               <ul className="space-y-3 text-gray-700">
//                 <li className="flex items-center gap-2">
//                   <TrendingUp className="w-4 h-4 text-teal-500" />
//                   Compare multiple options
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <DollarSign className="w-4 h-4 text-teal-500" />
//                   Factor in living costs
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <Award className="w-4 h-4 text-amber-500" />
//                   Check accreditation status
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <Globe className="w-4 h-4 text-teal-500" />
//                   Consider location benefits
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div className="space-y-8">
//         {/* Header Cards */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
//           {items.map((item, index) => (
//             item && (
//               <div key={index} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform hover:scale-105 transition-all duration-300">
//                 <div className="relative h-48 bg-gradient-to-br from-teal-500 to-teal-700">
//                   <button
//                     onClick={() => removeComparison(index)}
//                     className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
//                   >
//                     ×
//                   </button>
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <div className="w-24 h-24 bg-white rounded-2xl p-4 shadow-lg">
//                       <Image
//                         src={item.imageSrc}
//                         alt={item.name || item.title}
//                         width={96}
//                         height={96}
//                         className="w-full h-full object-cover rounded-lg"
//                       />
//                     </div>
//                   </div>
//                 </div>
//                 <div className="p-6">
//                   <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
//                     {item.name || item.title}
//                   </h3>
//                   {item.country && (
//                     <p className="text-gray-600 flex items-center gap-2 mb-4">
//                       <MapPin className="w-4 h-4" />
//                       {item.city}, {item.country}
//                     </p>
//                   )}
//                   <div className="flex items-center justify-between">
//                     <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
//                       {item.type}
//                     </span>
//                     {item.ranking && (
//                       <span className="flex items-center gap-1 text-amber-600">
//                         <Trophy className="w-4 h-4" />
//                         #{item.ranking}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )
//           ))}
          
//           {selectedItems.length < 4 && (
//             <button
//               onClick={addComparison}
//               className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-teal-400 hover:bg-teal-50 transition-all duration-300 group"
//             >
//               <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
//                 <span className="text-2xl text-teal-600">+</span>
//               </div>
//               <span className="text-gray-600 group-hover:text-teal-600 font-medium">
//                 Add Another {comparisonType}
//               </span>
//             </button>
//           )}
//         </div>

//         {/* Comparison Table */}
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
//           <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6">
//             <h2 className="text-2xl font-bold text-white flex items-center gap-3">
//               <BarChart3 className="w-8 h-8" />
//               Detailed Comparison
//             </h2>
//           </div>
          
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-gray-200">
//                   <th className="text-left p-6 bg-gray-50 font-semibold text-gray-900 min-w-[200px]">
//                     Criteria
//                   </th>
//                   {items.map((item, index) => (
//                     <th key={index} className="p-6 text-center bg-gray-50 border-l border-gray-200 min-w-[250px]">
//                       {item ? (
//                         <div className="font-semibold text-gray-900">
//                           {item.name || item.title}
//                         </div>
//                       ) : (
//                         <select
//                           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
//                           value=""
//                           onChange={(e) => handleItemChange(index, e.target.value)}
//                         >
//                           <option value="">Select {comparisonType}</option>
//                           {(comparisonType === 'university' ? data.universities : data.courses).map(opt => (
//                             <option key={opt.id} value={opt.id}>
//                               {opt.name || opt.title}
//                             </option>
//                           ))}
//                         </select>
//                       )}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {fields.map((field, i) => {
//                   const Icon = field.icon;
//                   return (
//                     <tr key={i} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
//                       <td className="p-6 border-r border-gray-200">
//                         <div className="flex items-center gap-3">
//                           <div className={`p-2 rounded-lg bg-gray-100`}>
//                             <Icon className={`w-5 h-5 ${field.color}`} />
//                           </div>
//                           <span className="font-medium text-gray-900">
//                             {field.label}
//                           </span>
//                         </div>
//                       </td>
//                       {items.map((item, j) => (
//                         <td key={j} className="p-6 text-center border-l border-gray-200">
//                           <div className="min-h-[40px] flex items-center justify-center">
//                             {item ? renderFieldValue(field, item) : (
//                               <span className="text-gray-400">-</span>
//                             )}
//                           </div>
//                         </td>
//                       ))}
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50">
//       <div className="max-w-7xl mx-auto px-4 py-12">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <div className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-3 rounded-full font-semibold mb-6">
//             <BarChart3 className="w-6 h-6" />
//             Professional Comparison Tool
//           </div>
          
//           <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
//             Compare {comparisonType === 'university' ? 'Universities' : 'Courses'}
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-700"> Side by Side</span>
//           </h1>
          
//           <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
//             Make informed decisions with our comprehensive comparison tool featuring visual data representation and detailed insights
//           </p>
          
//           {/* Toggle Buttons */}
//           <div className="inline-flex bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
//             <button
//               className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
//                 comparisonType === 'university' 
//                   ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg' 
//                   : 'text-gray-700 hover:bg-gray-100'
//               }`}
//               onClick={() => setComparisonType('university')}
//             >
//               <GraduationCap className="w-5 h-5" />
//               Universities
//             </button>
//             <button
//               className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
//                 comparisonType === 'course' 
//                   ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg' 
//                   : 'text-gray-700 hover:bg-gray-100'
//               }`}
//               onClick={() => setComparisonType('course')}
//             >
//               <BookOpen className="w-5 h-5" />
//               Courses
//             </button>
//           </div>
//         </div>
        
//         {/* Selection Interface */}
//         <div className="mb-12">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//             {selectedItems.map((item, index) => (
//               <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
//                 <label className="block text-sm font-semibold text-gray-700 mb-3">
//                   Select {comparisonType} {index + 1}
//                 </label>
//                 <select
//                   className="w-full p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
//                   value={item.id}
//                   onChange={(e) => handleItemChange(index, e.target.value)}
//                   disabled={loading}
//                 >
//                   <option value="">Choose {comparisonType}...</option>
//                   {(comparisonType === 'university' ? data.universities : data.courses).map(opt => (
//                     <option key={opt.id} value={opt.id}>
//                       {opt.name || opt.title}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Comparison Results */}
//         {renderComparisonCards()}

//         {/* Tips Section */}
//         <div className="mt-16 bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 text-white">
//           <div className="text-center mb-8">
//             <h3 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
//               <Sparkles className="w-8 h-8" />
//               Expert Comparison Tips
//             </h3>
//           </div>
          
//           <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
//             <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
//               <h4 className="font-bold mb-4 text-xl">
//                 {comparisonType === 'university' ? 'For Universities' : 'For Courses'}
//               </h4>
//               <ul className="space-y-3">
//                 {comparisonType === 'university' ? (
//                   <>
//                     <li className="flex items-start gap-3">
//                       <CheckCircle className="w-5 h-5 mt-0.5 text-teal-300" />
//                       Higher visa success rates indicate better international student support
//                     </li>
//                     <li className="flex items-start gap-3">
//                       <Award className="w-5 h-5 mt-0.5 text-amber-300" />
//                       Explore scholarship options to significantly reduce education costs
//                     </li>
//                     <li className="flex items-start gap-3">
//                       <Users className="w-5 h-5 mt-0.5 text-teal-300" />
//                       Higher international student ratios often mean better cultural diversity
//                     </li>
//                   </>
//                 ) : (
//                   <>
//                     <li className="flex items-start gap-3">
//                       <Clock className="w-5 h-5 mt-0.5 text-teal-300" />
//                       Compare course durations against yearly fees for total cost analysis
//                     </li>
//                     <li className="flex items-start gap-3">
//                       <Star className="w-5 h-5 mt-0.5 text-amber-300" />
//                       Student reviews provide authentic insights into course quality
//                     </li>
//                     <li className="flex items-start gap-3">
//                       <Target className="w-5 h-5 mt-0.5 text-teal-300" />
//                       Verify entry requirements match your academic background
//                     </li>
//                   </>
//                 )}
//               </ul>
//             </div>
            
//             <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
//               <h4 className="font-bold mb-4 text-xl flex items-center gap-2">
//                 <Trophy className="w-6 h-6" />
//                 General Best Practices
//               </h4>
//               <ul className="space-y-3">
//                 <li className="flex items-start gap-3">
//                   <ExternalLink className="w-5 h-5 mt-0.5 text-teal-300" />
//                   Always verify information directly with institutions
//                 </li>
//                 <li className="flex items-start gap-3">
//                   <DollarSign className="w-5 h-5 mt-0.5 text-teal-300" />
//                   Factor in living costs, not just tuition fees
//                 </li>
//                 <li className="flex items-start gap-3">
//                   <Award className="w-5 h-5 mt-0.5 text-amber-300" />
//                   Verify program accreditation and recognition
//                 </li>
//                 <li className="flex items-start gap-3">
//                   <TrendingUp className="w-5 h-5 mt-0.5 text-teal-300" />
//                   Research graduate employment rates when available
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function ComparisonPage() {
//   return (
//     <Suspense fallback={
//       <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mb-6"></div>
//           <h2 className="text-2xl font-semibold text-gray-800">Loading Comparison Tool...</h2>
//         </div>
//       </div>
//     }>
//       <ComparisonTool />
//     </Suspense>
//   );
// }