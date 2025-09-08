import PropTypes from 'prop-types';

const Paragraph = ({ children }) => {
  // Use <span> instead of <p> to avoid nested <p> problem
  return (
    <span className="xl:text-[18px] lg:text-[18px] md:text-[18px] sm:text-[15px] text-[14px] text-[#000000] font-400">
      {children}
    </span>
  );
};

Paragraph.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Paragraph;
