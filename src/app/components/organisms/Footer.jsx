'use client';
import { useState } from 'react';
import Container from "../atoms/Container";
import FooterMolecule from "../molecules/FooterMolecule";
import { SocialIcons } from "../molecules/SocialIcons";
import Link from 'next/link';
import Image from 'next/image';
import Button from '../atoms/Button';

const locationDetails = {
  Lahore: 'Universities Page,2nd Floor faisal bank,Raja Market,Garden town,Lahore',
  Islamabad: 'Universities Page, Punjab market,Venus Plaza, 1st Floor, Office No. 1, Sector G13/4,Islamabad',
  Thailand: '70 Young Pl Alley, Khwaeng Khlong Toei Nuea, Watthana, Krung Thep Maha Nakhon ,Thailand. ',
  Karachi: 'Universities Page,1st floor, Amber Estate, Shahrah-e-Faisal Rd, Bangalore Town Block A Shah, Karachi, Sindh',
  China: 'Universities Page,East road of Madian plaza, Hai Dian District, Beijing, China',
};

const FooterOrganism = () => {
  const [selectedCity, setSelectedCity] = useState('');

  return (
    <footer className="relative bg-[#E7F1F2] pt-[160px] mt-28">
      {/* Newsletter Card - Overlapping */}
      <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[80%] lg:w-[70%] mb-16">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left Side */}
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Newsletter</p>
            <h3 className="text-2xl font-bold text-black font-sans mb-4">
              Subscribe to the free newsletter to receive the latest news & case studies!
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="email"
                placeholder="Your e-mail address"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#0B6D76] w-full"
              />
              <Button className="bg-[#0B6D76] hover:bg-[#095b5a] text-white px-6 py-3 rounded-lg font-medium w-full sm:w-auto">
                Subscribe
              </Button>
            </div>
          </div>
          {/* Right Side Image */}
          <div className="flex-shrink-0">
            <div className="rounded-xl overflow-hidden p-4 flex items-center justify-center">
              <Image
                src="/assets/newsletter_img.png" // replace with your airplane + suitcase image
                alt="Newsletter illustration"
                width={180}
                height={180}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Main Content */}
      <Container>
        <div className="text-gray-800 px-4 sm:px-6 py-10 space-y-10">
          {/* Top Section */}
          <div>
            <FooterMolecule />
          </div>

          {/* Main Footer Info Section */}
          <div className="border-t border-gray-300 pt-10 flex flex-col lg:flex-row lg:justify-between lg:gap-20 gap-10">
            {/* Menu Links */}
            <div>
              <h4 className="font-semibold mb-4 lg:text-left">Menu Links</h4>
              <div className="flex flex-row gap-6 justify-center lg:justify-start">
                <ul className="space-y-2">
                  <li><Link href={'/CountriesGuide'}>Guide</Link></li>
                  <li><Link href={'universities'}>Universities</Link></li>
                  <li><Link href={'courses'}>Courses</Link></li>
                  <li>Search</li>
                  <li><Link href={'/blogs'}>Articles</Link></li>
                  <li><Link href={'/services'}>Services</Link></li>
                </ul>
                <ul className="space-y-2">
                  <li><Link href={'visit-visa'}>Visit Visa</Link></li>
                  <li><Link href={'free-consultation'}>Free Consultation</Link></li>
                  <li>Complaint</li>
                  <li>100% Discount Offer</li>
                  <li><Link href={'/ourteam'}>Our Team</Link></li>
                  <li><Link href={'/aboutus'}>about us</Link></li>
                </ul>
              </div>
            </div>

            {/* Address Dropdowns */}
            <div className="w-full sm:w-auto">
              <h4 className="font-semibold mb-4">Address</h4>
              <div className="grid xl:grid-cols-1 lg:grid-cols-1 md:grid-cols-1 grid-cols-2 sm:grid-cols-2 gap-4">
                {Object.entries(locationDetails).map(([city, paragraph], index) => (
                  <div
                    key={index}
                    className="border-b border-[#00000033] pb-2 w-full max-w-[250px] cursor-pointer"
                    onClick={() => setSelectedCity(selectedCity === city ? '' : city)}
                  >
                    <div className="font-medium text-gray-800 hover:text-[#0B6D76] transition">
                      {city}
                    </div>
                    {selectedCity === city && (
                      <p className="mt-2 text-sm text-gray-700">
                        {paragraph}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Social Icons */}
            <div className="w-full sm:w-auto">
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex justify-center lg:justify-start">
                <SocialIcons />
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom Bar */}
      <div className="bg-[#0b4d4b] mt-10">
        <Container>
          <div className="text-white py-4 px-4 text-sm flex flex-col md:flex-row justify-between items-center gap-3 text-center">
            <span>Copyright© Universities Page. All rights reserved.</span>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/terms-and-condition">Terms & Conditions</Link>
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/feedback">Feedback</Link>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default FooterOrganism;





















// 'use client';
// import { useState } from 'react';
// import Container from "../atoms/Container";
// import FooterMolecule from "../molecules/FooterMolecule";
// import { SocialIcons } from "../molecules/SocialIcons";
// import Link from 'next/link';

// const locationDetails = {
//   Lahore: 'Universities Page,2nd Floor faisal bank,Raja Market,Garden town,Lahore',
//   Islamabad: 'Universities Page, Punjab market,Venus Plaza, 1st Floor, Office No. 1, Sector G13/4,Islamabad',
//   Thailand: '70 Young Pl Alley, Khwaeng Khlong Toei Nuea, Watthana, Krung Thep Maha Nakhon ,Thailand. ',
//   Karachi: 'Universities Page,1st floor, Amber Estate, Shahrah-e-Faisal Rd, Bangalore Town Block A Shah, Karachi, Sindh',
//   China: 'Universities Page,East road of Madian plaza, Hai Dian District, Beijing, China',
// };

// const FooterOrganism = () => {
//   const [selectedCity, setSelectedCity] = useState('');
//   return (
//     <footer className="bg-[#E7F1F2]  xl:pt-[80px] lg:pt-[80px] md:pt-[80px] sm:pt-[40px] pt-[30px]">
//       <Container>
//         <div className="text-gray-800 px-4 sm:px-6 py-10 space-y-10">
//           {/* Top Section */}
//           <div>
//             <FooterMolecule />
//           </div>
//           {/* Main Footer Info Section */}
//           <div className="border-t border-gray-300 pt-10 flex flex-col lg:flex-row lg:justify-between lg:gap-20 gap-10">
//             {/* Menu Links */}
//             <div>
//               <h4 className="font-semibold mb-4  lg:text-left">Menu Links</h4>
//               <div className="flex flex-row  gap-6 justify-center lg:justify-start">
//                 <ul className="space-y-2 ">
//                   <li><Link href={'/CountriesGuide'}>Guide</Link></li>
//                   <li><Link href={'universities'}>Universities</Link></li>
//                   <li><Link href={'courses'}>Courses</Link></li>
//                   <li>Search</li>
//                   <li><Link href={'/blogs'}>Articles</Link></li>
//                   <li><Link href={'/services'}>Services</Link></li>
//                 </ul>
//                 <ul className="space-y-2 ">
//                   <li><Link href={'visit-visa'}>Visit Visa</Link></li>
//                   <li><Link href={'free-consultation'}>Free Consultation</Link></li>
//                   <li>Complaint</li>
//                   <li>100% Discount Offer</li>
//                   <li><Link href={'/ourteam'}>Our Team</Link></li>
//                   <li><Link href={'/aboutus'}>about us</Link></li>
//                 </ul>
//               </div>
//             </div>
//             {/* Address Dropdowns */}
//             <div className="w-full sm:w-auto">
//               <h4 className="font-semibold mb-4">Address</h4>
//               <div className="grid xl:grid-cols-1 lg:grid-cols-1 md:grid-cols-1 grid-cols-2 sm:grid-cols-2 gap-4">
//                 {Object.entries(locationDetails).map(([city, paragraph], index) => (
//                   <div
//                     key={index}
//                     className="border-b border-[#00000033] pb-2 w-full max-w-[250px] cursor-pointer"
//                     onClick={() => setSelectedCity(selectedCity === city ? '' : city)} 
//                   >
//                     <div className="font-medium text-gray-800 hover:text-[#0B6D76] transition">
//                       {city}
//                     </div>
//                     {selectedCity === city && (
//                       <p className="mt-2 text-sm text-gray-700">
//                         {paragraph}
//                       </p>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Social Icons */}
//             <div className="w-full sm:w-auto ">
//               <h4 className="font-semibold mb-4">Follow Us</h4>
//               <div className="flex justify-center lg:justify-start">
//                 <SocialIcons />
//               </div>
//             </div>
//           </div>
//         </div>
//       </Container>
//       <div className="bg-[#0b4d4b] mt-10">
//         <Container>
//           <div className="text-white py-4 px-4 text-sm flex flex-col md:flex-row justify-between items-center gap-3 text-center">
//             <span>Copyright© Universities Page. All rights reserved.</span>
//             <div className="flex flex-wrap gap-4 justify-center">
//               <Link href="/terms-and-condition">Terms & Conditions</Link>
//               <Link href="/privacy-policy">Privacy Policy</Link>
//               <Link href="/feedback">Feedback</Link>
//             </div>
//           </div>
//         </Container>
//       </div>
//     </footer>
//   );
// };

// export default FooterOrganism;