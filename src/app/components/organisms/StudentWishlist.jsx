'use client';

import React, { useEffect, useState } from 'react';
import Heading from '../atoms/Heading';
import { useSession } from 'next-auth/react';
import { useWishlist } from '../../context/WishlistContext';
import Link from 'next/link';
import Image from 'next/image';

const StudentWishlist = () => {
  const { data: session } = useSession();
  const { wishlist, removeFromWishlist } = useWishlist();

  // Removed loadWishlist as we're using the context's wishlist

  // Remove the local wishlist state and loadWishlist effect
  // as we'll use the wishlist from the context

  const handleRemove = async (item) => {
    try {
      await removeFromWishlist(item);
      // No need to call loadWishlist() here because the context's state update will trigger a re-render
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const getItemLink = (item) => {
    if (item.course_id && item.course) {
      return `/courses/${item.course_id}`;
    } else if (item.university_id && item.university) {
      return `/university/${item.university.slug || item.slug}`;
    } else if (item.slug) {
      return `/university/${item.slug}`;
    }
    return '/';
  };

  const getItemImage = (item) => {
    if (item.course_id && item.course) {
      return item.image || '/assets/default-course.png';
    } else if (item.university_id && item.university) {
      return item.university.logo || item.image || '/assets/default-university.png';
    }
    return item.image || '/assets/default-image.png';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return isNaN(date) ? '—' : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return isNaN(date) ? '—' : date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '—';
    }
  };

  const getItemDetails = (item) => {
    const isCourse = !!item.course_id;
    const university = item.university || (item.course?.university_id ? { 
      name: item.course?.university?.name || 'Unknown University',
      slug: item.course?.university?.slug || '',
      logo: item.course?.university?.logo || null
    } : null);

    return {
      id: item.id || item.course_id || item.university_id,
      name: isCourse 
        ? item.course?.name || item.title || 'Unnamed Course'
        : item.university?.name || item.title || 'Unnamed University',
      type: item.label || (isCourse ? 'Course' : 'University'),
      deadline: isCourse ? item.course?.deadline : null,
      startingDate: isCourse ? item.course?.starting_date : null,
      university,
      isCourse,
      fee: isCourse ? item.course?.yearly_fee : null,
      duration: isCourse ? `${item.course?.duration_qty} ${item.course?.duration_type}` : null,
      addedAt: item.created_at // This was missing in your original code
    };
  };

  return (
    <div className="flex justify-center px-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="text-center md:text-left">
            <Heading level={5}>My Wishlist</Heading>
            <div className="text-gray-600 text-sm">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in wishlist
            </div>
          </div>
          {session?.user?.first_name && (
            <div className="text-sm text-gray-500">
              Welcome back, {session.user.first_name}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full w-full text-sm md:text-base border border-gray-200">
            <thead className="bg-[#0B6D76] text-white">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left">Item</th>
                <th className="px-4 sm:px-6 py-3 text-left">Type</th>
                <th className="px-4 sm:px-6 py-3 text-left">University</th>
                <th className="px-4 sm:px-6 py-3 text-left">Details</th>
                <th className="px-4 sm:px-6 py-3 text-left">Added</th>
                <th className="px-4 sm:px-6 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {wishlist.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    Your wishlist is empty. Start adding courses or universities!
                  </td>
                </tr>
              ) : (
                wishlist.map((item) => {
                  const details = getItemDetails(item);
                  
                  return (
                    <tr key={details.id} className="border-t hover:bg-gray-50 even:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4">
                        <Link href={getItemLink(item)} className="flex items-center gap-3">
                          <div className="relative w-10 h-10 flex-shrink-0">
                            <Image
                              src={getItemImage(item)}
                              alt={details.name}
                              fill
                              className="object-contain"
                              onError={(e) => {
                                e.target.src = details.isCourse 
                                  ? '/assets/default-course.png'
                                  : '/assets/default-university.png';
                              }}
                            />
                          </div>
                          <span className="text-blue-600 hover:underline">
                            {details.name}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          details.isCourse 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {details.type}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        {details.university ? (
                          <div className="flex items-center gap-2">
                            {details.university.logo && (
                              <div className="relative w-8 h-8">
                                <Image
                                  src={details.university.logo}
                                  alt={details.university.name}
                                  fill
                                  className="object-contain"
                                  onError={(e) => {
                                    e.target.src = '/assets/default-university.png';
                                  }}
                                />
                              </div>
                            )}
                            <Link href={`/university/${details.university.slug}`}>
                              <span className="text-gray-700 hover:underline">
                                {details.university.name}
                              </span>
                            </Link>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex flex-col text-sm">
                          {details.isCourse && details.fee && (
                            <span>${details.fee.toLocaleString()}/year</span>
                          )}
                          {details.isCourse && details.duration && (
                            <span>{details.duration}</span>
                          )}
                          {details.deadline && (
                            <span className="text-red-600">
                              Deadline: {formatDate(details.deadline)}
                            </span>
                          )}
                          {!details.isCourse && details.university && (
                            <span className="text-gray-600">
                              {details.university.city}, {details.university.country}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">
                        {formatDateTime(details.addedAt)}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <button
                          onClick={() => handleRemove(item)}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 text-xs sm:text-sm transition-colors"
                          aria-label={`Remove ${details.name} from wishlist`}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentWishlist;