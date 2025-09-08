'use client';
import { useEffect, useState } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const AccordionItem = ({ title, items, isOpen, toggle, onItemClick }) => {
  // Limit to exactly 10 items
  const displayItems = items ? items.slice(0, 10) : [];

  return (
    <div className=" rounded mb-2">
      {/* Header */}
      <div
        onClick={toggle}
        className="rounded-lg md:mx-[0px] mx-[20px] text-gray-600 border-[1px] border-gray-400 p-4 font-semibold flex justify-between items-center cursor-pointer select-none"
      >
        {title}
        <span className="w-10 h-10 bg-[white] rounded-full shadow-md transition-transform duration-300 flex items-center justify-center">
          {isOpen ? <FaMinus /> : <FaPlus />}
        </span>
      </div>

      {/* Smooth Animated Content */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-auto scrollbar-hide-scroll ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-6 text-center bg-white">
          {displayItems.length > 0 ? (
            <div className="flex flex-col gap-4">
              {displayItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onItemClick(item, title)}
                  className="border rounded-lg py-3 cursor-pointer hover:text-white hover:bg-[#0B6D76] transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md group"
                  title={`Click to search for ${typeof item === 'string' ? item : (item.name || item.title || 'this item')}`}
                >
                  {/* Display just the name/title field */}
                  <span className="group-hover:font-medium">
                    {typeof item === 'string' ? item : (item.name || item.title || 'Unnamed Item')}
                  </span>
                  <span className="ml-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    🔍
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-500 mb-2">No data available</p>
              <p className="text-xs text-gray-400">Items count: {items ? items.length : 'undefined'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BrowseCoursesAccordion = () => {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState(0);
  const [levels, setLevels] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrors({});
        
        // Fetch qualification levels
        try {
          const qualificationsRes = await fetch('/api/internal/add_post_level');
          if (!qualificationsRes.ok) throw new Error(`HTTP ${qualificationsRes.status}`);
          const qualificationsData = await qualificationsRes.json();
          
          if (qualificationsData.success && qualificationsData.data && Array.isArray(qualificationsData.data)) {
            // Extract titles from the posts data and filter for qualification-related content
            const qualificationTitles = qualificationsData.data
              .filter(post => post.title && post.title.trim().length > 0)
              .map(post => post.title)
              .filter(title => {
                const lowerTitle = title.toLowerCase();
                // Filter for qualification-related titles
                return lowerTitle.includes('bachelor') || 
                       lowerTitle.includes('master') || 
                       lowerTitle.includes('phd') || 
                       lowerTitle.includes('doctorate') || 
                       lowerTitle.includes('diploma') || 
                       lowerTitle.includes('certificate') || 
                       lowerTitle.includes('foundation') || 
                       lowerTitle.includes('associate') ||
                       lowerTitle.includes('level') ||
                       lowerTitle.includes('matric') ||
                       lowerTitle.includes('intermediate');
              });
            
            setLevels(qualificationTitles);
            console.log('✅ Qualification levels loaded from add_post_level:', qualificationTitles.length, qualificationTitles[0]);
          } else {
            // Fallback to static qualifications if API fails
            const fallbackQualifications = [
              'Bachelor', 'Master', 'PhD', 'Diploma', 'Certificate'
            ];
            setLevels(fallbackQualifications);
            console.log('✅ Using fallback qualifications:', fallbackQualifications);
          }
        } catch (error) {
          console.error('❌ Error fetching add_post_level data:', error);
          // Fallback to static qualifications if API fails
          const fallbackQualifications = [
            'Bachelor', 'Master', 'PhD', 'Diploma', 'Certificate'
          ];
          setLevels(fallbackQualifications);
          console.log('✅ Using fallback qualifications:', fallbackQualifications);
        }

        // Fetch universities
        try {
          const universitiesRes = await fetch('/api/internal/university');
          if (!universitiesRes.ok) throw new Error(`HTTP ${universitiesRes.status}`);
          const universitiesData = await universitiesRes.json();
          const universitiesArray = Array.isArray(universitiesData) ? universitiesData : universitiesData.data || [];
          setUniversities(universitiesArray);
          console.log('✅ Universities loaded:', universitiesArray.length, universitiesArray[0]);
        } catch (error) {
          console.error('❌ Error fetching universities:', error);
          setErrors(prev => ({ ...prev, universities: error.message }));
          setUniversities([]);
        }

        // Fetch subjects
        try {
          const subjectsRes = await fetch('/api/internal/subject');
          if (!subjectsRes.ok) throw new Error(`HTTP ${subjectsRes.status}`);
          const subjectsData = await subjectsRes.json();
          const subjectsArray = Array.isArray(subjectsData) ? subjectsData : subjectsData.data || [];
          setSubjects(subjectsArray);
          console.log('✅ Subjects loaded:', subjectsArray.length, subjectsArray[0]);
        } catch (error) {
          console.error('❌ Error fetching subjects:', error);
          setErrors(prev => ({ ...prev, subjects: error.message }));
          setSubjects([]);
        }

      } catch (error) {
        console.error('❌ General error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Handle item click and redirect to search page
  const handleItemClick = (item, sectionTitle) => {
    console.log('🔍 Item clicked:', item, 'Section:', sectionTitle);
    
    // Determine the search type based on section title
    let searchType = '';
    let searchValue = '';
    let qualificationValue = '';
    
    if (sectionTitle.includes('Qualification Type')) {
      searchType = 'course'; // Set type to course for qualification searches
      searchValue = typeof item === 'string' ? item : (item.name || item.title || '');
      qualificationValue = typeof item === 'string' ? item : (item.name || item.title || ''); // Also set qualification parameter
    } else if (sectionTitle.includes('University')) {
      searchType = 'university';
      searchValue = typeof item === 'string' ? item : (item.name || item.title || '');
    } else if (sectionTitle.includes('Subject')) {
      searchType = 'course'; // Set type to course for subject searches
      searchValue = typeof item === 'string' ? item : (item.name || item.title || '');
    }
    
    // Build search query parameters
    const searchParams = new URLSearchParams();
    if (searchType) searchParams.append('type', searchType);
    if (searchValue) searchParams.append('search', searchValue);
    if (qualificationValue) searchParams.append('qualification', qualificationValue);
    
    // Redirect to search page with parameters
    const searchUrl = `/search?${searchParams.toString()}`;
    console.log('🚀 Redirecting to:', searchUrl);
    router.push(searchUrl);
  };

  if (loading) {
    return (
      <section className="bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p>Loading data...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Image Section */}
          <div className="hidden lg:grid grid-cols-2 gap-6 auto-rows-fr">
            {/* Large Card with Badge */}
            <div className="relative overflow-hidden aspect-[3/4] md:aspect-auto h-96 lg:h-full min-h-[400px] lg:min-h-[600px] row-span-2 w-full">
              <img
                src="/assets/b1.png"
                alt="Main Image"
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0"></div>
              <div className="absolute bottom-6 left-6 z-10">
                <div className="flex items-center space-x-3 bg-white/95 backdrop-blur-sm rounded-full px-4 py-3 shadow-lg">
                  <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-bold">🏆</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">30 Years Of</span>
                    <span className="text-sm font-semibold text-gray-700">Quality Service</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Medium Card 1 */}
            <div className="overflow-hidden aspect-[4/5] md:aspect-auto h-72 lg:h-72 w-full">
              <img
                src="/assets/b2.png"
                alt="Team collaboration"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            {/* Medium Card 2 */}
            <div className="overflow-hidden aspect-[4/5] md:aspect-auto mb-[-15%] w-full">
              <img
                src="/assets/b3.png"
                alt="Professional woman"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Right Side - Accordion Section */}
          <div className="w-full">
            <AccordionItem
              title={`Browse Courses By Their Qualification Type `}
              items={levels}
              isOpen={openIndex === 0}
              toggle={() => toggleAccordion(0)}
              onItemClick={handleItemClick}
            />
            <AccordionItem
              title={`Study In Your Desired University `}
              items={universities}
              isOpen={openIndex === 1}
              toggle={() => toggleAccordion(1)}
              onItemClick={handleItemClick}
            />
            <AccordionItem
              title={`Browse Courses By Subject `}
              items={subjects}
              isOpen={openIndex === 2}
              toggle={() => toggleAccordion(2)}
              onItemClick={handleItemClick}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrowseCoursesAccordion;