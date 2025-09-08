'use client';

import Image from 'next/image';
import Heading from '../atoms/Heading';
import Paragraph from '../atoms/Paragraph';

const TeamMember = ({ name, role, image, className = '', style }) => {
  return (
    <div
      className={`text-center ${className}`}
      style={style}
    >
      <div className="w-32 h-32 mx-auto mb-4 rounded-full relative overflow-hidden shadow-lg">
        {/* IMAGE */}
        <Image
          src={image}
          alt={name}
          width={128}
          height={128}
          className="w-full h-full object-cover"
        />
        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      </div>
      {/* TEXT */}
      <Heading level={3}>{name}</Heading>
      <Paragraph>{role}</Paragraph>
    </div>
  );
};

export default TeamMember;
