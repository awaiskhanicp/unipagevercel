'use client';
import React, { useState, useEffect, useRef } from 'react';
import Button from '../atoms/Button';
import Container from '../atoms/Container';
import { useRouter } from 'next/navigation';
import { useSearch } from '../../context/SearchContext';

const SearchBar = () => {
  const [type, setType] = useState('university');
  const [country, setCountry] = useState('All Country');
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [countries, setCountries] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false); // 🔹 Loading state add kiya

  const router = useRouter();
  const inputRef = useRef(null);

  const { selectedCountry, setSelectedCountry, selectedType, setSelectedType } = useSearch();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('/api/internal/countries');
        if (!res.ok) throw new Error('Failed to fetch countries');
        const data = await res.json();
        // Fix: Extract countries from the correct response structure
        if (data.success && data.data) {
          setCountries(data.data);
        } else {
          setCountries([]);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
        setCountries([]);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    setCountry(selectedCountry);
  }, [selectedCountry]);

  useEffect(() => {
    setType(selectedType);
  }, [selectedType]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!search.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(
          `/api/internal/search-suggestions?q=${encodeURIComponent(search)}&type=${type}&country=${country}`
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
        setActiveIndex(-1);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [search, type, country]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (isLoading) return; // Prevent multiple clicks

    setIsLoading(true); // 🔹 Loading start
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (country && country !== 'All Country') params.append('country', country);
    if (search) params.append('q', search);

    router.push(`/search?${params.toString()}`);
  };

  const handleSuggestionClick = (value) => {
    setSearch(value);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        setSearch(suggestions[activeIndex]);
        setShowSuggestions(false);
        e.preventDefault();
      }
    }
  };

  const isFormValid = type !== 'university' || country !== 'All Country' || search.trim() !== '';

  return (
    <Container>
      <div className="bg-[#eaf3f5] rounded-[50px] py-6 px-6 flex justify-center">
        <form onSubmit={handleSearch} className="w-[90%] flex items-center gap-5">
          {/* Type Dropdown */}
          <div className="w-[90%]">
            <label className="block text-lg text-gray-500 mb-2">Search For</label>
            <select
              className="w-full border-2 border-gray-300 bg-transparent focus:outline-none py-4 px-4 rounded-full text-sm text-gray-700"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setSelectedType(e.target.value);
              }}
            >
              <option value="university">Universities</option>
              <option value="course">Courses</option>
              <option value="country">Countries</option>
            </select>
          </div>

          {/* Country Dropdown */}
          <div className="w-[90%]">
            <label className="block text-lg text-gray-500 mb-2">Select Country</label>
            <select
              className="w-full border-2 border-gray-300 bg-transparent focus:outline-none py-4 px-4 rounded-full text-sm text-gray-700"
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setSelectedCountry(e.target.value);
              }}
            >
              <option value="All Country">All Countries</option>
              {Array.isArray(countries) && countries.map((countryItem, index) => (
                <option key={index} value={countryItem.country}>
                  {countryItem.country}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="w-[90%] relative">
            <label className="block text-lg text-gray-500 mb-2">Search</label>
            <input
              type="text"
              ref={inputRef}
              placeholder="Search University, Course, or Country"
              className="w-full border-2 border-gray-300 bg-transparent focus:outline-none py-4 px-4 rounded-full text-sm text-gray-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border rounded shadow-md max-h-60 overflow-y-auto">
                {suggestions.map((item, index) => (
                  <li
                    key={index}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm ${
                      index === activeIndex ? 'bg-gray-100' : ''
                    }`}
                    onMouseDown={() => handleSuggestionClick(item)}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Search Button */}
          <div className="w-[90%] mt-8">
            <Button 
              type="submit" 
              className="w-full"
              disabled={!isFormValid || isLoading} // 🔹 Button disable on loading
            >
              {isLoading ? 'Searching...' : 'Search now'}
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
};

export default SearchBar;





// 'use client';
// import React, { useState } from 'react';
// import Button from '../atoms/Button';
// import Container from '../atoms/Container';
// import { useRouter } from 'next/navigation';

// const SearchBar = () => {
//   const [type, setType] = useState('university');
//   const [country, setCountry] = useState('All Country');
//   const [search, setSearch] = useState('');
//   const router = useRouter();

//   const handleSearch = (e) => {
//     e.preventDefault();
//     // Build query string
//     const params = new URLSearchParams();
//     if (type) params.append('type', type);
//     if (country && country !== 'All Country') params.append('country', country);
//     if (search) params.append('q', search);
//     router.push(`/search?${params.toString()}`);
//   };

//   return (
//     <div className="bg-[#eaf3f5] py-6 ">
//       <Container>
//         <form onSubmit={handleSearch} className=" mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-6">
//           {/* Search For Dropdown */}
//           <select
//             className="w-full md:w-1/4 border-b-2 border-gray-300 bg-transparent focus:outline-none py-2 text-sm text-gray-700"
//             value={type}
//             onChange={e => setType(e.target.value)}
//           >
//             <option value="university">Universities</option>
//             <option value="course">Courses</option>
//           </select>
//           {/* Select Country Dropdown */}
//           <select
//             className="w-full md:w-1/4 border-b-2 border-gray-300 bg-transparent focus:outline-none py-2 text-sm text-gray-700"
//             value={country}
//             onChange={e => setCountry(e.target.value)}
//           >
//             <option>All Country</option>
//             <option>United Kingdom</option>
//             <option>USA</option>
//             <option>Canada</option>
//           </select>
//           {/* Search Text Input */}
//           <input
//             type="text"
//             placeholder="Search University and course"
//             className="w-full md:w-1/4 border-b-2 border-gray-300 bg-transparent focus:outline-none py-2 text-sm text-gray-700"
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//           />
//           {/* Search Button */}
//           <div className="w-full md:w-fit">
//             <Button type="submit">Search now</Button>
//           </div>
//         </form>
//       </Container>
//     </div>
//   );
// };

// export default SearchBar;