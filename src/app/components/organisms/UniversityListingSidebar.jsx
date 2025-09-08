'use client';

import useUniversitiessidebar from '../../../app/hooks/useUniversitiessidebar';
import Image from 'next/image';
import React, { useState, useEffect, Suspense, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Button from '../atoms/Button';
import Container from '../atoms/Container';
import Heading from '../atoms/Heading';
import Swal from 'sweetalert2';
import { FaHeart, FaRegHeart, FaTimes, FaFilter, FaSpinner } from 'react-icons/fa';
import { MdCompare } from "react-icons/md";
import Loader from "../atoms/loader"
import { slugify } from '../../utils/slugify';
import { useWishlist } from '../../context/WishlistContext';
import Pagination from '../../admin/components/Pagination';

const UniversityListingContent = ({ initialType, initialCountry, initialSearch, initialSubject, initialQualification }) => {
  const router = useRouter();
  
  // Track component re-renders
  console.log('🔄 UniversityListingContent re-rendered');
  
  // Prepare initial filters for the hook
  const initialFilters = useMemo(() => {
    const filters = {};
    if (initialType) filters.type = initialType;
    if (initialCountry && initialCountry !== 'Select Country') filters.country = initialCountry;
    if (initialSearch) filters.search = initialSearch;
    if (initialQualification) {
      const qualificationList = initialQualification.split(',').map(q => q.trim()).filter(q => q);
      if (qualificationList.length > 0) {
        filters.qualifications = qualificationList;
      }
    }
    return filters;
  }, [initialType, initialCountry, initialSearch, initialQualification]);
  
  const {
    // Pagination
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    isLoading,
    handlePageChange,
    
    // Data
    filters,
    handleFilterChange,
    currentPageData,
    currentPageItems,
    countries,
    countriesLoading,
    scholarshipOptions,
    qualificationOptions,
    qualificationsLoading,
    handleScholarshipChange,
    handleQualificationChange,
    
    // Request tracking
    requestInProgress,
    lastRequest,
    
    handleSearch,
    clearAllFilters,
    hasActiveFilters,
    
    // Show all results
    showAllResults,
    fetchAllResults,
    resetToPagination,
    
    // Internal functions
    fetchPageData,
  } = useUniversitiessidebar(initialFilters);

  // Initialize state variables
  const [searchInput, setSearchInput] = useState(initialSearch || '');
  const { wishlist, toggleWishlist, isWishlisted } = useWishlist();
  const [compareItems, setCompareItems] = useState([]);
  const [showComparisonSidebar, setShowComparisonSidebar] = useState(false);
  const [initialQualificationApplied, setInitialQualificationApplied] = useState(false);
  const initialQualificationAppliedRef = useRef(false);

  // Track if filters are being applied
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  // Set loading state when filters change
  useEffect(() => {
    if (hasActiveFilters) {
      setIsApplyingFilters(true);
      // Clear loading state after a short delay to allow data to load
      const timer = setTimeout(() => {
        setIsApplyingFilters(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasActiveFilters]);

  // Initialize from localStorage
  useEffect(() => {
    const savedCompareItems = localStorage.getItem('compareItems');
    if (savedCompareItems) {
      setCompareItems(JSON.parse(savedCompareItems));
      setShowComparisonSidebar(JSON.parse(savedCompareItems).length > 0);
    }
  }, []);

  // Initialize search input from URL params
  useEffect(() => {
    if (initialSearch && initialSearch !== searchInput) {
      setSearchInput(initialSearch);
    }
  }, [initialSearch, searchInput]);

  // Sync search input with filter state
  useEffect(() => {
    if (filters.search && filters.search !== searchInput && !searchInput) {
      setSearchInput(filters.search);
    }
  }, [filters.search, searchInput]);

  // Save compare items to localStorage when they change
  useEffect(() => {
    localStorage.setItem('compareItems', JSON.stringify(compareItems));
    setShowComparisonSidebar(compareItems.length > 0);
  }, [compareItems]);

  // Handle search input change
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // Clear any existing search timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    // Set a new timeout to search after user stops typing
    window.searchTimeout = setTimeout(() => {
      if (value && value.trim()) {
        console.log('🔍 Performing search for:', value);
        handleSearch(value.trim());
      } else {
        console.log('🔍 Clearing search');
        handleSearch('');
      }
    }, 500); // Wait 500ms after user stops typing
  };

  // Handle search input key press (for immediate search on Enter)
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Clear the timeout since we're searching immediately
      if (window.searchTimeout) {
        clearTimeout(window.searchTimeout);
      }
      
      const value = searchInput.trim();
      if (value) {
        console.log('🔍 Performing immediate search for:', value);
        handleSearch(value);
      } else {
        console.log('🔍 Clearing search');
        handleSearch('');
      }
    }
  };

  // Handle pagination
  const paginate = (pageNumber) => {
    handlePageChange(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemClick = (label, id, slug, title) => {
    switch(label) {
      case 'University':
        if (id && slug) {
          router.push(`/university/${slug}`);
        } else if (id) {
          router.push(`/university/${id}`);
        }
        break;
      case 'Course':
        if (slug) {
          router.push(`/courses/${slug}`);
        } else if (id) {
          router.push(`/courses/${id}`);
        }
        break;
      case 'Guide':
        if (title) {
          router.push(`/guides/${title}`);
        } 
        else if (id) {
          router.push(`/guides/${id}`);
        }
        break;
      case 'Article':
        if (slug) {
          router.push(`/${slug}`);
        } else if (id) {
          router.push(`/${id}`);
        }
        break;
      default:
        break;
    }
  };

  // Handle admission request
  const handleRequestInfo = async (item) => {
    // Check if user is logged in or collect guest information
    let userInfo = null;
    
    // Try to get user info from session/localStorage
    try {
      const session = await fetch('/api/auth/session');
      const sessionData = await session.json();
      
      if (sessionData?.user) {
        userInfo = {
          name: sessionData.user.name || 'Unknown User',
          phone: sessionData.user.phone || 'Not provided',
          email: sessionData.user.email || 'No email'
        };
      }
    } catch (error) {
      console.log('No active session found');
    }

    // If no user info, collect guest information
    if (!userInfo) {
      const { value: formValues } = await Swal.fire({
        title: 'Request Information',
        html: `
          <div class="text-left">
            <p class="mb-3">Please provide your contact information to receive details for:</p>
            <p class="font-bold text-blue-600 mb-4">${item.name || item.title || 'This Item'}</p>
            
            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input id="swal-input1" class="swal2-input" placeholder="Enter your full name">
            </div>
            
            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input id="swal-input2" class="swal2-input" type="email" placeholder="Enter your email">
            </div>
            
            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input id="swal-input3" class="swal-input" placeholder="Enter your phone number">
            </div>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Send Request',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
          const name = document.getElementById('swal-input1').value;
          const email = document.getElementById('swal-input2').value;
          const phone = document.getElementById('swal-input3').value;
          
          if (!name || !email) {
            Swal.showValidationMessage('Name and Email are required');
            return false;
          }
          
          if (!email.includes('@')) {
            Swal.showValidationMessage('Please enter a valid email address');
            return false;
          }
          
          return { name, email, phone: phone || 'Not provided' };
        }
      });

      if (formValues) {
        userInfo = formValues;
      } else {
        return; // User cancelled
      }
    }

    // Check if we have university email information
    if (item.type === 'course') {
      // For courses, check multiple possible email fields
      const universityEmail = item.rawData?.university_alternate_email || 
                             item.rawData?.university_info?.alternate_email ||
                             item.rawData?.university_email ||
                             item.rawData?.alternate_email;
      
      if (!universityEmail) {
        Swal.fire({
          title: 'University Email Not Found',
          text: `Sorry, we couldn't find an email address for the university offering this course. Please contact support or try another course.`,
          icon: 'warning',
          confirmButtonText: 'OK',
        });
        return;
      }
    }

    if (item.type === 'university' && !item.rawData?.alternate_email) {
      Swal.fire({
        title: 'University Email Not Found',
        text: `Sorry, we couldn't find an email address for ${item.name}. Please contact support or try another university.`,
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Confirm the request
    const result = await Swal.fire({
      title: `Send Information Request?`,
      text: `We'll send your request for: ${item.name || item.title}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Send Request',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Sending request...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        // Prepare the item data with proper structure for the email function
        let apiItem = { ...item.rawData };
        
        if (item.type === 'course') {
          // For courses, ensure we have the university email fields
          const universityEmail = item.rawData?.university_alternate_email || 
                                 item.rawData?.university_info?.alternate_email ||
                                 item.rawData?.university_email ||
                                 item.rawData?.alternate_email;
          
          apiItem = {
            ...item.rawData,
            university_alternate_email: universityEmail,
            university_name: item.rawData?.university_name || item.rawData?.university || 'Unknown University',
            title: item.rawData?.name || item.rawData?.title, // Email function expects 'title' for courses
            university_info: item.rawData?.university_info || {
              name: item.rawData?.university_name || item.rawData?.university,
              alternate_email: universityEmail
            }
          };
        }

        console.log('📤 Sending request to API with prepared data:', { apiItem, userInfo });

        const res = await fetch('/api/internal/request-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item: apiItem, userInfo }),
        });

        console.log('📥 API response status:', res.status);
        const data = await res.json();
        console.log('📥 API response data:', data);

        if (res.status === 401) {
          Swal.fire({
            title: 'Unauthorized',
            text: data.error || 'Please login as a student or consultant to request info.',
            icon: 'warning',
          });
          return;
        }

        if (data.success) {
          Swal.fire({
            title: 'Request Sent Successfully! 🎉',
            text: `Your information request has been sent. The ${item.type === 'university' ? 'university' : 'university'} will contact you within 24-48 hours.`,
            icon: 'success',
            confirmButtonText: 'Great!',
          });
        } else {
          console.error('❌ API returned error:', data.error);
          Swal.fire({
            title: 'Error',
            text: data.error || 'Failed to send request. Please try again.',
            icon: 'error',
          });
        }
      } catch (err) {
        console.error('❌ Network/JS error sending request:', err);
        Swal.fire({
          title: 'Error',
          text: 'Something went wrong while sending the request. Please try again.',
          icon: 'error',
        });
      }
    }
  };

  const handleFreeConsultation = () => {
    router.push('/free-consultation');
  };

  // Handle comparison logic
  const handleCompareClick = async (newItem) => {
    // Check if already in comparison
    if (compareItems.some(item => item.id === newItem.id && item.type === newItem.type)) {
      Swal.fire({
        title: 'Already Added',
        text: 'This item is already in your comparison list.',
        icon: 'info'
      });
      return;
    }

    // Check type compatibility
    if (compareItems.length > 0 && compareItems[0].type !== newItem.type) {
      Swal.fire({
        title: 'Cannot Compare',
        text: `You can only compare items of the same type (${compareItems[0].type}s).`,
        icon: 'warning'
      });
      return;
    }

    // Check limit
    if (compareItems.length >= 4) {
      Swal.fire({
        title: 'Limit Reached',
        text: 'You can compare up to 4 items at a time.',
        icon: 'warning'
      });
      return;
    }

    // First item - just add
    if (compareItems.length === 0) {
      setCompareItems([newItem]);
      return;
    }

    // Second or more items - show popup
    const { value: compareWithId, isConfirmed, isDenied } = await Swal.fire({
      title: 'Comparison Options',
      html: `What would you like to do with <strong>${newItem.name || newItem.title}</strong>?`,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: compareItems.length > 1 ? 'Compare with...' : `Compare with ${compareItems[0].name || compareItems[0].title}`,
      denyButtonText: 'Just Add to List',
      cancelButtonText: 'Cancel',
      input: compareItems.length > 1 ? 'select' : undefined,
      inputOptions: compareItems.length > 1 ? 
        compareItems.reduce((options, item) => {
          options[item.id] = item.name || item.title;
          return options;
        }, {}) : undefined,
      inputPlaceholder: compareItems.length > 1 ? 'Select item to compare with' : undefined,
    });

    if (isConfirmed) {
      if (compareItems.length === 1) {
        // Compare with the single existing item
        router.push(`/comparison?type=${newItem.type}&id1=${compareItems[0].id}&id2=${newItem.id}`);
      } else if (compareWithId) {
        // Compare with selected item
        const selectedItem = compareItems.find(item => item.id === compareWithId);
        router.push(`/comparison?type=${newItem.type}&id1=${selectedItem.id}&id2=${newItem.id}`);
      }
    } else if (isDenied) {
      // Just add to comparison
      setCompareItems([...compareItems, newItem]);
    }
  };

  // Remove item from comparison
  const removeFromComparison = (itemToRemove) => {
    setCompareItems(prev => prev.filter(item => !(item.id === itemToRemove.id && item.type === itemToRemove.type)));
  };

  // Navigate to comparison page with selected items
  const navigateToComparison = () => {
    if (compareItems.length < 2) {
      Swal.fire({
        title: 'Not Enough Items',
        text: 'Please select at least 2 items to compare.',
        icon: 'warning'
      });
      return;
    }
    
    const queryParams = new URLSearchParams();
    queryParams.append('type', compareItems[0].type);
    
    compareItems.forEach((item, index) => {
      queryParams.append(`id${index + 1}`, item.id);
    });
    
    router.push(`/comparison?${queryParams.toString()}`);
  };

  const getButtonForItem = (label, details) => {
    switch(label) {
      case 'University': 
        return (
          <>
            <Button 
              className="w-full"
              onClick={() => handleItemClick(label, details.id, details.slug)}
            >
              View University
            </Button>
            <Button 
              className="w-full"
              onClick={() => handleRequestInfo(details)}
            >
              Request Information
            </Button>
          </>
        );
      case 'Course': 
        return (
          <>
            <Button 
              className="w-full"
              onClick={() => handleItemClick(label, details.id, details.slug)}
            >
              View Course
            </Button>
            <Button 
              className="w-full"
              onClick={() => handleRequestInfo(details)}
            >
              Request Information
            </Button>
          </>
        );
      case 'Guide':
        return (
          <>
            <Button 
              className="w-full"
              onClick={() => handleItemClick(label, details.id, details.title, details.slug)}
            >
              View Guide
            </Button>
            <Button 
              className="w-full"
              onClick={() => handleRequestInfo(details)}
            >
              Request Information
            </Button>
          </>
        );
      case 'Article':
        return (
          <Button 
            className="w-full"
            onClick={() => handleItemClick(label, details.id, details.slug, details.title)}
          >
            View Article
          </Button>
        );
      default: 
        return null;
    }
  };

  const renderFilterSection = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaFilter className="mr-2 text-teal-600" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-red-600 hover:text-red-800 underline flex items-center"
            title="Clear all filters"
          >
            <FaTimes className="mr-1" />
            Clear All
          </button>
        )}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Search</label>
        <div className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchInputChange}
            onKeyPress={handleSearchKeyPress}
            placeholder="Search universities, courses, articles..."
            className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <button
            onClick={() => {
              const value = searchInput.trim();
              if (value) {
                handleSearch(value);
              } else {
                handleSearch('');
              }
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700 transition-colors"
            title="Search"
          >
            🔍
          </button>
        </div>
        
        
        
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Rating</label>
        <div className="flex space-x-1">
          {[...Array(5)].map((_, index) => (
            <span key={`star-${index}`} className="text-teal-600 text-xl">★</span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Country</label>
        <Button className='w-full'>
          <select
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            className="w-full text-white outline-none text-sm"
            disabled={countriesLoading}
          >
            {countriesLoading ? (
              <option className="text-black">Loading countries...</option>
            ) : (
              countries
                .filter(country => typeof country === 'string' && country.trim().length > 0)
                .map((country, index) => (
                  <option className="text-black" key={`country-${country}-${index}`} value={country}>
                    {country}
                  </option>
                ))
            )}
          </select> 
        </Button>
        
        {/* Loading indicator for countries */}
        {countriesLoading && (
          <div className="mt-2 flex items-center text-xs text-gray-500">
            <FaSpinner className="animate-spin mr-2" />
            Loading countries from database...
          </div>
        )}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Type</label>
        <Button className='w-full'>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full text-white outline-none text-sm"
          >
            <option className="text-black" value="">All Types</option>
            <option className="text-black" value="university">University</option>
            <option className="text-black" value="course">Course</option>
            <option className="text-black" value="article">Article</option>
            <option className="text-black" value="guide">Guide</option>
          </select>
        </Button>
      </div>

      {/* Scholarship Filter */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Scholarship</label>
        <div className="space-y-2">
          {scholarshipOptions.map((option, index) => (
            <label key={`scholarship-${option}-${index}`} className="flex items-center">
              <input
                type="radio"
                name="scholarship"
                value={option}
                checked={filters.scholarship.includes(option)}
                onChange={() => handleScholarshipChange(option)}
                className="mr-2"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Qualifications Filter */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Qualifications</label>
        <div className=" space-y-2">
          {qualificationsLoading ? (
            <div className="text-xs text-gray-500">Loading qualifications...</div>
          ) : qualificationOptions.length > 0 ? (
            qualificationOptions.map((option, index) => (
              <label key={`qual-${option}-${index}`} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  checked={filters.qualifications.includes(option)}
                  onChange={() => handleQualificationChange(option)}
                  className="mr-2"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))
          ) : (
            <div className="text-xs text-gray-500">No qualifications found</div>
          )}
          
          {/* Loading indicator for qualifications */}
          {qualificationsLoading && (
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <FaSpinner className="animate-spin mr-2" />
              Loading qualifications from database...
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {Object.values(filters).some(value => 
        (Array.isArray(value) && value.length > 0) || 
        (typeof value === 'string' && value !== '' && value !== 'Select Country')
      ) && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
           
            {filters.scholarship.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                Scholarship: {filters.scholarship.join(', ')}
              </span>
            )}
            {filters.qualifications.length > 0 && (
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                Qualifications: {filters.qualifications.join(', ')}
              </span>
            )}
          </div>
          <button
            onClick={clearAllFilters}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            Clear All Filters
          </button>
        </div>
      )}

    </>
  );

  const renderComparisonSidebar = () => (
    <div className={`fixed right-0 top-0 h-full bg-white shadow-lg z-50 transition-all duration-300 ease-in-out 
      ${showComparisonSidebar ? 'w-80 translate-x-0' : 'w-0 translate-x-full'}`}>
      <div className="p-4 h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Comparison ({compareItems.length}/4)</h3>
          <button 
            onClick={() => setShowComparisonSidebar(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        {compareItems.length > 0 ? (
          <>
            <div className="space-y-4">
              {compareItems.map((item, index) => (
                <div key={`compare-${item.type}-${item.id}-${index}`} className="flex items-center p-2 border rounded-lg">
                  <Image 
                    src={item.imageSrc} 
                    alt={item.name || item.title} 
                    width={40} 
                    height={40} 
                    className="rounded-full object-cover w-10 h-10 mr-3"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name || item.title}</p>
                    <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                  </div>
                  <button 
                    onClick={() => removeFromComparison(item)}
                    className="text-red-500 hover:text-red-700 ml-2 cursor-pointer"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Button 
                className="w-full"
                onClick={navigateToComparison}
                disabled={compareItems.length < 2}
              >
                Compare Now
              </Button>
            </div>

            {compareItems.length >= 2 && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {compareItems.slice(0, 2).map((item, index) => (
                  <div key={`preview-${item.type}-${item.id}-${index}`} className="border p-2 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Image 
                        src={item.imageSrc} 
                        alt={item.name || item.title} 
                        width={30} 
                        height={30} 
                        className="rounded-full object-cover w-8 h-8 mr-2"
                      />
                      <p className="text-xs font-medium truncate">{item.name || item.title}</p>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      {item.type === 'university' && (
                        <>
                          <p>Location: {item.rawData?.location}</p>
                          <p>Ranking: {item.rawData?.ranking}</p>
                        </>
                      )}
                      {item.type === 'course' && (
                        <>
                          <p>University: {item.rawData?.university_name}</p>
                          <p>Duration: {item.rawData?.duration}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 text-center">
              <button 
                onClick={() => setCompareItems([])}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Clear All
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MdCompare className="mx-auto text-4xl mb-2" />
            <p>Add items to compare</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="heros">
      {renderComparisonSidebar()}
      
      <section className="relative md:h-[64vh] md:pt-[0px] sm:pt-[100px] pt-[100px] sm:h-[70vh] h-[70vh] flex items-center justify-center overflow-hidden">
        <img src="/assets/s.png" alt="Hero Background" className="absolute top-0 left-0 w-full h-full object-cover z-0" />
        <div className="absolute inset-0 bg-black opacity-50 z-10" />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[rgba(0,0,0,0.1)] to-[rgba(0,0,0,0.9)]" />
        <div className="relative z-20 text-center px-4 max-w-[1000px] mx-auto pb-12">
          <Heading level={1}>
            <div className="text-white">Search University /Courses/ Articles /Guides</div>
          </Heading>
        </div>
      </section>

      <Container className="px-4 sm:px-2">
        <div className="bottom-session-space banner-bottom-space">
          {/* Floating comparison button */}
          {compareItems.length > 0 && (
            <button 
              onClick={() => setShowComparisonSidebar(!showComparisonSidebar)}
              className="fixed right-4 bottom-4 bg-teal-600 text-white p-3 rounded-full shadow-lg z-40 flex items-center hover:bg-teal-700 transition-colors"
            >
              <MdCompare className="text-xl" />
              <span className="ml-2 bg-white text-teal-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                {compareItems.length}
              </span>
            </button>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="hidden sm:block lg:col-span-1 bg-[#E7F1F2] p-6 space-y-6 rounded-[24px] sticky top-4 h-[calc(100vh-120px)] overflow-y-auto">
              {renderFilterSection()}
            </div>

            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
                
                {currentPageItems && currentPageItems.length > 0 ? (
                  currentPageItems.map((item, index) => {
                    const details = item; // item is already processed by the hook
                    if (!details) return null;

                    return (
                      <div key={`${details.label}-${details.id}-${index}`} className="bg-[#E7F1F2] rounded-2xl p-4 shadow hover:shadow-lg transition relative">
                        {/* Card label */}
                        <div className="absolute top-2 left-2 z-10">
                          <span className="bg-teal-600 text-white text-xs font-semibold px-2 py-1 rounded">
                            {details.label}
                          </span>
                        </div>
                        
                        {/* Top right icons */}
                        <div className="absolute top-2 right-2 flex gap-2 z-20">
                          <span
                            className="cursor-pointer bg-white rounded-full p-1 shadow hover:bg-red-50"
                            title={isWishlisted(details) ? 'Remove from wishlist' : 'Add to wishlist'}
                            onClick={() => toggleWishlist(details)}
                          >
                            {isWishlisted(details) ? (
                              <FaHeart className="text-red-500" />
                            ) : (
                              <FaRegHeart className="text-gray-400" />
                            )}
                          </span>
                          {(details.label === 'University' || details.label === 'Course') && (
                            <span
                              className={`cursor-pointer bg-white rounded-full p-1 shadow ${
                                compareItems.some(i => i.id === details.id && i.type === details.type) ? 'bg-teal-100 text-teal-600' : 'hover:bg-blue-100'
                              }`}
                              title={compareItems.some(i => i.id === details.id && i.type === details.type) ? 'Remove from comparison' : 'Add to comparison'}
                              onClick={() => handleCompareClick(details)}
                            >
                              <MdCompare className={compareItems.some(i => i.id === details.id && i.type === details.type) ? 'text-teal-600' : 'text-gray-600'} />
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-[20px] mb-4 pt-[30px] text-center sm:text-left items-center sm:items-start">
                          <div className="flex justify-center sm:justify-start">
                            <Image 
                              src={details.imageSrc} 
                              alt={details.title} 
                              width={80} 
                              height={80} 
                              className="rounded-full object-cover w-[80px] h-[80px]" 
                              onError={(e) => {
                                e.target.src = '/university-placeholder.png';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold text-gray-800 mb-2">
                                {details.title}
                                {details.label === 'University' && details.subtitle && (
                                  <span className='text-xs text-gray-400'>({details.subtitle})</span>
                                )}
                              </span>
                            </div>
                            {details.label !== 'University' && details.subtitle && (
                              <p className="text-gray-500 text-sm mb-1">{details.subtitle}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-center max-w-md mx-auto">
                          <div className="mb-2 flex flex-col sm:flex-row gap-3">
                            {getButtonForItem(details.label, details)}
                          </div>
                          <div className="mb-4">
                            <Button 
                              className="w-full"
                              onClick={handleFreeConsultation}
                            >
                              Free Consultation
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 text-lg col-span-full">
                    {totalItems === 0 ? (
                       <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                         <div className="text-red-600 mb-3">
                           <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                           </svg>
                           <h3 className="text-lg font-semibold mb-2">
                             {filters.type ? `No ${filters.type}s Found` : 'No Results Found'}
                           </h3>
                         </div>
                         
                         <div className="text-sm text-red-700 mb-4">
                           <p className="mb-2">
                             {filters.type ? 
                               `No ${filters.type}s match your current filters:` : 
                               'Your current filters returned no results:'
                             }
                           </p>
                           <div className="space-y-1">
                             {filters.type && (
                               <div><strong>Type:</strong> {filters.type}</div>
                             )}
                             {filters.country !== 'Select Country' && (
                               <div><strong>Country:</strong> {filters.country}</div>
                             )}
                             {filters.scholarship.length > 0 && (
                               <div><strong>Scholarship:</strong> {filters.scholarship.join(', ')}</div>
                             )}
                             {filters.qualifications.length > 0 && (
                               <div><strong>Qualifications:</strong> {filters.qualifications.join(', ')}</div>
                             )}
                             {filters.search && (
                               <div><strong>Search:</strong> "{filters.search}"</div>
                             )}
                           </div>
                         </div>
                         
                         <div className="text-xs text-red-600">
                           <p>💡 Try:</p>
                           <ul className="list-disc list-inside space-y-1 mt-1">
                             <li>Removing some filters to broaden your search</li>
                             <li>Changing the country selection</li>
                             <li>Adjusting scholarship preferences</li>
                             <li>Using different search terms</li>
                             <li>Selecting different qualifications</li>
                             {filters.type && (
                               <li>Try a different content type (university, course, article, or guide)</li>
                             )}
                           </ul>
                         </div>
                       </div>
                     ) : isLoading || isApplyingFilters ? (
                       <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                         <div className="text-blue-600 mb-3">
                           <Loader />
                           <h3 className="text-lg font-semibold mb-2">
                             {isApplyingFilters ? 'Applying filters...' : 'Searching...'}
                           </h3>
                         </div>
                         <p className="text-sm text-blue-700">
                           {isApplyingFilters 
                             ? 'Please wait while we apply your filters and load the results.'
                             : 'Please wait while we process your search criteria'
                           }
                         </p>
                         
                         {/* Show current filters while loading */}
                         {hasActiveFilters && (
                           <div className="mt-4 pt-4 border-t border-blue-200">
                             <p className="text-xs text-blue-600">
                               <strong>Applying filters:</strong>
                             </p>
                             <div className="text-xs text-blue-600 mt-1">
                               {filters.type && <div>• Type: {filters.type}</div>}
                               {filters.country !== 'Select Country' && <div>• Country: {filters.country}</div>}
                               {filters.scholarship.length > 0 && <div>• Scholarship: {filters.scholarship.join(', ')}</div>}
                               {filters.qualifications.length > 0 && <div>• Qualifications: {filters.qualifications.join(', ')}</div>}
                               {filters.search && <div>• Search: "{filters.search}"</div>}
                             </div>
                           </div>
                         )}
                       </div>
                     ) : (
                       <div>
                         <p className="mb-2">Loading results...</p>
                         <p className="text-sm text-gray-400">Please wait while we fetch your data</p>
                       </div>
                     )}
                   </div>
                 )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && !showAllResults && (
                <div className="mt-8 text-center">
                  <div className="mb-4 text-sm text-gray-600">
                    <p> <strong>Pagination:</strong> Showing {itemsPerPage} items per page</p>
                    <p className="text-xs text-blue-600 mt-1">
                      <strong>Page {currentPage} of {totalPages}</strong> | 
                      <strong> Total:</strong> {totalItems} items
                    </p>
                    <p className="text-xs text-blue-600">
                      <strong>Showing:</strong> {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                    </p>
                  </div>
                  
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={paginate}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

const UniversityListingSidebar = () => {
  const searchParams = useSearchParams();
  
  const initialType = searchParams.get('type') || '';
  const initialCountry = searchParams.get('country') || '';
  const initialSearch = searchParams.get('q') || searchParams.get('search') || '';
  const initialSubject = searchParams.get('subject') || '';
  const initialQualification = searchParams.get('qualification') || '';

  console.log('🔍 URL Parameters read:', {
    initialType,
    initialCountry,
    initialSearch,
    initialSubject,
    initialQualification,
    allParams: Object.fromEntries(searchParams.entries())
  });

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <UniversityListingContent 
        initialType={initialType}
        initialCountry={initialCountry}
        initialSearch={initialSearch}
        initialSubject={initialSubject}
        initialQualification={initialQualification}
      />
    </Suspense>
  );
};

export default UniversityListingSidebar;