'use client';

import { useEffect, useState } from 'react';
import UniversityCountryatom from '../atoms/UniversityCountryatom';
import Button from '../atoms/Button';
import Link from 'next/link';

const UniversityCountrySection = ({ countries }) => {
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (countries && countries.length > 0) {
      processCountries();
    }
  }, [countries]);

  const processCountries = () => {
    try {
      setLoading(true);

      const transformed = countries.map((c) => {
        const feeValue = Number(c.consultation_fee) || 0;
        const discountValue = Number(c.consultation_fee_discount) || 0;

        const fee = `${feeValue} ${c.currency || ''}`;
        const discountFee = `${discountValue} ${c.currency || ''}`;

        let discount = '';
        if (feeValue > 0 && discountValue > 0 && discountValue < feeValue) {
          const percent = Math.round(((feeValue - discountValue) / feeValue) * 100);
          discount = `${percent}% OFF`;
        }

        return {
          name: `${c.country || c.country_name || c.name || ''} (${c.code || ''})`,
          flag: c.image || '/assets/uni.png',
          discounted: discountFee,
          actual: fee,
          discount,
        };
      });

      setFilteredCountries(transformed);
    } catch (err) {
      console.error('Error processing countries:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">Loading countries...</div>
      </div>
    );
  }

  return (
    <div>
      <UniversityCountryatom data={filteredCountries} linkType="search" />
      {filteredCountries.length > 4 && (
        <div className="text-center mt-16">
          <Link href="/visit-visa">
            <Button>See All</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default UniversityCountrySection;
