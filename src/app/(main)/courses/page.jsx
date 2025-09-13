'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '../../components/atoms/Container';
import Heading from '../../components/atoms/Heading';
import CoursePageType from '../../components/organisms/CoursePageType';
import CoursesPageSubject from '../../components/organisms/CoursesPageSubject';
import Paragraph from '../../components/atoms/Paragraph';
import { useWishlist } from '../../context/WishlistContext';

const CoursesPage = () => {
  const [levels, setLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchType, setSearchType] = useState('');
  const [searchSubject, setSearchSubject] = useState('');
  const router = useRouter();


  useEffect(() => {

    const fetchdata = async () => {
      const [levels, subjects] = await Promise.all([
        fetch('/api/frontend/getpostlevel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }),
        fetch('/api/frontend/getsubject', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }),
      ]);

      if(!levels.ok || !subjects.ok) throw new Error('Failed to fetch data')

      const levelData = await levels.json();
      const subjectsData = await subjects.json();

      setLevels(levelData.data);
      setSubjects(subjectsData.data);

    }

    fetchdata()

  }, [])

  const filteredLevels = levels.filter((level) =>
    level.title?.toLowerCase().includes(searchType.toLowerCase())
  );

  const filteredSubjects = subjects.filter((subject) =>
    subject.name?.toLowerCase().includes(searchSubject.toLowerCase())
  );

  return (
    <div className="font-sans text-gray-800">
      {/* Hero Section */}
  <section className="relative flex h-[60vh] items-center justify-center overflow-hidden md:h-[64vh]">
        <img
          src="/assets/c.png"
          alt="Courses Hero Background"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center pb-12">
          <Heading level={1} className="pt-[100px] md:pt-0">
            <span className='text-white'>Find Courses</span>
          </Heading>
          <Paragraph>
            <p className="mx-auto w-full max-w-2xl leading-relaxed text-white/90">
              Search over <strong>10,000+</strong> courses by type or subject and kick‑start your learning journey.
            </p>
          </Paragraph>
        </div>
      </section>

      {/* Main Content */}
      <div className="banner-bottom-space bg-gray-50 py-20">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            {/* Course Type Box */}
            <div>
              <div className="text-center mb-[30px]">
                <Heading level={4}>
                  Courses <span className="text-[#0B6D76]">By Type</span>
                </Heading>
              </div>
              <div className="rounded-2xl bg-white shadow-md">
                <div className="bg-[#0B6D76] px-6 py-3 rounded-t-2xl">
                  <input
                    type="text"
                    placeholder="Search by Course Type..."
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="w-full rounded-md border-none bg-white p-4 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
                <div className="scrollbar-hide max-h-[500px] overflow-y-auto space-y-3 p-4">
                  {filteredLevels.map((level, index) => (
                    <div className="relative" key={level.id || index}>
                      <CoursePageType
                        title={level.title}
                        image={level.image || '/assets/co1.png'}
                        onClick={() => router.push(`/search?qualification=${encodeURIComponent(level.title)}`)}
                      />
                    </div>
                  ))}
                  {filteredLevels.length === 0 && (
                    <p className="text-sm text-gray-500 text-center">No course type found</p>
                  )}
                </div>
              </div>
            </div>

            {/* Subject Box */}
            <div>
              <div className="text-center mb-[30px]">
                <Heading level={4}>
                  Subject <span className="text-[#0B6D76]">By Type</span>
                </Heading>
              </div>
              <div className="rounded-2xl bg-white shadow-md">
                <div className="bg-[#0B6D76] px-6 py-3 rounded-t-2xl">
                  <input
                    type="text"
                    placeholder="Search by Subject Type..."
                    value={searchSubject}
                    onChange={(e) => setSearchSubject(e.target.value)}
                    className="w-full rounded-md border-none bg-white p-4 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
                <div className="scrollbar-hide max-h-[500px] overflow-y-auto space-y-3 p-4">
                  {filteredSubjects.map((subject, index) => (
                    <div className="relative" key={subject.id || index}>
                      <CoursesPageSubject
                        title={subject.name}
                        image={subject.icon || '/assets/co1.png'}
                        onClick={() => router.push(`/search?subject=${encodeURIComponent(subject.name)}`)}
                      />
                    </div>
                  ))}
                  {filteredSubjects.length === 0 && (
                    <p className="text-sm text-gray-500 text-center">No subject found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default CoursesPage;