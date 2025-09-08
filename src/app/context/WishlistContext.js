'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

const WishlistContext = createContext();

// Helper to generate consistent wishlist key
function getWishlistKey(item) {
  if (!item) return '';
  if (item.label === 'Course' || item.course_id) {
    return `course-${item.id || item.course_id}`;
  }
  if (item.label === 'University' || item.university_id) {
    return `university-${item.id || item.university_id}`;
  }
  return '';
}

export function WishlistProvider({ children }) {
  const { data: session } = useSession();
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist from localStorage or API - only when explicitly called
  const fetchWishlist = useCallback(async () => {
    if (session && session.user) {
      // Sync localStorage to DB on login
      const local = localStorage.getItem('wishlist');
      if (local) {
        const items = JSON.parse(local);
        if (items.length > 0) {
          await fetch('/api/internal/wishlist', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: items.map(i => ({
                course_id: i.label === 'Course' ? i.id : undefined,
                university_id: i.label === 'University' ? i.id : undefined,
              })),
            }),
          });
          localStorage.removeItem('wishlist');
        }
      }
      // Fetch from API
      try {
        const res = await fetch('/api/internal/wishlist');
        const data = await res.json();
        if (Array.isArray(data.wishlist)) {
          setWishlist(data.wishlist.map(item => ({
            ...item,
            key: item.course_id ? `course-${item.course_id}` : `university-${item.university_id}`,
            label: item.course_id ? 'Course' : 'University',
            title: item.course?.name || item.university?.name || item.title || item.name,
            image: item.course?.image || item.university?.logo || '/assets/university_icon.png',
            subtitle: item.course?.university_name || item.university?.location || '',
            id: item.course_id || item.university_id,
            slug: item.course?.slug || item.university?.slug || '',
          })));
        }
      } catch {
        setWishlist([]);
      }
    } else {
      // Guest: use localStorage
      const stored = localStorage.getItem('wishlist');
      setWishlist(stored ? JSON.parse(stored) : []);
    }
  }, [session]);

  // Only load wishlist on specific pages that need it
  useEffect(() => {
    const pathname = window.location.pathname;
    const wishlistRelatedPages = ['/wishlist', '/comparison', '/institutions', '/courses', '/'];
    
    if (wishlistRelatedPages.some(page => pathname.startsWith(page))) {
      console.log('🔍 WishlistContext: Loading wishlist for page:', pathname);
      fetchWishlist();
    } else {
      console.log('🔍 WishlistContext: Skipping wishlist load for page:', pathname);
    }
  }, [session, fetchWishlist]);

  // Add to wishlist
  const addToWishlist = useCallback(async (item) => {
    const key = getWishlistKey(item);
    if (session && session.user) {
      // API add
      await fetch('/api/internal/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: item.label === 'Course' ? item.id : undefined,
          university_id: item.label === 'University' ? item.id : undefined,
        }),
      });
      setWishlist((prev) => [...prev, { ...item, key }]);
    } else {
      // LocalStorage add
      const updated = [...wishlist, { ...item, key }];
      setWishlist(updated);
      localStorage.setItem('wishlist', JSON.stringify(updated));
    }
  }, [session, wishlist]);

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (item) => {
    const key = getWishlistKey(item);
    if (session && session.user) {
      await fetch('/api/internal/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: item.label === 'Course' ? item.id : undefined,
          university_id: item.label === 'University' ? item.id : undefined,
        }),
      });
      setWishlist((prev) => prev.filter(w => w.key !== key));
    } else {
      const updated = wishlist.filter(w => w.key !== key);
      setWishlist(updated);
      localStorage.setItem('wishlist', JSON.stringify(updated));
    }
  }, [session, wishlist]);

  // Toggle wishlist
  const toggleWishlist = (item) => {
    if (isWishlisted(item)) {
      removeFromWishlist(item);
    } else {
      addToWishlist(item);
    }
  };

  // Check if item is wishlisted
  const isWishlisted = (item) => {
    const key = getWishlistKey(item);
    return wishlist.some(w => w.key === key);
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isWishlisted,
      fetchWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}