'use client';
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Pagination from '../components/Pagination';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage] = useState(5); // Show 5 notifications per page
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    fetchNotifications(currentPage);
  }, [currentPage, searchTerm, filterType, filterStatus]);

  const fetchNotifications = async (page) => {
    setLoading(true);
    try {
      let url = `/api/internal/notifications?page=${page}&limit=${itemsPerPage}`;
      
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (filterType) url += `&type=${encodeURIComponent(filterType)}`;
      if (filterStatus) url += `&status=${encodeURIComponent(filterStatus)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data || []);
        setTotalItems(data.pagination.totalItems);
        setTotalPages(data.pagination.totalPages);
        setSelectedNotifications(new Set()); // Reset selection when data changes
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0); // Scroll to top when page changes
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterStatus('');
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n.id)));
    }
  };

  const handleSelectNotification = (id) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifications(newSelected);
  };

  const handleBulkAction = async (action) => {
    if (selectedNotifications.size === 0) return;
    
    setBulkActionLoading(true);
    try {
      const response = await fetch('/api/internal/notifications/bulk-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds: Array.from(selectedNotifications),
          action: action
        }),
      });
      
      if (response.ok) {
        // Refresh the current page to show updated status
        await fetchNotifications(currentPage);
        setSelectedNotifications(new Set());
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Notifications</h1>
            <p className="text-gray-600 mt-2">
              Total: {totalItems.toLocaleString()} notifications • Page {currentPage} of {totalPages}
            </p>
          </div>
          <div className="flex items-center space-x-4">
          
            
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search by name, email, or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="account">Account</option>
                  <option value="application">Application</option>
                  <option value="payment">Payment</option>
                  <option value="system">System</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="0">Unread</option>
                  <option value="1">Read</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
            
            {(searchTerm || filterType || filterStatus) && (
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Active filters: {searchTerm && `Search: "${searchTerm}"`} {filterType && `Type: ${filterType}`} {filterStatus && `Status: ${filterStatus === '1' ? 'Read' : 'Unread'}`}
                </div>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                {selectedNotifications.size} notification{selectedNotifications.size !== 1 ? 's' : ''} selected
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('mark-read')}
                  disabled={bulkActionLoading}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {bulkActionLoading ? 'Processing...' : 'Mark as Read'}
                </button>
                <button
                  onClick={() => handleBulkAction('mark-unread')}
                  disabled={bulkActionLoading}
                  className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  {bulkActionLoading ? 'Processing...' : 'Mark as Unread'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-6 overflow-x-auto">
          {loading ? (
            <div className="text-center text-gray-500 text-lg py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No notifications found</div>
              <p className="text-gray-400 mt-2">
                {searchTerm || filterType || filterStatus ? 'Try adjusting your search criteria' : 'You\'re all caught up'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[800px] w-full">
                <thead className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.size === notifications.length && notifications.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Message</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Date/Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {notifications.map((n) => (
                    <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.has(n.id)}
                          onChange={() => handleSelectNotification(n.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">#{n.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[150px] truncate" title={n.name}>
                        {n.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate" title={n.email}>
                        {n.email || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          n.type === 'account' ? 'bg-blue-100 text-blue-800' :
                          n.type === 'application' ? 'bg-green-100 text-green-800' :
                          n.type === 'payment' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {n.type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-[250px]">
                        <div className="truncate" title={n.meta || n.message || '-'}>
                          {typeof n.meta === 'object' && n.meta !== null ? n.meta.message : n.meta || n.message || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          n.is_read ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {n.is_read ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDateTime(n.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            startIndex={((currentPage - 1) * itemsPerPage) + 1}
            endIndex={Math.min(currentPage * itemsPerPage, totalItems)}
          />
        )}
      </div>
    </Layout>
  );
};

function formatDateTime(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default Notifications;