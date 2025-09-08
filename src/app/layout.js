'use client';
import './globals.css';
import Script from 'next/script';
import Header from '../app/components/organisms/Header';
import Footer from '../app/components/organisms/Footer';
import { SearchProvider } from './context/SearchContext'; // Changed to named import
import { AuthProvider } from './context/authContext';
import { Providers } from '../lib/Provider';
import { WishlistProvider } from './context/WishlistContext';
import Loader from '../app/components/atoms/loader';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      let el = e.target;
      while (el && el.tagName !== 'A' && el !== document.body) {
        el = el.parentElement;
      }
      if (el && el.tagName === 'A' && el.href && !el.target) {
        setLoading(true);
      }
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="antialiased">
        <Providers>
          <SearchProvider>
            <AuthProvider>
              <WishlistProvider>
                <Script
                  src="https://accounts.google.com/gsi/client"
                  strategy="afterInteractive"
                />
                {loading && <Loader />}
                {children}
              </WishlistProvider>
            </AuthProvider>
          </SearchProvider>
        </Providers>
      </body>
    </html>
  );
}








// 'use client';
// import './globals.css';
// import Script from 'next/script';
// import Header from '../app/components/organisms/Header';
// import Footer from '../app/components/organisms/Footer';
// import SearchProvider from  "./context/SearchContext"
// import { AuthProvider } from './context/authContext';
// import { Providers } from '../lib/Provider';
// import { WishlistProvider } from './context/WishlistContext';
// import Loader from '../app/components/atoms/loader';
// import { useState, useEffect } from 'react';
// import { usePathname } from 'next/navigation';

// // export const metadata = {
// //   title: 'University Page',
// //   description: 'University Portal for Students and Staff',
// //   keywords: [
// //     'University Pagge',
// //     'Education Consultancy Lahore',
// //     'Education Consultancy Karachi',
// //     'Education Consultancy Islamabad',
// //     'Study Abroad Pakistan',
// //     'Student Visa Assistance',
// //     'Overseas Education',
// //     'University Admissions',
// //     'Educational Consultant in Pakistan',
// //     'Pakistan to UK Study Visa',
// //     'Study in Canada from Pakistan',
// //     'Study in Australia from Pakistan'
// //   ],
// //   icons: {
// //     icon: '/assets/university_icon.png',
// //   }
// // };

// export default function RootLayout({ children }) {
//   const [loading, setLoading] = useState(false);
//   const pathname = usePathname();

//   useEffect(() => {
//     setLoading(true);
//     const timer = setTimeout(() => setLoading(false), 700); // Minimum loader time for smoothness
//     return () => clearTimeout(timer);
//   }, [pathname]);

//   // Show loader immediately on link click
//   useEffect(() => {
//     const handleClick = (e) => {
//       let el = e.target;
//       while (el && el.tagName !== 'A' && el !== document.body) {
//         el = el.parentElement;
//       }
//       if (el && el.tagName === 'A' && el.href && !el.target) {
//         setLoading(true);
//       }
//     };
//     document.addEventListener('click', handleClick, true);
//     return () => document.removeEventListener('click', handleClick, true);
//   }, []);

//   return (
//     <html lang="en" suppressHydrationWarning>
//       <head />
//       <body className="antialiased">
        
        
//         <Providers>
//           <SearchProvider>
//           <AuthProvider>
//             <WishlistProvider>
//               {/* ✅ Load scripts only on the client */}
//               <Script
//                 src="https://accounts.google.com/gsi/client"
//                 strategy="afterInteractive"
//               />
//               {/* Add other scripts here if needed */}
//               {loading && <Loader />}
//               {children}
//             </WishlistProvider>
//           </AuthProvider>
//               </SearchProvider>
//         </Providers>
//       </body>
//     </html>
//   );
// }