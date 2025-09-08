"use client";
import React, { useState, useContext, createContext } from "react";

const initialGuides = [
  // Add initial guide objects if needed
];

const GuideListContext = createContext({
  guides: [],
  setGuides: () => {},
  addGuide: () => {},
});

export const GuideListProvider = ({ children }) => {
  const [guides, setGuides] = useState(initialGuides);

  const addGuide = (guide) => {
    const newGuide = {
      ...guide,
      id: guides.length ? guides[guides.length - 1].id + 1 : 1,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setGuides((prev) => [...prev, newGuide]);
  };

  return (
    <GuideListContext.Provider value={{ guides, setGuides, addGuide }}>
      {children}
    </GuideListContext.Provider>
  );
};

export const useGuideList = () => useContext(GuideListContext);
