'use client';

import Image from 'next/image';
import Heading from '../../../app/components/atoms/Heading';

const UniversityPhotos = ({ university }) => {

  console.log("University Data", university)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <Heading level={3} className="mb-6">Campus Photos</Heading>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="relative h-64 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <Image
              src={university.feature_image || "/assets/logo1.png"}
              alt={`${university.name} campus photo`}
              fill
              className="object-cover w-[100%] hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityPhotos;
