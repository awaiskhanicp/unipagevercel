'use client';

import { useState, useEffect, useMemo } from 'react';
import ArticleCard from '../../components/molecules/ArticleCard';
import Button from '../../components/atoms/Button';
import Heading from '../../components/atoms/Heading';
import Container from '../../components/atoms/Container';
import Paragraph from '../../components/atoms/Paragraph';
import { IoSearch } from "react-icons/io5";
import Pagination from '../../admin/components/Pagination';
 

const ARTICLES_PER_PAGE = 6; // Changed to 6 as requested

const ArticlePage = () => {
  const [blogs, setBlogs] = useState([]);
  const [activeCategory, setActiveCategory] = useState({ id: 'All', name: 'All' });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch blogs with server-side pagination
  const fetchBlogs = async (page = 1, category = 'All', search = '') => {
    setLoading(true);
    try {
      // Build query parameters for pagination
      const params = new URLSearchParams({
        limit: ARTICLES_PER_PAGE.toString(),
        page: page.toString()
      });

      // Add category filter if not 'All'
      if (category.id !== 'All') {
        params.append('category', category.id);
      }

      // Add search query if provided
      if (search.trim()) {
        params.append('search', search.trim());
      }

      console.log('🚀 Fetching blogs with params:', params.toString());

      const res = await fetch(`/api/internal/blogs?${params.toString()}`);
      const data = await res.json();
      
      console.log('🔍 Fetched blogs:', {
        page,
        category,
        search,
        blogsCount: data.data?.length || 0,
        total: data.totalItems || 0,
        pagination: data.pagination,
        fullResponse: data,
        params: params.toString()
      });

      if (data && data.data) {
        setBlogs(data.data);
        
        // Try to get total from multiple possible sources
        let total = data.totalItems;
        
        // If totalItems is missing, try pagination object (this is where the API actually returns it)
        if (!total && data.pagination && data.pagination.totalItems) {
          total = data.pagination.totalItems;
          console.log('✅ Found totalItems in pagination object:', total);
        }
        
        // If still missing, try other fields
        if (!total && data.meta && data.meta.totalItems) {
          total = data.meta.totalItems;
        }
        
        // If still no total, try to get it from the response headers or use fallback
        if (!total) {
          console.warn('⚠️ No totalItems found in API response, using fallback');
          // Try to fetch total count separately
          try {
            const countRes = await fetch('/api/internal/blogs?limit=1&page=1');
            const countData = await countRes.json();
            total = countData.pagination?.totalItems || countData.totalItems || countData.data?.length || 0;
            console.log('🔍 Fallback total count:', total);
          } catch (countErr) {
            console.error('❌ Fallback count failed:', countErr);
            total = data.data.length; // Use current page count as fallback
          }
        }
        
        setTotalBlogs(total);
        setTotalPages(Math.ceil(total / ARTICLES_PER_PAGE));
        
        console.log('✅ Data processed:', {
          blogsLoaded: data.data.length,
          totalBlogs: total,
          totalPages: Math.ceil(total / ARTICLES_PER_PAGE),
          currentPage: page,
          apiResponse: data
        });
      } else {
        console.warn('⚠️ No data received from API');
        setBlogs([]);
        setTotalBlogs(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('❌ Error fetching blogs:', err);
      setBlogs([]);
      setTotalBlogs(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial load - only first page
  useEffect(() => {
    console.log('🚀 Initial load starting...');
    fetchBlogs(1, 'All', '');
    fetchCategories(); // Fetch all categories
  }, []);

  // Fetch all categories from the database
  const [categories, setCategories] = useState([{ id: 'All', name: 'All' }]);
  
  // Fetch all categories separately
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/internal/blog-categories');
      const data = await res.json();
      
      if (data && data.data) {
        const allCategories = [
          { id: 'All', name: 'All' },
          ...data.data.map(cat => ({ id: cat.id.toString(), name: cat.name }))
        ];
        setCategories(allCategories);
        console.log('✅ Fetched categories:', allCategories);
      }
    } catch (err) {
      console.error('❌ Error fetching categories:', err);
      // Fallback to extracting from current blogs
      const cats = [{ id: 'All', name: 'All' }];
      blogs.forEach(blog => {
        if (blog.category && blog.category.name) {
          cats.push({ id: blog.category.id.toString(), name: blog.category.name });
        }
      });
      setCategories(cats);
    }
  };

  // Reset to first page when filters change and fetch new data
  useEffect(() => {
    setCurrentPage(1);
    fetchBlogs(1, activeCategory, searchQuery);
  }, [activeCategory.id, searchQuery]);



  // Pagination logic - using server-side pagination
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  
  // Fallback calculation for totalPages if API doesn't return it
  const calculatedTotalPages = totalPages || Math.ceil((totalBlogs || blogs.length) / ARTICLES_PER_PAGE);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    console.log('🎯 Category changed to:', category);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchBlogs(page, activeCategory, searchQuery);
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative md:h-[64vh] sm:h-[70vh] h-[85vh] flex items-center md:pt-[0px] sm:pt-[80px] pt-[80px] justify-center overflow-hidden">
        <img
          src="/assets/art.png"
          alt="Hero Background"
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[rgba(0,0,0,0.1)] to-[rgba(0,0,0,0.9)]"></div>

        <div className="relative z-20 text-center px-4 pb-12 max-w-3xl w-full">
          <Heading level={1}>
            <div className="text-white">Search Here Blogs Articles</div>
          </Heading>
          <Paragraph>
            <p className="text-white max-w-2xl mx-auto leading-relaxed">
              Browse, explore, Request Information from Articles.
            </p>
          </Paragraph>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-[fadeIn_1s_ease-in_0.4s] mt-6">
              <div className="relative w-full sm:w-[540px] flex">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setCurrentPage(1);
                      fetchBlogs(1, activeCategory, e.target.value);
                    }
                  }}
                  className="w-full bg-[#0B6D76] rounded-tl-[30px] rounded-tr-[30px] rounded-bl-[30px] px-5 py-3 pr-12 text-sm text-white placeholder-white focus:outline-none shadow"
                />
                <button
                  onClick={() => {
                    setCurrentPage(1);
                    fetchBlogs(1, activeCategory, searchQuery);
                  }}
                  className="bg-[#0B6D76] hover:bg-[#0A5A62] text-white px-6 py-3 rounded-tr-[30px] rounded-br-[30px] transition-colors shadow"
                >
                  Search
                </button>
              </div>
            </div>
        </div>
      </section>

      {/* Articles Section */}
      <Container>
        <div className="banner-bottom-space bottom-session-space">
          <div className="flex flex-col justify-center items-center">
            <Heading level={3}>
              Latest <span className="text-[#0B6D76]">Articles</span>
            </Heading>

            {/* Category Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-6 mt-4">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => handleCategoryChange(category)}
                  className={`${
                    activeCategory.id === category.id
                      ? 'bg-[#0B6D76] text-white'
                      : 'bg-white text-yellow-600'
                  }`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Info Text */}
          <p className="text-sm text-gray-500 mb-4 text-center">
            Showing: {activeCategory.name} 
            {searchQuery ? ` for "${searchQuery}"` : ''}
            <br />
            <span className="text-blue-600 font-medium">
              Page {currentPage} of {totalPages} • 
              Showing {startIndex + 1}-{Math.min(endIndex, totalBlogs)} of {totalBlogs} articles
            </span>
          </p>

     

          {/* Article Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B6D76] mx-auto mb-2"></div>
                Loading page {currentPage}...
              </div>
            ) : blogs.length === 0 ? (
              <div className="col-span-3 text-center text-gray-400">
                <p className="text-lg mb-2">No articles found.</p>
                <p className="text-sm">Try adjusting your search or category filters.</p>
              </div>
            ) : (
              blogs.map((blog) => (
                <ArticleCard key={blog.id} article={blog} />
              ))
            )}
          </div>

                      {/* Simple Working Pagination */}
            <div className="mt-8 border-t pt-8">
          
            {/* Manual Refresh Button for Testing */}
            {/* Pagination Component */}
            {(calculatedTotalPages > 1 || totalBlogs > ARTICLES_PER_PAGE) ? (
              <div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={calculatedTotalPages}
                  onPageChange={handlePageChange}
                  totalItems={totalBlogs || blogs.length}
                  startIndex={startIndex}
                  endIndex={endIndex}
                />
              </div>
            ) : (
              <div className="text-center text-gray-500 bg-gray-50 p-4 rounded">
                <p className="font-medium">📝 Single Page</p>
                <p className="text-sm">All blogs fit on one page</p>
                <p className="text-xs mt-1 text-red-500">
                  If you have more than {ARTICLES_PER_PAGE} blogs, this might be a data fetching issue.
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ArticlePage;