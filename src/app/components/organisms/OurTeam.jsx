"use client";
import Heading from "../atoms/Heading";
import Paragraph from "../atoms/Paragraph";

const OurTeam = () => {
  return (
    <section
      className="relative py-[100px] bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/assets/our.png')`,
      }}
    >
      {/* Frosted glass-like Overlay */}
      <div className="absolute inset-0 bg-[var(--brand-color)]/80 opacity-[85%] backdrop-blur-sm z-0"></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <Heading level={3}>
          <div className="text-white">Our Team</div>
        </Heading>
      <Paragraph>
          <p className="text-teal-100 text-lg mb max-w-2xl mx-auto">
          We are an experienced team of energetic people who belongs to
          different countries. We are based in Haidian District Beijing China.
          Our team members consist of Marketing and Sales officers, Admission
          officers, consultants, Software developers, and digital marketing
          staff.
        </p>
      </Paragraph>
      </div>
    </section>
  );
};

export default OurTeam;
