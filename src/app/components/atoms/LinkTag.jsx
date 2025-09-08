import Link from 'next/link';

const LinkTag = ({ href, children }) => {
  return (
    <Link href={href} className="text-[#0B6D76] underline text-[15.25px] font-[400] leading-[16px]">
      {children}
    </Link>
  );
};

export default LinkTag;
