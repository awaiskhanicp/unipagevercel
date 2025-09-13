import Head from 'next/head'
import Heading from '../../../app/components/atoms/Heading'
import Image from 'next/image';
import Link from "next/link";
import { Briefcase, ShieldCheck, Users, Clock, CheckCircle, Globe, Calendar, MapPin, Phone, Mail, Plus, Facebook, Instagram, Linkedin, Twitter, BookOpen, GraduationCap, GlobeIcon, Award, Heart } from 'lucide-react'

export default function AboutPage() {

  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#0b4d4b]" />,
      title: 'Secure Process',
      description: 'Your documents and personal information are handled with the highest level of security and confidentiality.',
    },
    {
      icon: <Users className="w-6 h-6 text-[#0b4d4b]" />,
      title: 'Expert Advisors',
      description: 'Get guidance from experienced education consultants who have helped thousands of students.',
    },
    {
      icon: <BookOpen className="w-6 h-6 text-[#0b4d4b]" />,
      title: 'Comprehensive Support',
      description: 'From university selection to visa application, we provide end-to-end assistance for your study abroad journey.',
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-[#0b4d4b]" />,
      title: 'University Partnerships',
      description: 'Direct connections with hundreds of universities worldwide for better admission opportunities.',
    },
  ];

  const stats = [
    {
      icon: <Briefcase className="w-6 h-6 text-[#0b4d4b]" />,
      number: '10K+',
      label: 'Students Successfully Placed',
    },
    {
      icon: <GlobeIcon className="w-6 h-6 text-[#0b4d4b]" />,
      number: '25+',
      label: 'Countries We Work With',
    },
    {
      icon: <Award className="w-6 h-6 text-[#0b4d4b]" />,
      number: '98%',
      label: 'Visa Success Rate',
    },
    {
      icon: <Users className="w-6 h-6 text-[#0b4d4b]" />,
      number: '50+',
      label: 'Partner Universities',
    },
  ];

  const services = [
    {
      title: 'University Selection',
      description: 'Expert guidance choosing the right university based on your profile, preferences and career goals.'
    },
    {
      title: 'Admission Assistance',
      description: 'Complete support with applications, documentation, and meeting admission requirements.'
    },
    {
      title: 'Visa Guidance',
      description: 'Professional assistance with visa applications, documentation, and interview preparation.'
    },
    {
      title: 'Pre-Departure Briefing',
      description: 'Comprehensive orientation about your destination country, culture, and what to expect.'
    },
    {
      title: 'Scholarship Assistance',
      description: 'Help identifying and applying for scholarships and financial aid opportunities.'
    },
    {
      title: 'Post-Arrival Support',
      description: 'Continued assistance after you arrive in your host country for a smooth transition.'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      title: 'Founder & CEO',
      imageUrl: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'With over 15 years in international education, Sarah founded UniversitiesPage to make global education accessible to all.'
    },
    {
      name: 'Michael Rodriguez',
      title: 'Director of Admissions',
      imageUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Michael specializes in North American universities and has helped hundreds of students secure admissions.'
    },
    {
      name: 'Priya Sharma',
      title: 'Senior Education Consultant',
      imageUrl: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Priya is an expert on UK and European education systems with a background in academic counseling.'
    },
    {
      name: 'David Kim',
      title: 'Visa Specialist',
      imageUrl: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'David has an exceptional track record with visa approvals and stays updated on immigration policies.'
    }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8 text-[#0b4d4b]" />,
      title: 'Student-Centric Approach',
      description: 'We prioritize your aspirations and needs in every step of your study abroad journey.'
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-[#0b4d4b]" />,
      title: 'Integrity & Transparency',
      description: 'Honest advice and clear communication about processes, costs, and expectations.'
    },
    {
      icon: <Globe className="w-8 h-8 text-[#0b4d4b]" />,
      title: 'Global Perspective',
      description: 'We understand international education landscapes and cultural nuances.'
    },
    {
      icon: <Award className="w-8 h-8 text-[#0b4d4b]" />,
      title: 'Excellence in Service',
      description: 'Committed to delivering exceptional results and support throughout your journey.'
    }
  ];

  return (
    <>  
      <Head>
        <title>About Us | UniversitiesPage - Study Abroad Consultants</title>
        <meta name="description" content="Learn about UniversitiesPage, your trusted partner for study abroad programs, university admissions, and visa guidance. Discover our mission, team, and commitment to your international education success." />
      </Head>
      
      {/* Hero Section */}
      <section className="relative md:h-[60vh] sm:h-[50vh] md:pt-[0px] sm:pt-[90px] pt-[90px] h-[50vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
<Image
  src="/assets/breadcrumb_bg.jpg"
  alt="Students studying abroad"
  fill
  className="absolute top-0 left-0 object-cover z-0"
/>
        {/* Overlay */}
        <div className="absolute inset-0 bg-[#0b4d4b] opacity-80 z-10"></div>
 
        {/* Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <Heading level={1}>
            <div className="text-white text-4xl md:text-5xl font-bold mb-4">About UniversitiesPage</div>
          </Heading>
          <p className="text-white text-lg md:text-xl max-w-2xl mx-auto">
            Empowering students to achieve global education dreams through expert guidance and comprehensive support.
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Text Block */}
            <div>
              <span className="text-[#0b4d4b] font-semibold uppercase tracking-wide">Who We Are</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">
                Your Trusted Partner in Global Education
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                UniversitiesPage, powered by Sunrise International Education Consultancy Private Limited, 
                is a leading study abroad consultancy dedicated to helping students navigate the complex 
                process of international education. Since our inception, we have been committed to making 
                quality education accessible across borders.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our team of experienced counselors understands the challenges students face when pursuing 
                education overseas. We provide personalized guidance tailored to each student academic 
                background, career aspirations, and personal preferences, ensuring the best possible fit 
                between students and institutions.
              </p>
            </div>

            {/* Right Image */}
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/assets/about_img3.jpg"
                alt="UniversityPage team helping students"
                width={800}
                height={500}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Stats Block */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white text-center px-4 py-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-3">{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-6">
                <div className="bg-[#0b4d4b] p-2 rounded-full mr-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
              </div>
              <p className="text-gray-600 mb-6">
                To democratize access to quality global education by providing expert guidance, 
                transparent processes, and comprehensive support that empowers students to achieve 
                their academic and career aspirations without boundaries.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="flex-shrink-0 h-5 w-5 text-[#0b4d4b] mt-1 mr-3" />
                  <span className="text-gray-700">Make international education accessible to all qualified students</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="flex-shrink-0 h-5 w-5 text-[#0b4d4b] mt-1 mr-3" />
                  <span className="text-gray-700">Provide honest, transparent guidance throughout the application process</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="flex-shrink-0 h-5 w-5 text-[#0b4d4b] mt-1 mr-3" />
                  <span className="text-gray-700">Build lasting relationships with educational institutions worldwide</span>
                </li>
              </ul>
            </div>
            
            {/* Vision */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-6">
                <div className="bg-[#0b4d4b] p-2 rounded-full mr-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
              </div>
              <p className="text-gray-600 mb-6">
                To create a world where geographical boundaries no longer limit educational opportunities, 
                and where every student can access the best global education that aligns with their potential 
                and ambitions.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="flex-shrink-0 h-5 w-5 text-[#0b4d4b] mt-1 mr-3" />
                  <span className="text-gray-700">Become the most trusted name in international education consulting</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="flex-shrink-0 h-5 w-5 text-[#0b4d4b] mt-1 mr-3" />
                  <span className="text-gray-700">Expand our network to include every major educational destination</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="flex-shrink-0 h-5 w-5 text-[#0b4d4b] mt-1 mr-3" />
                  <span className="text-gray-700">Develop innovative digital tools to simplify the study abroad process</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[#0b4d4b] font-semibold uppercase tracking-wide">Our Services</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              Comprehensive Study Abroad Support
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mt-4">
              We guide you through every step of your study abroad journey, from initial consultation 
              to post-arrival support in your destination country.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-[#f8fafc] p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <div className="bg-[#0b4d4b] w-12 h-12 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[#0b4d4b] font-semibold uppercase tracking-wide">Our Values</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              The Principles That Guide Us
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[#0b4d4b] font-semibold uppercase tracking-wide">Our Team</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              Meet Our Education Experts
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mt-4">
              Our team comprises experienced education consultants, visa specialists, and country experts 
              who are passionate about helping students achieve their international education goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <div className="relative h-64 overflow-hidden">
                  <Image
                   src={member.imageUrl}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                  <p className="text-[#0b4d4b] font-medium mb-3">{member.title}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                  <div className="flex space-x-3 mt-4">
                    <Linkedin className="w-5 h-5 text-gray-500 hover:text-[#0b4d4b] cursor-pointer" />
                    <Twitter className="w-5 h-5 text-gray-500 hover:text-[#0b4d4b] cursor-pointer" />
                    <Mail className="w-5 h-5 text-gray-500 hover:text-[#0b4d4b] cursor-pointer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#0b4d4b] text-white">
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

    </>
  )
}