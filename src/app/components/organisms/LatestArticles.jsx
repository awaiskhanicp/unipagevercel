'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Container from '../atoms/Container';
import Heading from '../atoms/Heading';
import Paragraph from '../atoms/Paragraph';
import ArticleCard from '../molecules/ArticleCard';
import Button from '../atoms/Button';

const LatestArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // const fetchArticles = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await fetch('/api/internal/blogs?limit=3&sort=desc');
  //     const data = await res.json();

  //     if (!res.ok || !data.success) {
  //       throw new Error(data.message || 'Failed to fetch articles');
  //     }

  //     setArticles(data.data || []);
  //   } catch (err) {
  //     setError(err.message || 'Something went wrong');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

const fetchArticles = async () => {
  try {
    setLoading(true);
    const res = await fetch('/api/internal/blogs?sort=desc');
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch articles');
    }

    // Filter only popular and limit to 3
    const popularArticles = (data.data || [])
      .filter(article => article.enable_meta_tags ) // Adjust property name as per your API
      .slice(0, 3);

    setArticles(popularArticles);
  } catch (err) {
    setError(err.message || 'Something went wrong');
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <section className="relative">
      {/* Background Section */}
      <div className="bg-gradient-to-r from-[#F0F9FB] to-[#F0F9FB] lg:h-[400px] py-16 lg:mx-6 rounded-2xl  relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-full  h-full opacity-50 pointer-events-none" 
        style={{
          backgroundImage: 'url("/assets/blog_bg.png")'
        }}
        >
          {/* <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            viewBox="0 0 1920 400"
            preserveAspectRatio="none"
          >
            <g fill="#E2F1F4">
              <circle cx="150" cy="80" r="60" />
              <circle cx="400" cy="200" r="40" />
              <circle cx="1700" cy="100" r="70" />
              <circle cx="1300" cy="300" r="50" />
                <circle cx="1500" cy="60" r="80" />
                  <circle cx="1200" cy="70" r="90" />
            </g>
          </svg> */}
        </div>

        {/* Heading */}
        <Container>
          <div className="text-center mb-12 relative z-10">
            <h1 className="font-bold text-4xl text-gray-800">
              Cast Your Eyes Upon Our <br />
              <span className="text-[#0B6D76]">Newest Article</span>
            </h1>
            <p className="text-gray-500 text-2xl mt-2">
              Explore the most recent addition to our informative articles
            </p>
          </div>
        </Container>
      </div>

      {/* Cards Floating Section */}
      <div className="relative -mt-20 z-20">
        <Container>
          {loading && (
            <p className="text-center text-gray-500">Loading articles...</p>
          )}
          {error && (
            <p className="text-center text-red-500">Error: {error}</p>
          )}
          {!loading && !error && (
            <div className="grid md:grid-cols-3 gap-8">
              {articles.map((article, index) => (
                <ArticleCard key={index} article={article} />
              ))}
            </div>
          )}

          {/* View All Button */}
          {!loading && !error && articles.length > 0 && (
            <div className="flex justify-center cursor-pointer my-8">
              <Link href="/blog">
                <Button>View All</Button>
              </Link>
            </div>
          )}
        </Container>
      </div>
    </section>
  );
};

export default LatestArticles;














// 'use client';

// import { useEffect, useState } from 'react';
// import Link from 'next/link';
// import Container from '../atoms/Container';
// import Heading from '../atoms/Heading';
// import Paragraph from '../atoms/Paragraph';
// import ArticleCard from '../molecules/ArticleCard';
// import Button from '../atoms/Button';

// const LatestArticles = () => {
//   const [articles, setArticles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   const fetchArticles = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch('/api/internal/blogs?limit=3&sort=desc');
//       const data = await res.json();

//       if (!res.ok || !data.success) {
//         throw new Error(data.message || 'Failed to fetch articles');
//       }

//       setArticles(data.data || []);
//     } catch (err) {
//       setError(err.message || 'Something went wrong');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchArticles();
//   }, []);

//   return (
//     <section className="bg-white">
//       <Container>
//         <div className="text-center mb-12">
//           <Heading level={3}>
//             Latest <span className="text-[#0B6D76]">Articles</span>
//           </Heading>
//           <div className="xl:w-[70%] lg:w-[70%] md:w-[75%] sm:w-[90%] w-[100%] mx-auto">
//             <Paragraph>
//               Stay updated on universities and courses with our insightful articles. Explore academic trends, institution profiles, and career advice to guide your educational journey.
//             </Paragraph>
//           </div>
//         </div>

//         {loading && (
//           <p className="text-center text-gray-500">Loading articles...</p>
//         )}
//         {error && (
//           <p className="text-center text-red-500">Error: {error}</p>
//         )}
//         {!loading && !error && (
//           <div className="grid md:grid-cols-3 gap-8">
//             {articles.map((article, index) => (
//               <ArticleCard key={index} article={article} />
//             ))}
//           </div>
//         )}

//         {/* View All Button */}
//         {!loading && !error && articles.length > 0 && (
//           <div className="flex justify-center cursor-pointer my-8">
//             <Link href="/blog">
//               <Button>View All</Button>
//             </Link>
//           </div>
//         )}
//       </Container>
//     </section>
//   );
// };

// export default LatestArticles;
