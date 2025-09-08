"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../../../admin/components/Pagination";

const InboxComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState(""); // ✅ search input
  const [appliedSearch, setAppliedSearch] = useState(""); // ✅ only applied when button clicked
  const itemsPerPage = 10;

  useEffect(() => {
    fetchComplaints();
  }, [currentPage, appliedSearch]); // ✅ refetch only on page change or when search is applied

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/internal/complaints?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(appliedSearch)}`
      );
      if (res.data.success) {
        setComplaints(res.data.data);
        setTotalItems(res.data.meta?.totalItems || res.data.data.length);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
    setLoading(false);
  };

  const handleSearchClick = () => {
    setCurrentPage(1); // ✅ reset to first page
    setAppliedSearch(search); // ✅ apply search only when button is clicked
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Inbox Complaints</h1>

      {/* ✅ Search input + button */}
      <div className="mb-4 flex gap-2 items-center">
        <input
          type="text"
          placeholder="Search complaints..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-72 px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-[#0B6D76] focus:outline-none"
        />
        <button
          onClick={handleSearchClick}
          className="px-4 py-2 bg-[#0B6D76] text-white rounded-xl shadow hover:bg-[#095a61] transition"
        >
          Search
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">#</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Complaint</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {complaints.map((msg, index) => (
                <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-600">{startIndex + index + 1}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">{msg.name}</td>
                  <td className="py-3 px-4 text-gray-600">{msg.email}</td>
                  <td className="py-3 px-4 text-gray-600">{msg.subject}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading...</p>
          </div>
        )}
        {!loading && complaints.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No complaints found.</p>
          </div>
        )}

        {!loading && complaints.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        )}
      </div>
    </div>
  );
};

export default InboxComplaints;
