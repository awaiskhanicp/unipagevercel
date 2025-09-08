'use client';

import React, { useState, useContext, createContext } from 'react';

// Create the context
const ArticleContext = createContext(undefined);

// Sample data
const initialArticles = [
  {
    id: 1,
    title: "How to Apply for Visa",
    slug: "how-to-apply-for-visa",
    category: "Visa",
    shortDescription: "Visa process explained...",
    views: 100,
    sortOrder: 1,
    description: "Visa process explained in detail...",
    schemaQuestion: "How do I apply for a visa?",
    schemaAnswer: "Submit your documents online.",
    rating: 4.5,
    date: "2024-01-01",
    authorName: "Admin",
    publisherName: "Portal",
    reviewName: "Student Review",
    reviewDescription: "Very helpful!",
    featuredImage: "/assets/default-article.png",
    popular: true,
    active: true,
    createdAt: "2024-01-01"
  },
  {
    id: 2,
    title: "Choosing the Right Course",
    slug: "choosing-the-right-course",
    category: "Education",
    shortDescription: "Course selection tips...",
    views: 50,
    sortOrder: 2,
    description: "Tips for choosing courses...",
    schemaQuestion: "How do I choose a course?",
    schemaAnswer: "Consider your interests.",
    rating: 4.0,
    date: "2024-01-02",
    authorName: "Editor",
    publisherName: "Portal",
    reviewName: "Parent Review",
    reviewDescription: "Great advice!",
    featuredImage: "/assets/default-article.png",
    popular: false,
    active: false,
    createdAt: "2024-01-02"
  }
];

const initialCategories = [
  {
    id: 1,
    name: "Visa",
    slug: "visa",
    description: "Visa related articles",
    isActive: true,
    createdAt: "2024-01-01"
  },
  {
    id: 2,
    name: "Education",
    slug: "education",
    description: "Education related articles",
    isActive: true,
    createdAt: "2024-01-02"
  }
];

// Provider component
export const ArticleProvider = ({ children }) => {
  const [articles, setArticles] = useState(initialArticles);
  const [categories, setCategories] = useState(initialCategories);

  const addArticle = (article) => {
    const newArticle = {
      ...article,
      id: articles.length ? articles[articles.length - 1].id + 1 : 1,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setArticles((prev) => [...prev, newArticle]);

    // Add category if it doesn't exist
    if (!categories.find((cat) => cat.name === article.category)) {
      addCategory(article.category);
    }
  };

  const addCategory = (name) => {
    const newCategory = {
      id: categories.length ? categories[categories.length - 1].id + 1 : 1,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      description: "",
      isActive: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  return (
    <ArticleContext.Provider value={{ articles, setArticles, categories, setCategories, addArticle, addCategory }}>
      {children}
    </ArticleContext.Provider>
  );
};

// Custom hook to use the context
export const useArticleContext = () => {
  const context = useContext(ArticleContext);
  if (!context) {
    throw new Error("useArticleContext must be used within ArticleProvider");
  }
  return context;
};
