"use client";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, startIndex, endIndex }) => {
  // Function to render page numbers with ellipsis
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Maximum visible page numbers

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    // Adjust start and end for better display
    if (currentPage <= 3) {
      end = Math.min(totalPages, maxVisible);
    }
    if (currentPage >= totalPages - 2) {
      start = Math.max(1, totalPages - (maxVisible - 1));
    }

    // Add first page if not in range
    if (start > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => {
            console.log('Clicking page 1');
            onPageChange(1);
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors font-medium"
        >
          1
        </button>
      );
      if (start > 2) {
        pages.push(
          <span key="start-ellipsis" className="px-2 text-gray-400">
            ...
          </span>
        );
      }
    }

    // Add visible page numbers
    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => {
            console.log('Clicking page:', i);
            onPageChange(i);
          }}
          className={`w-10 h-10 flex items-center justify-center rounded-full font-medium transition-all duration-200 ${
            i === currentPage
              ? "bg-[#0B6D76] text-white shadow-lg scale-105"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
          }`}
        >
          {i}
        </button>
      );
    }

    // Add last page if not in range
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="px-2 text-gray-400">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => {
            console.log('Clicking last page:', totalPages);
            onPageChange(totalPages);
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors font-medium"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      {/* Results info */}
      <div className="text-sm text-gray-600 font-medium">
        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1 bg-white shadow-lg rounded-full px-6 py-3 border border-gray-100">
        {/* Previous button */}
        <button
          onClick={() => {
            console.log('Clicking Previous, going to page:', currentPage - 1);
            onPageChange(currentPage - 1);
          }}
          disabled={currentPage === 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
            currentPage === 1
              ? "text-gray-400 cursor-not-allowed opacity-50"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-2">
          {renderPageNumbers()}
        </div>

        {/* Next button */}
        <button
          onClick={() => {
            console.log('Clicking Next, going to page:', currentPage + 1);
            onPageChange(currentPage + 1);
          }}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
            currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed opacity-50"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
