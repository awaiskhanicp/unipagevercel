import React from "react";

interface ParagraphProps {
  children: React.ReactNode;
  className?: string; // 👈 optional
}

const Paragraph: React.FC<ParagraphProps> = ({ children, className }) => {
  const baseClass =
    "xl:text-[18px] lg:text-[18px] md:text-[18px] sm:text-[15px] text-[14px] text-[#000000] font-400";

  return (
    <span className={`${baseClass} ${className || ""}`}>
      {children}
    </span>
  );
};

export default Paragraph;
