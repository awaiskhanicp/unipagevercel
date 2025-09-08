


"use client"
import React, { useRef, useEffect } from "react";
import Heading from "../../components/atoms/Heading";
import Paragraph from "../../components/atoms/Paragraph";
import BottomMarquee from "../../components/organisms/BottomMarquee";
import Container from "../../components/atoms/Container";
import { FaArrowRight, FaPlane, FaUserGraduate, FaBook, FaBriefcase, FaBuilding, FaUsers, FaHospital } from "react-icons/fa";
import { IoMdAirplane } from "react-icons/io";

function MarqueeRow({ countries, reverse = false }) {
  const marqueeRef = useRef();

  useEffect(() => {
    let scrollAmount = 0;
    const speed = 0.5;
    const element = marqueeRef.current;
    if (!element) return;
    let frameId;

    const scroll = () => {
      scrollAmount += reverse ? -speed : speed;
      element.scrollLeft = scrollAmount;

      if (!reverse && scrollAmount >= element.scrollWidth / 2) {
        scrollAmount = 0;
      }
      if (reverse && scrollAmount <= 0) {
        scrollAmount = element.scrollWidth / 2;
      }

      frameId = requestAnimationFrame(scroll);
    };

    frameId = requestAnimationFrame(scroll);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [reverse]);

  return (
    <div className="overflow-hidden whitespace-nowrap w-full" ref={marqueeRef}>
      <div className="inline-flex gap-4 px-4">
        {[...countries, ...countries].map((country, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-4 py-2 justify-between w-[180px] border border-gray-300 rounded-full text-sm bg-white shadow-sm"
          >
            <img
              src={country.flag}
              alt={country.name + ' flag'}
              className="w-10 h-10 rounded-full object-cover"
              style={{ minWidth: 60, minHeight: 60 }}
            />
            <Heading level={2}>{country.name}</Heading>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const boxes = [
    {
      img: "/assets/media-1.jpg",
      title: "Student Visa",
      description: "Secure your student visa for studying abroad with our trusted services."
    },
    {
      img: "/assets/media-2.jpg",
      title: "Business Visa",
      description: "Fast-track your business visa to expand your global business opportunities."
    },
    {
      img: "/assets/media-3.jpg",
      title: "Tourist Visa",
      description: "Secure your tourist visa with easy and reliable guidance for smooth travel."
    }
  ];
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
    { name: 'Malaysia', flag: 'https://flagcdn.com/w320/my.png' }
  ];
  const visaTypes = [
    {
      id: 1,
      title: "Student Visa",
      icon: <FaUserGraduate />,
      description: "A legal permit allowing foreign nationals to work in a specific country.",
    },
    {
      id: 2,
      title: "Tourist Visa",
      icon: <FaBook />,
      description: "A legal permit allowing foreign nationals to work in a specific country.",
    },
    {
      id: 3,
      title: "Working Visa",
      icon: <FaBriefcase />,
      description: "A legal permit allowing foreign nationals to work in a specific country.",
      highlight: true,
    },
    {
      id: 4,
      title: "Business Visa",
      icon: <FaBuilding />,
      description: "A legal permit allowing foreign nationals to work in a specific country.",
    },
    {
      id: 5,
      title: "Family Visa",
      icon: <FaUsers />,
      description: "A legal permit allowing foreign nationals to work in a specific country.",
    },
    {
      id: 6,
      title: "Medical Visa",
      icon: <FaHospital />,
      description: "A legal permit allowing foreign nationals to work in a specific country.",
    },
  ];
  

  return (
    <>
      {/* Hero Section */}
      <section className="relative md:h-[50vh] sm:h-[95vh] h-[95vh] flex items-center justify-center overflow-hidden">
        <img
          src="/assets/service.jpg"
          alt="Services Hero Background"
          className="absolute top-0 left-0 w-full h-full object-center object-cover z-0"
        />
        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[rgba(0,0,0,0.1)] to-[rgba(0,0,0,0.9)]"></div>
        <div className="relative z-20 text-center px-4 md:pt-[0px] sm:pt-[120px] pt-[120px] max-w-4xl mx-auto pb-12">
          <Heading level={1}>
            <div className="text-white">Our Services</div>
          </Heading>
          <Paragraph>
            <p className="text-white w-[65%] mx-auto leading-relaxed">
              We provide a wide range of immigration and visa consulting services to help you achieve your dreams.
            </p>
          </Paragraph>
        </div>
      </section>
      <BottomMarquee />

<Container>
    {/* card */}
<div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-3 gap-6 p-6">
  {visaTypes.map((visa, index) => (
    <div
      key={visa.id}
      className="rounded-2xl shadow-md transition-all bg-[#E7F1F2]  duration-300 relative overflow-hidden group p-6  text-black hover:bg-[#0B6D76] hover:text-white"
    >
      <div className="flex flex-col gap-4 relative h-full">
        {/* Icon */}
        <div className="flex items-center justify-between relative">
          <div className="text-3xl bg-[#0B6D76] group-hover:bg-white group-hover:text-[#0B6D76]  text-white p-3 rounded-full">
            {visa.icon}
          </div>

          {/* Number Line */}
          <div className="absolute left-0 right-0 top-full translate-y-[40px] flex items-center px-6">
            <span className="text-gray-300 text-2xl font-bold">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="inline-block flex-1 border-t border-gray-300 ml-2"></span>
          </div>
        </div>

        {/* Title */}

        {/* Animated paragraph and arrow */}
        <div className="relative h-[185px] ">
          <div className="absolute bottom-0 left-0 right-0 transition-all duration-300 group-hover:bottom-4">
        <h3 className="text-lg font-bold mt-14">{visa.title}</h3>
            <p className="text-sm leading-relaxed mb-2 transition-all duration-300 group-hover:translate-y-[-4px]">
              {visa.description}
            </p>
            <FaArrowRight className="text-sm transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>

        {/* Plane icon on top right */}
        <span className="absolute top-0 right-0 text-xl rotate-45 opacity-20 group-hover:opacity-90 pointer-events-none select-none p-4">
        <IoMdAirplane className="text-6xl group-hover:text-white" />

        </span>
      </div>
    </div>
  ))}
</div>

</Container>

      <div className="text-center bottom-session-space banner-bottom-space">
        <Heading level={3}>Easy visa support from <br /> <span className="text-[#0B6D76] font-medium">start to finish</span></Heading>
      </div>
      <div className="flex justify-center gap-6 p-6">
        {boxes.map((box, index) => (
          <div key={index} className="w-[22%] bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative w-full h-[350px] group">
              <img src={box.img} alt={box.title} className="w-full h-[350px] object-cover" />
              {/* Animated Overlay with centered image */}
              <div className="absolute inset-0 bg-[#0B6D76] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none overflow-hidden">
                <img
                  src={box.img}
                  alt=""
                  className="absolute left-1/2 w-[85%] h-[300px] object-center rounded-b-[120px] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 translate-y-[-100%] group-hover:translate-y-0"
                />
              </div>
            </div>
            <div className="p-4">
              <Heading level={4}>{box.title}</Heading>
              <Paragraph>{box.description}</Paragraph>
            </div>
          </div>
        ))}
      </div>
      {/* Two marquee rows: one left, one right */}
      <div className="">
        <div className="space-y-4 my-8">

          <div className="text-center bottom-session-space banner-bottom-space">
            <Heading level={3}>Countries We Help <br /> <span className="text-[#0B6D76] font-medium">Immigrate</span></Heading>
          </div>
          <MarqueeRow countries={countries} />
          <MarqueeRow countries={countries} reverse />
        </div>

        {/* tern  */}
        <section className="bg-[#eaf6fd] py-20 px-6 md:px-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            {/* Left Side: Custom Image with overlayed design */}
            <div className="relative w-full">
              {/* Main image (your uploaded image) */}
              <div className="rounded-[30px] overflow-hidden border-t-4 border-[#e3362c]">
                <img
                  src="/assets/media-4.jpg" // Replace with your image path
                  alt="Custom Travel Image"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Circular Badge - Bottom Left */}
              <div className="absolute bottom-0 left-110 translate-x-1/2 translate-y-1/2 bg-[#1a2c79] text-white rounded-full w-36 h-36 flex flex-col justify-center items-center text-center shadow-lg">
                <div className="text-2xl font-bold">5k+</div>
                <div className="text-sm mt-1 px-2">Successful Projects</div>
                <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full border-[6px] border-yellow-400"></div>
              </div>
            </div>

            {/* Right Side: Text and Stats */}
            <div>
             <div className=" mb-[25px]">
             <Heading level={3} className="">
                Turn your Dream into <span className="text-[#1a2c79]">reality</span>
              </Heading>
             </div>
             <div className="mb-[40px]"> <Paragraph>
                Take the leap from dreaming to doing, and let us help you turn your
                vision into a successful one with our support.
              </Paragraph></div>

              {/* Stats Box */}
              <div className="bg-white rounded-xl py-6 px-[60px] flex flex-col   gap-12 shadow-md">
              <div className="flex items-center justify-between ">
              <div className="text-center">
                  <div className=" font-bold text-[#1a2c79]"><Heading level={1}>184+</Heading></div>
                  <div className="text-gray-600 mt-1 text-sm">Total Consultation Members</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-[#1a2c79]"><Heading level={1}>11+</Heading></div>
                  <div className="text-gray-600 mt-1 text-sm">Years of Experience</div>
                </div>
              </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex -space-x-4">
                    <img
                      src="https://randomuser.me/api/portraits/men/32.jpg"
                      className="w-18 h-18 rounded-full border-2 border-white"
                      alt=""
                    />
                    <img
                      src="https://randomuser.me/api/portraits/women/44.jpg"
                      className="w-18 h-18 rounded-full border-2 border-white"
                      alt=""
                    />
                    <img
                      src="https://randomuser.me/api/portraits/men/55.jpg"
                      className="w-18 h-18 rounded-full border-2 border-white"
                      alt=""
                    />
                    <img
                      src="https://randomuser.me/api/portraits/women/65.jpg"
                      className="w-18 h-18 rounded-full border-2 border-white"
                      alt=""
                    />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-semibold text-[#1a2c79]"><Heading level={1}>0.3m+</Heading></div>
                    <div className="text-sm text-gray-600">Trusted customers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}