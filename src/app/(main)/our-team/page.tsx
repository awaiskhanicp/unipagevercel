'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Linkedin, Mail, Twitter, BookOpen, GraduationCap, Globe, Award, Users } from 'lucide-react';

export default function OurTeam() {
  const profiles = [
    {
      name: 'Sarah Johnson',
      title: 'Founder & CEO',
      imageUrl: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'sarah-johnson',
      bio: 'With over 15 years in international education, Sarah founded UniversitiesPage to make global education accessible to all.',
      expertise: ['US Universities', 'UK Education System', 'Scholarship Guidance'],
      education: 'M.Ed. International Education, Harvard University'
    },
    {
      name: 'Michael Rodriguez',
      title: 'Director of Admissions',
      imageUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'michael-rodriguez',
      bio: 'Michael specializes in North American universities and has helped hundreds of students secure admissions.',
      expertise: ['Canadian Universities', 'US Ivy League', 'Application Strategy'],
      education: 'MBA Education Management, Stanford University'
    },
    {
      name: 'Priya Sharma',
      title: 'Senior Education Consultant',
      imageUrl: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'priya-sharma',
      bio: 'Priya is an expert on UK and European education systems with a background in academic counseling.',
      expertise: ['UK Universities', 'European Programs', 'Student Visa Guidance'],
      education: 'M.A. Education Counseling, University of Oxford'
    },
    {
      name: 'David Kim',
      title: 'Visa Specialist',
      imageUrl: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'david-kim',
      bio: 'David has an exceptional track record with visa approvals and stays updated on immigration policies.',
      expertise: ['Student Visas', 'Documentation', 'Interview Preparation'],
      education: 'J.D. Immigration Law, Georgetown University'
    },
    {
      name: 'Emily Chen',
      title: 'Australia & NZ Specialist',
      imageUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'emily-chen',
      bio: 'Emily specializes in Australian and New Zealand education systems with extensive regional knowledge.',
      expertise: ['Australian Universities', 'NZ Education', 'Pacific Region Programs'],
      education: 'M.A. International Relations, Australian National University'
    },
    {
      name: 'James Wilson',
      title: 'Financial Aid Advisor',
      imageUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'james-wilson',
      bio: 'James helps students navigate financial aid options and scholarship opportunities worldwide.',
      expertise: ['Scholarships', 'Financial Planning', 'Education Loans'],
      education: 'M.Sc. Financial Management, London School of Economics'
    },
    {
      name: 'Lisa Taylor',
      title: 'European Programs Manager',
      imageUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'lisa-taylor',
      bio: 'Lisa specializes in European universities with fluency in 4 languages and deep cultural understanding.',
      expertise: ['European Universities', 'Language Programs', 'EU Education Systems'],
      education: 'M.A. European Studies, Sciences Po Paris'
    },
    {
      name: 'Robert Martinez',
      title: 'Career Counselor',
      imageUrl: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'robert-martinez',
      bio: 'Robert helps students align their education choices with long-term career goals and market trends.',
      expertise: ['Career Planning', 'Internship Programs', 'Post-Study Work'],
      education: 'Ph.D. Career Development, University of Toronto'
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Students Guided' },
    { number: '98%', label: 'Success Rate' },
    { number: '25+', label: 'Countries Covered' },
    { number: '50+', label: 'University Partners' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-[#0b4d4b] text-white">
        <div className="absolute inset-0 bg-[url('/assets/breadcrumb_bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Meet Our Team</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Dedicated education experts committed to your study abroad success
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-[#0b4d4b] mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Education Experts</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our team comprises experienced education consultants, visa specialists, and country experts 
              who are passionate about helping students achieve their international education goals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {profiles.map((profile, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={profile.imageUrl}
                    alt={profile.name}
                    fill
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="bg-white p-2 rounded-full shadow-md hover:bg-[#0b4d4b] hover:text-white transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </button>
                    <button className="bg-white p-2 rounded-full shadow-md hover:bg-[#0b4d4b] hover:text-white transition-colors">
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{profile.name}</h3>
                  <p className="text-[#0b4d4b] font-medium mb-3">{profile.title}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.expertise.slice(0, 2).map((item, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {item}
                      </span>
                    ))}
                  </div>
                  
                  <Link 
                    href={`/page-team-details/${profile.slug}`}
                    className="mt-4 inline-block text-[#0b4d4b] font-medium text-sm hover:underline"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Start Your Journey?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Book a free consultation with one of our education experts to discuss your study abroad options
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/free-consultation"
              className="bg-[#0b4d4b] text-white px-8 py-3 rounded-md font-medium hover:bg-[#0a423f] transition"
            >
              Book Consultation
            </Link>
            <Link
              href="/contact-us"
              className="border-2 border-[#0b4d4b] text-[#0b4d4b] px-8 py-3 rounded-md font-medium hover:bg-[#0b4d4b] hover:text-white transition"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Team?</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our expertise and approach make us the ideal partner for your study abroad journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="bg-[#0b4d4b] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Guidance</h3>
              <p className="text-gray-600">Our consultants have firsthand experience with international education systems</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-[#0b4d4b] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized Approach</h3>
              <p className="text-gray-600">We tailor our advice to your unique goals, background, and preferences</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-[#0b4d4b] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Network</h3>
              <p className="text-gray-600">Direct connections with universities worldwide for better opportunities</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-[#0b4d4b] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Proven Success</h3>
              <p className="text-gray-600">Track record of helping students gain admission to top institutions</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}