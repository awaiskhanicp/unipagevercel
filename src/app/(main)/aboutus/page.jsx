import Head from 'next/head'
import Heading from '../../../app/components/atoms/Heading'
import Image from 'next/image'
import { Briefcase, ShieldCheck, Users, Clock , CheckCircle, Globe, Calendar, MapPin, Phone, Mail, Plus, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react'

export default function AboutPage() {

  const features = [
  {
    icon: <ShieldCheck className="w-6 h-6 text-[#0b4d4b]" />,
    title: 'Secure Process',
    description: 'Your documents are handled with top-level security and confidentiality.',
  },
  {
    icon: <Users className="w-6 h-6 text-[#0b4d4b]" />,
    title: 'Expert Team',
    description: 'Get guidance from experienced visa consultants and legal experts.',
  },
];

const stats = [
  {
    icon: <Briefcase className="w-6 h-6 text-[#0b4d4b]" />,
    number: '30K+',
    label: 'Clients Served Worldwide',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-[#0b4d4b]" />,
    number: '100%',
    label: 'Visa Success Rate',
  },
  {
    icon: <Clock className="w-6 h-6 text-[#0b4d4b]" />,
    number: '1 Day',
    label: 'Average Processing Time',
  },
  {
    icon: <Users className="w-6 h-6 text-[#0b4d4b]" />,
    number: '50+',
    label: 'Global Team Members',
  },
];

 const profiles = [
    {
      name: 'Guy Hawkins',
      title: 'Admin',
      imageUrl:
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      name: 'Jacob Jones',
      title: 'Manager',
      imageUrl:
        'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      name: 'Kristin Watson',
      title: 'Consultant',
      imageUrl:
        'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      name: 'Bessie Cooper',
      title: 'Founder',
      imageUrl:
        'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      name: 'Kristin Watson',
      title: 'Consultant',
      imageUrl:
        'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      name: 'Guy Hawkins',
      title: 'Admin',
      imageUrl:
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      name: 'Kristin Watson',
      title: 'Consultant',
      imageUrl:
        'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      name: 'Bessie Cooper',
      title: 'Founder',
      imageUrl:
        'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ]


  return (
    <>  
      <Head>
        <title>About Us | Your Visa Partner</title>
        <meta name="description" content="Learn about our mission, team, and commitment to your visa success" />
      </Head>
      
      {/* Hero Section */}
      <section className="relative md:h-[50vh] sm:h-[50vh] md:pt-[0px] sm:pt-[90px] pt-[90px] h-[50vh] flex items-center justify-center overflow-hidden">
       {/* Background Image */}
       <img
         src="/assets/breadcrumb_bg.jpg"
         alt="Hero Background"
         className="absolute top-0 left-0 w-full h-full object-cover z-0"
       />
       {/* Overlay */}
       <div className="absolute inset-0 bg-gray-100 opacity-50 z-10"></div>
 
       {/* Gradient Overlay */}
       <div className="absolute inset-0 z-10 "></div>
       {/* Content */}
       <div className="relative z-20 text-center px-4 max-w-4xl mx-auto pb-12">
         <Heading level={1}>
           <div className="text-white">About us</div>
         </Heading>
       </div>
     </section>

    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-12 items-center">
          {/* Left Text Block */}
          <div className="grid lg:grid-cols-2 gap-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug mb-4">
              <span className="block">Committed to Your Visa</span>
              <span className="block font-light text-gray-700">Success – About us</span>
            </h2>
            <p className="text-gray-600 leading-relaxed max-w-sm mb-6">
              We deliver budget-friendly visa solutions, removing financial barriers from your journey. Our goal is to provide quality services at reasonable rates.
            </p>
          </div>

          {/* Right Image + Floating Stat */}
          <div className="relative">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/assets/about_img3.jpg"
                alt="Visa Team"
                width={800}
                height={500}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-[#0b4d4b] text-white p-6 rounded-xl shadow-xl w-[280px]">
              <div className="text-4xl font-bold">15+</div>
              <div className="text-sm mt-1">Years of Combined Experience</div>
            </div>
          </div>
        </div>

        {/* Stats Block */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white text-center px-4 py-8 rounded-xl shadow-sm border">
              <div className="flex justify-center mb-3">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
              <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

      {/* Mission Section */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[#0b4d4b] font-semibold">OUR MISSION</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              Simplifying Global Mobility
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-xl overflow-hidden shadow-xl aspect-video">
              <Image
                src="/assets/mission.jpg"
                alt="Our Mission"
                width={800}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Guiding Your Path with Our Immigration Mission
              </h3>
              <p className="text-gray-600 mb-6">
                We believe borders shouldn't limit opportunities. Our mission is to break down barriers to global mobility through:
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="flex-shrink-0 h-5 w-5 text-[#0b4d4b] mt-1 mr-3" />
                  <span className="text-gray-700">Comprehensive visa consultation tailored to your specific needs</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="flex-shrink-0 h-5 w-5 text-[#0b4d4b] mt-1 mr-3" />
                  <span className="text-gray-700">Transparent pricing with no hidden fees</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="flex-shrink-0 h-5 w-5 text-[#0b4d4b] mt-1 mr-3" />
                  <span className="text-gray-700">End-to-end support from application to approval</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="flex-shrink-0 h-5 w-5 text-[#0b4d4b] mt-1 mr-3" />
                  <span className="text-gray-700">Continuous updates on immigration policy changes</span>
                </li>
              </ul>
              
              <button className="mt-8 bg-[#0b4d4b] text-white px-6 py-3 rounded-md hover:bg-[#0a423f] transition duration-300">
                Learn About Our Process
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-last lg:order-first">
              <span className="text-[#0b4d4b] font-semibold">OUR HISTORY</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-6">
                A Decade of Immigration Excellence
              </h2>
              <p className="text-gray-600 mb-6">
                What began as a small office helping local students with study visas has grown into an internationally recognized immigration consultancy. Our journey reflects our commitment to adapting to changing immigration landscapes while maintaining personal service.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-[#0b4d4b] text-white rounded-full w-10 h-10 flex items-center justify-center mr-4 mt-1">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">2010 - Founding</h4>
                    <p className="text-gray-600">Established with focus on student visas in 3 countries</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-[#0b4d4b] text-white rounded-full w-10 h-10 flex items-center justify-center mr-4 mt-1">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">2015 - Expansion</h4>
                    <p className="text-gray-600">Added work visas and expanded to 12 countries</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-[#0b4d4b] text-white rounded-full w-10 h-10 flex items-center justify-center mr-4 mt-1">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">2020 - Digital Transformation</h4>
                    <p className="text-gray-600">Launched online portal for document submission and tracking</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-[#0b4d4b] text-white rounded-full w-10 h-10 flex items-center justify-center mr-4 mt-1">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Present - Global Reach</h4>
                    <p className="text-gray-600">Serving clients in 50+ countries with 98% satisfaction rate</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative rounded-xl overflow-hidden shadow-xl aspect-video order-first lg:order-last">
              <Image
                src="/assets/vission.jpg"
                alt="Our History"
                width={800}
                height={600}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-8">
                <div className="text-white">
                  <div className="text-2xl font-bold mb-2">Our Founders</div>
                  <p>From left: Sarah Chen, Michael Rodriguez, and James Wilson at our first office</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[#0b4d4b] font-semibold">MEET THE TEAM</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              Our Immigration Experts
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mt-4">
              A diverse team united by one goal: making your visa journey smooth and successful
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {profiles.map((profile, index) => (
          <div
            key={index}
            className="relative w-72 h-[400px] rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl group transition-all duration-300"
          >
            {/* Image Area with Hover Stretch */}
            <div className="relative w-full h-[75%] overflow-hidden rounded-t-3xl">
              <div
                className="w-full h-full bg-cover bg-center origin-left scale-x-100 group-hover:scale-x-125 transition-transform duration-700 ease-in-out"
                style={{ backgroundImage: `url(${profile.imageUrl})` }}
              ></div>

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />

              {/* Social Icons */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-5 z-30">
                {['f', 'IG', 'in', 'Be'].map((icon, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-semibold text-black shadow-md"
                  >
                    {icon}
                  </div>
                ))}
              </div>

              {/* Plus → X Button */}
              <div className="absolute bottom-4 right-4 z-40">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-2xl font-bold bg-[#0B6D76] group-hover:bg-red-500 group-hover:rotate-45 transition-all duration-300">
                  +
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="bg-white h-[25%] rounded-b-3xl p-4 flex flex-col justify-center transition-colors duration-300 group-hover:bg-[#0B6D76] group-hover:text-white">
              <h2 className="text-lg font-bold text-gray-900 group-hover:text-white">
                {profile.name}
              </h2>
              <p className="text-sm text-gray-500 group-hover:text-white/80">
                {profile.title}
              </p>
            </div>
          </div>
        ))}
          </div>
          
          <div className="text-center mt-12">
            <button className="bg-[#0b4d4b] text-white px-8 py-3 rounded-md hover:bg-[#0a423f] transition duration-300 inline-flex items-center">
              See All Team Members
              <Plus className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#0b4d4b] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Begin Your Visa Journey?
          </h2>
          <p className="text-white/90 max-w-2xl mx-auto mb-8">
            Get a free consultation with one of our immigration experts today
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-[#0b4d4b] px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition">
              Book Consultation
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-md font-medium hover:bg-white/10 transition">
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter & Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Newsletter */}
            <div className="bg-[#f8fafc] p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-6">
                <Mail className="text-[#0b4d4b] w-8 h-8 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Stay Updated</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Subscribe to our newsletter for visa policy updates, success stories, and exclusive offers
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-grow px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b4d4b]"
                />
                <button className="bg-[#0b4d4b] text-white px-6 py-3 rounded-md hover:bg-[#0a423f] transition whitespace-nowrap">
                  Subscribe
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-3">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
            
            {/* Contact */}
            <div className="bg-[#f8fafc] p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-6">
                <Phone className="text-[#0b4d4b] w-8 h-8 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Contact Us</h3>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <MapPin className="text-[#0b4d4b] w-5 h-5 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Headquarters</h4>
                    <p className="text-gray-600 text-sm">123 Visa Lane, Global City, GC 10001</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="text-[#0b4d4b] w-5 h-5 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Phone</h4>
                    <p className="text-gray-600 text-sm">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="text-[#0b4d4b] w-5 h-5 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Email</h4>
                    <p className="text-gray-600 text-sm">info@visaconsultant.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="text-[#0b4d4b] w-5 h-5 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Hours</h4>
                    <p className="text-gray-600 text-sm">Mon-Fri: 9am-6pm (GMT)</p>
                  </div>
                </div>
              </div>
              
              <button className="mt-6 bg-[#0b4d4b] text-white px-6 py-3 rounded-md hover:bg-[#0a423f] transition w-full sm:w-auto">
                Contact Form
              </button>
            </div>
          </div>
          
          {/* Map */}
          <div className="mt-12 rounded-xl overflow-hidden shadow-xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.215573291865!2d-73.98784492453745!3d40.74844047138972!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1712345678901!5m2!1sen!2sus"
              width="100%"
              height="400"
              className="border-0"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>
    </>
  )
}