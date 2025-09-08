'use client';

import { FaHeart, FaTrashAlt } from 'react-icons/fa';
import Button from '../../components/atoms/Button';
import Heading from '../../components/atoms/Heading';
import Container from '../../components/atoms/Container';
import { useWishlist } from '../../context/WishlistContext';
import Link from 'next/link';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();

  // Function to determine the link path based on item type
  const getItemLink = (item) => {
  console.log(item, "whishlist")

    if (item.id) {
      // Course detail page (by ID)
      return `/courses/${item.id}`;
    } else if (item.university_slug) {
      // University detail page (by slug)
      return `/university/${item.university_slug}`;
    } else if (item.slug) {
      // Fallback slug field
      return `/university/${item.slug}`;
    }
    return '/';
  };

  return (
    <Container className="py-12">
      <Heading
        level={2}
        className="mb-10 text-3xl font-bold text-center text-gray-800"
      >
        ❤️ My Wishlist
      </Heading>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <FaHeart className="text-gray-300 text-6xl mb-4" />
          <p className="text-gray-500 text-lg">Your wishlist is empty.</p>
          <p className="text-gray-400 text-sm mt-1">
            Start adding your favorite courses or universities!
          </p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => (
            <div
              key={item.key}
              className="group bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 overflow-hidden"
            >
              {/* Image & heart icon */}
              <Link href={getItemLink(item)}>
                <div className="relative overflow-hidden cursor-pointer">
                  <img
                    src={item.image}
                    alt={item.title || item.name}
                    className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = '/assets/university_icon.png';
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow">
                    <FaHeart className="text-red-500" />
                  </div>
                </div>
              </Link>

              {/* Card body */}
              <div className="p-5">
                <Link href={getItemLink(item)}>
                  <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                    {item.title || item.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 mt-1">
                  {item.label || (item.course_id ? 'Course' : 'University')}
                </p>
                {item.subtitle && (
                  <p className="text-gray-400 text-sm mt-1">{item.subtitle}</p>
                )}

                {/* Remove button */}
                <Button
                  className="w-full mt-5 bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center gap-2"
                  onClick={() => removeFromWishlist(item)}
                >
                  <FaTrashAlt /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

export default Wishlist;
