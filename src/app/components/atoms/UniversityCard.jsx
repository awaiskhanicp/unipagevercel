'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Heading from '../../components/atoms/Heading';

const UniversityCard = ({ name, logo, image, className = '', style, slug, id }) => {
  const [imgSrc, setImgSrc] = useState(
    logo || image ? getFullImageUrl(logo || image) : '/assets/university_icon.png'
  );

  function getFullImageUrl(path) {
    // Agar path already http se start hota hai
    if (path?.startsWith('http')) return path;
    // Otherwise, backend ka base URL add karo
    return `${process.env.NEXT_PUBLIC_BASE_URL || ''}${path}`;
  }

  const cardContent = (
    <div className={`text-center group cursor-pointer ${className}`} style={style}>
      {/* Image */}
      <div className="w-[240px] h-[240px] mx-auto mb-4 rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 bg-white p-2 flex items-center justify-center">
        <Image
          src={imgSrc}
          alt={name}
          width={240}
          height={240}
          className="w-full h-full object-contain"
          onError={() => setImgSrc('/assets/university_icon.png')}
          unoptimized={imgSrc.startsWith('http')}
        />
      </div>
      {/* Name */}
      <Heading level={4}>{name}</Heading>
    </div>
  );

  if (slug) {
    return <Link href={`/university/${slug}`}>{cardContent}</Link>;
  }

  if (id) {
    return <Link href={`/university/${id}`}>{cardContent}</Link>;
  }

  return cardContent;
};

export default UniversityCard;




// 'use client';

// import Image from 'next/image';
// import Link from 'next/link';
// import Heading from '../../components/atoms/Heading';

// const UniversityCard = ({ name, logo, className = '', style, slug, id }) => {
//   const validLogo = logo && typeof logo === 'string' && logo.trim() !== '' 
//     ? logo 
//     : '/assets/university_icon.png';

//   const cardContent = (
//     <div className={`text-center group cursor-pointer ${className}`} style={style}>
//       <div className="w-[240px] h-[240px] mx-auto mb-4 rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 bg-white p-4 flex items-center justify-center">
//         <Image 
//           src={validLogo} 
//           alt={name}
//           width={240}
//           height={240}
//           className="w-full h-full object-contain"
//           onError={(e) => {
//             e.target.src = '/assets/university_icon.png';
//           }}
//         />
//       </div>
//       <Heading level={4} className="text-lg font-semibold">{name}</Heading>
//     </div>
//   );

//   if (id && slug) {
//     return (
//       <Link href={`/university/${id}-${slug}`}>
//         {cardContent}
//       </Link>
//     );
//   }

//   if (id) {
//     return (
//       <Link href={`/university/${id}`}>
//         {cardContent}
//       </Link>
//     );
//   }

//   return cardContent;
// };

// export default UniversityCard;