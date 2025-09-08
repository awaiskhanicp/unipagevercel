"use client"
import React from "react";

export default function BottomMarquee() {
  return (
    <div className="w-full bg-[#0B6D76] py-3 overflow-hidden">
      <div
        className="marquee-content whitespace-nowrap text-white font-semibold text-lg px-4"
        style={{ display: "inline-block", minWidth: "100%" }}
      >
        <span className="mx-8">✔️ 100% Verified Consultants</span>
        <span className="mx-8">✔️ Fast Application Process</span>
        <span className="mx-8">✔️ Free Consultation</span>
        <span className="mx-8">✔️ Scholarships Available</span>
        <span className="mx-8">✔️ 24/7 Support</span>
        {/* Repeat for smooth loop */}
        <span className="mx-8">✔️ 100% Verified Consultants</span>
        <span className="mx-8">✔️ Fast Application Process</span>
        <span className="mx-8">✔️ Free Consultation</span>
        <span className="mx-8">✔️ Scholarships Available</span>
        <span className="mx-8">✔️ 24/7 Support</span>
      </div>
      <style jsx global>{`
        .marquee-content {
          animation: marquee 20s linear infinite;
          animation-play-state: running;
        }
        .marquee-content:hover {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}