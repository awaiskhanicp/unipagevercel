'use client'
import { useState, useMemo, useEffect, useCallback } from 'react';

function useUniversitiessidebar() {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);
  
  // Current page data only
  const [currentPageData, setCurrentPageData] = useState([]);
  
  // Filter state - Updated to include type filter
  const [filters, setFilters] = useState({
    country: 'Select Country',
    scholarship: [],
    qualifications: [],
    search: '',
    type: 'university' // Default to university
  });

  // Countries state
  const [countries, setCountries] = useState(['Select Country']);
  const [countriesLoading, setCountriesLoading] = useState(false);

  // Qualifications state
  const [qualificationOptions, setQualificationOptions] = useState([]);
  const [qualificationsLoading, setQualificationsLoading] = useState(false);

  // Request deduplication - prevent multiple identical calls
  const [lastRequest, setLastRequest] = useState('');
  const [requestInProgress, setRequestInProgress] = useState(false);

  // Fetch countries from API
  const fetchCountries = useCallback(async () => {
    setCountriesLoading(true);
    try {
      const response = await fetch('/api/internal/countries');
      const data = await response.json();
      
      console.log('🌍 Full API Response:', data);
      console.log('🌍 Response structure:', {
        success: data.success,
        hasData: !!data.data,
        dataType: typeof data.data,
        isArray: Array.isArray(data.data),
        dataLength: data.data?.length,
        keys: Object.keys(data),
        firstKey: Object.keys(data)[0]
      });
      
      if (data.success && data.data && Array.isArray(data.data)) {
        console.log('🌍 Countries data received:', data.data);
        
        // Extract country names from objects (each country has a 'country' property)
        const countryNames = data.data
          .map(item => item.country) // Extract the 'country' field from each object
          .filter(country => 
            typeof country === 'string' && country.trim().length > 0
          );
        
        console.log('🌍 Extracted country names:', countryNames);
        console.log('🌍 Valid countries count:', countryNames.length);
        
        if (countryNames.length > 0) {
          setCountries(['Select Country', ...countryNames]);
          console.log('🌍 Countries loaded from API:', countryNames.length);
        } else {
          // If no valid countries, use fallback
          throw new Error('No valid countries found in API response');
        }
      } else {
        console.error('🌍 Invalid countries data structure:', data);
        throw new Error('Invalid countries data structure from API');
      }
      
    } catch (error) {
      console.error('Error fetching countries from API:', error);
      // Fallback to static countries if API fails
      const fallbackCountries = [
        'Select Country',
        'United States', 'United Kingdom', 'Canada', 'Australia',
        'Germany', 'France', 'Netherlands', 'Sweden', 'Norway',
        'India', 'Pakistan', 'Bangladesh', 'China', 'Japan',
        'South Korea', 'Singapore', 'Malaysia', 'Thailand', 'Vietnam'
      ];
      setCountries(fallbackCountries);
      console.log('🌍 Using fallback countries:', fallbackCountries);
    } finally {
      setCountriesLoading(false);
    }
  }, []);

  // Fetch qualifications from API
  const fetchQualifications = useCallback(async () => {
    setQualificationsLoading(true);
    try {
      const response = await fetch('/api/frontend/getpostlevel', 
        {
          method: "POST"
        }
      );
      const data = await response.json();
      
      setQualificationOptions(data.data)
      
    } catch (error) {
      console.error('Error fetching add_post_level data:', error);
      // Fallback to static qualifications if API fails
      const fallbackQualifications = [
        'Bachelor', 'Master', 'PhD', 'Diploma', 'Certificate', 'Foundation', 'Associate'
      ];
      setQualificationOptions(fallbackQualifications);
      console.log('🎓 Using fallback qualifications:', fallbackQualifications);
    } finally {
      setQualificationsLoading(false);
    }
  }, []);

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  // Fetch qualifications on mount
  useEffect(() => {
    fetchQualifications();
  }, [fetchQualifications]);

  // Fetch data for a specific page with ALL filters applied at database level
  const fetchPageData = useCallback(async (page, searchTerm = '', filterType = '', fetchAll = false) => {
    // Create request signature
    const requestSignature = `${filterType}-${page}-${searchTerm}-${filters.country}-${filters.scholarship.join(',')}-${filters.qualifications.join(',')}-${fetchAll}`;
    
    // Prevent duplicate calls
    if (requestInProgress) {
      console.log('🔍 Skipping duplicate API call - request already in progress');
      return;
    }
    
    // Check if this is the same request
    if (lastRequest === requestSignature) {
      console.log('🔍 Skipping duplicate API call - same request signature');
      return;
    }
    
    console.log('🔍 Starting new API request:', requestSignature);
    setRequestInProgress(true);
    setLastRequest(requestSignature);
    setIsLoading(true);
    
    try {
      let apiUrl = '';
      let params = new URLSearchParams({
        page: page.toString(),
        limit: fetchAll ? '1000' : itemsPerPage.toString()
      });
      
      // Add search filter
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      // Add country filter
      if (filters.country !== 'Select Country') {
        params.append('country', filters.country);
      }
      
      // Add scholarship filter (only one can be selected at a time)
      if (filters.scholarship.length === 1) {
        params.append('scholarship', filters.scholarship[0]);
      }
      
      // Add qualifications filter (support multiple selections)
      if (filters.qualifications.length > 0) {
        // Join multiple qualifications with comma for backend processing
        params.append('qualification', filters.qualifications.join(','));
        console.log('🎓 Sending qualifications to API:', filters.qualifications);
      }
      
      // Build API URL based on type filter - Database level filtering
      if (filterType === 'university') {
        apiUrl = `/api/frontend/universityfilter?${params.toString()}`;
      } else if (filterType === 'course') {
        apiUrl = `/api/frontend/coursefilter?${params.toString()}`;
      } else if (filterType === 'article') {
        apiUrl = `/api/internal/blogs?${params.toString()}`;
      } else if (filterType === 'guide') {
        apiUrl = `/api/internal/guides?${params.toString()}`;
      } else {
        // Default to university if no type specified
        apiUrl = `/api/frontend/universityfilter?${params.toString()}`;
      }
      
      console.log('🔍 Fetching page data with database-level filters:', { 
        page, 
        apiUrl, 
        params: params.toString(),
        requestSignature,
        appliedFilters: {
          type: filterType,
          country: filters.country,
          scholarship: filters.scholarship,
          qualifications: filters.qualifications,
          search: searchTerm
        }
      });
      
      const startTime = Date.now();
      const response = await fetch(apiUrl);
      const data = await response.json();
      const endTime = Date.now();
      
      if (data.error) {
        // Handle pagination errors (page exceeds filtered results)
        if (data.redirectTo) {
          console.log('🔍 Page exceeds filtered results, redirecting to:', data.redirectTo);
          // Automatically fetch the correct page
          fetchPageData(data.redirectTo, searchTerm, filterType);
          return;
        }
        throw new Error(data.error);
      }
      
      // Update pagination state based on FILTERED results from database
      if (data.pagination) {
        setTotalItems(data.pagination.totalItems);
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(page);
        
        console.log('🔍 Pagination updated from database-filtered results:', {
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
          totalItems: data.pagination.totalItems,
          itemsPerPage: data.pagination.itemsPerPage,
          actualItemsOnPage: data.pagination.actualItemsOnPage,
          hasNextPage: data.pagination.hasNextPage,
          hasPrevPage: data.pagination.hasPrevPage
        });
      } else {
        // Fallback for APIs that don't return pagination object
        setTotalItems(data.total || data.totalItems || 0);
        setTotalPages(Math.ceil((data.total || data.totalItems || 0) / itemsPerPage));
        setCurrentPage(page);
      }
      
      // Set current page data
      setCurrentPageData(data.data || []);
      
      console.log('🔍 Database-filtered page data fetched successfully:', {
        page,
        requestSignature,
        responseTime: `${endTime - startTime}ms`,
        responseSize: `${JSON.stringify(data).length} bytes`,
        totalItems: data.pagination?.totalItems || data.total || 0,
        totalPages: data.pagination?.totalPages || Math.ceil((data.total || 0) / itemsPerPage),
        currentPageItems: data.data?.length || 0,
        actualItemsOnPage: data.pagination?.actualItemsOnPage || data.data?.length || 0,
        appliedFilters: data.filters || {}
      });
      
    } catch (error) {
      console.error('Error fetching page data:', error);
      setCurrentPageData([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setRequestInProgress(false);
      setIsLoading(false);
    }
  }, [itemsPerPage, filters.country, filters.scholarship, filters.qualifications, requestInProgress, lastRequest]);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    if (page < 1 || page > totalPages) return;
    
    console.log('🔍 Changing to page:', page);
    setShowAllResults(false); // Reset show all results when changing pages
    fetchPageData(page, filters.search, filters.type);
  }, [fetchPageData, filters.search, filters.type, totalPages]);

  // Handle search
  const handleSearch = useCallback((searchTerm) => {
    setCurrentPage(1); // Reset to first page
    setShowAllResults(false); // Reset show all results when search changes
    setFilters(prev => ({ ...prev, search: searchTerm }));
    fetchPageData(1, searchTerm, filters.type);
  }, [fetchPageData, filters.type]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType, value) => {
    setCurrentPage(1);
    setShowAllResults(false); // Reset show all results when filters change
    
    if (filterType === 'type') {
      // Clear current data when type changes
      setCurrentPageData([]);
      setTotalItems(0);
      setTotalPages(0);
      setFilters(prev => ({ ...prev, [filterType]: value }));
      // Fetch first page of new type
      fetchPageData(1, filters.search, value);
    } else {
      setFilters(prev => ({ ...prev, [filterType]: value }));
      // Refetch current page with new filters
      fetchPageData(1, filters.search, filters.type);
    }
  }, [fetchPageData, filters.search, filters.type]);

  // Handle scholarship filter (only one can be selected)
  const handleScholarshipChange = useCallback((option) => {
    setCurrentPage(1);
    setShowAllResults(false); // Reset show all results when filters change
    
    setFilters(prev => {
      const newFilters = {
        ...prev,
        scholarship: prev.scholarship.includes(option)
          ? [] // Remove if already selected
          : [option] // Only allow one selection
      };
      
      // Refetch with new filters immediately
      fetchPageData(1, newFilters.search, newFilters.type);
      
      return newFilters;
    });
  }, [fetchPageData]);

  // Handle qualification filter (support multiple selections)
  const handleQualificationChange = useCallback((option) => {
    setCurrentPage(1);
    setShowAllResults(false); // Reset show all results when filters change
    
    setFilters(prev => {
      const newFilters = {
        ...prev,
        qualifications: prev.qualifications.includes(option)
          ? prev.qualifications.filter(q => q !== option) // Remove if already selected
          : [...prev.qualifications, option] // Add to existing selections
      };
      
      // Refetch with new filters immediately
      fetchPageData(1, newFilters.search, newFilters.type);
      
      return newFilters;
    });
  }, [fetchPageData]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setCurrentPage(1);
    setShowAllResults(false); // Reset show all results when clearing filters
    setFilters({
      country: 'Select Country',
      scholarship: [],
      qualifications: [],
      search: '',
      type: filters.type // Keep the type filter
    });
    
    // Refetch with cleared filters
    fetchPageData(1, '', filters.type);
  }, [fetchPageData, filters.type]);

  // Clear specific filter
  const clearFilter = useCallback((filterType) => {
    setCurrentPage(1);
    setShowAllResults(false);
    
    if (filterType === 'type') {
      // Don't allow clearing type filter, reset to default
      setFilters(prev => ({ ...prev, type: 'university' }));
      fetchPageData(1, filters.search, 'university');
    } else {
      setFilters(prev => {
        const newFilters = { ...prev };
        if (filterType === 'country') {
          newFilters.country = 'Select Country';
        } else if (filterType === 'scholarship') {
          newFilters.scholarship = [];
        } else if (filterType === 'qualifications') {
          newFilters.qualifications = [];
        } else if (filterType === 'search') {
          newFilters.search = '';
        }
        return newFilters;
      });
      
      // Refetch with updated filters
      fetchPageData(1, filterType === 'search' ? '' : filters.search, filters.type);
    }
  }, [fetchPageData, filters.search, filters.type]);

  // Initial data fetch - only once on mount
  useEffect(() => {
    console.log('🔍 Initial data fetch');
    fetchPageData(1, '', filters.type);
  }, [fetchPageData, filters.type]); // Include required dependencies

  // Debounced filter change handler to prevent multiple API calls
  const debouncedFetch = useCallback(
    (page, search, type) => {
      console.log('🔍 Debounced fetch triggered');
      // Only fetch if the component is still mounted and filters haven't changed
      if (!requestInProgress) {
        fetchPageData(page, search, type);
      }
    },
    [fetchPageData, requestInProgress]
  );

  // Create debounced version of the fetch function
  const debouncedFetchWithDelay = useCallback(
    debounce(debouncedFetch, 500),
    [debouncedFetch]
  );

  // Handle filter changes with debouncing to prevent multiple API calls
  useEffect(() => {
    // Only refetch if we're on page 1 and have active filters
    if (currentPage === 1 && !requestInProgress) {
      console.log('🔍 Filter change detected, triggering debounced fetch');
      debouncedFetchWithDelay(1, filters.search, filters.type);
    }
    
    // Cleanup function to cancel pending debounced calls
    return () => {
      // This will be called when component unmounts or dependencies change
      console.log('🔍 Cleaning up debounced fetch');
    };
  }, [filters.country, filters.scholarship, filters.qualifications, debouncedFetchWithDelay, filters.search, filters.type, currentPage, requestInProgress]);

  // Debounce utility function with cleanup
  function debounce(func, wait) {
    let timeout;
    const debouncedFunc = function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
    
    // Add cleanup method
    debouncedFunc.cancel = () => {
      clearTimeout(timeout);
    };
    
    return debouncedFunc;
  }

  const scholarshipOptions = useMemo(() => [
    'With Scholarship',
    'Without Scholarship'
  ], []);

  // Type options for the type filter
  const typeOptions = useMemo(() => [
    { value: 'university', label: 'University' },
    { value: 'course', label: 'Course' },
    { value: 'article', label: 'Article' },
    { value: 'guide', label: 'Guide' }
  ], []);

  // Get current page items for display
  const currentPageItems = useMemo(() => {
    return currentPageData.map(item => {
      // Transform item based on type for consistent display
      if (item.hasOwnProperty('logo')) {
        return {
          ...item,
          type: 'university',
          label: 'University',
          imageSrc: item.logo?.trim() || '/assets/a2.png',
          title: item.name,
          name: item.name,
          subtitle: item.location || item.city || item.country || '',
          rawData: item
        };
      } else if (item.hasOwnProperty('university_id')) {
        return {
          ...item,
          type: 'course',
          label: 'Course',
          imageSrc: item.image?.trim() || '/assets/co2.png',
          title: item.name,
          name: item.name,
          subtitle: item.university_name ? `University: ${item.university_name}` : '',
          rawData: item
        };
      } else if (item.hasOwnProperty('guide_type')) {
        return {
          ...item,
          type: 'guide',
          label: 'Guide',
          imageSrc: item.image?.trim() || '/assets/logo1.png',
          title: item.title,
          name: item.title,
          subtitle: item.short_description || item.description?.slice(0, 100) || '',
          rawData: item
        };
      } else {
        return {
          ...item,
          type: 'article',
          label: 'Article',
          imageSrc: item.image?.trim() || '/assets/logo1.png',
          title: item.title,
          name: item.title,
          subtitle: item.short_description || item.description?.slice(0, 100) || '',
          rawData: item
        };
      }
    });
  }, [currentPageData]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filters.country !== 'Select Country' || 
           filters.scholarship.length > 0 || 
           filters.qualifications.length > 0 || 
           filters.search || 
           filters.type !== 'university';
  }, [filters]);

  // Get active filters for display
  const activeFilters = useMemo(() => {
    const active = [];
    
    if (filters.type !== 'university') {
      const typeOption = typeOptions.find(opt => opt.value === filters.type);
      active.push({
        key: 'type',
        label: 'Type',
        value: typeOption?.label || filters.type,
        displayValue: typeOption?.label || filters.type
      });
    }
    
    if (filters.country !== 'Select Country') {
      active.push({
        key: 'country',
        label: 'Country',
        value: filters.country,
        displayValue: filters.country
      });
    }
    
    if (filters.scholarship.length > 0) {
      active.push({
        key: 'scholarship',
        label: 'Scholarship',
        value: filters.scholarship[0],
        displayValue: filters.scholarship[0]
      });
    }
    
    if (filters.qualifications.length > 0) {
      active.push({
        key: 'qualifications',
        label: 'Qualifications',
        value: filters.qualifications,
        displayValue: filters.qualifications.join(', ')
      });
    }
    
    if (filters.search) {
      active.push({
        key: 'search',
        label: 'Search',
        value: filters.search,
        displayValue: `"${filters.search}"`
      });
    }
    
    return active;
  }, [filters, typeOptions]);

  // Fetch all results without pagination
  const fetchAllResults = useCallback(async () => {
    console.log('🔍 Fetching all results without pagination');
    setShowAllResults(true);
    setCurrentPage(1);
    await fetchPageData(1, filters.search, filters.type, true);
  }, [fetchPageData, filters.search, filters.type]);

  // Reset to pagination view
  const resetToPagination = useCallback(() => {
    setShowAllResults(false);
    fetchPageData(1, filters.search, filters.type);
  }, [fetchPageData, filters.search, filters.type]);

  // Return all the functions and state
  return {
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
    
    // Search
    handleSearch,
    
    // Filter utilities
    clearAllFilters,
    clearFilter,
    hasActiveFilters,
    activeFilters,
    
    // Type filter
    typeOptions,
    
    // Show all results
    showAllResults,
    fetchAllResults,
    resetToPagination,
    
    // Current page data
    currentPageData,
  };
}

export default useUniversitiessidebar;