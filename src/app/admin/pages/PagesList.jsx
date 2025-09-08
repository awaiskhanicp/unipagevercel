"use client";
import React, { useState } from "react";
import { Pencil } from "lucide-react";
import Pagination from '../components/Pagination';

const initialPages = [
  { id: 1, title: "About Us", url: "/about-us", createdAt: "2024-01-10" },
  { id: 2, title: "Privacy Policy", url: "/privacy-policy", createdAt: "2024-02-15" },
  { id: 3, title: "Terms & Conditions", url: "/terms", createdAt: "2024-03-05" },
];

const PagesList = () => {
  const [pages, setPages] = useState(initialPages);
  const [selectedPage, setSelectedPage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;
  const totalItems = pages.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPages = pages.slice(startIndex, endIndex);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Pages List</h1>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Horizontal Scrollbar Added */}
        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 rounded-l-xl">Page Title</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">URL</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Created At</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600 rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedPages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-800">{page.title}</td>
                  <td className="py-3 px-4 text-blue-500 hover:underline">
                    <a href={page.url} target="_blank" rel="noopener noreferrer">
                      {page.url}
                    </a>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{page.createdAt}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedPage(page);
                        setShowModal(true);
                      }}
                      className="p-2 rounded hover:bg-gray-100"
                      title="Edit Page"
                    >
                      <Pencil className="w-5 h-5 text-blue-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
        />

        {pages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No pages found.</p>
          </div>
        )}
      </div>

      {/* Custom Modal */}
      {showModal && selectedPage && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-4 text-gray-600 hover:text-black text-2xl font-bold"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">Edit Page</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Title:</strong> {selectedPage.title}</p>
              <p><strong>URL:</strong> {selectedPage.url}</p>
              <p><strong>Created:</strong> {selectedPage.createdAt}</p>
              <p className="text-gray-500">Edit functionality can be implemented here.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagesList;
