'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import countriesData from '../../utils/countriesData';
import Heading from '../atoms/Heading';
import Container from '../atoms/Container';
import Paragraph from '../atoms/Paragraph';
import Button from '../atoms/Button';
import SearchBar from './SearchBar';
import Pagination from '../../admin/components/Pagination'; // <-- Import your pagination
import { useRouter } from 'next/navigation';

const ITEMS_PER_PAGE = 6;

const CountriesGuide = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [guides, setGuides] = useState([]);
  const [guidesLoading, setGuidesLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  // Fetch guides from API
  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setGuidesLoading(true);
        const response = await fetch(`/api/frontend/getguides?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
        if (!response.ok) throw new Error('Failed to fetch guides');
        const data = await response.json();
        setGuides(Array.isArray(data.data) ? data.data : []);
        setTotalItems(data.meta?.totalItems || (Array.isArray(data.data) ? data.data.length : 0));
        setTotalPages(data.meta?.totalPages || 1);
      } catch (error) {
        console.error('Error fetching guides:', error);
      } finally {
        setGuidesLoading(false);
      }
    };

    fetchGuides();
  }, [currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + guides.length;
  const currentData = guides;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative md:h-[64vh] sm:h-[88vh] h-[88vh] flex items-center justify-center overflow-hidden pt-[80px]">
        <img
          src="/assets/guid.png"
          alt="Hero Background"
          className="absolute top-0 left-0 w-full h-full h-screen bg-contain object-center object-cover z-0"
        />
        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[rgba(0,0,0,0.1)] to-[rgba(0,0,0,0.9)]"></div>
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto pb-12">
          <Heading level={1}>
            <div className="text-white">Study Abroad?</div>
          </Heading>
          <Paragraph>
            <p className="text-white w-[65%] mx-auto leading-relaxed">
              Discover global opportunities and expand your horizons with world-class education
            </p>
          </Paragraph>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-[fadeIn_1s_ease-in_0.4s] mt-6">
            <Button size="lg" className="shadow-xl hover:shadow-2xl">
              Universities
            </Button>
          </div>
        </div>
      </section>

      {/* Search */}
      <div className="inner bottom-session-space  complete-page-spaceing">

        {/* Heading */}
        <div className="heading-session">
          <div className="text-center lg:mb-16 md:mb-12 sm:mb-4 mb-4">
            <Heading level={3}>
              Countries <span className="text-teal-700">Guide</span>
            </Heading>
          </div>

          <Container>
            {/* Guide List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {guidesLoading ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-500 text-lg">Loading guides...</div>
                </div>
              ) : currentData.length > 0 ? (
                currentData.map((guide, idx) => (
                  <div
                    key={guide.id}
                    className="bg-[#eef6f7] rounded-[40px] p-4 flex flex-col justify-between h-full cursor-pointer hover:shadow-lg transition"
                    onClick={() => {
                      // Use the actual slug from database, fallback to generated slug if not available
                      const guideSlug = guide.slug || guide.title?.toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-');
                      router.push(`/guides/${guideSlug}`);
                    }}
                  >
                    {/* Top Section (ID + Title) */}
                    <div className="flex items-center gap-4 mb-[20px] min-h-[80px]">
                      <div className="w-[50px] h-[50px] bg-white text-[#006666] font-semibold flex items-center justify-center rounded-[40px] border-b-4 border-[#0B6D76] shadow">
                        {(startIndex + idx + 1).toString().padStart(2, '0')}
                      </div>
                      <div className="flex-1">
                        <Heading level={4}>{guide.title}</Heading>
                      </div>
                    </div>

                    {/* Spacer */}
                    <div className="flex-grow"></div>

                    {/* Image Section */}
                    <div className="w-full overflow-hidden rounded-tr-[82px] rounded-br-[82px] rounded-bl-[82px] mt-auto">
                      <Image
                        src={guide.image || '/assets/placeholder-guide.png'}
                        alt={guide.title}
                        width={552}
                        height={423}
                        className="object-cover w-full h-[300px] rounded-tr-[82px] rounded-br-[82px] rounded-bl-[82px]"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-500 text-lg">No guides available yet.</div>
                  <p className="text-gray-400 mt-2">
                    Guides will appear here once they are added to the system.
                  </p>
                </div>
              )}
            </div>
          </Container>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CountriesGuide;