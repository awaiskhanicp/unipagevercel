"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Check, X, ChevronDown, ChevronUp, Reply } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import Link from "next/link";
import Pagination from '../../components/Pagination';

const CommentList = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [replies, setReplies] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});
  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [articleId, setArticleId] = useState("");
  
  // Applied filters state (only updated when search button is clicked)
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("all");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");
  const [appliedArticleId, setAppliedArticleId] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Reset to first page when applied filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearch, appliedStatus, appliedFromDate, appliedToDate, appliedArticleId]);

  useEffect(() => {
    fetchComments();
  }, [currentPage, appliedSearch, appliedStatus, appliedFromDate, appliedToDate, appliedArticleId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = { 
        page: currentPage, 
        limit: itemsPerPage,
        status: appliedStatus
      };
      if (appliedSearch) params.search = appliedSearch;
      if (appliedFromDate) params.from_date = appliedFromDate;
      if (appliedToDate) params.to_date = appliedToDate;
      if (appliedArticleId) params.article_id = appliedArticleId;
      
      console.log('=== FRONTEND DEBUG ===');
      console.log('Sending params:', params);
      console.log('Applied search:', appliedSearch);
      console.log('Applied status:', appliedStatus);
      
      const res = await axios.get("/api/internal/comments", { params });
      if (res.data.success) {
        const repliesState = {};
        res.data.data.forEach(comment => {
          repliesState[comment.comment_id] = [];
        });
        setReplies(repliesState);
        setComments(res.data.data);
        setTotalItems(res.data.meta?.totalItems || 0);
        setTotalPages(res.data.meta?.totalPages || 1);
        
        console.log('API response:', {
          success: res.data.success,
          totalItems: res.data.meta?.totalItems,
          returnedCount: res.data.data.length,
          currentPage: res.data.meta?.currentPage
        });
      } else {
        toast.error("Failed to fetch comments");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (commentId) => {
    try {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
      const res = await axios.get(`/api/internal/replies?parent_comment_id=${commentId}`);
      if (res.data.success) {
        setReplies((prev) => ({ 
          ...prev, 
          [commentId]: res.data.data 
        }));
      } else {
        toast.error("Failed to fetch replies");
      }
    } catch (error) {
      console.error("Fetch replies error:", error);
      toast.error("Failed to load replies");
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));

    if (!replies[commentId]?.length && !loadingReplies[commentId]) {
      fetchReplies(commentId);
    }
  };

const handleDelete = async () => {
  try {
    // First delete all replies for this comment (if any)
    if (replies[deleteId]?.length > 0) {
      await Promise.all(
        replies[deleteId].map(reply => 
          axios.delete(`/api/internal/replies/${reply.reply_id}`)
        )
      );
    }
    
    // Then delete the comment itself
    await axios.delete(`/api/internal/comments/${deleteId}`);
    
    // Refresh the current page data instead of filtering locally
    fetchComments();
    toast.success("Comment and its replies deleted successfully!");
  } catch (error) {
    console.error("Delete error:", error);
    toast.error("Failed to delete comment");
  } finally {
    setShowConfirm(false);
    setDeleteId(null);
  }
};

  const handleApproveToggle = async (commentId) => {
    try {
      const currentComment = comments.find(c => c.comment_id === commentId);
      const newStatus = currentComment.status === "1" ? "0" : "1";
      
      await axios.patch(`/api/internal/comments/${commentId}`, { 
        status: newStatus 
      });
      
      // Update the comment in local state
      setComments(prev => 
        prev.map(comment => 
          comment.comment_id === commentId 
            ? { ...comment, status: newStatus }
            : comment
        )
      );
      
      toast.success(`Comment ${newStatus === "1" ? "1" : "set to pending"}`);
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Failed to update comment status");
    }
  };

  const handleApproveReplyToggle = async (replyId, commentId) => {
    try {
      const currentReplies = replies[commentId];
      const currentReply = currentReplies.find(r => r.reply_id === replyId);
      const newStatus = currentReply.status === "1" ? "0" : "1";
      
      await axios.patch(`/api/internal/replies/${replyId}`, { 
        status: newStatus 
      });
      
      setReplies(prev => ({
        ...prev,
        [commentId]: prev[commentId].map(reply => 
          reply.reply_id === replyId 
            ? { ...reply, status: newStatus }
            : reply
        )
      }));
      
      toast.success(`Reply ${newStatus === "1" ? "1" : "set to pending"}`);
    } catch (error) {
      console.error("Reply approval error:", error);
      toast.error("Failed to update reply status");
    }
  };

  // Reset to first page when filters change
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'search') setSearch(value);
    else if (filterType === 'status') setStatus(value);
    else if (filterType === 'fromDate') setFromDate(value);
    else if (filterType === 'toDate') setToDate(value);
    else if (filterType === 'articleId') setArticleId(value);
    
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = () => {
    setAppliedSearch(search);
    setAppliedStatus(status);
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setAppliedArticleId(articleId);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setFromDate('');
    setToDate('');
    setArticleId('');
    setAppliedSearch('');
    setAppliedStatus('all');
    setAppliedFromDate('');
    setAppliedToDate('');
    setAppliedArticleId('');
    setCurrentPage(1);
  };

  const hasActiveFilters = appliedSearch || appliedStatus !== 'all' || appliedFromDate || appliedToDate || appliedArticleId;

  // Compute visible range based on server pagination
  const startIndex = (currentPage - 1) * itemsPerPage + (comments.length ? 1 : 0);
  const endIndex = startIndex + comments.length - (comments.length ? 0 : 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600 border-b-2"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Article Comments</h1>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            isFilterOpen 
              ? 'bg-[#0B6D76] text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🔍 Filters
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-1 bg-white text-[#0B6D76] text-xs rounded-full">
              {[appliedSearch, appliedStatus !== 'all' ? appliedStatus : '', appliedFromDate, appliedToDate, appliedArticleId].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>
      
      {/* Filter Section */}
      {isFilterOpen && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Comments</label>
              <input
                type="text"
                placeholder="Search by name, email, comment, or URL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="1">Approved</option>
                <option value="0">Pending</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Article ID</label>
              <input
                type="text"
                placeholder="Filter by specific article ID..."
                value={articleId}
                onChange={(e) => setArticleId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-[#0B6D76] text-white rounded-lg hover:bg-[#094F56] transition-colors flex items-center gap-2"
              >
                🔍 Search
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
            
            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="text-sm text-gray-600">
                Active filters: 
                {appliedSearch && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">Search: "{appliedSearch}"</span>}
                {appliedStatus !== 'all' && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">Status: {appliedStatus}</span>}
                {appliedFromDate && <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded">From: {appliedFromDate}</span>}
                {appliedToDate && <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded">To: {appliedToDate}</span>}
                {appliedArticleId && <span className="ml-2 px-2 py-1 bg-pink-100 text-pink-800 rounded">Article ID: {appliedArticleId}</span>}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {comments.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full">
                <thead className="sticky top-0 bg-gray-100 z-10">
                  <tr>
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-left">Comment</th>
                    <th className="py-3 px-4 text-left">Article</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((comment) => (
                    <React.Fragment key={comment.comment_id}>
                      <tr className="border-b">
                        <td className="py-3 px-4">{comment.first_name} {comment.last_name}</td>
                        <td className="py-3 px-4">{comment.email}</td>
                        <td className="py-3 px-4">{comment.comment}</td>
                        <td className="py-3 px-4">
                          {comment.article_url && (
                            <Link 
                              href={comment.article_url} 
                              target="_blank" 
                              className="text-blue-600 hover:underline"
                            >
                              View Article
                            </Link>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                            comment.status === "1" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {comment.status === "1" ? "Approved" : "Pending"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => handleApproveToggle(comment.comment_id)}
                              className={`p-1 rounded ${
                                comment.status === "1" 
                                  ? "text-red-500 hover:bg-red-50" 
                                  : "text-green-500 hover:bg-green-50"
                              }`}
                            >
                              {comment.status === "1" ? <X size={16} /> : <Check size={16} />}
                            </button>
                            <button 
                              onClick={() => { 
                                setDeleteId(comment.comment_id); 
                                setShowConfirm(true); 
                              }}
                              className="p-1 rounded text-red-500 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </button>
                            <button 
                              onClick={() => toggleReplies(comment.comment_id)}
                              className="p-1 rounded text-blue-500 hover:bg-blue-50"
                            >
                              {expandedComments[comment.comment_id] ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedComments[comment.comment_id] && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 bg-gray-50">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Reply size={16} />
                                <span>
                                  Replies ({replies[comment.comment_id]?.length || 0})
                                </span>
                              </div>
                              
                              {loadingReplies[comment.comment_id] ? (
                                <div className="flex justify-center py-4">
                                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-600 border-b-2"></div>
                                </div>
                              ) : replies[comment.comment_id]?.length > 0 ? (
                                <div className="space-y-3 pl-6">
                                  {replies[comment.comment_id].map((reply) => (
                                    <div 
                                      key={reply.reply_id} 
                                      className="border-l-2 border-gray-200 pl-4 py-2"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="font-medium">
                                            {reply.first_name} {reply.last_name}
                                          </p>
                                          <p className="text-sm text-gray-600 mt-1">
                                            {reply.comment}
                                          </p>
                                          <span className={`inline-block mt-1 text-xs font-semibold px-2 py-1 rounded-full ${
                                            reply.status === "1" 
                                              ? "bg-green-100 text-green-800" 
                                              : "bg-yellow-100 text-yellow-800"
                                          }`}>
                                            {reply.status === "1" ? "Approved" : "Not Approved"}
                                          </span>
                                        </div>
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => handleApproveReplyToggle(reply.reply_id, comment.comment_id)}
                                            className={`p-1 rounded ${
                                              reply.status === "1" 
                                                ? "text-red-500 hover:bg-red-50" 
                                                : "text-green-500 hover:bg-green-50"
                                            }`}
                                          >
                                            {reply.status === "1" ? <X size={14} /> : <Check size={14} />}
                                          </button>
                                          <button
                                            onClick={() => handleDeleteReply(reply.reply_id, comment.comment_id)}
                                            className="p-1 rounded text-red-500 hover:bg-red-100"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 pl-6">
                                  No replies found for this comment.
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

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
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 text-lg">
              {hasActiveFilters ? 'No comments found matching your filters.' : 'No comments available.'}
            </div>
            <p className="text-gray-400 mt-2">
              {hasActiveFilters ? 'Try adjusting your search criteria or clear filters' : 'No comments have been submitted yet'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-[#0B6D76] text-white rounded-lg hover:bg-[#094F56] transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
            <h2 className="text-lg font-semibold mb-2">Delete Comment?</h2>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete the comment and all its replies. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentList;