'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { useRouter } from 'next/navigation';
import { useSearch } from '../../context/SearchContext';
import Heading from '../atoms/Heading';
import 'swiper/css';

const countries = [
  { name: 'Brazil', flag: 'https://flagcdn.com/w320/br.png' },
  { name: 'Australia', flag: 'https://flagcdn.com/w320/au.png' },
  { name: 'Colombia', flag: 'https://flagcdn.com/w320/co.png' },
  { name: 'Austria', flag: 'https://flagcdn.com/w320/at.png' },
  { name: 'New Zealand', flag: 'https://flagcdn.com/w320/nz.png' },
  { name: 'China', flag: 'https://flagcdn.com/w320/cn.png' },
  { name: 'Belgium', flag: 'https://flagcdn.com/w320/be.png' },
  { name: 'Bulgaria', flag: 'https://flagcdn.com/w320/bg.png' },
  { name: 'Canada', flag: 'https://flagcdn.com/w320/ca.png' },
  { name: 'Germany', flag: 'https://flagcdn.com/w320/de.png' },
  { name: 'Malaysia', flag: 'https://flagcdn.com/w320/my.png' },
];

const CountryList = () => {
  const router = useRouter();
  const { setSelectedCountry, setSelectedType } = useSearch();

  const handleCountryClick = (countryName) => {
    setSelectedCountry(countryName);
    setSelectedType('country');
    const slug = encodeURIComponent(countryName);
    router.push(`/search?type=country&country=${slug}`);
  };

  return (
    <section className="py-10 list relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center md:mb-30 mb-10">
          <Heading level={3}>
            Search By <span className="text-white">Countries</span>
          </Heading>
        </div>

        <Swiper
          modules={[Autoplay]}
          spaceBetween={20}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
          }}
          autoplay={{ delay: 2500 }}
        >
          {countries.map((country, index) => (
            <SwiperSlide key={index}>
              <div
                className="flex flex-col justify-center items-center text-center bg-white cursor-pointer rounded-lg shadow px-4 py-8 transition-transform duration-300 hover:-translate-y-4 hover:shadow-lg"
                onClick={() => handleCountryClick(country.name)}
              >
                <img
                  src={country.flag}
                  alt={country.name}
                  className="w-16 h-16 object-cover rounded-full mb-3"
                />
                <span className="text-base font-semibold text-gray-800">
                  {country.name}
                </span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default CountryList;





// 'use client';
// import React from 'react';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Autoplay } from 'swiper/modules'; // Removed Pagination
// import { useRouter } from 'next/navigation';
// import { useSearch } from '../../context/SearchContext';
// import Heading from '../atoms/Heading';
// import 'swiper/css';

// const countries = [
//   { name: 'Brazil', flag: 'https://flagcdn.com/w320/br.png' },
//   { name: 'Australia', flag: 'https://flagcdn.com/w320/au.png' },
//   { name: 'Colombia', flag: 'https://flagcdn.com/w320/co.png' },
//   { name: 'Austria', flag: 'https://flagcdn.com/w320/at.png' },
//   { name: 'New Zealand', flag: 'https://flagcdn.com/w320/nz.png' },
//   { name: 'China', flag: 'https://flagcdn.com/w320/cn.png' },
//   { name: 'Belgium', flag: 'https://flagcdn.com/w320/be.png' },
//   { name: 'Bulgaria', flag: 'https://flagcdn.com/w320/bg.png' },
//   { name: 'Canada', flag: 'https://flagcdn.com/w320/ca.png' },
//   { name: 'Germany', flag: 'https://flagcdn.com/w320/de.png' },
//   { name: 'Malaysia', flag: 'https://flagcdn.com/w320/my.png' },
// ];

// const CountryList = () => {
//   const router = useRouter();
//   const { setSelectedCountry, setSelectedType } = useSearch();

//   const handleCountryClick = (countryName) => {
//     setSelectedCountry(countryName);
//     setSelectedType('country');
//     const slug = encodeURIComponent(countryName);
//     router.push(`/search?type=country&country=${slug}`);
//   };

//   return (
//     <section className="py-10 list">
//       <div className="text-center md:mb-30 mb-10">
//         <Heading level={3}>
//           Search By <span className="text-white">Countries</span>
//         </Heading>
//       </div>

//       <Swiper
//         modules={[Autoplay]}
//         spaceBetween={20}
//         slidesPerView={2}
//         breakpoints={{
//           640: { slidesPerView: 3 },
//           768: { slidesPerView: 4 },
//           1024: { slidesPerView: 5 },
//         }}
//         autoplay={{ delay: 2500 }}
//         // Removed pagination prop
//       >
//         {countries.map((country, index) => (
//           <SwiperSlide key={index}>
//             <div
//               className="flex flex-col justify-center items-center text-center bg-[#E7F1F2] cursor-pointer rounded-lg shadow px-4 py-8 transition-transform duration-300 hover:-translate-y-4"
//               onClick={() => handleCountryClick(country.name)}
//             >
//               <img
//                 src={country.flag}
//                 alt={country.name}
//                 className="w-16 h-16 object-cover rounded-full mb-3"
//               />
//               <span className="text-base font-semibold text-gray-800">
//                 {country.name}
//               </span>
//             </div>
//           </SwiperSlide>
//         ))}
//       </Swiper>
//     </section>
//   );
// };

// export default CountryList;