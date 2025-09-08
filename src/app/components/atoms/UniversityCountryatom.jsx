'use client';
import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import Heading from '../atoms/Heading';
import Link from 'next/link';
import 'swiper/css';
import Image from 'next/image';

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

const UniversityCountryatom = ({
  data = [],
  heading = 'Search By Country',
  viewType = 'grid', // 'grid' or 'swiper'
  columns = 4,
  limit = 0,
  imageSize = { width: 40, height: 30 },
  cardPadding = 'px-4 py-2',
  cardRounded = 'rounded-full',
  imageRounded = 'rounded',
  showDiscountBadge = false,
  showBottomSpace = true,
  customBottomSpaceClass = '',
  linkType = 'visit-visa-detail',
  autoplay = false,
}) => {
  const [selectedContinent, setSelectedContinent] = useState("All");

  console.log(data,"kasao ho ")
  // Define grid columns mapping
  const gridCols = {
    1: 'grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
  }[columns] || 'lg:grid-cols-4';

  // Get unique continents from data
  const availableContinents = Array.from(
    new Set(data.map(item => item.continent))
  ).filter(Boolean);


  // Add "All" option with count
  const continentOptions = [
    { 
      name: "All", 
    },

    ...availableContinents.map(continent => ({
      name: continent,
      count: data.filter(item => item.continent === continent).length
    }))
  ];

  // Filter data by continent
  const filteredData = selectedContinent === 'All' 
    ? data 
    : data.filter(item => item.continent === selectedContinent);

  const limitedData = limit > 0 ? filteredData.slice(0, limit) : filteredData;
  const bottomSpaceClass = showBottomSpace
    ? customBottomSpaceClass || 'mb-10'
    : '';

  const renderUniversityCard = (university, index) => {
    const universityName = university.name
      ? university.name.replace(/\s*\([^)]*\)/, '').trim()
      : '';
    const slug = slugify(universityName) + '-visit-visa';
    const cleanName = universityName.replace(/\s*\([^)]*\)/, '').trim();
    const searchUrl = `/search?type=university&country=${encodeURIComponent(cleanName)}`;

    return (
      <Link
        key={index}
        href={linkType === 'search' ? searchUrl : `/visit-visa-detail/${slug}`}
        className="block"
      >
        <div
          className={`${cardRounded} shadow-sm bg-white ${cardPadding} transition-all cursor-pointer flex items-center gap-3 border border-gray-300 group hover:shadow-md w-50`}
        >
          {/* University Image/Logo */}
          <div className={`w-14 h-10 mt-1 overflow-hidden ${imageRounded}`}>
            <Image
              src={university.flag || '/assets/uni.png'}
              alt={university.name}
              width={100}
              height={50}
              className="w-full h-full object-cover"
              style={{
                width: `${imageSize.width}px`,
                height: `${imageSize.height}px`,
              }}
              loading={university.flag && university.flag.startsWith('http') ? 'eager' : undefined}
              crossOrigin={university.flag && university.flag.startsWith('http') ? 'anonymous' : undefined}
              onError={(e) => {
                e.target.src = '/assets/uni.png';
              }}
            />
          </div>

          {/* University Name */}
          <h4 className="text-base font-semibold text-gray-800 group-hover:text-red-600 truncate">
            {university.name}
          </h4>
        </div>
      </Link>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <Heading level={2} className="text-4xl font-bold text-gray-900 mb-2">
          {heading}
        </Heading>
        <p className="text-gray-600 text-sm">
          Explore universities by continent to find your ideal education destination
        </p>
      </div>

      {/* Continent Filter */}
      <div className="flex flex-wrap rounded-[50px] w-full max-w-[100%] bg-gray-100 p-4 gap-3 mb-10">
        {continentOptions.map((continent) => (
          <button
            key={continent.name}
            onClick={() => setSelectedContinent(continent.name)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              selectedContinent === continent.name
                ? "bg-gray-400 text-white"
                : "bg-white text-gray-700 hover:bg-red-50 border-gray-300"
            }`}
          >
            {continent.name} 
          </button>
        ))}
      </div>

      {/* Content */}
      {viewType === 'swiper' ? (
        <Swiper
          modules={[Autoplay]}
          spaceBetween={20}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: columns > 4 ? columns : 4 },
          }}
          autoplay={autoplay ? { delay: 2500 } : false}
        >
          {limitedData.map((university, index) => (
            <SwiperSlide key={index} className="!h-auto">
              {renderUniversityCard(university, index)}
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className={`grid ${gridCols} sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`}>
          {limitedData.map((university, index) => (
            <React.Fragment key={index}>
              {renderUniversityCard(university, index)}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Empty State */}
      {limitedData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No universities available</div>
          <p className="text-gray-400">
            Universities will appear here once they are added to the system.
          </p>
        </div>
      )}
    </div>
  );
};

export default UniversityCountryatom;





// 'use client'
// import { useState } from "react";

// const continents = [
//   "Europe",
//   "North America",
//   "Asia",
//   "Latin America",
//   "Oceania",
//   "Africa",
//   "Antarctica",
// ];

// const countries = [
//   { name: 'Brazil', flag: 'https://flagcdn.com/w320/br.png', continent: 'Latin America' },
//   { name: 'Australia', flag: 'https://flagcdn.com/w320/au.png', continent: 'Oceania' },
//   { name: 'Colombia', flag: 'https://flagcdn.com/w320/co.png', continent: 'Latin America' },
//   { name: 'Austria', flag: 'https://flagcdn.com/w320/at.png', continent: 'Europe' },
//   { name: 'New Zealand', flag: 'https://flagcdn.com/w320/nz.png', continent: 'Oceania' },
//   { name: 'China', flag: 'https://flagcdn.com/w320/cn.png', continent: 'Asia' },
//   { name: 'Belgium', flag: 'https://flagcdn.com/w320/be.png', continent: 'Europe' },
//   { name: 'Bulgaria', flag: 'https://flagcdn.com/w320/bg.png', continent: 'Europe' },
//   { name: 'Canada', flag: 'https://flagcdn.com/w320/ca.png', continent: 'North America' },
//   { name: 'Germany', flag: 'https://flagcdn.com/w320/de.png', continent: 'Europe' },
//   { name: 'Malaysia', flag: 'https://flagcdn.com/w320/my.png', continent: 'Asia' },
//   { name: 'France', flag: 'https://flagcdn.com/w320/fr.png', continent: 'Europe' },
//   { name: 'Greece', flag: 'https://flagcdn.com/w320/gr.png', continent: 'Europe' },
//   { name: 'Italy', flag: 'https://flagcdn.com/w320/it.png', continent: 'Europe' },
//   { name: 'Hungary', flag: 'https://flagcdn.com/w320/hu.png', continent: 'Europe' },
//   { name: 'Ireland', flag: 'https://flagcdn.com/w320/ie.png', continent: 'Europe' },
//   { name: 'Luxembourg', flag: 'https://flagcdn.com/w320/lu.png', continent: 'Europe' },
//   { name: 'Iceland', flag: 'https://flagcdn.com/w320/is.png', continent: 'Europe' },
//   { name: 'Denmark', flag: 'https://flagcdn.com/w320/dk.png', continent: 'Europe' },
// ];

// export default function CountrySelector() {
//   const [selectedContinent, setSelectedContinent] = useState("Asia");

//   const filteredCountries = countries.filter(
//     (country) => country.continent === selectedContinent
//   );

//   return (
//     <div className="p-8 max-w-7xl mx-auto">
//       <div className="text-center max-w-2xl mx-auto mb-10">
//         <h2 className="text-4xl font-bold text-gray-900 mb-2">Choose Your Country</h2>
//         <p className="text-gray-600 text-sm">
//           Choosing the ideal destination for immigration is a pivotal decision that can shape the trajectory of your future.
//         </p>
//       </div>

//       <div className="flex flex-wrap rounded-[50px] w-full max-w-[100%] bg-gray-100 p-4 gap-3 mb-10">
//         {continents.map((continent) => (
//           <button
//             key={continent}
//             onClick={() => setSelectedContinent(continent)}
//             className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
//               selectedContinent === continent
//                 ? "bg-gray-400 text-white "
//                 : "bg-white text-gray-700 hover:bg-red-50 border-gray-300"
//             }`}
//           >
//             {continent}
//           </button>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {filteredCountries.map((country) => (
//           <div
//             key={country.name}
//             className="flex items-center gap-2 px-4 py-2 justify-between w-[200px] items-center border border-gray-300 rounded-full text-sm bg-white shadow-sm group"
//           >
//             <div className="w-14 h-10 overflow-hidden mb-3">
//               <img
//                 src={country.flag}
//                 alt={country.name}
//                 className="w-full h-full object-cover rounded"
//               />
//             </div>
//             <h4 className="text-base font-semibold text-gray-800 group-hover:text-red-600">
//               {country.name}
//             </h4>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }





















// 'use client';

// import Heading from '../atoms/Heading';
// import Link from 'next/link';

// function slugify(str) {
//   return str
//     .toLowerCase()
//     .replace(/\s*\([^)]*\)/g, '') // remove (code)
//     .replace(/[^a-z0-9]+/g, '-')
//     .replace(/^-+|-+$/g, '')
//     .replace(/-+/g, '-');
// }

// const UniversityCountryatom = ({
//   data = [],
//   heading = 'Search By Country',
//   columns = 2,
//   limit = 0,
//   imageSize = { width: 100, height: 100 },
//   cardPadding = 'p-[30px]',
//   cardRounded = 'rounded-xl',
//   imageRounded = 'rounded-full',
//   showDiscountBadge = true,
//   showBottomSpace = true,
//   customBottomSpaceClass = '',
//   linkType = 'visit-visa-detail',
// }) => {
//   const gridCols = {
//     1: 'grid-cols-1',
//     2: 'lg:grid-cols-2',
//     3: 'lg:grid-cols-3',
//     4: 'lg:grid-cols-4',
//   }[columns] || 'lg:grid-cols-2';

//   const limitedData = limit > 0 ? data.slice(0, limit) : data;

//   const bottomSpaceClass = showBottomSpace
//     ? customBottomSpaceClass || 'text-bottom-space'
//     : '';

//   return (
//     <section>
//       {/* Heading */}
//       <div className={`text-center ${bottomSpaceClass}`}>
//         <Heading level={3}>
//           {heading.split(' ').map((word, index) =>
//             word.toLowerCase() === 'by' ? (
//               <span key={index}> {word} </span>
//             ) : (
//               <span key={index} className="text-[#0B6D76]">
//                 {' '}
//                 {word}{' '}
//               </span>
//             )
//           )}
//         </Heading>
//       </div>

//       {/* Country Cards */}
//       <div className={`grid ${gridCols} md:grid-cols-1 sm:grid-cols-1 grid-cols-1 mt-[20px] gap-6`}>
//         {limitedData.map((c, index) => {
//           const countryName = c.name
//             ? c.name.replace(/\s*\([^)]*\)/, '').trim()
//             : '';
//           const slug = slugify(countryName) + '-visit-visa';
//           const cleanCountry = countryName.replace(/\s*\([^)]*\)/, '').trim();
//           const searchUrl = `/search?type=university&country=${encodeURIComponent(cleanCountry)}`;

//           return (
//             <Link
//               key={index}
//               href={linkType === 'search' ? searchUrl : `/visit-visa-detail/${slug}`}
//               className="block"
//             >
//               <div
//                 className={`${cardRounded} shadow bg-[#E7F1F2] ${cardPadding} relative hover:shadow-lg transition-all cursor-pointer`}
//               >
//                 {/* Discount Badge */}
//                 {c.discount && showDiscountBadge && (
//                   <span className="absolute top-2 right-2 bg-[#0B6D76] text-white text-xs px-2 py-1 rounded-full font-semibold">
//                     {c.discount}
//                   </span>
//                 )}

//                 <div className="flex flex-wrap items-center gap-4">
//                   {/* Flag */}
//                   <img
//                     src={c.flag || '/assets/uni.png'}
//                     alt={c.name}
//                     className={`${imageRounded} object-cover`}
//                     style={{
//                       width: `${imageSize.width}px`,
//                       height: `${imageSize.height}px`,
//                     }}
//                     loading={c.flag && c.flag.startsWith('http') ? 'eager' : undefined}
//                     crossOrigin={c.flag && c.flag.startsWith('http') ? 'anonymous' : undefined}
//                     onError={(e) => {
//                       e.target.src = '/assets/uni.png';
//                     }}
//                   />

//                   {/* Info */}
//                   <div className="flex-1 min-w-[200px]">
//                     <Heading level={4} className="text-gray-900">
//                       {c.name}
//                     </Heading>

//                     {c.discounted && (
//                       <div className="text-green-600 font-bold text-sm mt-1">
//                         Discounted Fee: {c.discounted}
//                       </div>
//                     )}

//                     {c.actual && (
//                       <div className="text-gray-500 line-through text-xs">
//                         Original Fee: {c.actual}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </Link>
//           );
//         })}
//       </div>

//       {/* Empty State */}
//       {limitedData.length === 0 && (
//         <div className="text-center py-12">
//           <div className="text-gray-500 text-lg mb-2">No countries available</div>
//           <p className="text-gray-400">
//             Countries will appear here once they are added to the system.
//           </p>
//         </div>
//       )}
//     </section>
//   );
// };

// export default UniversityCountryatom;