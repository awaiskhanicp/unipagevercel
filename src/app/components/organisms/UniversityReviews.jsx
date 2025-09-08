'use client';

import { FaStar } from "react-icons/fa";
import Heading from '../atoms/Heading';
import { BsFillPersonFill } from "react-icons/bs";

const UniversityReviews = ({ university }) => {
  // Parse review data from university object
  const getReviews = () => {
    try {
      // Check if review_detail exists and is not empty
      if (!university?.review_detail) return [];
      
      // Handle both stringified JSON and direct object
      const reviewData = typeof university.review_detail === 'string' 
        ? JSON.parse(university.review_detail) 
        : university.review_detail;
      
      // Convert to array if it's a single review object
      return Array.isArray(reviewData) ? reviewData : [reviewData];
    } catch (error) {
      console.error('Error parsing reviews:', error);
      return [];
    }
  };

  const reviews = getReviews();

  // Calculate average rating - convert string ratings to numbers
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + (parseInt(review.rating) || 0), 0) / reviews.length) 
    : 0;

  return (
    <div className="bg-[#E7F1F2] p-[30px] rounded-lg shadow-md space-y-6">
      <Heading level={3}>Student Reviews</Heading>
      
      {/* Overall Rating */}
      <div className="flex items-center gap-4">
        <div className="text-4xl font-bold text-teal-700">{averageRating.toFixed(1)}</div>
        <div className="flex flex-col">
          <div className="flex text-teal-500">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={i < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"} />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-teal-100 p-2 rounded-full">
                  <BsFillPersonFill className="text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold">
                    {review.reviewerName || review.authorName || 'Anonymous'}
                  </p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i} 
                        className={`text-sm ${i < (parseInt(review.rating) || 0) ? "text-yellow-400" : "text-gray-300"}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mt-2">{review.reviewDescription}</p>
              {review.reviewDate && (
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(review.reviewDate).toLocaleDateString()}
                </p>
              )}
              {review.publisherName && (
                <p className="text-xs text-gray-500 mt-1">
                  Published by: {review.publisherName}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">No reviews available yet.</p>
          <p className="text-sm mt-2">Be the first to review this university!</p>
        </div>
      )}
    </div>
  );
};

export default UniversityReviews;




// 'use client';

// import { FaStar } from "react-icons/fa";
// import Heading from '../../../app/components/atoms/Heading';
// import { BsFillPersonFill } from "react-icons/bs";

// const UniversityReviews = ({ university }) => {
//   let reviews = [];
//   try {
//     reviews = university && university.review_detail ? (typeof university.review_detail === 'string' ? JSON.parse(university.review_detail) : university.review_detail) : [];
//   } catch {
//     reviews = [];
//   }
//   return (
//     <div className="bg-[#E7F1F2] p-[30px] rounded-lg shadow-md">
//       <Heading level={3}>Reviews</Heading>
//       {reviews.length > 0 ? (
//         reviews.map((review, idx) => (
//           <div key={idx} className="mb-4">
//             <div className="text-teal-500">★★★★★</div>
//             <p className="font-semibold">{review.reviewerName}</p>
//             <p>{review.reviewDescription}</p>
//             <p className="text-xs text-gray-500">{review.reviewDate}</p>
//           </div>
//         ))
//       ) : (
//         <p>No reviews available.</p>
//       )}
//     </div>
//   );
// };

// export default UniversityReviews; 