import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import Paragraph from "../atoms/Paragraph";
import Heading from "../atoms/Heading";
import Container from "../atoms/Container";
import { useRouter } from 'next/navigation';
import { useState } from 'react';


const VisitvisaCompanyInfo = () => {
  const stats = [
    { number: "03", label: "Offices" },
    { number: "100+", label: "Staff" },
    { number: "7+", label: "Years Experience" },
    { number: "4.8", label: "Star Rating" }
  ];

  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/visit-visa?search=${encodeURIComponent(q)}`);
  };

  return (
    <div className="bg-white ">
      <div className="">
        <div className="text-center md:py-[80px] md:h-[50vh] sm:h-[80vh] h-[80vh]  visit-visa flex flex-col items-center justify-center ">
      <div className="mb-[50px] flex flex-col md:gap-[20px] sm:gap-[0px] gap-[0px] md:pt-[0px] sm:pt-[50px] pt-[50px]">
      <Heading level={3}><span className="text-white">Your one Stop solution </span></Heading>
      <Paragraph><span className="text-white">Begin your journey with our affordable prices</span></Paragraph>
      </div>

          <div className="w-full max-w-2xl mx-auto">
          {/* <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search visit-visa countries..."
              className="flex-1 px-4 py-4 rounded-[50px] border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-base"
            />
            <button type="submit" className="px-6 py-3 rounded-[50px] bg-[#0B6D76] text-white shadow">Search</button>
          </form> */}
          </div>
        </div>


       <Container>
       <div className="mt-[100px]">
          {/* Right Side - Stats */}
          <div className="">
            <div className="grid xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-2 grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-gray-100 flex flex-col justify-center items-center gap-[20px] rounded-lg md:p-6 sm:p-2 p-2 text-center ">
                  <div className=" w-8 h-8 bg-[var(--brand-color)] rounded-full flex items-center justify-center text-white text-xs">
                    <IoMdCheckmarkCircleOutline />
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <div className="md:text-2xl sm:text-md text-md font-bold text-gray-800 mb-1">{stat.number}</div>
                    <div className="text-[12px] text-gray-600">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
       </Container>
      </div>
    </div>
  );
};

export default VisitvisaCompanyInfo;


;