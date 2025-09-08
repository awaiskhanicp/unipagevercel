'use client'
import React, { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [selectedCountry, setSelectedCountry] = useState('All Country');
  const [selectedType, setSelectedType] = useState('university');

  return (
    <SearchContext.Provider value={{ selectedCountry, setSelectedCountry, selectedType, setSelectedType }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}