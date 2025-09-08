import React from 'react';
import CoursePageType from '../organisms/CoursePageType'; // Adjust path if needed
import { Universities } from '../../utils/OurUniversities'; // Adjust path if needed
import Heading from '../atoms/Heading';

const OurOffice = () => {

  return (
    <div className="text-center">
      <Heading level={3}> Our <span className="text-[#0B6D76]">Offices</span></Heading>
      <div className="grid grid-cols-1 py-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10 gap-20">
        {Universities.map((course, index) => (
          <CoursePageType
            key={index}
            title={course.title}
            subtitle={course.subtitle}
            image={course.image}
            icon={false}
          />
        ))}
      </div>
    </div>
  );
};

export default OurOffice;
