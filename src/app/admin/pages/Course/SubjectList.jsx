


"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Check, XCircle } from "lucide-react";
import Pagination from "../../components/Pagination";

const SubjectList = () => {
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [editSubjectId, setEditSubjectId] = useState(null);
  const [editSubjectName, setEditSubjectName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(""); // Only applied when search button is clicked
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch subjects when page changes or applied search term changes
  useEffect(() => {
    fetchSubjects();
  }, [currentPage, appliedSearchTerm]);

  // Fetch subjects
  const fetchSubjects = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString()
      });
      
      if (appliedSearchTerm) {
        params.append('search', appliedSearchTerm);
      }

      console.log('🔍 Fetching subjects with params:', params.toString());
      console.log('🔍 Applied search term:', appliedSearchTerm);

      const res = await fetch(`/api/internal/subject?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      console.log('🔍 Subject API response:', data);
      
      if (data.success) {
        setSubjects(data.data || []);
        setTotalItems(data.meta?.totalItems || 0);
        setTotalPages(data.meta?.totalPages || 1);
        
        console.log('🔍 Subjects loaded:', {
          count: data.data?.length || 0,
          totalItems: data.meta?.totalItems || 0,
          totalPages: data.meta?.totalPages || 1,
          searchTerm: appliedSearchTerm
        });
      } else {
        const subjectsArray = Array.isArray(data) ? data : data.data || [];
        setSubjects(subjectsArray);
        setTotalItems(subjectsArray.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Add subject
  const handleAddSubject = async () => {
    const name = newSubjectName.trim();
    if (!name) return;

    try {
      const res = await fetch("/api/internal/subject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon: null }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Failed to add subject");
        return;
      }
      // Refresh list to ensure we show the latest added item
      await fetchSubjects(currentPage);
      setNewSubjectName("");
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Error adding subject");
    }
  };

  // Delete subject
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;

    try {
      const res = await fetch(`/api/internal/subject/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete subject");
      
      // Refresh the current page data instead of filtering locally
      fetchSubjects(currentPage);
    } catch (error) {
      console.error(error);
      alert("Error deleting subject");
    }
  };

  // Edit functions
  const startEdit = (subject) => {
    setEditSubjectId(subject.id);
    setEditSubjectName(subject.name);
  };

  const cancelEdit = () => {
    setEditSubjectId(null);
    setEditSubjectName("");
  };

  const saveEdit = async (id) => {
    const name = editSubjectName.trim();
    if (!name) return alert("Subject name cannot be empty");

    try {
      const res = await fetch(`/api/internal/subject/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon: null }),
      });
      if (!res.ok) throw new Error("Failed to update subject");
      const updated = await res.json();

      // Refresh the current page data instead of updating locally
      fetchSubjects(currentPage);
      setEditSubjectId(null);
      setEditSubjectName("");
    } catch (error) {
      console.error(error);
      alert("Error updating subject");
    }
  };

  // Handle search button click
  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setAppliedSearchTerm("");
    setCurrentPage(1);
  };

  // Reset to first page when search term changes
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    // Don't reset page here - only when search button is clicked
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + subjects.length;

  return (
    <div className="p-6 bg-gradient-to-br from-green-50 to-teal-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Subjects</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage subject records</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Subject
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 sm:px-5 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 sm:py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              🔍 Search
            </button>
            {appliedSearchTerm && (
              <button
                onClick={clearSearch}
                className="px-4 py-2 sm:py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          
          {/* Active Search Display */}
          {appliedSearchTerm && (
            <div className="text-sm text-gray-600 bg-green-100 px-3 py-2 rounded-lg">
              <span className="font-medium">Active search:</span> "{appliedSearchTerm}"
              <span className="ml-2 text-xs text-gray-500">
                (Found {subjects.length} results)
              </span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 rounded-l-xl">Subject Name</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600 rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="2" className="py-6 text-center text-gray-500">Loading...</td>
                </tr>
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan="2" className="py-6 text-center text-gray-500">
                    {appliedSearchTerm ? `No subjects found matching "${appliedSearchTerm}".` : 'No subjects found.'}
                  </td>
                </tr>
              ) : (
                subjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      {editSubjectId === subject.id ? (
                        <input
                          type="text"
                          value={editSubjectName}
                          onChange={(e) => setEditSubjectName(e.target.value)}
                          className="w-full border px-3 py-2 rounded"
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium text-gray-800">{subject.name}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {editSubjectId === subject.id ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => saveEdit(subject.id)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => startEdit(subject)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(subject.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
      </div>

      {/* Add Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-lg font-semibold mb-4">Add New Subject</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject Name</label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Enter subject name"
                  className="w-full border px-3 py-2 rounded"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubject}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectList;