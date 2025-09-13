"use client"
import React, { useRef, useEffect } from "react";
import Heading from "../../components/atoms/Heading";
import Paragraph from "../../components/atoms/Paragraph";
import BottomMarquee from "../../components/organisms/BottomMarquee";
import Container from "../../components/atoms/Container";
import Link from "next/link";
import { FaArrowRight, FaUserGraduate, FaBook, FaBriefcase, FaUniversity, FaGraduationCap, FaGlobeAmericas, FaHandshake } from "react-icons/fa";
import { IoMdAirplane } from "react-icons/io";
import Image from 'next/image';

function MarqueeRow({ countries, reverse = false }) {
  const marqueeRef = useRef<HTMLDivElement | null>(null); // 👈 typed ref

  useEffect(() => {
    let scrollAmount = 0;
    const speed = 0.5;
    const element = marqueeRef.current;
    if (!element) return;
    let frameId: number;

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
            <Image
              src={country.flag}
              alt={country.name + ' flag'}
              height="400"
              width="400"
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
      title: "University Admissions",
      description: "Comprehensive support for selecting and applying to the right universities worldwide."
    },
    {
      img: "/assets/media-2.jpg",
      title: "Visa Guidance",
      description: "Expert assistance with student visa applications and documentation for your study abroad journey."
    },
    {
      img: "/assets/media-3.jpg",
      title: "Scholarship Assistance",
      description: "Help identifying and applying for scholarships and financial aid opportunities."
    }
  ];
  const countries = [
    { name: 'United States', flag: 'https://flagcdn.com/w320/us.png' },
    { name: 'United Kingdom', flag: 'https://flagcdn.com/w320/gb.png' },
    { name: 'Canada', flag: 'https://flagcdn.com/w320/ca.png' },
    { name: 'Australia', flag: 'https://flagcdn.com/w320/au.png' },
    { name: 'Germany', flag: 'https://flagcdn.com/w320/de.png' },
    { name: 'France', flag: 'https://flagcdn.com/w320/fr.png' },
    { name: 'Netherlands', flag: 'https://flagcdn.com/w320/nl.png' },
    { name: 'New Zealand', flag: 'https://flagcdn.com/w320/nz.png' },
    { name: 'Japan', flag: 'https://flagcdn.com/w320/jp.png' },
    { name: 'Sweden', flag: 'https://flagcdn.com/w320/se.png' },
    { name: 'Ireland', flag: 'https://flagcdn.com/w320/ie.png' }
  ];
  const services = [
    {
      id: 1,
      title: "University Selection",
      icon: <FaUniversity />,
      description: "Expert guidance choosing the right university based on your profile and career goals.",
    },
    {
      id: 2,
      title: "Application Support",
      icon: <FaBook />,
      description: "Complete assistance with applications, essays, and meeting admission requirements.",
    },
    {
      id: 3,
      title: "Visa Assistance",
      icon: <FaGlobeAmericas />,
      description: "Professional guidance with student visa applications and documentation.",
      highlight: true,
    },
    {
      id: 4,
      title: "Scholarship Guidance",
      icon: <FaGraduationCap />,
      description: "Help identifying and applying for scholarships and financial aid opportunities.",
    },
    {
      id: 5,
      title: "Pre-Departure Briefing",
      icon: <IoMdAirplane />,
      description: "Comprehensive orientation about your destination country and what to expect.",
    },
    {
      id: 6,
      title: "Post-Arrival Support",
      icon: <FaHandshake />,
      description: "Continued assistance after you arrive in your host country for a smooth transition.",
    },
  ];
  

  return (
    <>
      {/* Hero Section */}
      <section className="relative md:h-[50vh] sm:h-[95vh] h-[95vh] flex items-center justify-center overflow-hidden">
        <Image
  src="/assets/service.jpg"
  alt="Study Abroad Services"
  fill
  className="absolute top-0 left-0 object-cover object-center z-0"
/>

        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[rgba(0,0,0,0.1)] to-[rgba(0,0,0,0.9)]"></div>
        <div className="relative z-20 text-center px-4 md:pt-[0px] sm:pt-[120px] pt-[120px] max-w-4xl mx-auto pb-12">
          <Heading level={1}>
            <div className="text-white">Our Services</div>
          </Heading>
          <Paragraph>
            <p className="text-white w-[65%] mx-auto leading-relaxed">
              Comprehensive study abroad consulting services to help you navigate your international education journey.
            </p>
          </Paragraph>
        </div>
      </section>
      <BottomMarquee />

      <Container>
        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 mt-20">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="rounded-2xl shadow-md transition-all bg-[#E7F1F2] duration-300 relative overflow-hidden group p-6 text-black hover:bg-[#0b4d4b] hover:text-white"
            >
              <div className="flex flex-col gap-4 relative h-full">
                {/* Icon */}
                <div className="flex items-center justify-between relative">
                  <div className="text-3xl bg-[#0b4d4b] group-hover:bg-white group-hover:text-[#0b4d4b] text-white p-3 rounded-full">
                    {service.icon}
                  </div>

                  {/* Number Line */}
                  <div className="absolute left-0 right-0 top-full translate-y-[40px] flex items-center px-6">
                    <span className="text-gray-300 text-2xl font-bold">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="inline-block flex-1 border-t border-gray-300 ml-2"></span>
                  </div>
                </div>

                {/* Content */}
                <div className="relative h-[185px]">
                  <div className="absolute bottom-0 left-0 right-0 transition-all duration-300 group-hover:bottom-4">
                    <h3 className="text-lg font-bold mt-14">{service.title}</h3>
                    <p className="text-sm leading-relaxed mb-2 transition-all duration-300 group-hover:translate-y-[-4px]">
                      {service.description}
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


{/* Stats Section */}
<section className="py-20 bg-gradient-to-br from-[#F9FAFB] to-[#0B6D76] px-6 md:px-12 mt-30 mb-20">
  <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
    {/* Left Side: Image with overlay elements */}
    <div className="relative">
      {/* Main image container */}
      <div className="rounded-3xl overflow-hidden shadow-2xl">
        <Image
          src="/assets/media-4.jpg"
          height="400"
          width="400"
          alt="Successful Students"
          className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
        />
      </div>
      
      {/* Floating stats card */}
      <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-6 w-48 border-l-4 border-[#0b4d4b]">
        <div className="text-3xl font-bold text-[#0b4d4b]">10K+</div>
        <div className="text-sm font-medium text-gray-600 mt-1">Students Placed</div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#0b4d4b] opacity-10 rounded-full"></div>
      <div className="absolute -bottom-4 -left-8 w-16 h-16 bg-[#0b4d4b] opacity-5 rounded-full"></div>
    </div>

    {/* Right Side: Content */}
    <div>
      <div className="mb-8">
        <span className="text-[#0b4d4b] font-semibold text-lg mb-2 block">OUR SUCCESS STORY</span>
        <Heading level={2} className="text-3xl md:text-4xl font-bold text-gray-900">
          Turning Study Abroad Dreams into <span className="text-[#0b4d4b]">Reality</span>
        </Heading>
      </div>
      
      <div className="mb-10">
        <p className="text-lg text-gray-600 leading-relaxed">
          For over a decade, we have helped thousands of students achieve their international education goals 
          through personalized guidance and expert support at every step of their journey.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-xl p-6 shadow-md text-center border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-[#0b4d4b] mb-2">50+</div>
          <div className="text-sm font-medium text-gray-600">Partner Universities</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-md text-center border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-[#0b4d4b] mb-2">11+</div>
          <div className="text-sm font-medium text-gray-600">Years of Experience</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-md text-center border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-[#0b4d4b] mb-2">98%</div>
          <div className="text-sm font-medium text-gray-600">Success Rate</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-md text-center border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-[#0b4d4b] mb-2">25+</div>
          <div className="text-sm font-medium text-gray-600">Countries</div>
        </div>
      </div>

      {/* Student Avatars & Trust Indicator */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex -space-x-3">
            <Image
              src="https://randomuser.me/api/portraits/women/65.jpg"
              height="400"
              width="400"
              className="w-12 h-12 rounded-full border-3 border-white shadow-md"
              alt="Student"
            />
            <Image
              src="https://randomuser.me/api/portraits/men/32.jpg"
              height="400"
              width="400"
              className="w-12 h-12 rounded-full border-3 border-white shadow-md"
              alt="Student"
            />
            <Image
              src="https://randomuser.me/api/portraits/women/44.jpg"
              height="400"
              width="400"
              className="w-12 h-12 rounded-full border-3 border-white shadow-md"
              alt="Student"
            />
            <Image
              src="https://randomuser.me/api/portraits/men/55.jpg"
              height="400"
              width="400"
              className="w-12 h-12 rounded-full border-3 border-white shadow-md"
              alt="Student"
            />
            <div className="w-12 h-12 rounded-full bg-[#0b4d4b] text-white flex items-center justify-center border-3 border-white shadow-md text-sm font-bold">
              +500
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-[#0b4d4b]">4.9/5</div>
            <div className="text-sm text-gray-500">Student Satisfaction</div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Join thousands of successful students who have achieved their study abroad dreams with our guidance
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-8">
        <Link href="/contact-us" className="bg-[#0b4d4b] text-white px-8 py-4 rounded-xl font-medium hover:bg-[#0a423f] transition-colors shadow-md hover:shadow-lg w-full md:w-auto">
          Start Your Journey Today
        </Link>
      </div>
    </div>
  </div>
</section>


      
      {/* Countries Marquee */}
      <div className="my-12">
        <div className="space-y-4 my-8">
          <div className="text-center bottom-session-space banner-bottom-space">
            <Heading level={3}>Countries We Help Students <br /> <span className="text-[#0b4d4b] font-medium">Study In</span></Heading>
          </div>
          <MarqueeRow countries={countries} />
          <MarqueeRow countries={countries} reverse />
        </div>



        <div className="py-16 bg-gray-50 mt-30 mb-20">
  <Container>
    <div className="text-center mb-16">
      <Heading level={3}>
        Complete study abroad support from <br />{' '}
        <span className="text-[#0b4d4b] font-medium">start to finish</span>
      </Heading>
      <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
        We guide you through every step of your international education journey, 
        providing expert assistance from initial planning to post-arrival support.
      </p>
    </div>

    {/* Process Timeline */}
    <div className="relative mb-16">
      {/* Connection Line */}
      <div className="absolute left-0 right-0 top-1/2 h-1 bg-[#0b4d4b] opacity-20 transform -translate-y-1/2 hidden md:block"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
        {/* Phase 1 */}
        <div className="bg-white rounded-xl p-6 shadow-md text-center group hover:shadow-xl transition-shadow">
          <div className="w-16 h-16 bg-[#0b4d4b] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <span className="text-white text-xl font-bold">1</span>
          </div>
          <h4 className="font-semibold text-lg mb-2">Planning & Research</h4>
          <ul className="text-sm text-gray-600 text-left space-y-1">
            <li className="flex items-start">
              <span className="text-[#0b4d4b] mr-2">•</span>
              Career counseling & goal assessment
            </li>
            <li className="flex items-start">
              <span className="text-[#0b4d4b] mr-2">•</span>
              Country & university shortlisting
            </li>
            <li className="flex items-start">
              <span className="text-[#0b4d4b] mr-2">•</span>
              Program selection guidance
            </li>
            <li className="flex items-start">
              <span className="text-[#0b4d4b] mr-2">•</span>
              Timeline planning
            </li>
          </ul>
        </div>

        {/* Phase 2 */}
        <div className="bg-white rounded-xl p-6 shadow-md text-center group hover:shadow-xl transition-shadow">
          <div className="w-16 h-16 bg-[#0b4d4b] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <span className="text-white text-xl font-bold">2</span>
          </div>
          <h4 className="font-semibold text-lg mb-2">Application Process</h4>
          <ul className="text-sm text-gray-600 text-left space-y-1">
            <li className="flex items-start">
              <span className="text-[#0b4d4b] mr-2">•</span>
              Document preparation
            </li>
            <li className="flex items-start">
              <span className="text-[#0b4d4b] mr-2">•</span>
              Statement of purpose assistance
            </li>
            <li className="flex items-start">
              <span className="text-[#0b4d4b] mr-2">•</span>
              Application submission
            </li>
            <li className="flex items-start">
              <span className="text-[#0b4d4b] mr-2">•</span>
              Interview preparation
            </li>
          </ul>
        </div>

        {/* Phase 3 */}
        <div className="bg-white rounded-xl p-6 shadow-md text-center group hover:shadow-xl transition-shadow">
          <div className="w-16 h-16 bg-[#0b4d4b] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <span className="text-white text-xl font-bold">3</span>
          </div>
          <h4 className="font-semibold text-lg mb-2">Visa & Pre-Departure</h4>
          <ul className="text-sm text-gray-600 text-left space-y-1">
            <li className="flex items-start">
              <span className="text-[#0b4d4b] mr-2">•</span>
              Visa documentation
            </li>
            <li className="flex items-start">
              <span className="text-[#0b4d4b] mr-2">•</span>
              Financial proof preparation
            </li>
            <li className="flex items-start">
              <span className="text-[#0b4d4b] mr-2">•</span>
              Pre-departure orientation
            </li>
            <li className="flex items-start">
              <span className="text-[#0b4d4b] mr-2">•</span>
              Accommodation assistance
            </li>
          </ul>
        </div>

        {/* Phase 4 */}
        <div className="bg-white rounded-xl p-6 shadow-md text-center group hover:shadow-xl transition-shadow">
          <div className="w-16 h-16 bg-[#0b4d4b] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <span className="text-white text-xl font-bold">4</span>
          </div>
          <h4 className="font-semibold text-lg mb-2">Post-Arrival Support</h4>
          <ul className="text-sm text-gray-600 text-left space-y-1">
            <li className="flex items-start">
              <span className="text-[#0b4d4b] mr-2">•</span>
              Airport pickup coordination
            </li>
            <li className="flex items-start">
              <span className="text-[#0b4d4b] mr-2">•</span>
              Bank account setup
            </li>
            <li className="flex items-start">
              <span className="text-[#0b4d4b] mr-2">•</span>
              Cultural adaptation support
            </li>
            <li className="flex items-start">
              <span className="text-[#0b4d4b] mr-2">•</span>
              Ongoing student care
            </li>
          </ul>
        </div>
      </div>
    </div>


    {/* CTA */}
    <div className="text-center mt-12">
      <Link href="/contact-us" className="bg-[#0b4d4b] text-white px-8 py-3 rounded-md font-medium hover:bg-[#0a423f] transition inline-flex items-center">
        Start Your Journey Today
        <FaArrowRight className="ml-2" />
      </Link>
    </div>
  </Container>
</div>

      {/* CTA Section */}
      <section className="py-16 bg-[#0b4d4b] text-white mt-10 mb-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Begin Your Global Education Journey
          </h2>
          <p className="text-white/90 max-w-2xl mx-auto mb-8">
            Schedule a free consultation with our education experts to explore your study abroad options
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/free-consultation"
              className="bg-white text-[#0b4d4b] px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition"
            >
              Book Free Consultation
            </Link>
            <Link
              href="/contact-us"
              className="border-2 border-white text-white px-8 py-3 rounded-md font-medium hover:bg-white/10 transition"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}