'use client';

import { useState, useEffect } from 'react';
import UniversityCountryatom from '../atoms/UniversityCountryatom';
import Button from '../atoms/Button';
import Pagination from '../../admin/components/Pagination';

const COUNTRIES_PER_PAGE = 20;

const AllVisaDestination = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [countries, setCountries] = useState([]);
  const [allCountries, setAllCountries] = useState([]); // Store all countries for search
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch all countries for search functionality
  const fetchAllCountries = async () => {
    try {
      const response = await fetch('/api/internal/visa-country?limit=1000'); // Fetch all countries
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          const transformed = result.data.map((country) => ({
            id: country.id,
            name: country.country_name,
            flag: country.country_image || '/assets/default-flag.png',
            banner: country.banner_image,
            continent: country.continent,
            actual: `${country.currency} ${country.price}`,
            discounted: country.discount_price
              ? `${country.currency} ${country.discount_price}`
              : null,
            discount:
              country.price > 0 && country.discount_price > 0
                ? `${Math.round(
                    ((parseFloat(country.price) -
                      parseFloat(country.discount_price)) /
                      parseFloat(country.price)) *
                      100
                  )}% OFF`
                : null,
            slug: country.slug,
            visaTypes: country.visa_types,
            link: `/visit-visa/${country.slug}`,
          }));
          setAllCountries(transformed);
        }
      }
    } catch (err) {
      console.error('Error fetching all countries:', err);
    }
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/internal/visa-country?page=${currentPage}&limit=${COUNTRIES_PER_PAGE}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error('Invalid data format received');
        }

        const transformed = result.data.map((country) => ({
          id: country.id,
          name: country.country_name,
          flag: country.country_image || '/assets/default-flag.png',
          banner: country.banner_image,
          continent: country.continent,
          actual: `${country.currency} ${country.price}`,
          discounted: country.discount_price
            ? `${country.currency} ${country.discount_price}`
            : null,
          discount:
            country.price > 0 && country.discount_price > 0
              ? `${Math.round(
                  ((parseFloat(country.price) -
                    parseFloat(country.discount_price)) /
                    parseFloat(country.price)) *
                    100
                )}% OFF`
              : null,
          slug: country.slug,
          visaTypes: country.visa_types,
          link: `/visit-visa/${country.slug}`,
        }));

        setCountries(transformed);
        setTotalPages(result.pagination?.totalPages || 1);
        setTotalItems(result.pagination?.totalItems || transformed.length);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
    fetchAllCountries(); // Fetch all countries for search
  }, [currentPage]);

  // Filter countries based on search term from all countries
  const filteredCountries = searchTerm.trim() === '' 
    ? countries 
    : allCountries.filter(
        (country) =>
          country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          country.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Calculate pagination for search results
  const searchTotalPages = Math.ceil(filteredCountries.length / COUNTRIES_PER_PAGE);
  const searchTotalItems = filteredCountries.length;
  
  // Get current page data for search results
  const startIndex = (currentPage - 1) * COUNTRIES_PER_PAGE;
  const endIndex = startIndex + COUNTRIES_PER_PAGE;
  const currentPageCountries = searchTerm.trim() === '' 
    ? countries 
    : filteredCountries.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (searchTerm.trim() === '') {
      // Normal pagination
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
      }
    } else {
      // Search pagination
      if (newPage >= 1 && newPage <= searchTotalPages) {
        setCurrentPage(newPage);
      }
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="ml-2">Loading visa destinations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Error loading countries: {error}</div>
        <Button
          onClick={() => window.location.reload()}
          className="bg-[var(--brand-color)] text-white"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search + Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          All Visa Destinations
        </h1>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-[#0B6D76]"
          />
        </div>
      </div>

      {currentPageCountries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchTerm
              ? 'No matching destinations found'
              : 'No visa destinations available'}
          </p>
        </div>
      ) : (
        <>
          <UniversityCountryatom heading="Visa Destinations" data={currentPageCountries} />

          {/* Pagination for both normal and search results */}
          {((searchTerm.trim() === '' && totalPages > 1) || 
            (searchTerm.trim() !== '' && searchTotalPages > 1)) && (
            <Pagination
              currentPage={currentPage}
              totalPages={searchTerm.trim() === '' ? totalPages : searchTotalPages}
              onPageChange={handlePageChange}
              totalItems={searchTerm.trim() === '' ? totalItems : searchTotalItems}
              startIndex={startIndex}
              endIndex={Math.min(endIndex, searchTerm.trim() === '' ? totalItems : searchTotalItems)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AllVisaDestination;