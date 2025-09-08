'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from '../../components/Pagination';

const LevelEducationList = () => {
  const [levelEducations, setLevelEducations] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const router = useRouter();
  
  const itemsPerPage = 5; // Show 5 items per page

  useEffect(() => {
    fetchLevels();
  }, []);

  // Reset to first page when data changes
  useEffect(() => {
    if (levelEducations.length > 0) {
      setCurrentPage(1);
    }
  }, [levelEducations.length]);

  const fetchLevels = async () => {
    try {
      const res = await fetch('/api/internal/add_post_level');
      const data = await res.json();
      if (data.success) {
        setLevelEducations(data.data);
        setTotalItems(data.data.length);
        setTotalPages(Math.ceil(data.data.length / itemsPerPage));
      } else {
        setLevelEducations([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err) {
      setLevelEducations([]);
      setTotalItems(0);
      setTotalPages(1);
    }
  };

  const openEditModal = (edu) => {
    setEditData({ ...edu });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditData(null);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/internal/add_post_level/${editData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (data.success) {
        closeEditModal();
        setCurrentPage(1); // Reset to first page
        fetchLevels();
        alert('✅ Level updated successfully');
      } else {
        alert('❌ Failed to update: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
    setLoading(false);
  };

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return levelEducations.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Level of Education</h1>
            {levelEducations.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Total: {totalItems} levels • Page {currentPage} of {totalPages}
              </p>
            )}
          </div>
          <button
            onClick={() => router.push('/admin/level-education/add')}
            className="bg-[#0B6D76] text-white px-4 py-2 rounded-lg hover:bg-[#095a62] transition-colors"
          >
            Add Level
          </button>
        </div>

        {/* ✅ Scrollable Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B6D76]"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : (
          <table className="w-full min-w-[900px] text-left">
            <thead className="sticky top-0 bg-gray-100 text-gray-700 z-10">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Font Awesome</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Is Featured</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {getCurrentPageItems().map((edu) => (
                <tr key={edu.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{edu.title}</td>
                  <td className="px-4 py-3">{edu.fontAwesome}</td>
                  <td className="px-4 py-3">{edu.is_active === 1 ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">
                    <label className="inline-flex items-center cursor-pointer relative">
                      <input
                        type="checkbox"
                        checked={edu.is_featured === 1}
                        readOnly
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 relative">
                        <div
                          className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-all ${
                            edu.is_featured === 1 ? 'translate-x-full' : ''
                          }`}
                        />
                      </div>
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    {edu.created_at ? edu.created_at.split('T')[0] : ''}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        className="text-blue-600"
                        onClick={() => openEditModal(edu)}
                      >
                        ✏️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {levelEducations.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-lg">
            No level education records found.
          </div>
        )}

        {/* Pagination */}
        {levelEducations.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            startIndex={(currentPage - 1) * itemsPerPage}
            endIndex={Math.min(currentPage * itemsPerPage, totalItems)}
          />
        )}
      </div>

      {/* ✅ Edit Modal with Transparent Blur Background */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={closeEditModal}
              disabled={loading}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Edit Level of Education</h2>
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div>
                <label className="block mb-1 font-medium">Post Title *</label>
                <input
                  name="title"
                  required
                  value={editData.title}
                  onChange={handleEditChange}
                  className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Font Awesome Icon *</label>
                <input
                  name="fontAwesome"
                  required
                  value={editData.fontAwesome}
                  onChange={handleEditChange}
                  className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={editData.is_active === 1}
                    onChange={handleEditChange}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={editData.is_featured === 1}
                    onChange={handleEditChange}
                  />
                  Is Featured
                </label>
              </div>
              <button
                type="submit"
                className="bg-[#0B6D76] text-white px-6 py-2 rounded transition"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelEducationList;
