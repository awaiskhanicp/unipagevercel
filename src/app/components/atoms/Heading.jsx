import PropTypes from "prop-types";

const Heading = ({ level, children }) => {
  const styles = {
    1: "text-[32px] sm:text-[40px] md:text-[50px] lg:text-[80px] xl:text-[80px] font-normal", // Very Large Heading
    2: "text-[12px] sm:text-[12px] md:text-[14px] lg:text-[14px] xl:text-[14px] text-black font-normal", // Paragraph or Small Text
    3: "text-[30px] xl:leading-[60px] lg:leading-[60px] md:leading-[70px] sm:leading-[20px] leading-[10px] sm:text-[30px] md:text-[50px] lg:text-[54px] xl:text-[54px] leading-[57px] text-black font-normal", // Section Title
    4: "text-[22px] sm:text-[22px] md:text-[28px] lg:text-[28px] xl:text-[28px] text-black font-normal", // Sub-heading
    5: "text-[20px] sm:text-[20px] md:text-[22px] lg:text-[24px] xl:text-[24px] font-normal", // Mid-size Title
    6: "text-[16px] sm:text-[16px] md:text-[16px] lg:text-[16px] xl:text-[16px] text-black font-normal", // Normal Text / Body
  };
  const className = styles[level] || "text-lg font-medium";

  switch (parseInt(level)) {
    case 1:
      return <h1 className={className}>{children}</h1>;
    case 2:
      return <h2 className={className}>{children}</h2>;
    case 3:
      return <h3 className={className}>{children}</h3>;
    case 4:
      return <h4 className={className}>{children}</h4>;
    case 5:
      return <h5 className={className}>{children}</h5>;
    case 6:
      return <h6 className={className}>{children}</h6>;
    default:
      return <h1 className={className}>{children}</h1>;
  }
};

Heading.propTypes = {
  level: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  children: PropTypes.node.isRequired,
};

export default Heading;
