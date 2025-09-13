'use client';

import React, { ReactNode } from 'react';
import clsx from 'clsx';

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string; // ✅ optional now
}

const Heading: React.FC<HeadingProps> = ({ level, children, className }) => {
  const styles: Record<number, string> = {
    1: "text-[32px] sm:text-[40px] md:text-[50px] lg:text-[80px] xl:text-[80px] font-normal", 
    2: "text-[12px] sm:text-[12px] md:text-[14px] lg:text-[14px] xl:text-[14px] text-black font-normal", 
    3: "text-[30px] xl:leading-[60px] lg:leading-[60px] md:leading-[70px] sm:leading-[20px] leading-[10px] sm:text-[30px] md:text-[50px] lg:text-[54px] xl:text-[54px] leading-[57px] text-black font-normal", 
    4: "text-[22px] sm:text-[22px] md:text-[28px] lg:text-[28px] xl:text-[28px] text-black font-normal", 
    5: "text-[20px] sm:text-[20px] md:text-[22px] lg:text-[24px] xl:text-[24px] font-normal", 
    6: "text-[16px] sm:text-[16px] md:text-[16px] lg:text-[16px] xl:text-[16px] text-black font-normal", 
  };

  const combinedClassName = clsx(styles[level] || "text-lg font-medium", className);

  switch (level) {
    case 1: return <h1 className={combinedClassName}>{children}</h1>;
    case 2: return <h2 className={combinedClassName}>{children}</h2>;
    case 3: return <h3 className={combinedClassName}>{children}</h3>;
    case 4: return <h4 className={combinedClassName}>{children}</h4>;
    case 5: return <h5 className={combinedClassName}>{children}</h5>;
    case 6: return <h6 className={combinedClassName}>{children}</h6>;
    default: return <h1 className={combinedClassName}>{children}</h1>;
  }
};

export default Heading;
