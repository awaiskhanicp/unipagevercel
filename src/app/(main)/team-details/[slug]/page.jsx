




"use client";
import React from "react";
import { useParams } from "next/navigation";
import Heading from "../../../components/atoms/Heading";
import Link from "next/link";

// Dummy team data
const profiles = [
  {
    slug: "alen-hispro",
    name: "Alen Hispro",
    title: "Chief Attorney",
    imageUrl:
      "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400",
    email: "needhelp@yourdomain.com",
    phone: "+012-3456-789",
    website: "www.yourdomain.com",
    about: "I help my clients stand out and they help me grow.",
    experience: {
      personal:
        "When an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries architecto dolorem ipsum quia.",
      latestBoat: 90,
      sailingBoat: 80,
      powerBoat: 75,
    },
  },
];

// 🔧 Updated ProgressBar
function ProgressBar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-[#0B6D76]">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className="bg-[#0B6D76] h-4 rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function TeamDetailPage() {
  const { slug } = useParams();
  const profile = profiles.find((p) => p.slug === slug) || profiles[0];

  return (
    <div className="bg-white text-[#0B0B0B] font-sans">
      {/* Hero Section */}
      <div className="relative bg-[#0B6D76] h-[300px] flex items-center justify-center text-white mb-16">
        <div className="absolute inset-0 opacity-30">
          <img
            src="/assets/team-hero.jpg"
            className="w-full h-full object-cover"
            alt="team"
          />
        </div>
        <div className="relative z-10 text-center">
          <p className="text-sm text-lime-400"><Link href={'/'}>Home</Link> &gt; Team Details</p>
          <h1 className="text-4xl font-bold">Team Details</h1>
        </div>
      </div>

      {/* Profile Section */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 px-4 mb-16">
        <img
          src={profile.imageUrl}
          alt={profile.name}
          className="w-[50%] h-[600px] object-cover rounded-3xl shadow-md"
        />
        <div className="text-center md:text-left">
          <Heading
            level={3}
            className="text-2xl font-bold text-[#0B0B0B] mb-2"
          >
            {profile.name}
          </Heading>
          <p className="text-sm text-[#0B6D76] font-medium mb-4">
            {profile.title}
          </p>
          <Heading level={4}>
            <p className="pb-[30px]">{profile.about}</p>
          </Heading>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <Heading level={4}>
                <span>
                  Email Address:
                  <br />
                  <span className="text-[16px] relative -top-[10px]">
                    {profile.email}
                  </span>
                </span>
              </Heading>
            </p>
            <p>
              <Heading level={4}>
                <span>
                  Phone Number:
                  <br />
                  <span className="text-[16px] relative -top-[10px]">
                    {profile.phone}
                  </span>
                </span>
              </Heading>
            </p>
            <p>
              <Heading level={4}>
                <span>
                  Web Address:
                  <br />
                  <span className="text-[16px] relative -top-[10px]">
                    {profile.website}
                  </span>
                </span>
              </Heading>
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#">
                <img
                  src="https://img.icons8.com/ios-filled/24/x.png"
                  alt="x"
                />
              </a>
              <a href="#">
                <img
                  src="https://img.icons8.com/ios-filled/24/facebook-new.png"
                  alt="fb"
                />
              </a>
              <a href="#">
                <img
                  src="https://img.icons8.com/ios-filled/24/pinterest--v1.png"
                  alt="pin"
                />
              </a>
              <a href="#">
                <img
                  src="https://img.icons8.com/ios-filled/24/instagram-new.png"
                  alt="insta"
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Updated Experience Section */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 px-4 md:px-8 py-12 bg-white rounded-xl shadow-md mb-16">
        {/* Personal Experience Text */}
        <div>
          <h3 className="text-2xl font-semibold text-[#0B6D76] mb-4">
            Personal Experience
          </h3>
          <p className="text-gray-700 text-base leading-relaxed tracking-wide">
            {profile.experience.personal}
          </p>
        </div>

        {/* Progress Bars */}
        <div className="flex flex-col gap-6">
          <ProgressBar
            label="Latest Boat Experience"
            value={profile.experience.latestBoat}
          />
          <ProgressBar
            label="Sailing Boat Experience"
            value={profile.experience.sailingBoat}
          />
          <ProgressBar
            label="Power Boat Experience"
            value={profile.experience.powerBoat}
          />
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <p className="text-sm text-lime-500 mb-2">Contact With Us Now</p>
          <h2 className="text-2xl font-bold mb-8">
            Feel Free to Write Our {profile.name}
          </h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <input
              type="text"
              placeholder="Enter Name"
              className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-[#0B6D76]"
            />
            <input
              type="email"
              placeholder="Enter Email"
              className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-[#0B6D76]"
            />
            <input
              type="text"
              placeholder="Enter Subject"
              className="border border-gray-300 rounded-lg px-4 py-3 w-full md:col-span-2"
            />
            <input
              type="text"
              placeholder="Enter Phone"
              className="border border-gray-300 rounded-lg px-4 py-3 w-full md:col-span-2"
            />
            <textarea
              placeholder="Enter Message"
              rows={4}
              className="border border-gray-300 rounded-lg px-4 py-3 w-full md:col-span-2 resize-none"
            ></textarea>
            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                className="bg-[#0B6D76] cursor-pointer text-white px-6 py-3 rounded-md font-semibold hover:bg-[#095a5e] transition"
              >
                Send Message
              </button>
              <button
                type="reset"
                className="bg-lime-400 text-black px-6 py-3 cursor-pointer rounded-md font-semibold hover:bg-lime-500 transition"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}