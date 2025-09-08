"use client";

import { useState, useEffect } from "react";
import { Eye, Trash2, Check, X } from "lucide-react";
import Pagination from '../../components/Pagination';
import Swal from 'sweetalert2';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // '' | 'active' | 'inactive'
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Applied filters state (only updated when search button is clicked)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch students when page changes or applied filters change
  useEffect(() => {
    fetchStudents();
  }, [currentPage, appliedSearchTerm, appliedStatusFilter, appliedStartDate, appliedEndDate]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });
      
      if (appliedSearchTerm) {
        params.append('search', appliedSearchTerm);
      }
      if (appliedStatusFilter) {
        params.append('status', appliedStatusFilter);
      }
      if (appliedStartDate) {
        params.append('start_date', appliedStartDate);
      }
      if (appliedEndDate) {
        params.append('end_date', appliedEndDate);
      }

      const res = await fetch(`/api/internal/students?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      
      if (data.success) {
        setStudents(data.data || []);
        setTotalItems(data.meta?.totalItems || 0);
        setTotalPages(data.meta?.totalPages || 1);
      } else {
        setStudents([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setStudents([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStatusFilter(statusFilter);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setAppliedSearchTerm('');
    setAppliedStatusFilter('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setCurrentPage(1);
  };

  const hasActiveFilters = appliedSearchTerm || appliedStatusFilter || appliedStartDate || appliedEndDate;

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

  const toggleStudentStatus = async (id) => {
    try {
      const currentStudent = students.find(s => s.id === id);
      const newStatus = !currentStudent.is_active;
      
      const res = await fetch(`/api/internal/students`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: newStatus }),
      });
      
      if (!res.ok) throw new Error("Failed to update status");
      
      // Refresh the current page data instead of updating locally
      fetchStudents();
      
      Swal.fire({
        icon: 'success',
        title: 'Status Updated!',
        text: `Student ${newStatus ? 'activated' : 'deactivated'} successfully.`,
        confirmButtonColor: '#0B6D76',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error("Status update error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed!',
        text: 'Failed to update student status.',
        confirmButtonColor: '#0B6D76',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        const res = await fetch(`/api/internal/students/${id}`, {
          method: "DELETE",
        });
        
        if (!res.ok) throw new Error("Failed to delete student");
        
        // Refresh the current page data instead of filtering locally
        fetchStudents();
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Student has been deleted successfully.',
          confirmButtonColor: '#0B6D76',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed!',
        text: 'Failed to delete student.',
        confirmButtonColor: '#0B6D76',
        confirmButtonText: 'OK'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600 border-b-2"></div>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + students.length;

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-cyan-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Students</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage student records</p>
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            🔍 Filters {hasActiveFilters && `(${hasActiveFilters})`}
          </button>
        </div>

        {/* Filter Section */}
        {isFilterOpen && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Students</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by name, email, or phone..."
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
              <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
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
            {(appliedSearchTerm || appliedStatusFilter || appliedStartDate || appliedEndDate) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Active filters: 
                  {appliedSearchTerm && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">Search: "{appliedSearchTerm}"</span>}
                  {appliedStatusFilter && <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded">Status: {appliedStatusFilter === 'active' ? 'Active' : 'Inactive'}</span>}
                  {appliedStartDate && <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded">From: {formatDate(appliedStartDate)}</span>}
                  {appliedEndDate && <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded">To: {formatDate(appliedEndDate)}</span>}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 rounded-l-xl">Name</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Phone</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Status</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Created At</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600 rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-500">
                    {hasActiveFilters ? 'No students found matching your filters.' : 'No students found.'}
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800">{student.name}</td>
                    <td className="py-3 px-4 text-gray-600">{student.email}</td>
                    <td className="py-3 px-4 text-gray-600">{student.phone}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          student.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {student.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{formatDate(student.created_at)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStudentStatus(student.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            student.is_active
                              ? "text-red-600 hover:bg-red-100"
                              : "text-green-600 hover:bg-green-100"
                          }`}
                          title={student.is_active ? "Deactivate" : "Activate"}
                        >
                          {student.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      {/* Student Details Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-lg font-semibold mb-4">Student Details</h2>
            
            <div className="space-y-2 text-gray-700 text-sm">
              <p><strong>Name:</strong> {selectedStudent.name}</p>
              <p><strong>Email:</strong> {selectedStudent.email}</p>
              <p><strong>Phone:</strong> {selectedStudent.phone || 'N/A'}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 text-xs rounded-full font-semibold ${
                  selectedStudent.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {selectedStudent.is_active ? "Active" : "Inactive"}
                </span>
              </p>
              <p><strong>User Type:</strong> {selectedStudent.userType || 'N/A'}</p>
              <p><strong>Created:</strong> {formatDate(selectedStudent.created_at)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;