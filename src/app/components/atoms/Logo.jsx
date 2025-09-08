'use client';

import PropTypes from 'prop-types';
import Image from 'next/image';
import Link from 'next/link';
const Logo = ({ className = '', size = 40 }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
    <Link href="/" className="flex items-center">
      <Image
        src="/assets/logo.png"
        alt="Universities Hub Logo"
        width={266}
        height={60}
        className="w-[266px] h-[60px] cursor-pointer"
        priority={true}
      />
    </Link>
    </div>
  );
};

Logo.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
};

Logo.defaultProps = {
  className: '',
  size: 40,
};

export default Logo; 