'use client';

import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { FaGlobe, FaEnvelope, FaPhone } from "react-icons/fa";
import Heading from '../../../app/components/atoms/Heading';
import Paragraph from '../../../app/components/atoms/Paragraph';
import UniversityDetailForm from '../../../app/components/molecules/UniversityDetailForm';
import UniversityCard from '../../../app/components/atoms/UniversityCard';

const UniversityOverview = ({ university, relatedUniversities }) => {
  return (
    <div className="space-y-6">
      {/* University Detail Form */}
      <div className="mt-16">
        <UniversityDetailForm university={university} />
      </div>

      {/* Related Universities Section */}
      <div className="mt-16">
        <div className="text-center mb-12">
          <Heading level={3}>Other universities and colleges</Heading>
        </div>
        {relatedUniversities.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {relatedUniversities.map(uni => (
              <UniversityCard 
                key={uni.id} 
                name={uni.name} 
                logo={uni.logo} 
                slug={uni.slug} 
                id={uni.id} 
              />
            ))}
          </div>
        ) : (
          <Paragraph className="text-center text-lg text-gray-500">
            No related universities found.
          </Paragraph>
        )}
      </div>
    </div>
  );
};

export default UniversityOverview;