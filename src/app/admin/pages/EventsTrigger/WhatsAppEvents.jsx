"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Check, XCircle } from "lucide-react";
import Pagination from "../../components/Pagination";

const WhatsAppEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter states (input)
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Applied filter states
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    type: "",
    action_button: "",
    page_hit_name: "",
    whatsapp_button_text: "",
  });

  const itemsPerPage = 15;

  // Fetch web events
  const fetchEvents = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(appliedSearchTerm && { search: appliedSearchTerm }),
        ...(appliedStartDate && { startDate: appliedStartDate }),
        ...(appliedEndDate && { endDate: appliedEndDate }),
      });

      console.log('🔍 Frontend: Fetching events with params:', params.toString());
      const response = await fetch(`/api/internal/web-events?${params}`);
      console.log('🔍 Frontend: Response status:', response.status);
      
      if (!response.ok) throw new Error("Failed to fetch events");
      
      const data = await response.json();
      console.log('🔍 Frontend: API response:', data);
      
      if (data.success) {
        setEvents(data.data);
        setTotalPages(data.meta.totalPages);
        setTotalItems(data.meta.totalCount);
        setCurrentPage(data.meta.page);
      } else {
        console.error("API Error:", data.message);
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(currentPage);
  }, [currentPage, appliedSearchTerm, appliedStartDate, appliedEndDate]);

  // Handle search button click
  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setAppliedSearchTerm("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setCurrentPage(1);
  };

  // Check if there are active filters
  const hasActiveFilters = appliedSearchTerm || appliedStartDate || appliedEndDate;

  // Add new event
  const handleAddEvent = async () => {
    try {
      const response = await fetch("/api/internal/web-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to add event");
      
      const data = await response.json();
      if (data.success) {
        alert("Event added successfully!");
        setIsModalOpen(false);
        setFormData({ type: "", action_button: "", page_hit_name: "", whatsapp_button_text: "" });
        fetchEvents(currentPage);
      }
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Failed to add event");
    }
  };

  // Start editing
  const startEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      type: event.type,
      action_button: event.action_button,
      page_hit_name: event.page_hit_name,
      whatsapp_button_text: event.whatsapp_button_text,
    });
  };

  // Save edit
  const saveEdit = async () => {
    try {
      const response = await fetch(`/api/internal/web-events/${editingEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update event");
      
      const data = await response.json();
      if (data.success) {
        alert("Event updated successfully!");
        setEditingEvent(null);
        setFormData({ type: "", action_button: "", page_hit_name: "", whatsapp_button_text: "" });
        fetchEvents(currentPage);
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event");
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingEvent(null);
    setFormData({ type: "", action_button: "", page_hit_name: "", whatsapp_button_text: "" });
  };

  // Delete event
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`/api/internal/web-events/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete event");
      
      const data = await response.json();
      if (data.success) {
        alert("Event deleted successfully!");
        fetchEvents(currentPage);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event");
    }
  };

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800">WhatsApp Button Events</h1>
            <p className="text-gray-600 mt-2">Manage web events and button interactions</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isFilterOpen 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              🔍 Filters {hasActiveFilters && `(${hasActiveFilters ? 1 : 0})`}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>
          </div>
        </div>

        {/* Filter Section */}
        {isFilterOpen && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Events</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by type, action button, page name..."
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
            </div>
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                🔍 Search
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear Filters
              </button>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Active Filters:</h4>
                <div className="flex flex-wrap gap-2">
                  {appliedSearchTerm && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Search: {appliedSearchTerm}
                    </span>
                  )}
                  {appliedStartDate && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      From: {new Date(appliedStartDate).toLocaleDateString()}
                    </span>
                  )}
                  {appliedEndDate && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      To: {new Date(appliedEndDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Modal */}
        {(isModalOpen || editingEvent) && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingEvent(null);
                  setFormData({ type: "", action_button: "", page_hit_name: "", whatsapp_button_text: "" });
                }}
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-semibold mb-4 text-center">
                {editingEvent ? "Edit Event" : "Add New Event"}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Event Type</label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="e.g., Page Visit, Button Click"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Action Button</label>
                  <input
                    type="text"
                    value={formData.action_button}
                    onChange={(e) => setFormData({ ...formData, action_button: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="e.g., WhatsApp, Contact"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Page Hit Name</label>
                  <input
                    type="text"
                    value={formData.page_hit_name}
                    onChange={(e) => setFormData({ ...formData, page_hit_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="e.g., Home Page, About Page"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">WhatsApp Button Text</label>
                  <input
                    type="text"
                    value={formData.whatsapp_button_text}
                    onChange={(e) => setFormData({ ...formData, whatsapp_button_text: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="e.g., Chat on WhatsApp"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                {editingEvent ? (
                  <>
                    <button
                      onClick={saveEdit}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAddEvent}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Event
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Events Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Loading events...</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 rounded-l-xl">Event Type</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Action Button</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Page Hit Name</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">WhatsApp Button Text</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Created At</th>
                      <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600 rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-800">{event.type}</td>
                        <td className="py-3 px-4 text-gray-600">{event.action_button}</td>
                        <td className="py-3 px-4 text-gray-600">{event.page_hit_name}</td>
                        <td className="py-3 px-4 text-gray-600">{event.whatsapp_button_text}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(event.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center space-x-2">
                          <button
                            onClick={() => startEdit(event)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {events.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {hasActiveFilters ? 'No events found matching your filters.' : 'No events found.'}
                  </p>
                  <p className="text-gray-400 mt-2">
                    {hasActiveFilters ? 'Try adjusting your filters or clear them to see all events.' : 'Try adding a new event.'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
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
    </div>
  );
};

export default WhatsAppEvents;