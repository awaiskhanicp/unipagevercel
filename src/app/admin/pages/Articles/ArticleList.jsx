'use client';

import { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Pagination from '../../components/Pagination';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15;
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [popularFilter, setPopularFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  
  // Applied filters state (only updated when search button is clicked)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [appliedPopularFilter, setAppliedPopularFilter] = useState("");
  const [appliedActiveFilter, setAppliedActiveFilter] = useState("");
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const router = useRouter();

  const fetchArticles = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString()
      });
      
      if (appliedSearchTerm) {
        params.append('search', appliedSearchTerm);
      }
      if (appliedStartDate) {
        params.append('start_date', appliedStartDate);
      }
      if (appliedEndDate) {
        params.append('end_date', appliedEndDate);
      }
      if (appliedPopularFilter !== '') {
        params.append('popular', appliedPopularFilter);
      }
      if (appliedActiveFilter !== '') {
        params.append('active', appliedActiveFilter);
      }

      const apiUrl = `/api/internal/blogs?${params.toString()}`;
      console.log('🔍 Frontend: Fetching articles with params:', params.toString());
      console.log('🔍 Frontend: Full API URL:', apiUrl);

      const startTime = Date.now();
      const res = await fetch(apiUrl);
      const responseTime = Date.now() - startTime;
      
      console.log('🔍 Frontend: Response status:', res.status);
      console.log('🔍 Frontend: Response time:', `${responseTime}ms`);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Frontend: API response not ok:', res.status, errorText);
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      
      console.log('🔍 Frontend: Articles API response:', data);
      console.log('🔍 Frontend: Response size:', `${JSON.stringify(data).length} bytes`);
      
      if (data.success) {
        const articlesWithMeta = data.data?.map(article => ({
          ...article,
          enable_meta_tags: article.enable_meta_tags || false
        })) || [];
        
        setArticles(articlesWithMeta);
        
        // Debug log to see the actual data structure
        console.log('🔍 Frontend: First article data structure:', articlesWithMeta[0]);
        
        // Use pagination data from API response
        if (data.pagination) {
          setTotalItems(data.pagination.totalItems || articlesWithMeta.length);
          setTotalPages(data.pagination.totalPages || Math.ceil(articlesWithMeta.length / itemsPerPage));
        } else {
          // Fallback if pagination data is not available
          setTotalItems(articlesWithMeta.length);
          setTotalPages(Math.ceil(articlesWithMeta.length / itemsPerPage));
        }
        
        console.log('✅ Frontend: Successfully set articles data:', {
          articlesCount: articlesWithMeta.length,
          totalItems: data.pagination?.totalItems || articlesWithMeta.length,
          totalPages: data.pagination?.totalPages || Math.ceil(articlesWithMeta.length / itemsPerPage)
        });
      } else {
        console.warn('⚠️ Frontend: API returned success: false:', data);
        // Fallback to array format if available
        const items = Array.isArray(data) ? data : data.data;
        if (items) {
          const articlesWithMeta = items.map(article => ({
            ...article,
            enable_meta_tags: article.enable_meta_tags || false
          }));
          setArticles(articlesWithMeta);
          setTotalItems(articlesWithMeta.length);
          setTotalPages(Math.ceil(articlesWithMeta.length / itemsPerPage));
          console.log('✅ Frontend: Fallback to array format successful');
        } else {
          setArticles([]);
          setTotalItems(0);
          setTotalPages(1);
          console.warn('⚠️ Frontend: No data available, setting empty state');
        }
      }
    } catch (error) {
      console.error('❌ Frontend: Error fetching articles:', error);
      console.error('❌ Frontend: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setArticles([]);
      setTotalItems(0);
      setTotalPages(1);
      
      if (error.message.includes('API Error')) {
        console.error('❌ Frontend: API Error detected');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(currentPage);
  }, [currentPage, appliedSearchTerm, appliedStartDate, appliedEndDate, appliedPopularFilter, appliedActiveFilter]);

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedPopularFilter(popularFilter);
    setAppliedActiveFilter(activeFilter);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setPopularFilter('');
    setActiveFilter('');
    setAppliedSearchTerm('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setAppliedPopularFilter('');
    setAppliedActiveFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = appliedSearchTerm || appliedStartDate || appliedEndDate || appliedPopularFilter !== '' || appliedActiveFilter !== '';

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await fetch(`/api/internal/blogs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      
      setArticles(prev => prev.filter(article => article.id !== id));
      alert('Article deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete article');
    }
  };

  const togglePopularStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/internal/blogs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable_meta_tags: !currentStatus })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Update failed');
      }

      setArticles(prev => prev.map(article => 
        article.id === id 
          ? { ...article, enable_meta_tags: !currentStatus } 
          : article
      ));
    } catch (err) {
      console.error('Toggle error:', err);
      alert(err.message || 'Error updating status');
    }
  };

  const handleEdit = (id) => {
    router.push(`/admin/articles/edit/${id}`);
  };

  const fetchComments = async (articleId) => {
    setCommentLoading(true);
    setSelectedArticleId(articleId);
    try {
      const res = await fetch('/api/internal/comments');
      const data = await res.json();
      if (data.success) {
        const filtered = data.data.filter(c => c.article_id === articleId);
        setComments(filtered);
      }
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedArticleId(null);
    setComments([]);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + articles.length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Article List</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage and organize your articles</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              🔍 Filters {hasActiveFilters && `(${hasActiveFilters})`}
            </button>
            <button
              onClick={() => router.push('/admin/articles/add')}
              className="px-4 py-2 bg-gradient-to-b from-[#0B6D76] to-[#094F56] text-white rounded-md"
            >
              Create New Article
            </button>
          </div>
        </div>

        {/* Filter Section */}
        {isFilterOpen && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Articles</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by title, content..."
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Popular</label>
                <select
                  value={popularFilter}
                  onChange={(e) => setPopularFilter(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All</option>
                  <option value="true">Popular</option>
                  <option value="false">Not Popular</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
                <button 
                  onClick={handleSearch} 
                  className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 flex items-center gap-2"
                >
                  🔍 Search
                </button>
                <button 
                  onClick={clearFilters} 
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(appliedSearchTerm || appliedStartDate || appliedEndDate || appliedPopularFilter !== '' || appliedActiveFilter !== '') && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Active filters: 
                  {appliedSearchTerm && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">Search: "{appliedSearchTerm}"</span>}
                  {appliedStartDate && <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded">From: {formatDate(appliedStartDate)}</span>}
                  {appliedEndDate && <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded">To: {formatDate(appliedEndDate)}</span>}
                  {appliedPopularFilter !== '' && <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded">Popular: {appliedPopularFilter === 'true' ? 'Yes' : 'No'}</span>}
                  {appliedActiveFilter !== '' && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">Active: {appliedActiveFilter === 'true' ? 'Yes' : 'No'}</span>}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Image</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Title</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Author</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Popular</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Active</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Created At</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Comments</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500 text-lg">
                    Loading...
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500 text-lg">
                    {hasActiveFilters ? 'No articles found matching your filters.' : 'No articles found'}
                  </td>
                </tr>
              ) : (
                articles.map((article) => {
                  const imageUrl = article.image?.startsWith('http') 
                    ? article.image 
                    : article.image?.startsWith('/') 
                      ? `${API_BASE_URL}${article.image}` 
                      : null;

                  return (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={article.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">{article.title}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {article.user_id ? `User ID: ${article.user_id}` : 'No Author'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!article.enable_meta_tags}
                            onChange={() => togglePopularStatus(article.id, article.enable_meta_tags)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {article.enable_meta_tags ? 'Yes' : 'No'}
                          </span>
                        </label>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-semibold ${article.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {article.is_active ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {article.created_at ? formatDate(article.created_at) : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => fetchComments(article.id)}
                          className="px-3 py-1 bg-gradient-to-b from-[#0B6D76] to-[#094F56] text-white text-sm rounded"
                        >
                          View Comments
                        </button>
                      </td>
                      <td className="py-3 px-4 flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(article.id)}
                          className="p-2 text-blue-600 hover:bg-gray-100 rounded-full"
                          title="Edit"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="p-2 text-red-600 hover:bg-gray-100 rounded-full"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Component */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        )}
        
        {/* Results Summary */}
        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} articles
          {hasActiveFilters && ' (filtered results)'}
        </div>
      </div>

      {selectedArticleId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Comments for Article #{selectedArticleId}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-black text-2xl">&times;</button>
            </div>
            {commentLoading ? (
              <p>Loading comments...</p>
            ) : comments.length === 0 ? (
              <p>No comments found.</p>
            ) : (
              <ul className="space-y-4">
                {comments.map((comment) => (
                  <li key={comment.id} className="border-b pb-2">
                    <p className="text-sm text-gray-700">
                      <strong>{comment.first_name} {comment.last_name}</strong> ({comment.email})
                    </p>
                    <p className="text-gray-600 text-sm mt-1">{comment.comment}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}