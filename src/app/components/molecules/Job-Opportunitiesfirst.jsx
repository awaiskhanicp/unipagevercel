import React from 'react';
import { FaMapMarkerAlt, FaUserAlt, FaComments } from 'react-icons/fa';
import Heading from '../atoms/Heading';
import Paragraph from '../atoms/Paragraph';
import Button from '../atoms/Button';
import { useRouter } from 'next/navigation';

export const JobOpportunitiesfirst = ({ id, image, title, workType, location, experience, skills }) => {

  const skillsArray = Array.isArray(skills) ? skills : (skills ? skills.split(',') : []);

  const router = useRouter();
  const handleClick = () => {
    if (id) router.push(`/jobs/job-detail/${id}`);
  };
  return (
    <div className="relative w-full h-[250px] md:h-[400px] rounded-3xl overflow-visible shadow-lg mb-44 cursor-pointer" onClick={handleClick}>
      {/* Image */}
      <img 
        src={image} 
        alt={title}
        className="w-full h-full object-cover rounded-3xl"
      />

      {/* Curved overlay card */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 md:w-[80%] sm:w-[95%] w-[95%] bg-[#E7F1F2] rounded-tr-[82px] rounded-bl-[82px] rounded-br-[82px] p-6 shadow-md">
        <Heading level={4}>
          <div className="mb-3">{title}</div>
        </Heading>

        <div className="flex flex-wrap gap-3 mb-4">
          {workType.map((type, index) => (
            <span 
              key={index}
              className="text-sm text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-full"
            >
              {type}
            </span>
          ))}
        </div>

        <div className="space-y-2 mb-5 text-sm text-gray-600">
          <Paragraph>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-teal-600" />
              {location}
            </div>
          </Paragraph>

          <Paragraph>
            <div className="flex items-center gap-2">
              <FaUserAlt className="text-teal-600" />
              {experience}
            </div>
          </Paragraph>

          <Paragraph>
            <div className="flex items-start gap-2">
              <FaComments className="text-teal-600 mt-1" />
              <span>{skillsArray.join(', ')}</span>
            </div>
          </Paragraph>
        </div>

        <div className="flex justify-center">
          <Button>View Job</Button>
        </div>
      </div>
    </div>
  );
};